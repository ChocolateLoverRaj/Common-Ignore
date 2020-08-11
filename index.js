#!/usr/bin/env node

//Dependencies
//Npm Modules
const minimist = require('minimist');
const zeroPad = require('leadingzero');

//Node.js Modules
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

const argv = minimist(process.argv.slice(2));
const baseDir = process.env.INIT_CWD || process.cwd();

//Check options
const checkOptions = options => {
    //Check fileOptions
    const checkFileOptions = fileOptions => {
        const checkStrArr = arr => {
            if (!(arr instanceof Array)) {
                return false;
            }
            for (let str of arr) {
                if (typeof str !== 'string') {
                    return false;
                }
            }
            return true;
        };

        if (typeof fileOptions !== 'object') {
            throw new TypeError("fileOptions must be an object.");
        }
        if (!checkStrArr(fileOptions.extends)) {
            throw new TypeError("fileOptions.extends must be an array of strings.");
        }
        if (typeof fileOptions.output !== 'string') {
            throw new TypeError("fileOptions.output must be a string.");
        }
    };

    if (typeof options !== 'object') {
        throw new TypeError("Options must be an object.");
    }
    if (typeof options.inputDir !== 'string') {
        throw new TypeError("options.inputDir must be a string.");
    }
    if (typeof options.outputDir !== 'string') {
        throw new TypeError("options.outputDir must be a string.");
    }
    if (typeof options.files !== 'object') {
        throw new TypeError("options.files must be an object.");
    }
    for (let fileName in options.files) {
        checkFileOptions(options.files[fileName]);
    }
};

//Generate
const generate = options => {
    //Throw any TypeErrors if necessary.
    checkOptions(options);

    //The files in options.
    let files = options.files;

    //Join inputDir based on baseDir.
    let inputDir = path.join(baseDir, options.inputDir);

    //Join the outputDir based on baseDir.
    let outputDir = path.join(baseDir, options.outputDir);

    //Files Map
    //Key: fileName: string, Value: file: File
    let filesMap = new Map();

    //Join a file with inputDir
    const joinInput = file => path.join(inputDir, file);

    //File class
    class File {
        constructor(fileName, isInput) {
            //The name of the file
            this.fileName = fileName;

            //Whether or not this was a proved input
            this.isInput = isInput;

            //The other files this depends on
            this.dependencies = [];

            //Save this file in the filesMap
            filesMap.set(fileName, this);

            //The promise that will be fulfilled once it reads files and dependencies.
            this.ready = (async () => {
                //Read the text
                let mainReadPromise = fsPromises.readFile(joinInput(fileName), 'utf8');

                //If this is an input, also create extends files
                if (isInput) {
                    //List of dependency promises
                    let dependencyPromises = [];

                    //Loop through all the dependencies
                    for (let dependencyFileName of files[fileName].extends) {
                        //The File object to add.
                        var dependencyFile;

                        //Check if the dependency File was already created
                        if (filesMap.has(dependencyFileName)) {
                            //Get the existing File.
                            dependencyFile = filesMap.get(dependencyFileName);
                        }
                        else {
                            //Check if the file is a future input in the object.
                            if (files.hasOwnProperty(dependencyFileName)) {
                                //If it is, throw an error, because we don't reference future inputs because of circular dependencies.
                                throw new ReferenceError("Cannot reference input file that comes after the main file. This is to avoid circular dependencies.");
                            }
                            else {
                                //Create a new File.
                                dependencyFile = new File(dependencyFileName, false);
                            }
                        }

                        //Add the dependency file and its ready promise
                        this.dependencies.push(dependencyFile);
                        dependencyPromises.push(dependencyFile.ready);
                    }

                    //Wait for all the dependency promises and the main promise
                    await Promise.all([...dependencyPromises, mainReadPromise]);
                }

                //Wait for the main promise.
                this.text = await mainReadPromise;

                //Done with async promise.
                return;
            })()
                .then(() => {
                    //If this file was a provided input, then start generating the output file.
                    if (isInput) {
                        //Create a dependency tree.
                        let dependencyTree = this.getDependencyTree();

                        //Get all the files this depends on.
                        let recursiveDependencyFiles = this.getDependencies();

                        //The greatest line number.
                        let greatestLineNumber;

                        //Map withe the line number of all dependencies
                        let lineMap = new Map();

                        //Current line number
                        let currentLineNumber =
                            1 + //The initial line number
                            1 + //The first line will be '# Dependency Tree\n'
                            dependencyTree.length + //Each item takes up 1 line
                            2 + //There will be 2 empty lines
                            1; //There will be a line saying '# Input Files'

                        //The text that this file will output
                        let outputText = "# Input Files\n";

                        //Loop through all dependencyFiles
                        for (let dependencyFile of recursiveDependencyFiles) {
                            //Add to lineMap
                            lineMap.set(dependencyFile.fileName, currentLineNumber);

                            //New greatest lineNumberSize
                            greatestLineNumber = currentLineNumber;

                            //Add a comment with the fileName
                            outputText += `# Input: '${dependencyFile.fileName}'\n`;
                            currentLineNumber++;

                            //Add trimmed text
                            outputText += `${dependencyFile.text.trim()}\n`;
                            currentLineNumber += dependencyFile.text.split('\n').length;

                            //Add an empty line
                            outputText += "\n";
                            currentLineNumber++;
                        }

                        //The greatest line number size
                        let greatestLineNumberSize = greatestLineNumber.toString().length;

                        //Dependency tree text
                        let dependencyTreeText = "# Dependency Tree\n";

                        //Loop through lines in dependency tree
                        for (let dependencies of dependencyTree) {
                            //The name of the file
                            let fileName = dependencies[1];

                            //Add the line number
                            let lineNumber = zeroPad(lineMap.get(fileName), greatestLineNumberSize);
                            dependencyTreeText += `Line ${lineNumber}: `;

                            //Add the dependencies to the text
                            dependencyTreeText += `${dependencies[0]}\n`;
                        }

                        //Add 2 empty lines to the text.
                        dependencyTreeText += "\n\n";

                        //Prepend the dependency tree to the output text
                        outputText = dependencyTreeText + outputText;

                        console.log(outputText)
                    }
                });
        }

        //Get a Set of dependency files, which is recursive.
        //alreadyFiles is a Set of Files.
        getDependencies(alreadyFiles = new Set()) {
            //Add own fileName
            alreadyFiles.add(this);

            //Add all dependencyFiles
            for (let dependencyFile of this.dependencies) {
                dependencyFile.getDependencies(alreadyFiles);
            }

            return alreadyFiles;
        }

        //Get a dependency tree
        getDependencyTree(lines = [], prefix = '') {
            //The first line
            let firstLine = prefix + this.fileName;

            //Add this File
            lines.push([firstLine, this.fileName]);

            //The new prefix
            let newPrefix = " ".repeat(firstLine.length - 1) + "| --> ";

            //Go through all dependencies
            for (let dependencyFile of this.dependencies) {
                dependencyFile.getDependencyTree(lines, newPrefix);
            }

            return lines;
        }
    }

    //Go through all the files
    for (let fileName in files) {
        new File(fileName, true);
    };
}

const defaultConfig = {

};

var config;

const requireConfig = configFile => {
    try {
        config = require(configFile);
    }
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            throw new ReferenceError(`Couldn't require config file: ${configFile}`);
        }
    }
}
if (argv.c === true) {
    //TODO make this more efficient, because this could always be slow if someone had a .js file, but we check every single time for a .json file first.
    try {
        requireConfig(path.join(baseDir, "./commonignore.config.json"));
    }
    catch (e) {
        requireConfig(path.join(baseDir, "./commonignore.config.js"));
    }
}
else if (typeof argv.c === 'string') {
    requireConfig(path.join(baseDir, argv.c));
}
else {
    config = defaultConfig;
}
generate(config);
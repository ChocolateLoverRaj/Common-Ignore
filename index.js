#!/usr/bin/env node

//Dependencies
const minimist = require('minimist');
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

    //All the top level file promises
    let mainFilePromises = [];

    //Map of files that were read or are currently being read.
    //Key: string
    //Value: Promise
    let readFilePromises = new Map();

    //Map of files that were read.
    //Key: string
    //Value: string
    let readFiles = new Map();

    //Function that reads a file or finds an already started or completed file read.
    const readFile = async fileName => {
        var readPromise;
        if (readFiles.has(fileName)) {
            console.log("already read");

            readPromise = Promise.resolve(readFiles.get(fileName));
        }
        else if (readFilePromises.has(fileName)) {
            console.log("already reading");

            readPromise = readFilePromises.get(fileName);
        }
        else {
            console.log("we need to read");

            readPromise = fsPromises.readFile(fileName, 'utf8');
            readFilePromises.set(fileName, readPromise);
        }
        let fileText = await readPromise;
        readFiles.set(fileName, fileText);
        return fileText;
    };

    //Function that reads input file and writes to output file
    //TODO handle files that extend other main files.
    const readMainFile = async fileName => {
        //The fileOptions object
        let file = files[fileName];

        //The promises that the current file depends on
        let readPromises = [];

        //The files the current file depends on
        let dependencyFiles = new Map();

        //Loop through the dependencyFiles
        for (let dependencyFile of file.extends) {
            //The path joined with the inputDir.
            let dependencyPath = path.join(inputDir, dependencyFile);

            //The promise that the readFile method returns.
            let readPromise = readFile(dependencyPath)
                .then(text => {
                    dependencyFiles.set(dependencyFile, text);
                });

            //Add the file to the readPromises
            readPromises.push(readPromise);
        }

        //Join the fileName with the inputDir.
        let readFilePath = path.join(inputDir, fileName);

        //The read promise of the main file.
        let readFilePromise = readFile(readFilePath);

        //Add that read promise to readPromises too.
        readPromises.push(readFilePromise);

        //Wait for all the readPromises.
        await Promise.all(readPromises);

        //Get the resolved text of readFilePromise
        //This is already waited for by readPromises
        let readFileText = await readFilePromise;

        //The output string
        let outputStr = '';
        //Loop through the dependencyFiles
        for (let dependencyFile of file.extends) {
            //Add a comment saying what it extends.
            outputStr += `# Extends ${dependencyFile}\n`;

            //Add the content of that file.
            outputStr += `${dependencyFiles.get(dependencyFile)}\n`;
        }

        //Add a comment with the main file name.
        outputStr += `\n# From ${fileName}\n`;

        //Add the content of the main file.
        outputStr += readFileText;

        //The output path
        let outputPath = path.join(outputDir, file.output);

        //Wait for the file to be done writing
        await fsPromises.writeFile(outputPath, outputStr, 'utf8');

        //Return the outputStr
        return outputStr;
    };

    //Go through all the files
    for (let fileName in files) {
        mainFilePromises.push(readMainFile(fileName));
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
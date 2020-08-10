#!/usr/bin/env node

//Dependencies
const minimist = require('minimist');
const path = require('path');

const argv = minimist(process.argv.slice(2));
const basePath = process.env.INIT_CWD || process.cwd();

//Check fileOptions
const checkFileOptions = fileOptions => {
    switch (typeof fileOptions) {
        case 'object':
            break;
        case 'string':
            break;
        default:
            throw new TypeError("fileOptions can only be a string or FileOptions object.");
    }
};

//Check options
const checkOptions = options => {
    if (typeof options !== 'object') {
        throw new TypeError("Options must be an object.");
    }
    if(typeof options.inputDir !== 'string'){
        throw new TypeError("options.inputDir must be a string.");
    }
    if(typeof options.outputDir !== 'string'){
        throw new TypeError("options.outputDir must be a string.");
    }
    if(typeof options.files !== 'object'){
        throw new TypeError("options.files must be an object.");
    }
};

//Generate
const generate = options => {
    //Throw any TypeErrors if necessary.
    checkOptions(options);


};

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
    try {
        requireConfig(path.join(basePath, "./commonignore.config.json"));
    }
    catch(e){
        requireConfig(path.join(basePath, "./commonignore.config.js"));
    }
}
else if (typeof argv.c === 'string') {
    requireConfig(path.join(basePath, argv.c));
}
else {
    config = defaultConfig;
}
generate(config);
#!/usr/bin/env node

//Dependencies
//My Modules
const defaultConfig = require("./config.js");
const generate = require("./index");

//Npm modules
const minimist = require('minimist');

//Npm Modules
const path = require('path');

//Parse arguments with minimist
const argv = minimist(process.argv.slice(2));

//The base directory
const baseDir = process.env.INIT_CWD || process.cwd();

//The config to use
var config;

//Tries to require() a config file.
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

//Load config
if (argv.c === true) {
    requireConfig(path.join(baseDir, "./commonignore/commonignore.config.json"));
}
else if (typeof argv.c === 'string') {
    requireConfig(path.join(baseDir, argv.c));
}
else {
    config = defaultConfig;
}

//Generate
console.time("Successfully Generate All Files");
generate(config, baseDir).then(() => {
    console.timeEnd("Successfully Generate All Files");
});
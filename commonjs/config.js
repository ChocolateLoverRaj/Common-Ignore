//The default config.

module.exports = {
    inputDir: "./commonignore",
    outputDir: "./",
    files: {
        "git.txt": {
            extends: ["common.txt"],
            output: ".gitignore"
        },
        "npm.txt": {
            extends: ["common.txt"],
            output: ".npmignore"
        }
    }
};
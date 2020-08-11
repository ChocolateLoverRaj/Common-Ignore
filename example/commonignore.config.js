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
        },
        "more.txt": {
            extends: ["npm.txt", "git.txt"],
            output: "more.ignore"
        }
    }
}
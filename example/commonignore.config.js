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
        "another.txt": {
            extends: ["git.txt", "npm.txt"],
            output: "another.ignore"
        }
    }
}
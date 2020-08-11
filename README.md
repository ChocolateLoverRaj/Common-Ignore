# Common-Ignore
A tool for generating .gitignore and .npmignore files with a common file for both ignores.

## Installing
`npm install --save-dev common-ignore`

## Why Common-Ignore Is Useful.

### How `.npmignore` works.
By default npm uses `.gitignore`. If there is also a `.npmignore` file, then npm will use the `.npmignore` file *instead* of the `.gitignore` file.

### Accidentally publishing secret files
The `.npmignore` file can be useful, especially for repositories with other files that the npm package doesn't need. However, you need to remember to also include things that would be in `.gitignore`, which usually include secrets. It can be annoying to copy and paste things from `.gitignore` to `.npmignore`, and it can be easy to forget. For example, you could add something to `.gitignore`, but then forgot to also add it to `.npmignore`.

### What Common-Ignore does

Common-Ignore is a CLI that automatically generates `.gitignore` and `.npmignore` files based one three files. One with common things to ignore, and one for git only and one for npm only.

## Using

### The two different methods
- [Using the CLI](#CLI)
- [Using Node.js Module](#Node.js-Module)

### Config
There are three properties in a config object

- inputDir - The directory that contains the input files (then you can use the relative paths of individual inputs.)
- outputDir - The directory that the output files are in (usually it's just `./`, for top level outputs.)
- files - The inputs and their outputs. This is an object
    - *keys* - strings containing the name or path of the input file.
    - *values* - options for the file
        - extends - an array of files which it extends. This can be an empty array. If an item in this array is not an input in the config, then it will read that file. If items in the array are also inputs in files, then they will recursively extend whatever they extend. For example, if `a.txt` extends `b.txt`, and `b.txt` extends `c.txt`, then `a.txt` will extend both `b.txt` and `c.txt`.
        - output - The output path or file name of the input. This is usually `.gitignore` or `.npmignore`, but you can add whatever output names you want.

Here is an example which has two inputs. `git.txt` and `npm.txt`. Both of them extend `common.txt`, which is another file in the `commonignore` folder.
```javascript
{
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
```

### CLI
It is very easy using the CLI. In a npm script, you can use the `commonignore` command to generate the files. To specify input and output files, use the `-c` flag. `commonignore -c {path_to_options_file}`. You can use `.js` files or `.json` files. If you use `.js` files, then you have to use CommonJS files that export the [options](#Config).

File Structure Example

To keep things organized, you can create a folder called `commonignore`, which contains the input files. Here is an example below:

- package.json
- commonignore.config.js
- commonignore
    - git.txt
    - npm.txt
    - common.txt
- .gitignore (this will be generated)
- .npmignore (this will be generated)

Remember to specify inputs, outputs, and what inputs extend what other files or inputs in the [config file](#Config).

### Node.js Module
You can also programmatically use Common-Ignore.

ESModules
```javascript
import commonIgnore from 'common-ignore'
```
CommonJS
```javascript
const commonIgnore = require('common-ignore')
```
The commonIgnore function takes two parameters. The first one is the [options / config](#Config). The second parameter is optional, and it is the base directory. Usually the base directory is the root folder of your project. It returns a promise, which resolved `undefined` once done.

Example

```javascript
commonIgnore(myOptions, __dirname)
    .then(() => {
        console.log("Done");
    })
    .catch(err => {
        console.log("Error");
    })
```

## Npm Build Script
You can easily use Common-Ignore in a build script. This way you can also use the [`commonignore`](#Cli) command without installing it globally.

### Example `scripts` in `package.json`
```json
{
    "scripts": {
        "build": "commonignore -c myConfig.json"
    }
}
```

Then you can do `npm run build` and then it will generate your output files.
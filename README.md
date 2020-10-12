# Common-Ignore
A tool for generating .gitignore and .npmignore files with a common file for both ignores.

## Installing
`npm install --save-dev common-ignore`

## Why Common-Ignore Is Useful.

### How `.npmignore` works.
By default npm uses `.gitignore`. If there is also a `.npmignore` file, then npm will use the `.npmignore` file *instead* of the `.gitignore` file.

### Accidentally publishing secret files
The `.npmignore` file can be useful, especially for repositories with other files that the npm package doesn't need. However, you need to remember to also include things that would be in `.gitignore`, which usually include secrets. It can be annoying to copy and paste things from `.gitignore` to `.npmignore`, and it can be easy to forget. For example, you could add something to `.gitignore`, but then forgot to also add it to `.npmignore`.

## Using

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

### Node.js Module
```javascript
import commonIgnore from 'common-ignore'
```

The commonIgnore function takes two parameters. The first one is the [options / config](#Config). The second parameter is optional, and it is the base directory. Usually the base directory is the root folder of your project. It returns a promise, which resolves `undefined` once done.

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
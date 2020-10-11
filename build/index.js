import generate from '../index.js'
import { dirname } from 'dirname-filename-esm'
import { join } from 'path'

const __dirname = dirname(import.meta)

console.log('Generating...')
console.time('generate')
generate({
  inputDir: './common-ignore',
  outputDir: './',
  files: {
    'git.gitignore': {
      extends: [],
      output: '.gitignore'
    },
    'npm.npmignore': {
      extends: ['git.gitignore'],
      output: '.npmignore'
    }
  }
}, join(__dirname, '../'))
  .then(console.timeEnd.bind(undefined, 'generate'))
  .catch(e => { throw e })
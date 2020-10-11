import generate from 'common-ignore'
import { dirname } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)

console.log('Generating...')
console.time('generate')
generate({
  inputDir: './common-ignore',
  outputDir: './',
  files: {
    'git.txt': {
      extends: ['common.txt'],
      output: '.gitignore'
    },
    'npm.txt': {
      extends: ['common.txt'],
      output: '.npmignore'
    },
    'another.txt': {
      extends: ['git.txt', 'npm.txt'],
      output: 'another.ignore'
    }
  }
}, __dirname)
  .then(console.timeEnd.bind(undefined, 'generate'))
  .catch(e => { throw e })

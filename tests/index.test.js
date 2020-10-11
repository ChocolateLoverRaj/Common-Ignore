/* global test, expect */

import generate from '../index.js'

import { dirname } from 'dirname-filename-esm'
import { readFile } from 'fs/promises'
import { join } from 'path'

const __dirname = dirname(import.meta)

test('simple setup', async () => {
  await generate({
    inputDir: './input/',
    outputDir: './output/',
    files: {
      'git.gitignore': {
        extends: [],
        output: 'test.gitignore'
      },
      'npm.npmignore': {
        extends: ['git.gitignore'],
        output: 'test.npmignore'
      }
    }
  }, __dirname)

  const checkFile = async file => {
    const contents = await readFile(file, 'utf-8')
    expect(contents).toMatchSnapshot()
  }

  await Promise.all([
    checkFile(join(__dirname, './output/test.gitignore')),
    checkFile(join(__dirname, './output/test.npmignore'))
  ])
})

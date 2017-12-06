'use strict'
const jsdoc2md = require('jsdoc-to-markdown')
const fs = require('fs-extra')
const path = require('path')
const inputDir = './lib'
const outputDir = './md'

read(inputDir).map((file) => {
  let output = jsdoc2md.renderSync({ files: file })
  fs.outputFile(path.resolve(outputDir, `${file}.md`), output)
})

function read (dir) {
  return fs.readdirSync(dir)
    .reduce((files, file) =>
      fs.statSync(path.join(dir, file)).isDirectory()
      ? files.concat(read(path.join(dir, file)))
      : files.concat(path.join(dir, file)),
      [])
}

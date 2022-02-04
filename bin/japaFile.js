'use-strict'

const { configure } = require('japa')

configure({
  files: ['test/**/*.test.js'],
  timeout: 2 * (1000 * 60) // two minutes
})

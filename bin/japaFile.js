'use-strict'

const { configure } = require('japa')

configure({
  files: ['test/*.test.js'],
  timeout: 150000
})

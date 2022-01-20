'use-strict'

const { configure } = require('japa')

configure({
  files: ['test/*.spec.js'],
  timeout: 15000
})

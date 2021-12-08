'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class B2FileSchema extends Schema {
  up() {
    this.create('b_2_files', table => {
      table.increments()
      table.string('file_password').nullable().defaultTo(null)
      table.string('client_file_name').nullable().defaultTo(null)
      table.string('accountId').nullable().defaultTo(null)
      table.string('action').nullable().defaultTo(null)
      table.string('bucketId').nullable().defaultTo(null)
      table.string('contentLength').nullable().defaultTo(null)
      table.string('contentMd5').nullable().defaultTo(null)
      table.string('contentSha1').nullable().defaultTo(null)
      table.string('contentType').nullable().defaultTo(null)
      table.string('fileId').nullable().defaultTo(null)
      table.string('fileInfo').nullable().defaultTo(null)
      table.string('fileName').nullable().defaultTo(null)
      table.string('uploadTimestamp').nullable().defaultTo(null)
      table.timestamps()
    })
  }

  down() {
    this.drop('b_2_files')
  }
}

module.exports = B2FileSchema

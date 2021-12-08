'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class B2File extends Model {
  static async createFromBackBlaze(backBlazeObject) {
    return B2File.create(B2File.fromBBlazeToB2File(backBlazeObject))
  }

  static fromBBlazeToB2File(object) {
    const {
      id = null,
      file_password = null,
      client_file_name = null,
      accountId = null,
      action = null,
      bucketId = null,
      contentLength = null,
      contentMd5 = null,
      contentSha1 = null,
      contentType = null,
      fileId = null,
      fileInfo = null,
      fileName = null,
      uploadTimestamp = null,
      created_at = null,
      updated_at = null
    } = object
    return {
      id,
      file_password,
      client_file_name,
      accountId,
      action,
      bucketId,
      contentLength,
      contentMd5,
      contentSha1,
      contentType,
      fileId,
      fileInfo,
      fileName,
      uploadTimestamp,
      created_at,
      updated_at
    }
  }
}

module.exports = B2File

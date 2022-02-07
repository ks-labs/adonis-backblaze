'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class B2File extends Model {
  static async createFromBackBlaze(backBlazeObject) {
    return B2File.create(B2File.fromBBlazeToB2File(backBlazeObject))
  }
  static fromBBlazeToB2File(b2UploadObject) {
    const {
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
      uploadTimestamp = null
    } = b2UploadObject
    return {
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
      uploadTimestamp
    }
  }
}

module.exports = B2File

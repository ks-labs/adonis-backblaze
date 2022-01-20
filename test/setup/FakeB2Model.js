const _ = require('lodash')

;('use strict')

class FakeModel {
  static create(...args) {
    const newInstance = new FakeModel()
    for (const key in args) {
      if (Object.hasOwnProperty.call(args, key)) {
        const value = args[key]
        newInstance[key] = value
      }
    }
    newInstance.id = Date.now()
    return newInstance
  }

  static async createFromBackBlaze(backBlazeObject) {
    return FakeModel.create(FakeModel.fromBBlazeToB2File(backBlazeObject))
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

  merge(object) {
    return _.merge(this, object)
  }
  save() {
    console.log('Fake Save B2 Entity:', this.id)
  }
}

module.exports = FakeModel

'use strict'

const _ = require('lodash')
const allFiles = []
class FakeModel {
  static find(id) {
    if (allFiles.find(file => file.id === id)) return allFiles.find(file => file.id === id)
    else return new FakeModel()
  }

  static findBy(key, value, find) {
    if (find) {
      if (allFiles.find(file => file[key] === value)) {
        return allFiles.find(file => file[key] === value)
      } else {
        return new FakeModel()
      }
    } else {
      return null
    }
  }

  static create(args) {
    const newInstance = new FakeModel()
    for (const key in args) {
      if (Object.hasOwnProperty.call(args, key)) {
        const value = args[key]
        newInstance[key] = value
      }
    }
    newInstance.id = Date.now()
    allFiles.push(newInstance)
    return newInstance
  }

  static async createFromBackBlaze(backBlazeObject) {
    if (Array.isArray(backBlazeObject))
      return FakeModel.create(FakeModel.fromBBlazeToB2File(backBlazeObject[0]))
    else return FakeModel.create(FakeModel.fromBBlazeToB2File(backBlazeObject))
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
    return _.merge(this || {}, object)
  }

  save() {}

  static query(find) {
    return {
      where: object => {
        return {
          first: () => {
            return find ? FakeModel.createFromBackBlaze(object) : null
          }
        }
      }
    }
  }
}

module.exports = FakeModel

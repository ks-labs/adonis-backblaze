'use-strict'

/** @typedef {import('@adonisjs/bodyparser/src/Multipart/File')} File */

/** @type {typeof import('../Models/B2File')} */
const B2File = use('App/Models/B2File')
// read stream as buffers

const { readFileSync } = require('fs')
const { posix } = require('path')
const path = require('path')
const md5 = require('md5')

class B2Service {
  constructor(Config, app) {
    this._b2Options = {
      dummy: false,
      blazeAppKeyID: undefined,
      blazeAppKey: undefined,
      blazeBucketID: undefined,
      bucketPrefix: undefined,
      defaultDownloadTime: undefined,
      defaultTimeout: undefined
    }
    // Load Envs
    this._b2Options = Config.merge('app.b2-provider', {
      dummy: false,
      blazeAppKeyID: undefined,
      blazeAppKey: undefined,
      blazeBucketID: undefined,
      bucketPrefix: undefined,
      defaultDownloadTime: undefined,
      defaultTimeout: undefined
    })

    if (!this._b2Options.dummy) {
      const B2 = require('backblaze-b2')
      this.b2 = new B2({
        applicationKeyId: this._b2Options.blazeAppKeyID, // or accountId: 'accountId'
        applicationKey: this._b2Options.blazeAppKey // or masterApplicationKey
      })
    }
  }

  /**
   * must authorize before any job
   */
  async authorize() {
    if (!this._b2Options.dummy) {
      const result = await this.b2.authorize()
      this.authData = result.data

      if (!this.authData.downloadUrl) {
        throw new Error(
          'Invalid Backblaze "downloadUrl" when authorize client.'
        )
      }
      return this.authData
    }
    return null
  }

  /**
   * @param  {File} fileInstance
   */
  async createUploadMultipartFile(
    fileInstance,
    { originalName = md5(Date.now()), prefix, file_password }
  ) {
    if (this._b2Options.dummy) {
      const B2Model = use('App/Models/B2File').createFromBackBlaze({
        client_file_name: originalName
      })
      return B2Model
    } else {
      const clientName = fileInstance.clientName
      const fileName = fileInstance.fileName
      const uploadFullPath = this._b2FilePathWithPrefix(prefix, fileName)

      const uploadUrl = await this.b2.getUploadUrl({
        bucketId: this._b2Options.blazeBucketID
      })

      // read file from fileINstance
      let bufferToUpload = await readFileSync(
        path.join(fileInstance._location, fileInstance.fileName)
      )

      // upload file

      const b2UploadObject = {
        uploadUrl: uploadUrl.data.uploadUrl,
        uploadAuthToken: uploadUrl.data.authorizationToken,
        fileName: uploadFullPath,
        data: bufferToUpload,
        // optional info headers, prepended with X-Bz-Info- when sent, throws error if more than 10 keys set
        // valid characters should be a-z, A-Z and '-', all other characters will cause an error to be thrown
        info: {
          original_file_name: fileName
        },
        onUploadProgress: event => ({} || null),
        axios: {
          timeout: this._b2Options.defaultTimeout // (example)
        }
      }

      const response = await this.b2.uploadFile(b2UploadObject) // returns promise
      bufferToUpload = null
      // store in local database
      const b2File = await this.normalizeAndCreateB2File(response)
      await b2File.merge({
        client_file_name: clientName || null,
        file_password: file_password || null
      })
      await b2File.save()
      return b2File
    }
  }

  async uploadAndInsertB2File({
    bufferToUpload,
    originalName,
    fileName,
    onUploadProgress,
    file_password,
    prefix
  }) {
    if (this._b2Options.dummy) {
      const B2Model = use('App/Models/B2File').createFromBackBlaze({
        client_file_name: originalName
      })
      return B2Model
    }
    const uploadFullPath = this._b2FilePathWithPrefix(prefix, fileName)

    const uploadInfo = await this.b2.getUploadUrl({
      bucketId: this._b2Options.blazeBucketID
    })

    // upload file
    const b2UploadObject = {
      uploadUrl: uploadInfo.data.uploadUrl,
      uploadAuthToken: uploadInfo.data.authorizationToken,
      fileName: uploadFullPath,
      data: bufferToUpload,
      // optional info headers, prepended with X-Bz-Info- when sent, throws error if more than 10 keys set
      // valid characters should be a-z, A-Z and '-', all other characters will cause an error to be thrown
      info: {
        filename: fileName,
        original_file_name: originalName
      },
      onUploadProgress: onUploadProgress || function (event) {},
      axios: {
        timeout: this._b2Options.defaultTimeout // (example)
      }
    }

    const response = await this.b2.uploadFile(b2UploadObject) // returns promise

    // store in local database
    /** @type {import('../Models/B2File')} */
    const b2File = await this.normalizeAndCreateB2File(response)
    await b2File.merge({
      client_file_name: originalName || null,
      file_password: file_password || null
    })
    await b2File.save()
    return b2File
  }

  async listFilesInFolder({ prefix, limit = 150 }) {
    const path = [this._b2Options.bucketPrefix, prefix]
      .filter(value => value)
      .join('/')
    if (!this._b2Options.dummy) {
      const resp = await this.b2.listFileNames({
        bucketId: this._b2Options.blazeBucketID,
        maxFileCount: limit,
        delimiter: '',
        prefix: path
        // ...common arguments (optional)
      }) // returns promise

      return resp.data
    }
  }

  /**
   * @param  {number} b2FileId // B2FileModel.id
   * @param  {string} responseType // response types 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
   * @returns  {ArrayBuffer}
   */
  async downloadFileById(b2FileId, responseType = 'arraybuffer') {
    if (!this._b2Options.dummy) {
      const b2File = await B2File.find(b2FileId)
      const response = await this.b2.downloadFileById({
        fileId: b2File.fileId,
        responseType // options are as in axios: 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'

        // ...common arguments (optional)
      }) // returns promise

      return response.data
    }
    return null
  }

  _b2FilePathWithPrefix(...segments) {
    // unifica segmentos de caminho para criar um path completo
    // para enviar para uma pasta especifica precisa inicar sem '/' e cada nivel de pasta separada por uma '/'
    // "fileName": "fluffy/kitten.jpg"
    // atualmente retorna com / inicial para conseguir fazer upload corretamente.
    return (
      (this._b2Options.bucketPrefix || '') +
      '/' +
      posix.normalize(posix.join(...segments.filter(val => val)))
    )
  }

  async normalizeAndCreateB2File(response) {
    response.data.fileInfo = JSON.stringify(response.data.fileInfo)
    return await B2File.createFromBackBlaze(response.data)
  }
}

module.exports = B2Service

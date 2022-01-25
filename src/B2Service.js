'use-strict'

/** @typedef {import('@adonisjs/bodyparser/src/Multipart/File')} File */

/** @type {typeof import('../Models/B2File')} */
const B2File = use('App/Models/B2File')
// read stream as buffers

const { readFileSync } = require('fs')
const { posix } = require('path')
const path = require('path')
const md5 = require('md5')
const NE = require('node-exceptions')
const { Config } = require('@adonisjs/sink')
const _ = require('lodash')

class B2Service {
  /**
   * @param  {Config} ConfigInstance
   * @param  {} app
   */
  constructor(ConfigInstance, app) {
    /** @type {Config} */
    this.ConfigInstance = ConfigInstance
    this._setupConfig()
  }
  /**
   * @param  {Config} ConfigInstance
   */
  async _setupConfig() {
    this._b2Options = {
      dummy: undefined,
      blazeAppKeyID: undefined,
      blazeAppKey: undefined,
      blazeBucketID: undefined,
      blazeAppKeyPrefix: undefined,
      defaultDownloadTime: undefined,
      defaultTimeout: undefined
    }
    // Load Envs
    this._b2Options = this.ConfigInstance.merge('app.b2-provider', this._b2Options)
    await this.recreateB2Instance()
  }

  async recreateB2Instance() {
    if (!this._b2Options.dummy) {
      const B2 = require('backblaze-b2')
      this.b2 = new B2({
        applicationKeyId: this._b2Options.blazeAppKeyID, // or accountId: 'accountId'
        applicationKey: this._b2Options.blazeAppKey // or masterApplicationKey
      })
    }
  }

  async _changeConfig(newConfig) {
    this._b2Options = _.merge(this._b2Options, newConfig)
    await this.recreateB2Instance()
    return await this.authorize()
  }

  /**
   * must authorize before any job
   */
  async authorize() {
    if (this._b2Options.dummy) {
      return null
    }
    const result = await this.b2.authorize()
    this.authData = result.data

    if (!this.authData.downloadUrl) {
      throw new Error('Invalid Backblaze "downloadUrl" when authorize client.')
    }
    return this.authData
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
  /**
   */
  async uploadBufferToBackBlaze({
    fileName,
    pathToFile, // optional prefix for filename
    bufferToUpload,
    onUploadProgress,
    originalName
  }) {
    const uploadFullPath = this._b2FilePathWithPrefix(pathToFile, fileName)

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

    return this.b2.uploadFile(b2UploadObject) // returns promise
  }

  async uploadAndInsertB2File({
    bufferToUpload,
    originalName,
    pathToFile,
    fileName,
    onUploadProgress,
    file_password
  }) {
    if (this._b2Options.dummy) {
      const B2Model = use('App/Models/B2File').createFromBackBlaze({
        client_file_name: originalName
      })
      return B2Model
    }
    const response = await this.uploadBufferToBackBlaze({
      bufferToUpload,
      originalName,
      pathToFile,
      fileName,
      onUploadProgress
    })

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

  async listFilesOnBucket({ prefix, limit = 150 }) {
    if (!this._b2Options.dummy) {
      const normalizedPath = this._b2FilePathWithPrefix(prefix)
      const resp = await this.b2.listFileNames({
        bucketId: this._b2Options.blazeBucketID,
        maxFileCount: limit,
        delimiter: '',
        prefix: normalizedPath
        // ...common arguments (optional)
      }) // returns promise

      return resp.data
    }
  }
  /**
   * @param  {Object} opts
   * @param  {string} opts.b2FileId
   * @param  {string} opts.optionalNewName
   * @param  {string} opts.newFilePath
   * @param  {Object} opts.changeConfig
   * @param  {Object} opts.changeConfig.from
   * @param  {Object} opts.changeConfig.to
   * @param  {string} opts.changeConfig.to.blazeAppKeyID
   * @param  {string} opts.changeConfig.to.blazeAppKey
   * @param  {string} opts.changeConfig.to.blazeBucketID
   * @param  {string} opts.changeConfig.to.blazeAppKeyPrefix
   * @returns {Promise<StandardApiResponse> } - new backblaze file details
   */
  async moveFileByFileId(
    opts = {
      b2FileId: null,
      optionalNewName: null,
      newFilePath: null,
      dontDelete: false,
      changeConfig: null
    }
  ) {
    if (!this._b2Options.dummy) {
      const changeFromConfig = opts.changeConfig && opts.changeConfig.from
      if (changeFromConfig) await this._changeConfig(opts.changeConfig.from)

      const fileInfo = await this.b2.getFileInfo({
        fileId: opts.b2FileId
      })

      const parsedOldName = path.parse(fileInfo.data.fileName)
      const fileName = opts.optionalNewName
        ? path.parse(opts.optionalNewName).base
        : parsedOldName.base
      const originalName = fileInfo?.data?.fileInfo?.original_file_name ?? null
      const response = await this.b2.downloadFileById({
        fileId: opts.b2FileId,
        responseType: 'arraybuffer'
      })
      if (changeFromConfig) await this._setupConfig() // restore settings
      const changedToConfig = opts.changeConfig && opts.changeConfig.to

      if (changedToConfig) await this._changeConfig(opts.changeConfig.to)

      const fileCreated = await this.uploadBufferToBackBlaze({
        fileName,
        pathToFile: opts.newFilePath,
        bufferToUpload: response.data,
        originalName
      })

      if (changedToConfig) await this._setupConfig() // restore settings

      if (fileCreated.data.contentSha1 !== fileInfo.data.contentSha1) {
        throw new SHA1MismatchException()
      }

      return fileCreated
    }
  }

  async deleteB2Object({ fileId, fileName }) {
    if (!this._b2Options.dummy) {
      return this.b2.deleteFileVersion({
        fileId,
        fileName
      })
    } else {
      return {
        data: {
          fileId: fileId,
          fileName: fileName
        }
      }
    }
  }

  /**
   * @param  {number} b2FileId // B2FileModel.id
   * @param  {'arraybuffer'| 'blob'| 'document'|'json'| 'text'| 'stream'} responseType // response types
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

  _b2FilePathWithPrefix(...args) {
    const allowedPrefixForKey = this._b2Options.blazeAppKeyPrefix || null
    let finalPath = []
    const filteredArgs = args.filter(val => !!val)

    // unifica segmentos de caminho para criar um path completo
    // para enviar para uma pasta especifica precisa inicar sem '/' e cada nivel de pasta separada por uma '/'
    // "fileName": "fluffy/kitten.jpg"
    // atualmente retorna com / inicial para conseguir fazer upload corretamente.
    // fileName / prefix
    if (allowedPrefixForKey) {
      finalPath.push(allowedPrefixForKey)
    }
    if (filteredArgs && filteredArgs.length > 0) {
      finalPath.push(...filteredArgs)
    }
    return finalPath.join('/')
  }

  _buildFilePathCustomPrefix(customPrefix, ...segments) {
    // unifica segmentos de caminho para criar um path completo
    // para enviar para uma pasta especifica precisa inicar sem '/' e cada nivel de pasta separada por uma '/'
    // "fileName": "fluffy/kitten.jpg"
    // atualmente retorna com / inicial para conseguir fazer upload corretamente.
    // fileName / prefix
    return (customPrefix || '') + '/' + posix.normalize(posix.join(...segments.filter(val => val)))
  }

  async normalizeAndCreateB2File(response) {
    response.data.fileInfo = JSON.stringify(response.data.fileInfo)
    return await B2File.createFromBackBlaze(response.data)
  }
}

class SHA1MismatchException extends NE.LogicalException {
  constructor(
    message = 'The original file and the moved file SHA1 do not match.',
    status = 500,
    code = 'MOVED_SHA1_MISMATCH',
    link = null
  ) {
    super(message, status, code, link)
  }
}
module.exports = B2Service

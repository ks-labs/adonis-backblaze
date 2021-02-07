'use-strict'

/** @typedef {import('@adonisjs/bodyparser/src/Multipart/File')} File */
/** @typedef {import('@adonisjs/framework/src/Env')} Env */

/** @type {typeof import('../Models/B2File')} */
const B2File = use('App/Models/B2File')

const fs = require('fs')
const path = require('path')

class B2Service {
  constructor(app) {
    /** @type {Env}  */
    const Env = app.use('Env')

    if (process.env.NODE_ENV !== 'production') {
      // return {
      //   action: 'upload'
      // }
    }

    // Load Envs
    this.blazeAppKeyID = Env.get('BLAZE_KEY_ID')
    this.blazeAppKey = Env.get('BLAZE_APP_KEY')
    this.blazeBucketID = Env.get('BLAZE_BUCKET_ID')
    this.blazeAccessToken = Env.get('BLAZE_APP_KEY')
    this.bucketPrefix = Env.get('BLAZE_PREFIX')
    this.defaultDownloadTime = Env.get('BLAZE_DEFAULT_DOWNLOAD_DURATION')
    this.isDisabled = Env.get('BLAZE_DISABLE_UPLOAD', 'false') == 'true'

    if (!this.isDisabled) {
      const B2 = require('backblaze-b2')
      this.b2 = new B2({
        applicationKeyId: this.blazeAppKeyID, // or accountId: 'accountId'
        applicationKey: this.blazeAppKey // or masterApplicationKey
      })
    }
    //
  }

  /**
   * must authorize before any job
   */
  async authorize() {
    if (!this.isDisabled) {
      if (!this.authData || !this.authData.authorizationToken) {
        const result = await this.b2.authorize()
        this.authData = result.data
      }

      if (!this.authData.downloadUrl) {
        throw new Error('Invalid Backblaze "downloadUrl" when authorize client.')
      }
      return this.authData
    }
    return null
  }

  /**
   * @param  {File} fileInstance
   */
  async createUploadMultipartFile(fileInstance, { prefix, file_password }) {
    if (!this.isDisabled) {
      const clientName = fileInstance.clientName
      const fileName = fileInstance.fileName
      const uploadFullPath = this.b2FilePathWithPrefix(prefix, fileName)

      const uploadUrl = await this.b2.getUploadUrl({
        bucketId: this.blazeBucketID
      })

      // read file from fileINstance
      let bufferToUpload = await fs.readFileSync(
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
          timeout: 3600000 // (example)
        }
      }
      bufferToUpload = null

      const response = await this.b2.uploadFile(b2UploadObject) // returns promise

      response.data.fileInfo = JSON.stringify(response.data.fileInfo)
      // store in local database
      const b2File = await B2File.create(response.data)
      await b2File.merge({
        client_file_name: clientName || null,
        file_password: file_password || null
      })
      await b2File.save()
      return b2File
    }
    return null
  }

  async listFilesInFolder({ prefix }) {
    if (!this.isDisabled) {
      const resp = await this.b2.listFileNames({
        bucketId: this.blazeBucketID,
        maxFileCount: 100,
        delimiter: '',
        prefix: this.bucketPrefix + '/' + prefix
        // ...common arguments (optional)
      }) // returns promise

      return resp.data
    }
  }

  async downloadFileById(fileID) {
    if (!this.isDisabled) {
      throw new Error('Not Implemented Method')
      const b2File = await B2File.find(fileID)
      return b2File
    }
  }

  b2FilePathWithPrefix(...args) {
    // unifica segmentos de caminho para criar um path completo
    return this.bucketPrefix + '/' + args.filter(val => !!val).join('/')
  }
}

module.exports = B2Service

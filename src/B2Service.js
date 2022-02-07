'use-strict'

// read stream as buffers
const fs = require('fs')
const { readFileSync } = require('fs')
const { posix } = require('path')
const path = require('path')
const md5 = require('md5')
const NE = require('node-exceptions')

/** @typedef {import('@adonisjs/sink')} Sink */

const _ = require('lodash')

/** @typedef {import('@adonisjs/bodyparser/src/Multipart/File')} File */
class B2Service {
  /**
   * @param  {Sync.Config} ConfigInstance
   * @param  {Helpers} Helpers
   */
  constructor(ConfigInstance, Helpers) {
    /** @type {Sync.Config} */
    this.ConfigInstance = ConfigInstance
    /** @type {Helpers} */
    this._helpers = Helpers
    this._loadDefaultConfig()
  }
  /**
   * @param  {Sync.Config} ConfigInstance
   */
  async _loadDefaultConfig() {
    this._b2Options = {
      dummy: undefined,
      blazeAppKey: undefined,
      blazeAppKeyID: undefined,
      blazeBucketID: undefined,
      blazeAppKeyPrefix: undefined,
      defaultDownloadTime: undefined,
      defaultTimeout: undefined
    }
    // Load Envs
    this._b2Options = this.ConfigInstance.merge('b2-provider', this._b2Options)
    if (!this._b2Options.blazeAppKey) {
      throw new Error('Invalid Backblaze "blazeAppKey" when load config file.')
    }
    await this.recreateB2Instance()
  }

  async recreateB2Instance() {
    if (this._b2Options.dummy) {
      return
    }
    const B2 = require('backblaze-b2')
    this.b2 = new B2({
      applicationKeyId: this._b2Options.blazeAppKeyID, // or accountId: 'accountId'
      applicationKey: this._b2Options.blazeAppKey // or masterApplicationKey
    })
  }

  async changeConfig(newConfig) {
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
      /** @type {typeof import('../templates/B2File')} */
      const B2File = use('App/Models/B2File')
      const B2Model = B2File.createFromBackBlaze({
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
    originalName,
    info = null
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
      info: info ?? {
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
   * @param  {string} opts.replacePath
   * @param  {Object} opts.credentials
   * @param  {Object} opts.credentials.from
   * @param  {string} opts.credentials.from.blazeAppKeyID
   * @param  {string} opts.credentials.from.blazeAppKey
   * @param  {string} opts.credentials.from.blazeBucketID
   * @param  {string} opts.credentials.from.blazeAppKeyPrefix
   * @param  {Object} opts.credentials.to
   * @param  {string} opts.credentials.to.blazeAppKeyID
   * @param  {string} opts.credentials.to.blazeAppKey
   * @param  {string} opts.credentials.to.blazeBucketID
   * @param  {string} opts.credentials.to.blazeAppKeyPrefix
   * @returns {Promise<StandardApiResponse> } - new backblaze file details
   */
  async moveFileByFileId(opts = {}) {
    const {
      originFileId = null,
      optionalNewName = null,
      replacePath = null,
      deleteOldFile = false,
      credentials = null
    } = opts
    if (!this._b2Options.dummy) {
      const hasFromConfig = opts.credentials && opts.credentials.from
      if (hasFromConfig) await this.changeConfig(opts.credentials.from)

      const fileInfo = await this.b2.getFileInfo({
        fileId: originFileId
      })

      const originObject = fileInfo?.data
      const parsedOldName = path.parse(originObject?.fileName)
      const fileName = opts.optionalNewName
        ? path.parse(opts.optionalNewName).base
        : parsedOldName.base
      const originalName = originObject?.fileInfo?.original_file_name ?? null
      const response = await this.b2.downloadFileById({
        fileId: originFileId,
        responseType: 'arraybuffer'
      })
      if (hasFromConfig) await this._loadDefaultConfig() // restore settings
      const changedToConfig = opts.credentials && opts.credentials.to

      if (changedToConfig) await this.changeConfig(opts.credentials.to)

      const fileCreated = await this.uploadBufferToBackBlaze({
        fileName,
        pathToFile: opts.replacePath,
        bufferToUpload: response.data,
        originalName
      })

      if (changedToConfig) await this._loadDefaultConfig() // restore settings

      if (fileCreated.data.contentSha1 !== originObject.contentSha1) {
        throw new SHA1MismatchException()
      } else {
        if (deleteOldFile) {
          await this.changeConfig(opts.credentials.from)
          await this.deleteB2Object(originObject)
        }
      }

      return fileCreated
    }
  }
  /**
   * @param  {Object} opts
   * @param  {Object} opts.deleteOldFile - delete the old file after success migration
   * @param  {Object} opts.limit - limit of files to migrate 100 is default
   * @param  {Object} opts.from
   * @param  {Object} opts.from.blazeAppKeyPrefix
   * @param  {Object} opts.from.blazeAppKey
   * @param  {Object} opts.from.blazeAppKeyID
   * @param  {Object} opts.from.blazeBucketID
   * @param  {Object} opts.to
   * @param  {string} opts.to.blazeAppKeyID
   * @param  {string} opts.to.blazeAppKey
   * @param  {string} opts.to.blazeBucketID
   * @param  {string} opts.to.blazeAppKeyPrefix
   * @returns {Promise<StandardApiResponse> } - new backblaze file details
   */
  async migrateTokenAndDatabaseNames(opts = {}) {
    const {
      from = null,
      to = null,
      limit = 100,
      updateDBModels = false,
      deleteOldFile = false
    } = opts
    if (this._b2Options.dummy) throw new Error('Dummy mode is not supported for this method')

    if (!from) throw new Error('from config is required')
    if (!to) throw new Error('to config is required')
    const migratedFiles = []
    const oldFilesTmp = this._helpers.tmpPath(
      '/migration-' +
        from.blazeAppKey.substr(from.blazeAppKey.length - 7, from.blazeAppKey.length - 1) +
        '-old'
    )
    await this.changeConfig(from)
    const oldRequest = await this.listFilesOnBucket({
      limit
    })
    console.log('[LOG] Total old files to migrate:', oldRequest?.files?.length ?? 0)

    let totalMigrated = 0
    for (const oldFile of oldRequest.files) {
      const downloaded = await this.b2.downloadFileById({
        fileId: oldFile.fileId,
        responseType: 'arraybuffer'
      })
      totalMigrated++
      console.log(
        '[LOG] Downloading',
        totalMigrated,
        'of',
        oldRequest?.files?.length ?? 0,
        'old files'
      )
      const oldFilePath = path.join(oldFilesTmp, oldFile.fileName)

      fs.mkdirSync(path.parse(oldFilePath).dir, {
        recursive: true
      })
      await fs.writeFileSync(oldFilePath, downloaded.data)

      migratedFiles.push({
        old: {
          info: oldFile,
          tmpPath: oldFilePath
        },
        new: {}
      })
    }
    console.log('[LOG] All files downloaded with success')
    console.log('[LOG] Changing to new token and uploading:')

    await this.changeConfig(to)
    for (const id in migratedFiles) {
      try {
        let downloaded = migratedFiles[id]
        migratedFiles[id].error = null
        console.log(
          '[LOG] Uploading',
          'remaining',
          totalMigrated--,
          'of',
          oldRequest?.files?.length ?? 0,
          'files total'
        )
        let uploadName = downloaded.old.info.fileName
        if (
          from.blazeAppKeyPrefix &&
          from.blazeAppKeyPrefix.length > 0 &&
          from.blazeAppKeyPrefix !== to.blazeAppKeyPrefix
        ) {
          // remove the old prefix from the file name
          uploadName = uploadName.split(from.blazeAppKeyPrefix).join('')
        }
        const fileCreated = await this.uploadBufferToBackBlaze({
          fileName: uploadName,
          bufferToUpload: fs.readFileSync(downloaded.old.tmpPath),
          info: downloaded.old.info.info
        })
        migratedFiles[id].new.info = fileCreated?.data
        if (migratedFiles[id].new.info.contentSha1 != downloaded.old.info.contentSha1) {
          throw new SHA1MismatchException()
        }
      } catch (error) {
        console.error(error)
        migratedFiles[id].error = error
      }
    }
    let hasError = false
    for (const migrate of migratedFiles) {
      if (migrate.error) {
        hasError = true
      }
    }
    console.log('[LOG] All files migrated with success')
    if (deleteOldFile) {
      console.log('[LOG] Changing to old token and deleting old files:')
      await this.changeConfig(opts.from)
      if (!hasError) {
        for (const migrate of migratedFiles) {
          totalMigrated++
          console.log(
            '[LOG] Deleting old files ',
            totalMigrated,
            'of',
            oldRequest?.files?.length ?? 0,
            ' old files'
          )
          await this.deleteB2Object(migrate.old.info)
        }
        console.log('[LOG] finished migration')
      } else {
        console.log('[WARN] some files has errors during migration')
        console.log('[WARN] (nothing will be deleted)')
      }
    }
    // update all database entries
    if (updateDBModels) {
      for (const migrated of migratedFiles) {
        if (migrated.error) {
          /** @type {typeof import('../templates/B2File')} */
          const B2File = use('App/Models/B2File')
          const oldB2File = await B2File.find({
            contentSha1: migrated.old.info.contentSha1,
            fileId: migrated.old.info.fileId
          })

          const newB2File = B2File.fromBBlazeToB2File(migrated.new)
          await oldB2File.merge(newB2File)
          await oldB2File.save()
        }
      }
    }
    // restore default settings
    await this._loadDefaultConfig()
    return migratedFiles
  }

  async deleteB2Object({ fileId, fileName }) {
    if (this._b2Options.dummy) {
      return arguments[0]
    }
    return this.b2.deleteFileVersion({
      fileId,
      fileName
    })
  }

  /**
   * @param  {number} b2FileId // B2FileModel.id
   * @param  {'arraybuffer'| 'blob'| 'document'|'json'| 'text'| 'stream'} responseType // response types
   * @returns  {ArrayBuffer}
   */
  async downloadFileById(b2FileId, responseType = 'arraybuffer') {
    if (!this._b2Options.dummy) {
      /** @type {typeof import('../templates/B2File')} */
      const B2File = use('App/Models/B2File')
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
    return finalPath.join('/').split('//').join('/')
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
    /** @type {typeof import('../templates/B2File')} */
    const B2File = use('App/Models/B2File')
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

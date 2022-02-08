'use strict'

const hash = require('hasha')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

async function doTokenMigration(instance, opts) {
  const {
    from = null,
    to = null,
    limit = 10000,
    chunkSize = 1,
    updateDBModels = false,
    deleteOldFile = false
  } = opts
  if (instance.isDummy) throw new Error('Dummy mode is not supported for this method')

  if (!from) throw new Error('from config is required')
  if (!to) throw new Error('to config is required')
  let migratedFiles = []
  const appKeyTmpFolder = instance._helpers.tmpPath(
    '/migration-' +
      from.blazeAppKey.substr(from.blazeAppKey.length - 7, from.blazeAppKey.length - 1) +
      '-old'
  )
  const oldFilesReq = await instance.listFilesOnBucket({
    limit
  })
  const out = await downloadB2Files(
    instance,
    from,
    limit,
    chunkSize,
    oldFilesReq,
    appKeyTmpFolder,
    migratedFiles
  )
  migratedFiles = out.migratedFiles
  let downCount = out.downCount

  await instance.changeConfig(to)
  for (const id in migratedFiles) {
    try {
      let downloaded = migratedFiles[id]
      migratedFiles[id].error = null
      console.log(
        '[LOG] Uploading',
        'remaining',
        downCount--,
        'of',
        oldFilesReq?.files?.length ?? 0,
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
      const fileCreated = await instance.uploadBufferToBackBlaze({
        fileName: uploadName,
        bufferToUpload: fs.readFileSync(downloaded.old.tmpFilePath),
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
    await instance.changeConfig(opts.from)
    if (!hasError) {
      for (const migrate of migratedFiles) {
        downCount++
        console.log(
          '[LOG] Deleting old files ',
          downCount,
          'of',
          oldFilesReq?.files?.length ?? 0,
          ' old files'
        )
        await instance.deleteB2Object(migrate.old.info)
      }
      console.log('[LOG] finished migration')
    } else {
      console.log('[WARN] some files has errors during migration')
      console.log('[WARN] (nothing will be deleted)')
    }
  }
  // update all database entries
  if (updateDBModels) {
    for (const id in migratedFiles) {
      let migrated = migratedFiles[id]
      if (migrated.error) {
        console.warn('Skip because has error:', migrated.old.info.fileName)
      } else {
        /** @type {typeof import('../templates/B2File')} */
        const B2File = use('App/Models/B2File')
        const b2Model = await B2File.findBy('fileId', migrated.old.info.fileId)
        if (!b2Model) {
          const allreadyFound = await B2File.findBy('fileId', migrated.new.info.fileId)
          if (allreadyFound) {
            console.log('[LOG] model allready migrated fileId', migrated.new.info.fileId)
          } else {
            console.warn('[WARN] model not found fileId', migrated.old.info.fileId)
          }
          continue
        }
        const newB2File = B2File.fromBBlazeToB2File(migrated.new.info)
        await b2Model.merge(newB2File)
        await b2Model.save()
        migratedFiles[id].model = b2Model // save model reference to return
        console.log(
          '[LOG] Updated B2 Model:',
          migrated.old.info.fileName,
          'to',
          migrated.new.info.fileName
        )
      }
    }
  }
  // restore default settings
  console.log('[LOG] Restoring singleton config')
  await instance._loadDefaultConfig()
  console.log('[LOG] Migration process finished')
  return migratedFiles
}

async function downloadB2Files(
  instance,
  from,
  limit,
  chunkSize,
  oldFilesReq,
  appKeyTmpFolder,
  migratedFiles
) {
  await instance.changeConfig(from)

  console.log(
    '[LOG] Total old files to migrate:',
    oldFilesReq?.files?.length ?? 0,
    'chunked',
    chunkSize
  )

  let downCount = 0
  const chunked = _.chunk(oldFilesReq.files, chunkSize)
  for (const Cidx in chunked) {
    const chunksResolved = await Promise.all(
      chunked[Cidx].map(async oldFile => {
        let downObj = {
          hasFileCache: false,
          old: {},
          new: {}
        }
        try {
          // created this form because its more secure avoid file collisions
          const tmpFilePath = path.join(appKeyTmpFolder, oldFile.fileName)
          try {
            fs.accessSync(tmpFilePath, fs.constants.R_OK | fs.constants.W_OK)
            const sha1 = hash.fromFileSync(tmpFilePath, {
              algorithm: 'sha1',
              encoding: 'hex'
            })
            downObj.hasFileCache = sha1 === oldFile.contentSha1
          } catch (err) {
            console.error(err.code)
            console.warn('[C-' + Cidx + ']', '[WARN] blocked or not exists!', tmpFilePath)
          }
          if (downObj.hasFileCache) {
            console.log('[C-' + Cidx + ']', '[LOG] skipping allready downloaded:', oldFile.fileName)
          } else {
            const downloaded = await instance.b2.downloadFileById({
              fileId: oldFile.fileId,
              responseType: 'arraybuffer'
            })
            console.log(
              '[C-' + Cidx + ']',
              '[LOG] DOWNLOADED',
              downCount,
              'of',
              oldFilesReq?.files?.length ?? 0,
              'old files'
            )
            try {
              fs.mkdirSync(path.parse(tmpFilePath).dir, {
                recursive: true
              })
            } catch (e) {
              console.warn('[WARN] file err mkdirSync!', e.code)
              if (e.code !== 'EEXIST') {
                throw e
              }
            }
            try {
              fs.writeFileSync(tmpFilePath, downloaded.data)
            } catch (e) {
              console.warn('[WARN] file err writeFileSync!', e.code)
              if (e.code !== 'EEXIST') {
                throw e
              }
            }
          }

          downObj.old = {
            info: oldFile,
            tmpFilePath
          }
        } catch (error) {
          downObj.error = error
          console.error('[ERROR]', error)
        }
        downCount++
        return downObj
      })
    )
    migratedFiles.push(...chunksResolved)
  }

  console.log('[LOG] All files downloaded with success')
  console.log('[LOG] Changing to new token and uploading:')
  return { migratedFiles, downCount }
}

module.exports = doTokenMigration

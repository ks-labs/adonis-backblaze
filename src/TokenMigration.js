'use strict'
/** @typedef {import('./B2Service')} B2Service*/

const hash = require('hasha')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

/**
 * @param  {B2Service} instance - B2Service instance
 * @param  {Object} opts - B2Service Migration Options
 */
async function doTokenMigration(instance, opts) {
  const {
    from = null,
    to = null,
    limit = 10000,
    chunkSize = 1,
    updateDBModels = false,
    removeSlashPrefix = false,
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

  const uploaded = await uploadDownloaded(
    instance,
    to,
    migratedFiles,
    downCount,
    oldFilesReq,
    from,
    chunkSize,
    removeSlashPrefix
  )
  downCount = uploaded.downCount
  migratedFiles = uploaded.migratedFiles
  let hasError = false
  for (const migrate of migratedFiles) {
    if (migrate.error) {
      hasError = true
    }
  }
  console.log('[LOG] All files migrated, has error ?', hasError)
  if (deleteOldFile) {
    console.log('[LOG] Changing to old token and deleting old files:')
    if (!hasError) {
      for (const cEntry of migratedFiles) {
        downCount++
        console.log(
          '[LOG] Deleting old files ',
          downCount,
          'of',
          oldFilesReq?.files?.length ?? 0,
          ' old files'
        )
        await instance.deleteB2Object(cEntry.old.info)
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
      let cEntry = migratedFiles[id]
      if (cEntry.error) {
        console.warn('Skipping with error:', cEntry.old.info.fileName, cEntry.error.message)
      } else {
        /** @type {typeof import('../templates/B2File')} */
        const B2File = use('App/Models/B2File')
        const b2Model = await B2File.findBy('fileId', cEntry.old.info.fileId)
        if (!b2Model) {
          const allreadyFound = await B2File.findBy('fileId', cEntry.new.info.fileId)
          if (allreadyFound) {
            console.log('[LOG] model allready updated:', cEntry.new.info.fileId)
          } else {
            console.warn('[WARN] model not found to update:', cEntry.old.info.fileId)
          }
          continue
        }
        const newB2File = B2File.fromBBlazeToB2File(cEntry.new.info)
        await b2Model.merge(newB2File)
        await b2Model.save()
        migratedFiles[id].model = b2Model // save model reference to return
        console.log(
          '[LOG] Updated B2 Model:',
          cEntry?.old?.info?.fileName?.substring(0, 20) + '... to',
          cEntry?.new?.info?.fileName?.substring(0, 20) + '...'
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
/**
 * @param  {B2Service} instance
 * @param  {} to
 * @param  {} migratedFiles
 * @param  {} downCount
 * @param  {} oldFilesReq
 * @param  {} from
 * @param  {} chunkSize
 */
async function uploadDownloaded(
  instance,
  to,
  migratedFiles,
  downCount,
  oldFilesReq,
  from,
  chunkSize,
  removeSlashPrefix
) {
  const finishedEntries = []
  const chunks = _.chunk(migratedFiles, chunkSize)
  await instance.changeConfig(to)
  for (const cId in chunks) {
    const chunkEntriesFinished = await Promise.all(
      chunks[cId].map(async state => {
        state.hasUpload = false
        if (!state.error) {
          state.error = null
        }
        try {
          const uploadName = createUploadPath(from, to, state, removeSlashPrefix)
          const fileVersions = await instance.listFileVersions({
            startFileName: uploadName
          })
          state.hasUpload =
            fileVersions &&
            fileVersions?.data &&
            fileVersions?.data?.files?.length &&
            fileVersions?.data?.files[0].contentSha1 === state?.old?.info?.contentSha1

          if (state.hasUpload) {
            const uploadReference = fileVersions?.data?.files[0] ?? null
            console.log(
              '[C-' + cId + ']',
              '[LOG] Upload remaining',
              downCount,
              'of',
              oldFilesReq?.files?.length ?? 0,
              'total',
              'allready exists skipping',
              uploadReference.fileName
            )
            state.new.info = uploadReference ?? null
          } else {
            console.log(
              '[C-' + cId + ']',
              '[LOG] Upload remaining',
              downCount,
              'of',
              oldFilesReq?.files?.length ?? 0
            )
            const fileCreated = await instance.uploadBufferToBackBlaze({
              fileName: uploadName,
              bufferToUpload: fs.readFileSync(state.old.tmpFilePath),
              info: state.old.info.info
            })
            state.new.info = fileCreated?.data
          }
          if (state.new.info.contentSha1 != state.old.info.contentSha1) {
            throw new SHA1MismatchException()
          }
        } catch (error) {
          console.error(error.message, state.old.info.fileId)
          state.error = error
        }
        downCount--
        return state
      })
    )
    finishedEntries.push(...chunkEntriesFinished)
  }

  await instance.changeConfig(from)
  return { downCount, migratedFiles: finishedEntries }
}

function createUploadPath(from, to, chunkEntry, removeSlashPrefix) {
  let finalUploadPath = chunkEntry.old.info.fileName
  if (
    from.blazeAppKeyPrefix &&
    from.blazeAppKeyPrefix.length &&
    from.blazeAppKeyPrefix !== to.blazeAppKeyPrefix
  ) {
    // remove the old prefix from the file name
    finalUploadPath = finalUploadPath.split(from.blazeAppKeyPrefix).join('')
  }
  if (removeSlashPrefix && finalUploadPath.startsWith('/')) {
    finalUploadPath = finalUploadPath.replace(/^\/+/, '')
  }
  return finalUploadPath
}
/**
 * @param  {B2Service} instance
 * @param  {} from
 * @param  {} limit
 * @param  {} chunkSize
 * @param  {} oldFilesReq
 * @param  {} appKeyTmpFolder
 * @param  {} migratedFiles
 * @param  {} removeSlashPrefix
 */

async function downloadB2Files(
  instance,
  from,
  limit,
  chunkSize,
  oldFilesReq,
  appKeyTmpFolder,
  migratedFiles,
  removeSlashPrefix = false
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
  for (const cIdx in chunked) {
    const chunksResolved = await Promise.all(
      chunked[cIdx].map(async cEntry => {
        let migrationObj = {
          downCached: false,
          old: {},
          new: {}
        }
        try {
          // created this form because its more secure avoid file collisions
          const tmpFilePath = path.join(appKeyTmpFolder, cEntry.fileId, cEntry.fileName)
          try {
            fs.accessSync(tmpFilePath, fs.constants.R_OK | fs.constants.W_OK)
            const sha1 = hash.fromFileSync(tmpFilePath, {
              algorithm: 'sha1',
              encoding: 'hex'
            })
            migrationObj.downCached = sha1 === cEntry.contentSha1
          } catch (err) {
            if (err.code !== 'ENOENT') {
              console.error(err.code)
              console.warn('[C-' + cIdx + ']', '[WARN] file blocked!', cEntry.fileName)
            }
          }
          if (migrationObj.downCached) {
            console.log('[C-' + cIdx + ']', '[LOG] skipping allready downloaded:', cEntry.fileName)
          } else {
            const downloaded = await instance.b2.downloadFileById({
              fileId: cEntry.fileId,
              responseType: 'arraybuffer'
            })
            console.log(
              '[C-' + cIdx + ']',
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

          migrationObj.old = {
            info: cEntry,
            tmpFilePath
          }
        } catch (error) {
          migrationObj.error = error
          console.error('[ERROR]', error)
        }
        downCount++
        return migrationObj
      })
    )
    migratedFiles.push(...chunksResolved)
  }

  console.log('[LOG] All files downloaded with success')
  console.log('[LOG] Changing to new token and uploading:')
  return { migratedFiles, downCount }
}

module.exports = doTokenMigration

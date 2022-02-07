'use strict'
require('dotenv').config('test.env')

const test = require('japa')

const { ioc } = require('@adonisjs/fold')
const { emptyBucket: clearBucket } = require('../setup/helpers')

test.group('Backblaze Integration Tests', group => {
  let cfgWithSlashPrefix
  let cfgWithoutSlash
  /** @type {import('../../src/B2Service')} B2Service */
  let b2Singleton
  group.before(async () => {
    const setup = require('../setup')
    await setup({ dummy: false })
  })

  group.beforeEach(async () => {
    await ioc.restore()
    cfgWithSlashPrefix = {
      blazeAppKey: process.env.OLD_B2_APP_KEY,
      blazeAppKeyID: process.env.OLD_B2_APP_KEY_ID,
      blazeAppKeyName: process.env.OLD_B2_APP_KEY_NAME,
      blazeAppKeyPrefix: process.env.OLD_B2_APP_KEY_PREFIX
    }

    cfgWithoutSlash = {
      blazeAppKey: process.env.B2_APP_KEY,
      blazeAppKeyID: process.env.B2_APP_KEY_ID,
      blazeAppKeyName: process.env.B2_APP_KEY_NAME,
      blazeAppKeyPrefix: process.env.B2_APP_KEY_PREFIX
    }

    if (!cfgWithSlashPrefix.blazeAppKey) throw new Error('OLD_B2_APP_KEY is not defined')
    if (!cfgWithoutSlash.blazeAppKey) throw new Error('B2_APP_KEY is not defined')

    b2Singleton = ioc.use('BackBlaze')
    await clearBucket(b2Singleton, cfgWithSlashPrefix)
  })

  test('B2Provider', async t => {
    t.isDefined(ioc.use('BackBlaze'))
    t.isTrue(ioc._bindings.AdonisB2.singleton)
  })

  test('B2Config Loaded Correctly', async t => {
    const b2Options = ioc.use('BackBlaze')._b2Options
    t.isDefined(b2Options)
    t.strictEqual(b2Options.dummy, undefined)

    t.notStrictEqual(b2Options.blazeAppKeyID, 'testing')
    t.notStrictEqual(b2Options.blazeAppKeyID, 'testing')
    t.notStrictEqual(b2Options.blazeAppKeyID, 'testing')
    t.equal(b2Options.defaultTimeout, 1800000)
  })

  test('B2File Creation', async t => {
    t.isDefined(ioc.use('BackBlaze')._b2Options)

    await b2Singleton.authorize()
    const entityCreated = await b2Singleton.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('File Content'),
      fileName: 'test.txt',
      pathToFile: 'custom-folder',
      originalName: 'original.name.txt'
    })
    t.isDefined(entityCreated.id)
    t.isNumber(entityCreated.id)
  })

  test('B2File Upload And Listing', async t => {
    await b2Singleton.changeConfig(cfgWithoutSlash)
    await b2Singleton.authorize()

    await b2Singleton.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('File Content !!'),
      fileName: 'test.txt',
      pathToFile: 'custom-folder',
      originalName: 'original.name.txt'
    })
    await b2Singleton.authorize()
    const data = await b2Singleton.listFilesOnBucket({
      prefix: 'custom-folder'
    })
    // test
    // 'provider-files/custom-folder/test.txt'

    // omega
    // '/omega-test/certificates/3f10233f64f7294d4df9fd653b7627c4.pdf'
    // '/omega-test/certificates/4ce87c1719b67d6027d45a2517c8f56a.xls'

    t.strictEqual(data.files[0].fileName, 'provider-files/custom-folder/test.txt')
    t.isAbove(data.files.length, 0)
    t.equal(data.files.length, 1)
  })

  // test
  // 'provider-files/custom-folder/test.txt'

  // omega
  // '/omega-test/certificates/3f10233f64f7294d4df9fd653b7627c4.pdf'
  // '/omega-test/certificates/4ce87c1719b67d6027d45a2517c8f56a.xls'
  test('Move file to different app token and prefix', async t => {
    await clearBucket(b2Singleton)
    await b2Singleton.changeConfig(cfgWithSlashPrefix)
    await b2Singleton.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('Text Content !!'),
      fileName: 'test.txt',
      pathToFile: 'move-file',
      originalName: 'original.name.txt'
    })

    // List all files uploaded
    const payload = await b2Singleton.listFilesOnBucket({
      limit: 1000
    })
    t.isNotNull(payload.files)
    const firstFile = payload.files[0]

    t.isNotEmpty(firstFile)
    await b2Singleton.authorize()
    const newMovedFile = await b2Singleton.moveFileByFileId({
      originFileId: firstFile.fileId,
      deleteOldFile: true,
      replacePath: 'new-moved',
      credentials: {
        from: cfgWithSlashPrefix,
        to: cfgWithoutSlash
      }
    })

    t.isNotEmpty(newMovedFile)

    t.strictEqual(newMovedFile.data.fileName, 'provider-files/new-moved/test.txt')
    t.strictEqual(newMovedFile.data.contentSha1, firstFile.contentSha1)
    await b2Singleton.changeConfig(cfgWithoutSlash)
    const deleted = await b2Singleton.deleteB2Object(newMovedFile.data)
    t.isNotEmpty(deleted)

    await b2Singleton.changeConfig(cfgWithSlashPrefix)
    await clearBucket(b2Singleton)
  })

  test('Move all files from one app token to another', async t => {
    await b2Singleton.changeConfig(cfgWithSlashPrefix)

    await clearBucket(b2Singleton)

    const uploadedFiles = await Promise.all([
      b2Singleton.uploadAndInsertB2File({
        bufferToUpload: Buffer.from('Text Content !!'),
        fileName: 'test1.txt',
        pathToFile: 'migration-folder',
        originalName: 'original.name1.txt'
      }),
      b2Singleton.uploadAndInsertB2File({
        bufferToUpload: Buffer.from('Text Content !!'),
        fileName: 'test2.txt',
        pathToFile: 'migration-folder',
        originalName: 'original.name2.txt'
      }),
      b2Singleton.uploadAndInsertB2File({
        bufferToUpload: Buffer.from('Text Content !!'),
        fileName: 'test3.txt',
        pathToFile: 'migration-folder',
        originalName: 'original.name3.txt'
      })
    ])
    console.log('Uploaded all 3 test files')
    // List all files uploaded
    const beforeMove = await b2Singleton.listFilesOnBucket({
      limit: 1000
    })
    t.isNotEmpty(beforeMove.files)
    t.equal(beforeMove.files.length, 3)
    t.equal(uploadedFiles[0].fileName, '/slash-prefix/migration-folder/test1.txt')

    await b2Singleton.migrateTokenAndDatabaseNames({
      deleteOldFiles: true,
      updateDBModels: true,
      from: cfgWithSlashPrefix,
      to: cfgWithoutSlash
    })

    await b2Singleton.changeConfig(cfgWithoutSlash)
    const afterMove = await b2Singleton.listFilesOnBucket({
      prefix: 'migration-folder',
      limit: 1000
    })
    t.isNotEmpty(afterMove.files)
    t.equal(afterMove.files.length, 3)
    t.equal(afterMove.files[0].fileName, 'provider-files/migration-folder/test1.txt')
    await clearBucket(b2Singleton, cfgWithoutSlash)
  })
})

'use strict'
require('dotenv').config('test.env')

const test = require('japa')
const should = require('should')

const { ioc } = require('@adonisjs/fold')
/** @typedef {import('../../src/B2Service')} B2Service*/
const { emptyBucket } = require('../setup/helpers')

test.group('Backblaze Integration Tests', group => {
  group.before(async () => {
    const setup = require('../setup')
    await setup({ dummy: false })
  })

  group.beforeEach(async () => {
    await ioc.restore()
  })

  test('B2Provider', async assert => {
    assert.isDefined(ioc.use('AdonisB2'))
    assert.isTrue(ioc._bindings.AdonisB2.singleton)
  })

  test('B2Config Loaded Correctly', async assert => {
    const b2Options = ioc.use('AdonisB2')._b2Options
    assert.isDefined(b2Options)
    assert.strictEqual(b2Options.dummy, undefined)

    assert.notStrictEqual(b2Options.blazeAppKeyID, 'testing')
    assert.notStrictEqual(b2Options.blazeAppKeyID, 'testing')
    assert.notStrictEqual(b2Options.blazeAppKeyID, 'testing')
    assert.equal(b2Options.defaultTimeout, 1800000)
  })

  test('B2File Creation', async assert => {
    assert.isDefined(ioc.use('AdonisB2')._b2Options)
    /** @type {B2Service} */
    const B2Provider = ioc.use('AdonisB2')
    await B2Provider.authorize()
    const entityCreated = await B2Provider.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('File Content'),
      fileName: 'test.txt',
      pathToFile: 'custom-folder',
      originalName: 'original.name.txt'
    })
    assert.isDefined(entityCreated.id)
    assert.isNumber(entityCreated.id)
  })

  test('B2File Upload And Listing', async assert => {
    const B2Provider = ioc.use('AdonisB2')
    await B2Provider.authorize()
    const entityCreated = await B2Provider.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('File Content !!'),
      fileName: 'test.txt',
      pathToFile: 'custom-folder',
      originalName: 'original.name.txt'
    })
    await B2Provider.authorize()
    const data = await B2Provider.listFilesOnBucket({
      prefix: 'custom-folder'
    })
    // test
    // 'provider-files/custom-folder/test.txt'

    // omega
    // '/omega-test/certificates/3f10233f64f7294d4df9fd653b7627c4.pdf'
    // '/omega-test/certificates/4ce87c1719b67d6027d45a2517c8f56a.xls'

    should(data.files[0].fileName).be.exactly('provider-files/custom-folder/test.txt')
    should(data.files.length).be.greaterThan(0)
    should(data.files.length).be.equal(1)
  })

  // test
  // 'provider-files/custom-folder/test.txt'

  // omega
  // '/omega-test/certificates/3f10233f64f7294d4df9fd653b7627c4.pdf'
  // '/omega-test/certificates/4ce87c1719b67d6027d45a2517c8f56a.xls'
  test('Object move to different app token and prefix', async assert => {
    const oldConfigSlash = {
      blazeAppKey: process.env.OLD_B2_APP_KEY,
      blazeAppKeyID: process.env.OLD_B2_APP_KEY_ID,
      blazeAppKeyName: process.env.OLD_B2_APP_KEY_NAME,
      blazeAppKeyPrefix: process.env.OLD_B2_APP_KEY_PREFIX
    }
    if (!oldConfigSlash.blazeAppKey) throw new Error('OLD_B2_APP_KEY is not defined')

    const newConfigWithout = {
      blazeAppKey: process.env.B2_APP_KEY,
      blazeAppKeyID: process.env.B2_APP_KEY_ID,
      blazeAppKeyName: process.env.B2_APP_KEY_NAME,
      blazeAppKeyPrefix: process.env.B2_APP_KEY_PREFIX
    }
    if (!newConfigWithout.blazeAppKey) throw new Error('B2_APP_KEY is not defined')

    /** @type {B2Service} */
    const B2Provider = ioc.use('AdonisB2')
    await B2Provider._changeConfig(oldConfigSlash)
    const slashedObject = await B2Provider.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('Text Content !!'),
      fileName: 'test.txt',
      pathToFile: 'custom-folder',
      originalName: 'original.name.txt'
    })

    // List all files uploaded
    const payload = await B2Provider.listFilesOnBucket({
      limit: 1000
    })
    should(payload.files).be.not.null()
    const firstFile = payload.files[0]
    should(firstFile).not.be.empty()

    const newMovedFile = await B2Provider.moveFileByFileId({
      originFileId: firstFile.fileId,
      deleteOldFile: true,
      newFilePath: 'new-moved',
      changeConfig: {
        from: oldConfigSlash,
        to: newConfigWithout
      }
    })

    should(newMovedFile).not.be.empty()
    should(newMovedFile.data.fileName).be.exactly('provider-files/new-moved/test.txt')
    should(newMovedFile.data.contentSha1).be.exactly(firstFile.contentSha1)
    await B2Provider.authorize()
    const deleted = await B2Provider.deleteB2Object(newMovedFile.data)
    should(deleted).not.be.empty()

    await B2Provider._changeConfig(oldConfigSlash)
    await B2Provider.authorize()
    const deletedSlash = await B2Provider.deleteB2Object(slashedObject)
    should(deletedSlash).not.be.empty()
  })

  test.only('Move all files from one app token to another', async assert => {
    const configWithSlash = {
      blazeAppKey: process.env.OLD_B2_APP_KEY,
      blazeAppKeyID: process.env.OLD_B2_APP_KEY_ID,
      blazeAppKeyName: process.env.OLD_B2_APP_KEY_NAME,
      blazeAppKeyPrefix: process.env.OLD_B2_APP_KEY_PREFIX
    }
    if (!configWithSlash.blazeAppKey) throw new Error('OLD_B2_APP_KEY is not defined')

    const configWithoutSlash = {
      blazeAppKey: process.env.B2_APP_KEY,
      blazeAppKeyID: process.env.B2_APP_KEY_ID,
      blazeAppKeyName: process.env.B2_APP_KEY_NAME,
      blazeAppKeyPrefix: process.env.B2_APP_KEY_PREFIX
    }
    if (!configWithoutSlash.blazeAppKey) throw new Error('B2_APP_KEY is not defined')
    /** @type {B2Service} */
    const b2Instance = ioc.use('AdonisB2')
    await b2Instance._changeConfig(configWithSlash)

    await emptyBucket(b2Instance)

    console.log(
      'Uploaded all files',
      await Promise.all([
        b2Instance.uploadAndInsertB2File({
          bufferToUpload: Buffer.from('Text Content !!'),
          fileName: 'test1.txt',
          pathToFile: 'migration-folder',
          originalName: 'original.name1.txt'
        }),
        b2Instance.uploadAndInsertB2File({
          bufferToUpload: Buffer.from('Text Content !!'),
          fileName: 'test2.txt',
          pathToFile: 'migration-folder',
          originalName: 'original.name2.txt'
        }),
        b2Instance.uploadAndInsertB2File({
          bufferToUpload: Buffer.from('Text Content !!'),
          fileName: 'test3.txt',
          pathToFile: 'migration-folder',
          originalName: 'original.name3.txt'
        })
      ])
    )
    // List all files uploaded
    const beforeMove = await b2Instance.listFilesOnBucket({
      limit: 1000
    })
    should(beforeMove.files).be.not.null()
    should(beforeMove.files.length).be.equal(3)
    should(beforeMove.files[0].fileName).not.be.empty()

    const migration = await b2Instance.migrateFilesFromToken({
      from: configWithSlash,
      to: configWithoutSlash
    })

    await b2Instance._changeConfig(configWithoutSlash)
    const afterMove = await b2Instance.listFilesOnBucket({
      limit: 1000
    })
    should(afterMove.files).be.not.null()
    should(afterMove.files.length).be.equal(6)
    should(afterMove.files[0]).not.be.empty()
    await emptyBucket(b2Instance, configWithoutSlash)
  })
})

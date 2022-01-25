'use strict'
/** @typedef {import('../src/B2Service')} B2Service*/

const test = require('japa')
const { ioc } = require('@adonisjs/fold')
const should = require('should')

const setup = require('./setup')
require('dotenv').config('test.env')

test.group('Integration Test Authentication', group => {
  group.before(async () => {
    await setup({ dummy: false })
  })

  group.beforeEach(() => {
    ioc.restore()
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
  test('Back blaze object move to diferent app prefix', async assert => {
    const configWithSlash = {
      blazeAppKey: process.env.OLD_B2_APP_KEY,
      blazeAppKeyID: process.env.OLD_B2_APP_KEY_ID,
      blazeAppKeyName: process.env.OLD_B2_APP_KEY_NAME,
      blazeAppKeyPrefix: process.env.OLD_B2_APP_KEY_PREFIX
    }
    const configWithoutSlash = {
      blazeAppKey: process.env.B2_APP_KEY,
      blazeAppKeyID: process.env.B2_APP_KEY_ID,
      blazeAppKeyName: process.env.B2_APP_KEY_NAME,
      blazeAppKeyPrefix: process.env.B2_APP_KEY_PREFIX
    }
    /** @type {B2Service} */
    const B2Provider = ioc.use('AdonisB2')
    await B2Provider._changeConfig(configWithSlash)
    const slashedObject = await B2Provider.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('File Content !!'),
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
      b2FileId: firstFile.fileId,
      newFilePath: 'new-moved',
      dontDeleteOld: true,
      changeConfig: {
        to: configWithoutSlash
      }
    })

    should(newMovedFile).not.be.empty()
    should(newMovedFile.data.fileName).be.exactly('provider-files/new-moved/test.txt')
    should(newMovedFile.data.contentSha1).be.exactly(firstFile.contentSha1)
    await B2Provider.authorize()
    const deleted = await B2Provider.deleteB2Object(newMovedFile.data)
    should(deleted).not.be.empty()

    await B2Provider._changeConfig(configWithSlash)
    await B2Provider.authorize()
    const deletedSlash = await B2Provider.deleteB2Object(slashedObject)
    should(deletedSlash).not.be.empty()
  })
})

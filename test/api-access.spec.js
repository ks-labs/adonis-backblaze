'use strict'

const test = require('japa')
const { ioc } = require('@adonisjs/fold')

const setup = require('./setup')
/** @typedef {import('../src/B2Service')} B2Service*/

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
    assert.strictEqual(b2Options.dummy, false)

    assert.notStrictEqual(b2Options.blazeAppKeyID, 'testing')
    assert.notStrictEqual(b2Options.blazeAppKeyID, 'testing')
    assert.notStrictEqual(b2Options.blazeAppKeyID, 'testing')
    assert.equal(b2Options.defaultTimeout, 1800000)
  })

  test('B2File Creation And Deletion', async assert => {
    assert.isDefined(ioc.use('AdonisB2')._b2Options)
    /** @type {B2Service} */
    const B2Provider = ioc.use('AdonisB2')
    await B2Provider.authorize()
    const entityCreated = await B2Provider.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('File Content'),
      fileName: 'test.txt',
      prefix: 'custom-folder',
      originalName: 'original.name.txt'
    })
    assert.isDefined(entityCreated.id)
    assert.isNumber(entityCreated.id)
  })
})

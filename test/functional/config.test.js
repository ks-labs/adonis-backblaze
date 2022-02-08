'use strict'

const test = require('japa')
const { ioc } = require('@adonisjs/fold')

const setup = require('../setup')

test.group('Providers initialization working', group => {
  let b2Instance
  group.before(async () => {
    await setup({ dummy: true })
  })

  group.beforeEach(() => {
    ioc.restore()
    b2Instance = ioc.use('AdonisB2')
  })

  test('B2 Provider Registered', async assert => {
    assert.isNotEmpty(b2Instance)
    assert.isTrue(ioc._bindings['AdonisB2'].singleton)
  })

  test('B2Config Loaded Correctly', async assert => {
    assert.isDefined(b2Instance._b2Options)
    const b2Options = b2Instance._b2Options

    // default value is always false but here we are testing is true
    assert.strictEqual(b2Options.dummy, true)
    assert.strictEqual(b2Options.blazeAppKeyID, 'testing')
    assert.equal(b2Options.defaultTimeout, 1800000) // default value is always 1800000
  })

  test('B2File Creation', async assert => {
    assert.isDefined(b2Instance._b2Options)

    const uploeaded = await b2Instance.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('test')
    })
    assert.isDefined(uploeaded.id)
    assert.isNumber(uploeaded.id)
  })
})

'use strict'

const test = require('japa')
const { ioc } = require('@adonisjs/fold')

const setup = require('../setup')

test.group('Providers initialization working', group => {
  group.before(async () => {
    await setup()
  })

  group.beforeEach(() => {
    ioc.restore()
  })

  test('B2Provider', async assert => {
    assert.isDefined(ioc.use('BackBlaze'))
    assert.isTrue(ioc._bindings.BackBlaze.singleton)
  })

  test('B2Config Loaded Correctly', async assert => {
    assert.isDefined(ioc.use('BackBlaze')._b2Options)
    const b2Options = ioc.use('BackBlaze')._b2Options

    assert.strictEqual(b2Options.dummy, true)
    assert.strictEqual(b2Options.blazeAppKeyID, 'testing')
    assert.equal(b2Options.defaultTimeout, 1800000)
  })

  test('B2File Creation', async assert => {
    assert.isDefined(ioc.use('BackBlaze')._b2Options)
    const B2Provider = ioc.use('BackBlaze')
    const uploeaded = await B2Provider.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('test')
    })
    assert.isDefined(uploeaded.id)
    assert.isNumber(uploeaded.id)
  })
})

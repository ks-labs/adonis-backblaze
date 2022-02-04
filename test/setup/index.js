'use strict'

const path = require('path')
const { ioc, registrar, resolver } = require('@adonisjs/fold')
const { Config, Helpers, Env } = require('@adonisjs/sink')
const { Macroable } = require('macroable')
const FakeB2Model = require('./FakeB2Model')

class Context extends Macroable {
  static onReady() {}

  constructor() {
    super()
    this._qs = {}

    this.env = 'testing'

    // mock for the ctx.request object to get query params
    this.request = {
      get: () => this._qs
    }
  }
}
Context.getters = {}
Context.macros = {}

const fakeConfig = {
  dummy: true,
  // Load Envs
  blazeAppKeyID: 'testing',
  blazeAppKey: 'testing',
  blazeBucketID: 'testing',
  /** In general a path to /location that you token have access */
  blazeAppKeyPrefix: 'testing',
  defaultDownloadTime: parseInt('8640'),
  defaultTimeout: parseInt('1800000')
}

require('dotenv').config({
  path: 'test.env'
})
const testConfig = {
  // Load Envs
  blazeAppKeyID: process.env.B2_APP_KEY_ID,
  blazeAppKeyName: process.env.B2_APP_KEY_NAME,
  blazeAppKey: process.env.B2_APP_KEY,
  /** In general a path to /location that you token have access */
  blazeBucketID: process.env.B2_BUCKET_ID,
  blazeBucketName: process.env.B2_BUCKET_NAME,

  blazeAppKeyPrefix: process.env.B2_APP_KEY_PREFIX,

  defaultDownloadTime: parseInt('8640'),
  defaultTimeout: parseInt('1800000')
}

module.exports = async (opts = { dummy: true }) => {
  ioc.bind('App/Models/B2File', () => FakeB2Model)

  ioc.bind('Helpers', () => new Helpers(path.join(__dirname + '/../')))
  ioc.bind('Env', () => Env)

  ioc.singleton('Adonis/Src/Config', () => {
    const config = new Config()

    if (opts.dummy) {
      config.set('app.b2-provider', fakeConfig)
    } else {
      config.set('app.b2-provider', testConfig)
    }

    return config
  })

  resolver.appNamespace('App')

  await registrar.providers([path.join(__dirname, '../../providers/B2Provider')]).registerAndBoot()
}

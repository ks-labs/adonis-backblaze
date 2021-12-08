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

module.exports = async () => {
  ioc.bind('App/Models/B2File', () => FakeB2Model)

  ioc.bind('Helpers', () => Helpers)
  ioc.bind('Env', () => Env)

  ioc.singleton('Adonis/Src/Config', () => {
    const config = new Config()

    config.set('app.b2-provider', {
      /*
       * When enabled, AdonisB2 will automatically avoid upload to backblaze
       * returning a dummy file
       */
      dummy: true,
      // Load Envs
      blazeAppKeyID: 'testing',
      blazeAppKey: 'testing',
      blazeBucketID: 'testing',
      blazeAccessToken: 'testing',
      /** In general a path to /location that you token have access */
      bucketPrefix: 'testing',
      defaultDownloadTime: parseInt('8640'),
      defaultTimeout: parseInt('1800000')
    })

    return config
  })

  resolver.appNamespace('App')

  await registrar.providers([path.join(__dirname, '../../providers/B2Provider')]).registerAndBoot()
}

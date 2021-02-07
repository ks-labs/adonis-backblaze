'use strict'

const { ServiceProvider } = require('@adonisjs/fold')
const B2Service = require('../service/B2Service')

class B2ServiceProvider extends ServiceProvider {
  /**
   * Register namespaces to the IoC container
   *
   * @method register
   *
   * @return {void}
   */
  register() {
    this.app.singleton('Adonis/Addons/BackBlaze', app => {
      return new B2Service(app)
    })
    this.app.alias('Adonis/Addons/BackBlaze', 'BackBlaze')
  }

  /**
   * Attach context getter when all providers have
   * been registered
   *
   * @method boot
   *
   * @return {void}
   */
  boot() {}
}

module.exports = B2ServiceProvider

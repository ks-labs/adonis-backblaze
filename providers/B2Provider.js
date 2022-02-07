'use strict'

/**
 * adonis-B2
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const { ServiceProvider } = require('@adonisjs/fold')
const B2Service = require('../src/B2Service')

class B2Provider extends ServiceProvider {
  /**
   * Register all the required providers
   *
   * @method register
   *
   * @return {void}
   */
  register() {
    this.app.singleton('AdonisB2', app => {
      const Config = this.app.use('Adonis/Src/Config')
      const Helpers = this.app.use('Helpers')
      return new B2Service(Config, Helpers)
    })
  }

  /**
   * Bind transform to the http context
   *
   * @method boot
   *
   * @return {void}
   */
  boot() {}
}

module.exports = B2Provider

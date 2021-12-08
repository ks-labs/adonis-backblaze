'use strict'

/**
 * adonis-bumblebee
 *
 * (c) Ralph Huwiler <ralph@huwiler.rocks>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const path = require('path')

module.exports = async cli => {
  try {
    await cli.copy(
      path.join(__dirname, './templates/config.js'),
      path.join(cli.helpers.configPath(), 'b2-provider.js')
    )
    await cli.command.completed('create', 'config/bumblebee.js')
  } catch (error) {
    // ignore error
    await cli.command.failed('create', 'config/bumblebee.js')
    cli.command.info(
      'config/bumblebee.js already exists. Copy the config file and check differences manually.'
    )
  }
  try {
    await cli.copy(
      path.join(__dirname, './templates/B2File.js'),
      path.join(cli.Helpers.appRoot(), 'Models/B2File.js')
    )
    await cli.command.completed('create', 'Models/B2File.js')
  } catch (error) {
    // ignore error
    cli.command.info(
      'Models/B2File.js already exists. Copy the config file and check differences manually.'
    )
  }
  try {
    await cli.copy(
      path.join(__dirname, './templates/1607035890123_b_2_file_schema.js'),
      path.join(cli.Helpers.migrationsPath(), '1607035890123_b_2_file_schema.js')
    )
    await cli.command.completed('create', 'migrations/1607035890123_b_2_file_schema.js')
  } catch (error) {
    // ignore error
    cli.command.info(
      'migrations/1607035890123_b_2_file_schema.js already exists. Copy the config file and check differences manually.'
    )
  }
}

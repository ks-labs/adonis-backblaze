'use strict'
const path = require('path')

module.exports = async cli => {
  try {
    await cli.copy(
      path.join(__dirname, './templates/config.js'),
      path.join(cli.helpers.configPath(), 'b2-provider.js')
    )
    await cli.command.completed('create', 'config/b2-provider.js')
  } catch (error) {
    // ignore error
    await cli.command.failed('create', 'config/b2-provider.js')
    await cli.command.info(
      'config/b2-provider.js already exists. Copy the config file and check differences manually.'
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
    await cli.command.info(
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
    await cli.command.info(
      'migrations/1607035890123_b_2_file_schema.js already exists. Copy the config file and check differences manually.'
    )
  }
}

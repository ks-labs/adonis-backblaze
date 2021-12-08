'use strict'
// b2-provider.js

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

module.exports = {
  /*
   * When enabled, AdonisB2 will automatically avoid upload to backblaze
   * returning a dummy file
   */
  dummy: Env.get('BLAZE_DISABLE_UPLOAD', 'false') === 'true',
  // Load Envs
  blazeAppKeyID: Env.get('BLAZE_KEY_ID'),
  blazeAppKey: Env.get('BLAZE_APP_KEY'),
  blazeBucketID: Env.get('BLAZE_BUCKET_ID'),
  blazeAccessToken: Env.get('BLAZE_APP_KEY'),
  /** In general a path to /location that you token have access */
  bucketPrefix: Env.get('BLAZE_PREFIX'),
  defaultDownloadTime: parseInt(
    Env.get('BLAZE_DEFAULT_DOWNLOAD_DURATION', 8640)
  ),
  defaultTimeout: 1800000 // time in millis for timeout links during download
}

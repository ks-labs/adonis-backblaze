'use strict'
// b2-provider.js

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

module.exports = {
  /*
   * When enabled, AdonisB2 will automatically avoid upload to backblaze
   * returning a dummy file
   */
  dummy: Env.get('BLAZE_DISABLE_UPLOAD') == 'true' ? true : false,
  // Load Envs
  blazeAppKeyID: Env.get('B2_APP_KEY_ID'),
  blazeAppKeyName: Env.get('B2_APP_KEY_NAME'),
  blazeAppKey: Env.get('B2_APP_KEY'),
  blazeBucketID: Env.get('B2_BUCKET_ID'),
  blazeBucketName: Env.get('B2_BUCKET_NAME'),

  /** In general a path to /location that you token have access */
  bucketPrefix: Env.get('B2_APP_KEY_PREFIX'),
  defaultDownloadTime: parseInt(
    Env.get('BLAZE_DEFAULT_DOWNLOAD_DURATION', 8640)
  ),
  defaultTimeout: 1800000 // time in millis for timeout links during download
}

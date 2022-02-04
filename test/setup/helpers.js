/**
 * @param  {import('../../src/B2Service')} b2service
 * @param  {} backblazeConfig
 */
async function emptyBucket(b2service, backblazeConfig, opts = { limit: 1000, prefix: null }) {
  const { limit = 1000, prefix = null } = opts
  if (backblazeConfig) await b2service._changeConfig(backblazeConfig)
  const oldRequest = await b2service.listFilesOnBucket({
    limit,
    prefix
  })

  for (const oldFile of oldRequest.files) {
    await b2service.deleteB2Object(oldFile)
  }
}
module.exports = {
  emptyBucket
}

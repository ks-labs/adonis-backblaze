/**
 * @param  {import('../../src/B2Service')} b2service
 * @param  {} backblazeConfig
 */
async function emptyBucket(b2service, backblazeConfig, opts = { limit: 1000, prefix: null }) {
  const { limit = 1000, prefix = null } = opts
  if (backblazeConfig) await b2service.changeConfig(backblazeConfig)
  const oldRequest = await b2service.listFilesOnBucket({
    limit,
    prefix
  })
  let totalDeleted = 0
  for (const id in oldRequest.files) {
    const deleted = await b2service.deleteB2Object(oldRequest.files[id])
    totalDeleted++
  }
  console.log('Empty bucket files total:', totalDeleted)
}
module.exports = {
  emptyBucket
}

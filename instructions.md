## Provider

Make sure to register the provider inside `start/app.js` file.

```js
const providers = ['adonis-b2/providers/B2Provider']
```

That's all! Now you can use the request transformer by importing it from the http context

```js
// To get type definitions working on vscode
/** @type {typeof import('adonis-b2/src/B2Service')} */
const B2Provider = use('App/AdonisB2')

class UserController {
  async index({ request, response, params }) {
    const b2ModelInstance = await B2Provider.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('test'),
      originalName: 'FileName'
    })

    response.send(b2ModelInstance)
  }
}
```

## Config

The config file is saved as `config/b2-provider.js`.

Make sure to tweak it as per your needs.

# Adonis Backblaze Provider

![CI/CD - GHPackages](https://github.com/ks-labs/adonis-backblaze/workflows/CI/CD%20-%20GHPackages/badge.svg)

Adonis BackBlaze Service Provider using `backblaze-b2` under the hood.

## Install

```
npm install --save @ks-labs/adonis-backblaze
```

## Provider

Make sure to register the provider inside `start/app.js` file.

```js
const providers = ['@ks-labs/adonis-backblaze/providers/B2Provider']
```

That's all! Now you can use the request transformer by importing it from the http context

```js
// To get type definitions working on vscode
/** @type {typeof import('@ks-labs/adonis-backblaze/src/B2Service')} */
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

The config file is saved as `config/b2-provider.js`. Make sure to tweak it as per your needs.

Define B2File model as the example on:

`'./templates/B2File.js'`

The Database schema also is defined at:

`'./templates/1607035890123_b_2_file_schema.js'`

You can manipulate the backblaze entries references like this

```javascript
/** @type {typeof import('../Models/B2File')} */
const B2File = use('App/Models/B2File')
```

## Thanks

Special thanks to the creator(s) of [AdonisJS](http://adonisjs.com/) for creating such a great framework.

## Known Bugs

- **The entire file path being used as filename**

  Instead the backblaze use the file path folder to build the folder structure, it uses the path as the fully file name.

  The following upload code :

  ```javascript
    const entityCreated = await B2Provider.uploadAndInsertB2File({
      bufferToUpload: Buffer.from('File Content'),
      fileName: 'test.txt',
      pathToFile: 'custom-folder/custom2',
      originalName: 'original.name.txt'
    })
  ```

  Will generate a path that sounds like this:
  `/provider-files/custom-folder/test.txt`
  But we need the filename, without the leading forward slash:
  `provider-files/custom-folder/test.txt`

  **Cause :**

  So, the app key allowed prefix specified are `B2_APP_KEY_PREFIX=/provider-files`
  The library parses the leading fowarded slash and all following path, as the filename instead being the folder name.

  **Fix :**
  Remove the leading backslash
  from
  `B2_APP_KEY_PREFIX=/provider-files`
  to
  `B2_APP_KEY_PREFIX=provider-files`

  And then when upload some file to backblaze the returned filename will be :
  `'my-bucket/custom-folder/test.txt'`
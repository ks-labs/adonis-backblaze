# Adonis Backblaze Provider

![CI/CD - GHPackages](https://github.com/ks-labs/adonis-backblaze/workflows/CI/CD%20-%20GHPackages/badge.svg)

Adonis BackBlaze Service Provider using `backblaze-b2` under the hood.

## Install

```
npm install --save @ks-labs/adonis-backblaze
```

## Configure

Register it in `start/app.js`:

```javascript
const providers = [
  ...
  '@ks-labs/adonis-backblaze/providers/BackBlaze'
]

const aliases = {
  ...
  BackBlazeProvider: 'Adonis/Addons/BackBlaze'
}
```

Use it:

```javascript
const backBlazeProvider = use('BackBlaze')
```

## Usage

```bash
BLAZE_KEY_ID= # your backblaze key id
BLAZE_APP_KEY= # your backblaze app key
BLAZE_BUCKET_ID= # bucket used to access
BLAZE_PREFIX= # prefix used to access all bucket
BLAZE_DEFAULT_DOWNLOAD_DURATION= # default duration of generated download links (in milliseconds)
BLAZE_DISABLE_UPLOAD= # when true will disable upload to backblaze returning null when false will upload normally (defaults is false)
```

## Thanks

Special thanks to the creator(s) of [AdonisJS](http://adonisjs.com/) for creating such a great framework.

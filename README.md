# Adonis Backblaze Provider

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

Register the commands:

```javascript
const aceProviders = [...'adonis-scheduler/providers/CommandsProvider']
```

## Usage

### Starting the scheduler

Starting an instance of the kue listener is easy with the included ace command. Simply run `node ace run:scheduler`.

The provider looks for jobs in the `app/Tasks` directory of your AdonisJS project and will automatically register a handler for any tasks that it finds.

## Thanks

Special thanks to the creator(s) of [AdonisJS](http://adonisjs.com/) for creating such a great framework.

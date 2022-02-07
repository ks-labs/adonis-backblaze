# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.3.5"></a>

## 2.3.5 (2022-02-07)

### Added

- ✅ test(fix): fix tests, that are using old provider namespace [[4221f39](https://github.com/ks-labs/adonis-backblaze/commit/4221f39addf645226b05195cf6d2ff5cc211b734)]

### Changed

- 📌 chore(release): 2.3.5 [[d1fd428](https://github.com/ks-labs/adonis-backblaze/commit/d1fd4280d9987ef7d8cb21afbc0eccbebb7d6df9)]

<a name="2.3.4"></a>

## 2.3.4 (2022-02-07)

### Changed

- ♻️ refactor(provider): renamed provider name, changed B2File model load strategy [[3686939](https://github.com/ks-labs/adonis-backblaze/commit/3686939fd55e508f8c3a66ecf2cb6ddee31065c7)]

### Miscellaneous

- chore(release): 2.3.4 [[4fbea2a](https://github.com/ks-labs/adonis-backblaze/commit/4fbea2a0d000b4fe916809d5d05e1f427b0fea5f)]
- chore: v2.3.3 [[effc306](https://github.com/ks-labs/adonis-backblaze/commit/effc30653834a562ba421ea3eba23d8bcc9e2610)]

## [2.3.3](https://github.com/ks-labs/adonis-backblaze/compare/v2.3.2...v2.3.3) (2022-02-07)

### Fixed

- 🐛 fix(provider): change typedef import of @adonisjs/sync, to avoid errors on production install [[f99dfe8](https://github.com/ks-labs/adonis-backblaze/commit/f99dfe832f1f02c9e8bd3830fe66d48315e39a90)]

## [2.3.2](https://github.com/ks-labs/adonis-backblaze/compare/v2.3.1...v2.3.2) (2022-02-06)

### Fixed

- 🐛 fix(provider): change type import, to avoid errors on production install [[f99dfe8](https://github.com/ks-labs/adonis-backblaze/commit/f99dfe832f1f02c9e8bd3830fe66d48315e39a90)]

### Miscellaneous

- chore(release): 2.3.2 [[be0f6c9](https://github.com/ks-labs/adonis-backblaze/commit/be0f6c9f32b66c3edf2dc7013842e77b071c06fc)]

<a name="2.3.2"></a>

## 2.3.2 (2022-02-06)

### Fixed

- 🐛 fix(provider): change type import, to avoid errors on production install [[f99dfe8](https://github.com/ks-labs/adonis-backblaze/commit/f99dfe832f1f02c9e8bd3830fe66d48315e39a90)]

### Miscellaneous

- chore(release): 2.3.2 [[be0f6c9](https://github.com/ks-labs/adonis-backblaze/commit/be0f6c9f32b66c3edf2dc7013842e77b071c06fc)]

<a name="2.3.1"></a>

## 2.3.1 (2022-02-06)

### Fixed

- 🐛 fix(provider): remove wrong &#x60;;(&#x27;use strict&#x27;)&#x60; flag, move devDep to dependecies due error on user [[cd982e0](https://github.com/ks-labs/adonis-backblaze/commit/cd982e0b69141ae548176fcf18a757444b6890d5)]

### Miscellaneous

- chore(release): 2.3.1 [[24b261e](https://github.com/ks-labs/adonis-backblaze/commit/24b261ef117a2f15638e1d65a66e6bc1df78ff54)]
- 📝 docs(token-migrate): add token migration to the docs with short explanation [[1918a8f](https://github.com/ks-labs/adonis-backblaze/commit/1918a8fd62db07f59b548e1aa53b75969445e6b4)]

<a name="2.3.0"></a>

## 2.3.0 (2022-02-05)

### Added

- ✨ feat(token-migration): add option to update b2file model after migration or not [[80b499f](https://github.com/ks-labs/adonis-backblaze/commit/80b499ff63b7630954a467066ac1cd4f9586af22)]

### Changed

- 📌 chore(release): 2.3.0 [[fb4cac1](https://github.com/ks-labs/adonis-backblaze/commit/fb4cac15c43242a31cd73a9b1f8e56d2fb438590)]

<a name="2.2.0"></a>

## 2.2.0 (2022-02-04)

### Added

- ✅ test: released all tests on order [[4942423](https://github.com/ks-labs/adonis-backblaze/commit/494242365d1066faec3a4ed84654305f09abfd3e)]
- ✨ feat(provider): add method to migrate files from one env to another [[f4426a3](https://github.com/ks-labs/adonis-backblaze/commit/f4426a374a8af27f36bb8c0dd889b88b6200a67e)]

### Changed

- 📌 chore(gitignore): removed tmp files from tests [[660fcb7](https://github.com/ks-labs/adonis-backblaze/commit/660fcb70d3633cdc86ca694fe0e55922708da10b)]

### Fixed

- 🐛 fix(test): improve logs during token migration [[6396125](https://github.com/ks-labs/adonis-backblaze/commit/6396125b124b7a75500e56fa81547203daa623d2)]
- 💚 ci(envs): add correct enviroments during tests [[77ce230](https://github.com/ks-labs/adonis-backblaze/commit/77ce2304ae7ef83e3a6e8956cc9839bfccbd6a1b)]

### Miscellaneous

- chore(release): 2.2.0 [[fb3b9e2](https://github.com/ks-labs/adonis-backblaze/commit/fb3b9e21d32ea32fccd244c6e21e43bdfb5bfbbc)]
- chore(release): 2.1.0 [[05a8c34](https://github.com/ks-labs/adonis-backblaze/commit/05a8c34666f7fd69145771226e4fbb30e5ad6aae)]
- feat: add method to allow move files [[3790339](https://github.com/ks-labs/adonis-backblaze/commit/3790339b35fd88e187a6f50630c810adcdc40f4e)]

<a name="2.0.0"></a>

## 2.0.0 (2022-01-20)

### Miscellaneous

- chore(release): 2.0.0 [[8f27d8a](https://github.com/ks-labs/adonis-backblaze/commit/8f27d8a29a39e3fe69c6c6af90c7699b4020b50e)]
- ci: fixed integration tests enviroments for gh-actions [[3ea5f1c](https://github.com/ks-labs/adonis-backblaze/commit/3ea5f1c5f13c4ef6b135db4933211392f9b71442)]
- refactor: improved .env names and remove useless env [[33bee4b](https://github.com/ks-labs/adonis-backblaze/commit/33bee4b47f1926ec230b9a853ee3b45f9cd19a36)]
- chore(release): 1.0.4 [[125abb2](https://github.com/ks-labs/adonis-backblaze/commit/125abb26d027718d0abe6b8944b09cfe97d6fada)]
- Merge branch &#x27;main&#x27; of https://github.com/ks-labs/adonis-backblaze into main [[ce872d9](https://github.com/ks-labs/adonis-backblaze/commit/ce872d9f7c7e24ab1e8b2fb129559c93888d6baf)]
- ci: add continuous delivery [[1f0b773](https://github.com/ks-labs/adonis-backblaze/commit/1f0b773de2667447a2afe47526eca1d55656a3c9)]
- fix: added needed dependency [[b9eae09](https://github.com/ks-labs/adonis-backblaze/commit/b9eae09268a455342d3a48794bc1f2af3c39debc)]
- feat: initial implementation [[5291c7b](https://github.com/ks-labs/adonis-backblaze/commit/5291c7b0029a008f9367ef72d7538c0868c367e2)]
- Initial commit [[d33eb23](https://github.com/ks-labs/adonis-backblaze/commit/d33eb238d9ef3a713c040e12fbf023050e27aaa0)]
- chore: bump version and some dependencies [[6619312](https://github.com/ks-labs/adonis-backblaze/commit/66193120c3f013e16feb6748406427956eaacdcb)]
- Merge branch &#x27;development&#x27; into main [[8babfb0](https://github.com/ks-labs/adonis-backblaze/commit/8babfb029daa2ebd617e0f943d83a8b7d96c1966)]
- feat: added download option that downloads a stream from backblaze and returns a buffer with all contents (future will be an stream). [[2b29d5f](https://github.com/ks-labs/adonis-backblaze/commit/2b29d5f678e30a789a38433b10b956a7229ee1bc)]
- Merge pull request [#1](https://github.com/ks-labs/adonis-backblaze/issues/1) from ks-labs:development [[3c1c773](https://github.com/ks-labs/adonis-backblaze/commit/3c1c773c4389a1f9ddf4d3b62295ce896211c8ed)]
- fix: add readme status badge and change docs [[426a885](https://github.com/ks-labs/adonis-backblaze/commit/426a8850c944883433ab4f00d6d0b47e4fdf09b5)]
- fix: name and repo location address chore: bump version [[099d6cb](https://github.com/ks-labs/adonis-backblaze/commit/099d6cbf89177cc933d6589810ee96d4a8d7b4bb)]
- chore: initial commit [[8ec97cb](https://github.com/ks-labs/adonis-backblaze/commit/8ec97cba3c336491c4fddd7f12ffcbed060ae4ee)]
- Initial commit [[58824bc](https://github.com/ks-labs/adonis-backblaze/commit/58824bcd5b9482657da90873904b531f8a4bfb30)]

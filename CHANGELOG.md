# Changelog

<a name="2.3.17"></a>
## 2.3.17 (2022-02-09)

### Added

- ✨ feat: add function to update existing file model by hash and bucket when not found id [[e79f34a](https://github.com/ks-labs/adonis-backblaze/commit/e79f34a25e49fcd7c7e6daba4fe82d2df13a5175)]

### Fixed

- 💚 ci(changelog): add new changelog generation strategy [[598e758](https://github.com/ks-labs/adonis-backblaze/commit/598e758b315dad42794cb7e2f668cfb7a72a8b3e)]


<a name="2.3.16"></a>
## 2.3.16 (2022-02-08)

### Added

- ✨ feat(upload): add feature to remove slash prefix on new upload location [[3667eef](https://github.com/ks-labs/adonis-backblaze/commit/3667eef8dc386a36825f9cc66edba5d407c7bfaf)]


<a name="2.3.15"></a>
## 2.3.15 (2022-02-08)

### Added

- ✅ test: fix tests to achieve expected behaviour from new config load [[5acdc84](https://github.com/ks-labs/adonis-backblaze/commit/5acdc84d7046109fc330ca71d8be5805802d82c1)]
- ✨ feat(upload): add check if allready uploaded original file skipping if allready uploaded [[1cc2e87](https://github.com/ks-labs/adonis-backblaze/commit/1cc2e876bca6ca0359099972972ea7d8b506b158)]
- ✨ feat(service): add listFileVersions method to the provider using env bucketId as default parameter [[1cf1e07](https://github.com/ks-labs/adonis-backblaze/commit/1cf1e077c0f83aab7e98651783dfbb9260a341fa)]

### Fixed

- 🐛 fix(config): remove reusing of envs when change config, causing overlap envs bug [[40ec445](https://github.com/ks-labs/adonis-backblaze/commit/40ec445d1e041620749095d98fa8e765efabd0b4)]


<a name="2.3.14"></a>
## 2.3.14 (2022-02-08)

### Fixed

- 🐛 fix(token): remove authorize from upload chunk loop that cause authorization token error [[fc04fa2](https://github.com/ks-labs/adonis-backblaze/commit/fc04fa2be65c45130e99787c4e1625a63997cc03)]
- 💚 ci(ci-cd): fix integration tests [[13a57f4](https://github.com/ks-labs/adonis-backblaze/commit/13a57f45e30b3167aa1d44b0c591d8f7da2f51ae)]


<a name="2.3.13"></a>
## 2.3.13 (2022-02-08)

### Added

- ✨ feat(upload): support to parallel uploads added [[538f591](https://github.com/ks-labs/adonis-backblaze/commit/538f5912a17f78e04aa08541ab42d656ebe0ef6f)]


<a name="2.3.12"></a>
## 2.3.12 (2022-02-08)

### Changed

- 🚚 chore: make debug messages less verbose when file not exists [[b774f67](https://github.com/ks-labs/adonis-backblaze/commit/b774f67f11c09c29dec959bd7b813580dc5d7b99)]
- ♻️ refactor: remove async code where is useless [[a57282e](https://github.com/ks-labs/adonis-backblaze/commit/a57282ed38b543363319c636d35db805d13fb7da)]


<a name="2.3.11"></a>
## 2.3.11 (2022-02-08)

### Fixed

- 💚 ci(scripts): fix triggers to deploy scripts [[54e57cc](https://github.com/ks-labs/adonis-backblaze/commit/54e57ccaac5dfdb35273eedd0c260e8697c81b5a)]
- 🐛 fix(tmp): change temporary download filename to avoid errors during token migration [[4da4b74](https://github.com/ks-labs/adonis-backblaze/commit/4da4b74ad38ceb9db220c16d050334fedf9175af)]

### Miscellaneous

- 🔨 style(release): update gitmoji release generation config [[6ad1206](https://github.com/ks-labs/adonis-backblaze/commit/6ad1206fb20771c20d6435519ad891a4c26bfd23)]
- 📝 docs(download): add chunksize information to the function docs [[7cedad2](https://github.com/ks-labs/adonis-backblaze/commit/7cedad23eaade23b495cb590a2be552f938f6d77)]


<a name="2.3.10"></a>
## 2.3.10 (2022-02-08)

### Added

- ✨ feat(download): add support to chunk and parallel downloads during migration [[44f6b31](https://github.com/ks-labs/adonis-backblaze/commit/44f6b31d959835c8898d42f6e2049de0ea107197)]

### Changed

- 📌 chore(release): 2.3.10 [[23e19fd](https://github.com/ks-labs/adonis-backblaze/commit/23e19fd2c5e8d09a8d57981466bf3d3dc7c9ab22)]


<a name="2.3.9"></a>
## 2.3.9 (2022-02-07)

### Added

- ✨ feat(token-migration): added support to skip allready downloaded files [[5945be3](https://github.com/ks-labs/adonis-backblaze/commit/5945be3f269180c83735cbc2fcef10645b1159a0)]

### Changed

- 📌 chore(release): 2.3.9 [[7a60eef](https://github.com/ks-labs/adonis-backblaze/commit/7a60eef8ebd13d3fedba2124116d581589265c75)]


<a name="2.3.8"></a>
## 2.3.8 (2022-02-07)

### Changed

- 📌 chore(release): 2.3.8 [[7aa81a1](https://github.com/ks-labs/adonis-backblaze/commit/7aa81a1546ae2f26e3b13e19ed621076dc9a40d2)]

### Fixed

- 🐛 fix(model): fix error during model update, causing save without changes [[d9019ad](https://github.com/ks-labs/adonis-backblaze/commit/d9019ad5716ecc2eded8e8f83a7cc69d6dc5fd48)]
- 🐛 fix(config): add more checks to ensure dummy flag its correct could be string|boolean [[9b3199d](https://github.com/ks-labs/adonis-backblaze/commit/9b3199d14dca16d867dd4f0c25c351ed7acbd1e8)]

### Miscellaneous

- 📝 docs: add docs relative to deleteOldFiles and updateDBModels into migrateToken method [[c3a3c84](https://github.com/ks-labs/adonis-backblaze/commit/c3a3c84224aaa56bbb5a203ec3c4c78cd84fc806)]


<a name="2.3.7"></a>
## 2.3.7 (2022-02-07)

### Added

- ✨ feat(settings): add exception when cant load settings &#x60;b2-provider&#x60; appkey [[df0d932](https://github.com/ks-labs/adonis-backblaze/commit/df0d932a956a9acf3617591f558cc224e74737ab)]

### Changed

- 📌 chore(release): 2.3.7 [[96151af](https://github.com/ks-labs/adonis-backblaze/commit/96151afbc26e4cc06e9ce7fff7a27a8b4e34c2ce)]

### Fixed

- 🐛 fix(settings): fix settings load namespace to use &#x60;b2-provider&#x60; path and update template config [[e2b12cf](https://github.com/ks-labs/adonis-backblaze/commit/e2b12cfdc5d8fac3282ff18b6f886eede1641687)]


<a name="2.3.6"></a>
## 2.3.6 (2022-02-07)

### Changed

- 📌 chore(release): 2.3.6 [[d2c04c8](https://github.com/ks-labs/adonis-backblaze/commit/d2c04c808758759477c6f1916e507d9cd4ea1b51)]

### Breaking changes

- 💥 fix: change provider namespace to AdonisB2 avoiding breaking changes from past releases [[177dfa6](https://github.com/ks-labs/adonis-backblaze/commit/177dfa69658ce717007c6f22df75252267308814)]


<a name="2.3.5"></a>
## 2.3.5 (2022-02-07)

### Added

- ✅ test(fix): fix tests, that are using old provider namespace [[4221f39](https://github.com/ks-labs/adonis-backblaze/commit/4221f39addf645226b05195cf6d2ff5cc211b734)]

### Changed

- 📌 chore(release): 2.3.5 [[089d403](https://github.com/ks-labs/adonis-backblaze/commit/089d403770117cb155efd9fe289925100cb081a0)]


<a name="2.3.4"></a>
## 2.3.4 (2022-02-07)

### Changed

- ♻️ refactor(provider): renamed provider name, changed B2File model load strategy [[3686939](https://github.com/ks-labs/adonis-backblaze/commit/3686939fd55e508f8c3a66ecf2cb6ddee31065c7)]

### Miscellaneous

-  chore(release): 2.3.4 [[4fbea2a](https://github.com/ks-labs/adonis-backblaze/commit/4fbea2a0d000b4fe916809d5d05e1f427b0fea5f)]
-  chore: v2.3.3 [[effc306](https://github.com/ks-labs/adonis-backblaze/commit/effc30653834a562ba421ea3eba23d8bcc9e2610)]


<a name="2.3.2"></a>
## 2.3.2 (2022-02-06)

### Fixed

- 🐛 fix(provider): change type import, to avoid errors on production install [[f99dfe8](https://github.com/ks-labs/adonis-backblaze/commit/f99dfe832f1f02c9e8bd3830fe66d48315e39a90)]

### Miscellaneous

-  chore(release): 2.3.2 [[be0f6c9](https://github.com/ks-labs/adonis-backblaze/commit/be0f6c9f32b66c3edf2dc7013842e77b071c06fc)]


<a name="2.3.1"></a>
## 2.3.1 (2022-02-06)

### Fixed

- 🐛 fix(provider): remove wrong &#x60;;(&#x27;use strict&#x27;)&#x60; flag, move devDep to dependecies due error on user [[cd982e0](https://github.com/ks-labs/adonis-backblaze/commit/cd982e0b69141ae548176fcf18a757444b6890d5)]

### Miscellaneous

-  chore(release): 2.3.1 [[24b261e](https://github.com/ks-labs/adonis-backblaze/commit/24b261ef117a2f15638e1d65a66e6bc1df78ff54)]
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

### Miscellaneous

-  chore(release): 2.2.0 [[fb3b9e2](https://github.com/ks-labs/adonis-backblaze/commit/fb3b9e21d32ea32fccd244c6e21e43bdfb5bfbbc)]


<a name="2.1.0"></a>
## 2.1.0 (2022-02-04)

### Added

- ✨ feat(provider): add method to migrate files from one env to another [[f4426a3](https://github.com/ks-labs/adonis-backblaze/commit/f4426a374a8af27f36bb8c0dd889b88b6200a67e)]

### Changed

- 📌 chore(gitignore): removed tmp files from tests [[660fcb7](https://github.com/ks-labs/adonis-backblaze/commit/660fcb70d3633cdc86ca694fe0e55922708da10b)]

### Fixed

- 🐛 fix(test): improve logs during token migration [[6396125](https://github.com/ks-labs/adonis-backblaze/commit/6396125b124b7a75500e56fa81547203daa623d2)]
- 💚 ci(envs): add correct enviroments during tests [[77ce230](https://github.com/ks-labs/adonis-backblaze/commit/77ce2304ae7ef83e3a6e8956cc9839bfccbd6a1b)]

### Miscellaneous

-  chore(release): 2.1.0 [[05a8c34](https://github.com/ks-labs/adonis-backblaze/commit/05a8c34666f7fd69145771226e4fbb30e5ad6aae)]
-  feat: add method to allow move files [[3790339](https://github.com/ks-labs/adonis-backblaze/commit/3790339b35fd88e187a6f50630c810adcdc40f4e)]


<a name="2.0.0"></a>
## 2.0.0 (2022-01-20)

### Miscellaneous

-  chore(release): 2.0.0 [[8f27d8a](https://github.com/ks-labs/adonis-backblaze/commit/8f27d8a29a39e3fe69c6c6af90c7699b4020b50e)]
-  ci: fixed integration tests enviroments for gh-actions [[3ea5f1c](https://github.com/ks-labs/adonis-backblaze/commit/3ea5f1c5f13c4ef6b135db4933211392f9b71442)]
-  refactor: improved .env names and remove useless env [[33bee4b](https://github.com/ks-labs/adonis-backblaze/commit/33bee4b47f1926ec230b9a853ee3b45f9cd19a36)]
-  chore(release): 1.0.4 [[125abb2](https://github.com/ks-labs/adonis-backblaze/commit/125abb26d027718d0abe6b8944b09cfe97d6fada)]
-  Merge branch &#x27;main&#x27; of https://github.com/ks-labs/adonis-backblaze into main [[ce872d9](https://github.com/ks-labs/adonis-backblaze/commit/ce872d9f7c7e24ab1e8b2fb129559c93888d6baf)]
-  ci: add continuous delivery [[1f0b773](https://github.com/ks-labs/adonis-backblaze/commit/1f0b773de2667447a2afe47526eca1d55656a3c9)]
-  fix: added needed dependency [[b9eae09](https://github.com/ks-labs/adonis-backblaze/commit/b9eae09268a455342d3a48794bc1f2af3c39debc)]
-  feat: initial implementation [[5291c7b](https://github.com/ks-labs/adonis-backblaze/commit/5291c7b0029a008f9367ef72d7538c0868c367e2)]
-  Initial commit [[d33eb23](https://github.com/ks-labs/adonis-backblaze/commit/d33eb238d9ef3a713c040e12fbf023050e27aaa0)]
-  chore: bump version and some dependencies [[6619312](https://github.com/ks-labs/adonis-backblaze/commit/66193120c3f013e16feb6748406427956eaacdcb)]
-  Merge branch &#x27;development&#x27; into main [[8babfb0](https://github.com/ks-labs/adonis-backblaze/commit/8babfb029daa2ebd617e0f943d83a8b7d96c1966)]
-  feat: added download option that downloads a stream from backblaze and returns a buffer with all contents (future will be an stream). [[2b29d5f](https://github.com/ks-labs/adonis-backblaze/commit/2b29d5f678e30a789a38433b10b956a7229ee1bc)]
-  Merge pull request [#1](https://github.com/ks-labs/adonis-backblaze/issues/1) from ks-labs:development [[3c1c773](https://github.com/ks-labs/adonis-backblaze/commit/3c1c773c4389a1f9ddf4d3b62295ce896211c8ed)]
-  fix: add readme status badge and change docs [[426a885](https://github.com/ks-labs/adonis-backblaze/commit/426a8850c944883433ab4f00d6d0b47e4fdf09b5)]
-  fix: name and repo location address chore: bump version [[099d6cb](https://github.com/ks-labs/adonis-backblaze/commit/099d6cbf89177cc933d6589810ee96d4a8d7b4bb)]
-  chore: initial commit [[8ec97cb](https://github.com/ks-labs/adonis-backblaze/commit/8ec97cba3c336491c4fddd7f12ffcbed060ae4ee)]
-  Initial commit [[58824bc](https://github.com/ks-labs/adonis-backblaze/commit/58824bcd5b9482657da90873904b531f8a4bfb30)]



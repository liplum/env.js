# env.js

## Installation

```sh
yarn add @liplum/env
# or
npm i @liplum/env
# or
pnpm i @liplum/env
```

## Usage

### Basic usage

```js
import env from "@liplum/env"
// assume `process.env` has MY_DOMAIN="example.com"
const domain = env("MY_DOMAIN")
console.log(domain.string()) // example.com
```

Missing the environment variable will throw an error.

```js
try{
  const domain = env("MY_DOMAIN")
  console.log(domain.string())
} catch(e) {
  console.error(e)
}
```

Or you can get the raw value of the environment variable, even thougth it was missing.

```js
const domain = env("MY_DOMAIN")
// gets undefined if the env was missing.
console.log(domain.raw()) // example.com or undefined
```

### Default value

```js
const domain = env("MY_DOMAIN")
.default("example.com")
console.log(domain.string()) // example.com
```

Lazy evaluation of default value.

```js
const domain = env("MY_DOMAIN")
.default(() => "example.com")
console.log(domain.string()) // example.com
```

### Custom env store

Custom env store from an object.

```js
const domain = env("MY_DOMAIN")
.from({
  "MY_DOMAIN": "example.com"
})
console.log(domain.string()) // example.com
```

Custom env store from a Map.

```js
const store = new Map()
store.set("MY_DOMAIN", "example.com")
const domain = env("MY_DOMAIN")
.from(store)
console.log(domain.string()) // example.com
```

Custom env store from a function.

```js
const domain = env("MY_DOMAIN")
.from((key) => "example.com")
console.log(domain.string()) // example.com
```

### Value Type

string

```js
const domain = env("ENV_TEST")
.from(() => "hello, world!")
console.log(domain.string()) // hello, world!
```

boolean

Under the hood, the package [@liplum/str2bool](https://www.npmjs.com/package/@liplum/str2bool) is used to convert the env string to boolean.

```js
const domain = env("ENV_TEST")
.from(() => "true")
console.log(domain.bool() === true) // hello, world!
```

integer

```js
const domain = env("ENV_TEST")
.from(() => "1024")
console.log(domain.int() === 1024) // true
// specify the radix
console.log(domain.int(16) === 4132) // true
```

float

```js
const domain = env("ENV_TEST")
.from(() => "3.14")
console.log(domain.float() === 3.14) // true
```

string array

```js
const domain = env("ENV_TEST")
.from(() => "token1, token2, token3")
console.log(domain.array().length === 3) // true
```

json

```js
const domain = env("ENV_TEST")
.from(() => JSON.stringify({
    "name" : "@liplum/env"
}))
console.log(domain.json().name === "@liplum/env") // true
```

port

```js
const domain = env("ENV_TEST")
.from(() => "8080")
console.log(domain.port() === 8080) // true
```

## Next version


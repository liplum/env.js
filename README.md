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

Lazy evaluation of default value, ang it will be called only once.

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

- string

  ```js
  const domain = env("ENV_TEST")
  .from(() => "hello, world!")
  console.log(domain.string()) // hello, world!
  ```

- boolean

  Under the hood, the package [@liplum/str2bool](https://www.npmjs.com/package/@liplum/str2bool) is used to convert the env string to boolean.

  ```js
  const domain = env("ENV_TEST")
  .from(() => "true")
  console.log(domain.bool() === true) // hello, world!
  ```

- integer

  ```js
  const domain = env("ENV_TEST")
  .from(() => "1024")
  console.log(domain.int() === 1024) // true
  // specify the radix
  console.log(domain.int(16) === 4132) // true
  ```

- float

  ```js
  const domain = env("ENV_TEST")
  .from(() => "3.14")
  console.log(domain.float() === 3.14) // true
  ```

- string array

  ```js
  const domain = env("ENV_TEST")
  .from(() => "token1, token2, token3")
  console.log(domain.array().length === 3) // true
  ```

- json

  ```js
  const domain = env("ENV_TEST")
  .from(() => JSON.stringify({
      "name" : "@liplum/env"
  }))
  console.log(domain.json().name === "@liplum/env") // true
  ```

- port

  ```js
  const domain = env("ENV_TEST")
  .from(() => "8080")
  console.log(domain.port() === 8080) // true
  ```

## Intergation with dotenv

You can import the `dotenv/config` to load the .env file under the current working directory.

```js
import "dotenv/config"
```

Or you can config the dotenv to load .env file from other files.

```js
import dotenv from "dotenv"
dotenv.config(...options)
```

To lean more about `dotenv`, please read [its document](https://www.npmjs.com/package/dotenv).

## *Next* version

The next version was introduced and will replace the current version in the v1.0.0 release.

You can get the access of the next version by importing the `@liplum/env/next` module.

```js
import env from "@liplum/env/next"
// assume `process.env` has MY_ENV="MY_VALUE"
const value = env("MY_ENV").string()
console.log(value.get()) // MY_VALUE
```

Calling the `get()` will give you the parsed result,
and missing the environment variable will result in an error.

While calling the `getOrNull()` can give you the parsed result or undefined
if the environment variable was missing.

```js
const value = env("MY_ENV").string()
try {
  console.log(value.get()) // throw an error
} catch(error) {
  console.error(error)
}
console.log(value.getOrNull()) // undefined
```

You can specify the default value in the `string()` calling chain.
Or you can pass a getter function, like `()=>"YOUR_VALUE"`, to provide the default value when it's needed.

```js
const myEnv = env("MY_ENV")
const value = myEnv.string({
  default: "DEFAULT_VALUE"
})
console.log(value.get()) // DEFAULT_VALUE

const lazyValue = myEnv.string({
  default: () => {
    console.log("The default value was generated.")
    return "LAZY_VALUE"
  }
})
console.log(lazyValue.get()) // LAZY_VALUE
```

You can specify a custom environment variables store from an object, a Map, or a mapping function.

```js
const myEnv = env("MY_ENV")

const valueFromObject = myEnv.from({
  "MY_ENV": "FROM_OBJECT"
}).string()
console.log(valueFromObject.get()) // FROM_OBJECT

const store = new Map()
store.set("MY_ENV", "FROM_MAP")
const valueFromMap = myEnv.from({
  "MY_ENV": "FROM_MAP"
}).string()
console.log(valueFromMap.get()) // FROM_MAP

const valueFromFunc = myEnv
.from((key) => "FROM_FUNC")
console.log(valueFromFunc.get()) // FROM_FUNC
```

This package also supports other value types other than strings.

- string

  ```js
  const value = env("MY_ENV")
  .bool(()=>"string")
  console.log(value.get() === "string") // string
  ```

- boolean
  Under the hood, the package [@liplum/str2bool](https://www.npmjs.com/package/@liplum/str2bool) is used to convert the env string to boolean.

  ```js
  const value = env("MY_ENV")
  .bool(() => true)
  console.log(domain.get() === true) // true
  ```

- integer

  ```js
  const value = env("MY_ENV")
  .from(() => "1024").int()
  console.log(domain.get() === 1024) // true
  // specify the radix
  console.log(domain.get(16) === 4132) // true
  ```

- float

  ```js
  const value = env("MY_ENV")
  .from(() => "3.14").float()
  console.log(value.float() === 3.14) // true
  ```

- string array

  A list of strings which can be sperated by ","(comma), "\n"(new line), or " "(whitespace).

  ```js
  const value = env("MY_ENV")
  .from(() => "token1, token2, token3").array()
  console.log(domain.get().length === 3) // true
  ```

- port

  ```js
  const value = env("MY_ENV")
  .from(() => "8080").port()
  console.log(domain.get() === 8080) // true
  ```

- url

  You can get a `URL` object by calling `get()`,
  or get the a `string` object by calling `getString()`.

  ```js
  const value = env("MY_ENV")
  .from(() => "https://github.com").url()
  console.log(domain.get()) // https://github.com/
  console.log(domain.getString() === "https://github.com/") // true
  ```

[NODE_ENV](https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production)

```js
import env from 'env'
import { NODE_ENV } from "env"
console.log(env.NODE_ENV.development)
console.log(NODE_ENV.production)
```

Parse environment variables directly:
Use `env.fromValue` to convert string values to specific data types like integers or URLs.

This works well with Next.js's NEXT_PUBLIC_* environment variables,
please read [this](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) to learn more about it.

```js
console.log(env.fromValue("123").int().get()) // 123
const NEXT_PUBLIC_ENV = "https://example.com"
console.log(env.fromValue(NEXT_PUBLIC_ENV).url().getString()) // https://example.com/
```

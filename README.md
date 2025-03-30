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

### Basic

```js
import env from "@liplum/env"
// assume `process.env` has MY_ENV="MY_VALUE"
const value = env("MY_ENV").string()
console.log(value.get()) // MY_VALUE
```

Calling the `get()` will give you the parsed result,
and missing the environment variable will result in an error.

### Nullable

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

### Default Value

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

### Custom Environment Store

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

### Value Types

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

### From Value

Parse environment variables directly:
Use `env.fromValue` to convert string values to specific data types like integers or URLs.

```js
console.log(env.fromValue("123").int().get()) // 123
const ENV_VALUE = "https://example.com"
console.log(env.fromValue(ENV_VALUE).url().getString()) // https://example.com/
```

### NODE_ENV

Read the [NODE_ENV](https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production) document to learn more.

```js
import env from 'env'
import { NODE_ENV } from "env"
console.log(env.NODE_ENV.development)
console.log(env.NODE_ENV.production)
console.log(env.NODE_ENV.test)
console.log(env.NODE_ENV.staging)

console.log(NODE_ENV.production)
```

### Integration with Next.js

#### NEXT_PUBLIC

`env.fromValue` works well with Next.js's NEXT_PUBLIC_* environment variables,
please read [this](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) to learn more about it.

```js
const NEXT_PUBLIC_ENDPOINT = "https://example.com"
console.log(env.fromValue(NEXT_PUBLIC_ENDPOINT).url().getString()) // https://example.com/
```

#### NEXT_PHASE

Read the [NEXT_PHASE](https://nextjs.org/docs/app/api-reference/config/next-config-js#phase) document to lean more.

```js
import env from 'env'
import { NEXT_PHASE } from "env"
console.log(env.NEXT_PHASE.export)
console.log(env.NEXT_PHASE.productionBuild)
console.log(env.NEXT_PHASE.productionServer)
console.log(env.NEXT_PHASE.developmentServer)
console.log(env.NEXT_PHASE.test)

console.log(NEXT_PHASE.productionBuild)
```

### Integration with dotenv

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

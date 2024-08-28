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

### Default value

```js
const domain = env("MY_DOMAIN")
.default("example.com")
console.log(domain.string()) // example.com
```

### Custom env store

```js
const domain = env("MY_DOMAIN")
.from({
  "MY_DOMAIN": "example.com"
})
console.log(domain.string()) // example.com
```

### Value Type

- string

  ```js
  const domain = env("ENV_TEST")
  .from({
    "ENV_TEST": "hello, world!"
  })
  console.log(domain.string()) // hello, world!
  ```

- integer

  ```js
  const domain = env("ENV_TEST")
  .from({
    "ENV_TEST": "1024"
  })
  console.log(domain.int() === 1024) // true
  ```

- float

  ```js
  const domain = env("ENV_TEST")
  .from({
    "ENV_TEST": "3.14"
  })
  console.log(domain.float() === 3.14) // true
  ```

- string array

  ```js
  const domain = env("ENV_TEST")
  .from({
    "ENV_TEST": "token1, token2, token3"
  })
  console.log(domain.array().length===3) // true
  ```

- json

  ```js
  const domain = env("ENV_TEST")
  .from({
    "ENV_TEST": JSON.stringify({
      "name" : "@liplum/env"
    })
  })
  console.log(domain.json().name==="@liplum/env") // true
  ```

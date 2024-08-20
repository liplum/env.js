# env.js

## Installation

```sh
yarn add @liplum/env
# or
npm i --save @liplum/env
```

## Usage

Basic usage

```js
import env from "@liplum/env"

// assume `process.env` has MY_DOMAIN="example.com"
const domain = env("MY_DOMAIN")
.end()
.string()

console.log(domain) // example.com
```
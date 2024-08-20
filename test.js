import env from "./dist/index.js"

const defaultStringValue = env("ENV_TEST_STRING")
.byDefault("default")
.get()
console.log(defaultStringValue.asString())


const defaultIntValue = env("ENV_TEST_INT")
.byDefault("10")
.get()
console.log(defaultIntValue.asInt())

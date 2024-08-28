import test from 'ava'
import env from "./dist/index.js"

test("default string", t => {
  const v = env("ENV_TEST_STRING")
    .default("default")
  t.assert(v.string() === "default")
})

test("default int", t => {
  const v = env("ENV_TEST_INT")
    .default("10")
  t.assert(v.int() === 10)
})

test("default array by comma", t => {
  const v = env("ENV_TEST_ARRAY")
    .default("t1,t2,t3")
  t.assert(v.array().toString() === ["t1", "t2", "t3"].toString())
})

test("default array by white space", t => {
  const v = env("ENV_TEST_ARRAY")
    .default("t1  t2 t3")
  t.assert(v.array().toString() === ["t1", "t2", "t3"].toString())
})

test("default array by new line", t => {
  const v = env("ENV_TEST_ARRAY")
    .default(`
    t1
    t2
    t3
    `)
  t.assert(v.array().toString() === ["t1", "t2", "t3"].toString())
})

test("custom env store", t => {
  const v = env("ENV_TEST")
    .from({
      "ENV_TEST": "test"
    })
  t.assert(v.string() === "test")
})

test("json string", t => {
  const v = env("ENV_TEST")
    .from({
      "ENV_TEST": `
  {
    "name": "@liplum/env"  
  }
    `
    })
  t.assert(v.json().name === "@liplum/env")
})


test("eval string", t => {
  const v = env("ENV_TEST")
    .from({
      "ENV_TEST": "1+1"
    })
  t.assert(v.eval() === 2)
})

test("lazy default value", t => {
  const v = env("ENV_TEST")
    .default(() => "lazy evaluation")
  t.assert(v.string() === "lazy evaluation")
})

test("custom env store by func", t => {
  const v = env("ENV_TEST")
    .from((k) => `value of ${k}`)
  t.assert(v.string() === "value of ENV_TEST")
})

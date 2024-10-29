import test from 'ava'
import env from "../dist/legacy.js"

test("default string", t => {
  const v = env("ENV_TEST")
    .default("default")
  t.assert(v.string() === "default")
})

test("default bool", t => {
  const v = env("ENV_TEST")
    .from(() => "true")
  t.assert(v.bool() === true)

  const v2 = env("ENV_TEST")
    .from(() => "false")
  t.assert(v2.bool() === false)
})

test("default int", t => {
  const v = env("ENV_TEST")
    .from(() => "10")
  t.assert(v.int() === 10)
})

test("default array by comma", t => {
  const v = env("ENV_TEST")
    .from(() => "t1,t2,t3")
  t.assert(v.array().toString() === ["t1", "t2", "t3"].toString())
})

test("default array by white space", t => {
  const v = env("ENV_TEST")
    .from(() => "t1  t2 t3")
  t.assert(v.array().toString() === ["t1", "t2", "t3"].toString())
})

test("default array by new line", t => {
  const v = env("ENV_TEST")
    .from(() => `
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

test("lazy default value", t => {
  const v = env("ENV_TEST")
    .default(() => "lazy evaluation")
  t.assert(v.string() === "lazy evaluation")
})

test("custom env store by map", t => {
  const store = new Map()
  store.set("ENV_TEST", "map value")
  const v = env("ENV_TEST")
    .from(store)
  t.assert(v.string() === "map value")
})

test("custom env store by func", t => {
  const v = env("ENV_TEST")
    .from((k) => `value of ${k}`)
  t.assert(v.string() === "value of ENV_TEST")
})

test("raw and undefined", t => {
  const v = env("LIPLUM_ENV_TEST")
  t.assert(v.raw() === undefined)
})

test("default only once", t => {
  let count = 0
  const createDefault = () => `${count++}`
  const v = env("ENV_TEST")
    .default(createDefault)
  const r1 = v.string()
  const r2 = v.string()
  t.assert(r1 === r2)
  t.assert(count === 1)
})
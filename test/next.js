import test from 'ava'
import env from "../dist/next.js"

test("default string", t => {
  const v = env("ENV_TEST").string("default")
  t.assert(v.get() === "default")
})

test("default bool", t => {
  const v = env("ENV_TEST")
    .from(() => "true").bool()
  t.assert(v.get() === true)

  const v2 = env("ENV_TEST")
    .from(() => "false").bool()
  t.assert(v2.get() === false)
})

test("default int", t => {
  const v = env("ENV_TEST")
    .from(() => "10").int()
  t.assert(v.get() === 10)
})

test("default array by comma", t => {
  const v = env("ENV_TEST")
    .from(() => "t1,t2,t3").array()
  t.assert(v.get().toString() === ["t1", "t2", "t3"].toString())
})

test("default array by white space", t => {
  const v = env("ENV_TEST")
    .from(() => "t1  t2 t3").array()
  t.assert(v.get().toString() === ["t1", "t2", "t3"].toString())
})

test("default array by new line", t => {
  const v = env("ENV_TEST")
    .from(() => `
    t1
    t2
    t3
    `).array()
  t.assert(v.get().toString() === ["t1", "t2", "t3"].toString())
})

test("custom env store", t => {
  const v = env("ENV_TEST")
    .from({
      "ENV_TEST": "test"
    }).string()
  t.assert(v.get() === "test")
})

// test("json string", t => {
//   const v = env("ENV_TEST")
//     .from({
//       "ENV_TEST": `
//   {
//     "name": "@liplum/env"  
//   }
//     `
//     })
//   t.assert(v.json().name === "@liplum/env")
// })

test("lazy default value", t => {
  const v = env("ENV_TEST")
    .string(() => "lazy evaluation")
  t.assert(v.get() === "lazy evaluation")
})

test("custom env store by map", t => {
  const store = new Map()
  store.set("ENV_TEST", "map value")
  const v = env("ENV_TEST")
    .from(store).string()
  t.assert(v.get() === "map value")
})

test("custom env store by func", t => {
  const v = env("ENV_TEST")
    .from((k) => `value of ${k}`).string()
  t.assert(v.get() === "value of ENV_TEST")
})

test("raw and undefined", t => {
  const v = env("LIPLUM_ENV_TEST")
  t.assert(v.getOrNull() === undefined)
})
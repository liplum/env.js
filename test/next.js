import test from 'ava'
import env, { NODE_ENV } from "../dist/next.js"

test("default string", t => {
  const v = env("ENV_TEST").string({ default: "default" })
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

test("default port", t => {
  const v = env("ENV_TEST")
    .from(() => "8080").port()
  t.assert(v.get() === 8080)
})

test("default url", t => {
  const v = env("ENV_TEST")
    .from(() => "https://github.com").url()
  t.assert(v.getString() === "https://github.com/")
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

test("lazy default value", t => {
  const v = env("ENV_TEST")
    .string({ default: () => "lazy evaluation" })
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

test("default only once", t => {
  let count = 0
  const createDefault = () => `${count++}`
  const v = env("ENV_TEST")
    .string({ default: createDefault })
  const r1 = v.get()
  const r2 = v.get()
  t.assert(r1 === r2)
  t.assert(count === 1)
})

test("NODE_ENV", t => {
  t.assert(env.NODE_ENV.get() === "test")
  t.assert(NODE_ENV.from(() => "development").development)
  t.assert(NODE_ENV.from(() => "production").production)
})

test("from value", t => {
  t.assert(env.fromValue("123").int().get() === 123)
  t.assert(env.fromValue("true").bool().get() === true)
  t.assert(env.fromValue("3.14").float().get() === 3.14)
  t.assert(env.fromValue("https://example.com/").url().getString() === "https://example.com/")
})
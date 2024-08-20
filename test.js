import test from 'ava'
import env from "./dist/index.js"

test("default string", t=>{
  const v = env("ENV_TEST_STRING")
  .default("default")
  .get()
  t.assert(v.string() === "default")
})

test("default int", t=>{
  const v = env("ENV_TEST_INT")
  .default("10")
  .get()
  t.assert(v.int() === 10)
})

test("default array by comma", t=>{
  const v = env("ENV_TEST_ARRAY")
  .default("t1,t2,t3")
  .get()
  t.assert(v.array().toString() === ["t1","t2","t3"].toString())
})

test("default array by white space", t=>{
  const v = env("ENV_TEST_ARRAY")
  .default("t1  t2 t3")
  .get()
  t.assert(v.array().toString() === ["t1","t2","t3"].toString())
})

test("default array by new line", t=>{
  const v = env("ENV_TEST_ARRAY")
  .default(`
    t1
    t2
    t3
    `)
  .get()
  t.assert(v.array().toString() === ["t1","t2","t3"].toString())
})
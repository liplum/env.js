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

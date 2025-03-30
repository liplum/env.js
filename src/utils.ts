import { EnvStore } from "./model.js"

export const getValueFromStore = ({ key, store }: {
  key: string
  store?: EnvStore
}): string | undefined => {
  const _store = store ? store : process.env
  if (_store instanceof Map) {
    return _store.get(key)
  }
  if (typeof _store === "function") {
    return _store(key)
  }
  return _store[key]
}

export const missingEnvError = (key?: string): Error => {
  if (key) {
    return new Error(`Missing the environment variable "${key}".`)
  } else {
    return new Error(`Missing the environment variable.`)
  }
}
import { EnvStore } from "./model.js"
import { getValueFromStore, missingEnvError } from "./utils.js"

export class NodeEnv {
  readonly key = "NODE_ENV"
  readonly store?: EnvStore
  constructor(store?: EnvStore) {
    this.store = store
  }

  from = (store: EnvStore): NodeEnv => {
    return new NodeEnv(store)
  }

  getOrNull = (): string | undefined => {
    return getValueFromStore({
      key: this.key,
      store: this.store,
    })
  }

  get = (): string => {
    const result = this.getOrNull()
    if (result === undefined) {
      throw missingEnvError(this.key)
    }
    return result
  }

  get development() {
    return this.getOrNull() === "development"
  }

  get production() {
    return this.getOrNull() === "production"
  }
}
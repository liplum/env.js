import { EnvStore } from "./model.js"
import { getValueFromStore, missingEnvError } from "./utils.js"

export const ENV_DEVELOPMENT = "development"
export const ENV_PRODUCTION = "production"
export const ENV_TEST = "test"
export const ENV_STAGING = "staging"

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

  get development(): boolean {
    return this.getOrNull() === ENV_DEVELOPMENT
  }

  get production(): boolean {
    return this.getOrNull() === ENV_PRODUCTION
  }

  get test(): boolean {
    return this.getOrNull() === ENV_TEST
  }
  
  get staging(): boolean {
    return this.getOrNull() === ENV_STAGING
  }
}
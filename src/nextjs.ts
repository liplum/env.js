import { EnvStore } from "./model.js"
import { getValueFromStore, missingEnvError } from "./utils.js"

const PHASE_EXPORT = 'phase-export'
const PHASE_PRODUCTION_BUILD = 'phase-production-build'
const PHASE_PRODUCTION_SERVER = 'phase-production-server'
const PHASE_DEVELOPMENT_SERVER = 'phase-development-server'
const PHASE_TEST = 'phase-test'
const PHASE_INFO = 'phase-info'

export class NextPhase {
  readonly key = "NEXT_PHASE"
  readonly store?: EnvStore
  constructor(store?: EnvStore) {
    this.store = store
  }

  from = (store: EnvStore): NextPhase => {
    return new NextPhase(store)
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

  get export(): boolean {
    return this.getOrNull() === PHASE_EXPORT
  }

  get productionBuild(): boolean {
    return this.getOrNull() === PHASE_PRODUCTION_BUILD
  }

  get productionServer(): boolean {
    return this.getOrNull() === PHASE_PRODUCTION_SERVER
  }

  get developmentServer(): boolean {
    return this.getOrNull() === PHASE_DEVELOPMENT_SERVER
  }

  get test(): boolean {
    return this.getOrNull() === PHASE_TEST
  }
  
  get info(): boolean {
    return this.getOrNull() === PHASE_INFO
  }
}
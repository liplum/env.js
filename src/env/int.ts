import { EnvMixin } from "./shared.js"

export interface IIntEnv {
  getOrNull: (radix?: number) => number | undefined
  get: (radix?: number) => number
}

export class IntEnv extends EnvMixin<number> implements IIntEnv {
  getOrNull = (radix?: number) => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    return parseInt(raw, radix)
  }
  get = (radix?: number) => {
    const result = this.getOrNull(radix)
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}

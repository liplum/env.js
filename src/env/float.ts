import { EnvMixin } from "./shared.js"

export interface IFloatEnv {
  getOrNull: () => number | undefined
  get: () => number
}

export class FloatEnv extends EnvMixin<number> implements IFloatEnv {
  getOrNull = () => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    return parseFloat(raw)
  }
  get = () => {
    const result = this.getOrNull()
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}
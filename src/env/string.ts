import { EnvMixin } from "./shared.js"

export interface IStringEnv {
  getOrNull: () => string | undefined
  get: () => string
}

export class StringEnv extends EnvMixin<string> implements IStringEnv {
  getOrNull = (): string | undefined => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    return raw
  }
  get = (): string => {
    const result = this.getOrNull()
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}
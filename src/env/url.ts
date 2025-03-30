import { EnvMixin } from "./shared"

export interface IUrlEnv {
  getOrNull: () => URL | undefined
  get: () => URL
  getStringOrNull: () => string | undefined
  getString: () => string
}


export class UrlEnv extends EnvMixin<URL | string> implements IUrlEnv {
  getOrNull = () => {
    const raw = this.env.getOrNull() ?? this.getDefaultValue()
    if (raw === undefined) {
      return
    }
    try {
      const result = new URL(raw)
      return result
    } catch (error) {
      throw new Error(`${raw} is not a valid URL.`)
    }
  }
  get = () => {
    const result = this.getOrNull()
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
  getStringOrNull = () => {
    const result = this.getOrNull()
    if (result === undefined) {
      return
    }
    return result.toString()
  }
  getString = () => {
    const result = this.getStringOrNull()
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}

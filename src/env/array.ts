import { EnvMixin } from "./shared.js"

export interface IArrayEnv {
  getOrNull: (splitter?: string | RegExp) => string[] | undefined
  get: (splitter?: string | RegExp) => string[]
}

const defaultArraySpliter = /\s|,|\r|\n|\r\n/

export class ArrayEnv extends EnvMixin<string[]> implements IArrayEnv {
  getOrNull = (splitter: string | RegExp = defaultArraySpliter) => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    const vars = raw.split(splitter)
    return vars.filter(v => Boolean(v))
  }
  get = (splitter: string | RegExp = defaultArraySpliter) => {
    const result = this.getOrNull(splitter)
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}

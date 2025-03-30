import { EnvMixin } from "./shared"

export interface IPortEnv {
  getOrNull: () => number | undefined
  get: () => number
}

const checkPort = (p: number) => {
  return 0 <= p && p <= 65535
}

export class PortEnv extends EnvMixin<number> implements IPortEnv {
  getOrNull = () => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    const result = parseInt(raw)
    if (!checkPort(result)) {
      throw new Error(`${result} is not a valid port number between 0 and 65535.`)
    }
    return result
  }
  get = () => {
    const result = this.getOrNull()
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}

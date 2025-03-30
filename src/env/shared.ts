import { IEnv } from "../model"
import { missingEnvError } from "../utils.js"

export class EnvMixin<TDefault> {
  protected readonly env: IEnv
  protected readonly defaultValue?: () => TDefault
  constructor(env: IEnv, defaultValue?: () => TDefault) {
    this.env = env
    this.defaultValue = defaultValue
  }
  protected getDefaultValue = (): TDefault | undefined => {
    return this.defaultValue?.()
  }
  protected missingEnvError = (): Error => {
    return missingEnvError(this.env.key)
  }
}

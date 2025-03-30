import str2bool from "@liplum/str2bool"
import { EnvMixin } from "./shared"

export interface BoolEnvValueOptions {
  /**
   * If enabled, "yes" and "y" will be considered as `true`,
   * while "no" and "n" will be considered as `false`.
   *
   * false by default.
   */
  yesOrNo?: boolean
  /**
   * The strings will be considered as `true`
   */
  truthy?: string[]
  /**
   * The strings will be considered as `false`
   */
  falsy?: string[]
}

export interface IBoolEnv {
  getOrNull: (options?: BoolEnvValueOptions) => boolean | undefined
  get: (options?: BoolEnvValueOptions) => boolean
}

export class BoolEnv extends EnvMixin<boolean> implements IBoolEnv {
  getOrNull = (options?: BoolEnvValueOptions) => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    return str2bool(raw, {
      strict: false,
      ...options
    })
  }
  get = (options?: BoolEnvValueOptions) => {
    const result = this.getOrNull(options)
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}

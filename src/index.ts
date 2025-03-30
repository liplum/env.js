import str2bool from "@liplum/str2bool"
import { createLateinitGetter } from "./shared.js"
import { getValueFromStore, missingEnvError } from "./utils.js"
import { NodeEnv } from "./node.js"
import { IEnv, IEnvCreator, DefaultValue, IStringEnv, IBoolEnv, IIntEnv, IFloatEnv, IPortEnv, IArrayEnv, IUrlEnv, Constructor, EnvObj, EnvStore, IEnvObj, BoolEnvValueOptions } from "./model.js"
export * from "./model.js"

const mixinWithValueEnvs = <TBase extends (new (...args: any[]) => IEnv)>(Base: TBase) => {
  return class MixinWithValueEnvs extends Base implements IEnvCreator {
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    string = (options?: { default?: DefaultValue<string> }): IStringEnv => {
      const { default: defaultValue } = options ?? {}
      return new StringEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    bool = (options?: { default?: DefaultValue<boolean> }): IBoolEnv => {
      const { default: defaultValue } = options ?? {}
      return new BoolEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    int = (options?: { default?: DefaultValue<number> }): IIntEnv => {
      const { default: defaultValue } = options ?? {}
      return new IntEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    float = (options?: { default?: DefaultValue<number> }): IFloatEnv => {
      const { default: defaultValue } = options ?? {}
      return new FloatEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    port = (options?: { default?: DefaultValue<number> }): IPortEnv => {
      const { default: defaultValue } = options ?? {}
      return new PortEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    array = (options?: { default?: DefaultValue<string[]> }): IArrayEnv => {
      const { default: defaultValue } = options ?? {}
      return new ArrayEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    url = (options?: { default?: DefaultValue<URL | string> }): IUrlEnv => {
      const { default: defaultValue } = options ?? {}
      return new UrlEnv(this, createLateinitGetter(defaultValue))
    }
  }
}

const Env: Constructor<EnvObj> = mixinWithValueEnvs(class implements IEnv {
  readonly key: string
  readonly store?: EnvStore
  constructor({ key, store }: { key: string, store?: EnvStore }) {
    this.key = key
    this.store = store
  }

  from = (store: EnvStore) => {
    return new Env({
      key: this.key,
      store: store,
    })
  }

  get = () => {
    const raw = this.getOrNull()
    if (raw === undefined) {
      throw missingEnvError(this.key)
    }
    return raw
  }

  getOrNull = () => {
    return getValueFromStore({
      key: this.key,
      store: this.store,
    })
  }
})

const EnvFromValue: Constructor<IEnvObj> = mixinWithValueEnvs(class implements IEnv {
  readonly key?: string
  readonly value?: string
  constructor({ value }: { value?: string }) {
    this.value = value
  }

  get = () => {
    const raw = this.getOrNull()
    if (raw === undefined) {
      throw missingEnvError(this.key)
    }
    return raw
  }

  getOrNull = () => {
    return this.value
  }
})

class EnvMixin<TDefault> {
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

class StringEnv extends EnvMixin<string> implements IStringEnv {
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

class BoolEnv extends EnvMixin<boolean> implements IBoolEnv {
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

class IntEnv extends EnvMixin<number> implements IIntEnv {
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


class FloatEnv extends EnvMixin<number> implements IFloatEnv {
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

const checkPort = (p: number) => {
  return 0 <= p && p <= 65535
}

class PortEnv extends EnvMixin<number> implements IPortEnv {
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


const defaultArraySpliter = /\s|,|\r|\n|\r\n/
class ArrayEnv extends EnvMixin<string[]> implements IArrayEnv {
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

class UrlEnv extends EnvMixin<URL | string> implements IUrlEnv {
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

const env = (key: string): EnvObj => {
  return new Env({ key })
}

env.NODE_ENV = new NodeEnv()

env.fromValue = (value?: string): IEnvObj => {
  return new EnvFromValue({ value })
}

export const NODE_ENV = env.NODE_ENV

export default env

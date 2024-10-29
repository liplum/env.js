import str2bool from "@liplum/str2bool"
import { createLateinitGetter } from "./shared.js"

export type DefaultValue<TDefault> = TDefault | (() => TDefault)

export interface IEnv {
  key?: string
  get: () => string
  getOrNull: () => string | undefined
}

export interface IEnvCreator {
  string: (options?: { default?: DefaultValue<string> }) => IStringEnv
  bool: (options?: { default?: DefaultValue<boolean> }) => IBoolEnv
  int: (options?: { default?: DefaultValue<number> }) => IIntEnv
  float: (options?: { default?: DefaultValue<number> }) => IFloatEnv
  port: (options?: { default?: DefaultValue<number> }) => IPortEnv
  array: (options?: { default?: DefaultValue<string[]> }) => IArrayEnv
  url: (options?: { default?: DefaultValue<URL | string> }) => IUrlEnv
}
export type Constructor<T = {}> = new (...args: any[]) => T
export type IEnvObj = IEnv & IEnvCreator

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
export type EnvResolver = (key: string) => string | undefined
export type EnvStore = typeof process.env | Record<string, string | undefined> | Map<string, string> | EnvResolver

const getValueFromStore = ({ key, store }: {
  key: string
  store?: EnvStore
}): string | undefined => {
  const _store = store ? store : process.env
  if (_store instanceof Map) {
    return _store.get(key)
  }
  if (typeof _store === "function") {
    return _store(key)
  }
  return _store[key]
}

export interface EnvObj extends IEnvObj {
  readonly key: string
  from: (store: EnvStore) => EnvObj
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

const missingEnvError = (key?: string): Error => {
  if (key) {
    return new Error(`Missing the environment variable "${key}".`)
  } else {
    return new Error(`Missing the environment variable.`)
  }
}

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

export interface IStringEnv {
  getOrNull: () => string | undefined
  get: () => string
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

export interface IIntEnv {
  getOrNull: (radix?: number) => number | undefined
  get: (radix?: number) => number
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

export interface IFloatEnv {
  getOrNull: () => number | undefined
  get: () => number
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

export interface IPortEnv {
  getOrNull: () => number | undefined
  get: () => number
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

export interface IArrayEnv {
  getOrNull: (splitter?: string | RegExp) => string[] | undefined
  get: (splitter?: string | RegExp) => string[]
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

export interface IUrlEnv {
  getOrNull: () => URL | undefined
  get: () => URL
  getStringOrNull: () => string | undefined
  getString: () => string
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

export class NodeEnv {
  readonly key = "NODE_ENV"
  readonly store?: EnvStore
  constructor(store?: EnvStore) {
    this.store = store
  }

  from = (store: EnvStore): NodeEnv => {
    return new NodeEnv(store)
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

  get development() {
    return this.getOrNull() === "development"
  }

  get production() {
    return this.getOrNull() === "production"
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
import str2bool from "@liplum/str2bool"

export type DefaultValue<TDefault> = TDefault | (() => TDefault)

export type EnvResolver = (key: string) => string | undefined
export type EnvStore = typeof process.env | Record<string, string | undefined> | Map<string, string> | EnvResolver

export class Env {
  readonly key: string
  readonly store?: EnvStore
  constructor({ key, store }: { key: string, store?: EnvStore }) {
    this.key = key
    this.store = store
  }

  from = (store: EnvStore): Env => {
    return new Env({
      key: this.key,
      store: store,
    })
  }

  private getValueFromStore = (): string | undefined => {
    const store = this.store ? this.store : process.env
    if (store instanceof Map) {
      return store.get(this.key)
    }
    if (typeof store === "function") {
      return store(this.key)
    }
    return store[this.key]
  }
  get = () => {
    const raw = this.getOrNull()
    if (raw === undefined) {
      throw missingEnvError(this.key)
    }
    return raw
  }
  getOrNull = () => {
    return this.getValueFromStore()
  }

  string = (options?: { default?: DefaultValue<string> }) => {
    const { default: defaultValue } = options ?? {}
    return new StringEnv(this, defaultValue)
  }

  bool = (options?: { default?: DefaultValue<boolean> }) => {
    const { default: defaultValue } = options ?? {}
    return new BoolEnv(this, defaultValue)
  }

  int = (options?: { default?: DefaultValue<number> }) => {
    const { default: defaultValue } = options ?? {}
    return new IntEnv(this, defaultValue)
  }

  float = (options?: { default?: DefaultValue<number> }) => {
    const { default: defaultValue } = options ?? {}
    return new FloatEnv(this, defaultValue)
  }

  port = (options?: { default?: DefaultValue<number> }) => {
    const { default: defaultValue } = options ?? {}
    return new PortEnv(this, defaultValue)
  }

  array = (options?: { default?: DefaultValue<string[]> }) => {
    const { default: defaultValue } = options ?? {}
    return new ArrayEnv(this, defaultValue)
  }

  url = (options?: { default?: DefaultValue<URL | string> }) => {
    const { default: defaultValue } = options ?? {}
    return new UrlEnv(this, defaultValue)
  }
}

const missingEnvError = (key: string): Error => {
  return new Error(`Missing the environment variable "${key}".`)
}
const isFunction = (arg: any): arg is Function => typeof arg === 'function'

class EnvMixin<TDefault> {
  protected readonly env: Env
  protected readonly defaultValue?: DefaultValue<TDefault>
  constructor(env: Env, defaultValue?: DefaultValue<TDefault>) {
    this.env = env
    this.defaultValue = defaultValue
  }
  protected getDefaultValue = (): TDefault | undefined => {
    const defaultValue = this.defaultValue
    if (isFunction(defaultValue)) {
      return defaultValue()
    }
    return defaultValue
  }
  protected missingEnvError = (): Error => {
    return missingEnvError(this.env.key)
  }
}

export class StringEnv extends EnvMixin<string> {
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
  yesOrNo?: boolean;
  /**
   * The strings will be considered as `true`
   */
  truthy?: string[];
  /**
   * The strings will be considered as `false`
   */
  falsy?: string[];
}

class BoolEnv extends EnvMixin<boolean> {
  getOrNull = (options?: BoolEnvValueOptions): boolean | undefined => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    return str2bool(raw, {
      strict: false,
      ...options
    })
  }
  get = (options?: BoolEnvValueOptions): boolean => {
    const result = this.getOrNull(options)
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}

class IntEnv extends EnvMixin<number> {
  getOrNull = (radix?: number): number | undefined => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    return parseInt(raw, radix)
  }
  get = (radix?: number): number => {
    const result = this.getOrNull(radix)
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}

class FloatEnv extends EnvMixin<number> {
  getOrNull = (): number | undefined => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    return parseFloat(raw)
  }
  get = (): number => {
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

class PortEnv extends EnvMixin<number> {
  getOrNull = (): number | undefined => {
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
  get = (): number => {
    const result = this.getOrNull()
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}
const defaultArraySpliter = /\s|,|\r|\n|\r\n/
class ArrayEnv extends EnvMixin<string[]> {
  getOrNull = (splitter: string | RegExp = defaultArraySpliter): string[] | undefined => {
    const raw = this.env.getOrNull()
    if (raw === undefined) {
      return this.getDefaultValue()
    }
    const vars = raw.split(splitter)
    return vars.filter(v => Boolean(v))
  }
  get = (splitter: string | RegExp = defaultArraySpliter): string[] => {
    const result = this.getOrNull(splitter)
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}

class UrlEnv extends EnvMixin<URL | string> {
  getOrNull = (): URL | undefined => {
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
  get = (): URL => {
    const result = this.getOrNull()
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
  getStringOrNull = (): string | undefined => {
    const result = this.getOrNull()
    if (result === undefined) {
      return
    }
    return result.toString()
  }
  getString = (): string => {
    const result = this.getStringOrNull()
    if (result === undefined) {
      throw this.missingEnvError()
    }
    return result
  }
}

const env = (key: string): Env => {
  return new Env({ key })
}

export default env
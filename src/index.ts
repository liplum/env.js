import str2bool from "@liplum/str2bool"
export interface EnvVarBoolOptions {
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

export interface EnvVarEvalutor {
  /**
   * Get the raw value
   * @returns the raw value of the environment variable, or undefined if it was missing.
   */
  raw: () => string | undefined
  string: () => string
  int: (radix?: number) => number
  float: () => number
  bool: (options?: EnvVarBoolOptions) => boolean
  json: () => any
  /**
   * @deprecated This will be removed at `v1.0.0`.
   * Dangerous!
   * @returns the evaluated value
   */
  eval: () => any
  /**
   * @param splitter By default, it splits a string by white space, new line and comma.
   * @returns 
   */
  array: (splitter?: string | RegExp) => string[]
  port: () => number
}

export type EnvResolver = (key: string) => string | undefined
export type EnvStore = typeof process.env | Record<string, string | undefined> | Map<string, string> | EnvResolver
export type DefaultValue<TDefault> = TDefault | (() => TDefault)

const isFunction = (arg: any): arg is Function => typeof arg === 'function'

export interface EnvVar<TDefault = string> extends EnvVarEvalutor {
  readonly key: string
  /**
   * Set the default value.
   * @param defaultValue a string, or a function for lazy evaluation.
   * @returns a new EnvVar instance
   */
  default: <TNewDefault>(defaultValue: DefaultValue<TNewDefault>) => EnvVar<TNewDefault>
  /**
   * Set the env store.
   * The default enc store is `process.env`.
   * @param store an object or a map
   * @returns a new EnvVar instance
   */
  from: (store: EnvStore) => EnvVar<TDefault>
  /**
   * @deprecated This will be removed at `v1.0.0`.
   * @returns Return a new EnvVar instance
   */
  end: () => EnvVar<TDefault>
}

const missingEnv = (key: string): Error => {
  return new Error(`Missing the environment variable "${key}".`)
}
type NonUndefined<T> = T extends undefined ? never : T;
const unexpectedDefaultValue = <T>(given: NonUndefined<T>, expected: string): Error => {
  return new Error(`Unexpected default value was given: "${given}", but ${expected} is expected.`)
}

class EnvVarImpl<TDefault = string> implements EnvVar<TDefault> {
  readonly key: string
  readonly defaultValue?: DefaultValue<TDefault>
  readonly store?: EnvStore
  constructor({
    key, defaultValue, store
  }: {
    key: string
    defaultValue?: DefaultValue<TDefault>
    store?: EnvStore
  }) {
    this.key = key
    this.defaultValue = defaultValue
    this.store = store
  }

  default = <TNewDefault>(defaultValue: DefaultValue<TNewDefault>): EnvVar<TNewDefault> => {
    return new EnvVarImpl<TNewDefault>({
      key: this.key,
      defaultValue: defaultValue,
      store: this.store,
    })
  }

  from = (store: EnvStore): EnvVar<TDefault> => {
    return new EnvVarImpl<TDefault>({
      key: this.key,
      defaultValue: this.defaultValue,
      store: store,
    })
  }

  end = (): EnvVar<TDefault> => {
    return new EnvVarImpl<TDefault>(this)
  }

  private getDefaultValue = (): TDefault | undefined => {
    const defaultValue = this.defaultValue
    if (isFunction(defaultValue)) {
      return defaultValue()
    }
    return defaultValue
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

  raw = (): string | undefined => {
    return this.getValueFromStore()
  }

  string = () => {
    const raw = this.raw()
    if (raw !== undefined) {
      return raw
    } else {
      const defaultValue = this.getDefaultValue()
      if (typeof defaultValue === "string") {
        return defaultValue
      } else if (defaultValue !== undefined) {
        throw unexpectedDefaultValue(defaultValue, "a string")
      }
    }
    throw missingEnv(this.key)
  }

  int = (radix?: number) => {
    const raw = this.raw()
    if (raw !== undefined) {
      return parseInt(raw, radix)
    } else {
      const defaultValue = this.getDefaultValue()
      if (typeof defaultValue === "number" && Number.isInteger(defaultValue)) {
        return defaultValue
      } else if (defaultValue !== undefined) {
        throw unexpectedDefaultValue(defaultValue, "an integer")
      }
    }
    throw missingEnv(this.key)
  }

  float = () => {
    const raw = this.raw()
    if (raw !== undefined) {
      return parseFloat(raw)
    } else {
      const defaultValue = this.getDefaultValue()
      if (typeof defaultValue === "number") {
        return defaultValue
      } if (defaultValue !== undefined) {
        throw unexpectedDefaultValue(defaultValue, "a float")
      }
    }
    throw missingEnv(this.key)
  }

  bool = (options?: EnvVarBoolOptions) => {
    const raw = this.raw()
    if (raw !== undefined) {
      return str2bool(raw, {
        strict: false,
        ...options
      })
    } else {
      const defaultValue = this.getDefaultValue()
      if (typeof defaultValue === "boolean") {
        return defaultValue
      } if (defaultValue !== undefined) {
        throw unexpectedDefaultValue(defaultValue, "a boolean")
      }
    }
    throw missingEnv(this.key)
  }

  json = () => {
    const raw = this.raw()
    if (raw !== undefined) {
      return JSON.parse(raw)
    } else {
      const defaultValue = this.getDefaultValue()
      if (typeof defaultValue === "string") {
        return JSON.parse(defaultValue)
      } else if (defaultValue !== undefined) {
        throw unexpectedDefaultValue(defaultValue, "a JSON string")
      }
    }
    throw missingEnv(this.key)
  }

  eval = () => {
    const raw = this.raw()
    if (raw !== undefined) {
      return eval(raw)
    } else {
      const defaultValue = this.getDefaultValue()
      if (typeof defaultValue === "string") {
        return eval(defaultValue)
      } else if (defaultValue !== undefined) {
        throw unexpectedDefaultValue(defaultValue, "a string of javascript code")
      }
    }
    throw missingEnv(this.key)
  }

  array = (splitter: string | RegExp = /\s|,|\r|\n|\r\n/) => {
    const raw = this.raw()
    if (raw !== undefined) {
      const vars = raw.split(splitter)
      return vars.filter(v => Boolean(v))
    } else {
      const defaultValue = this.getDefaultValue()
      if (Array.isArray(defaultValue)) {
        return defaultValue
      } else if (defaultValue !== undefined) {
        throw unexpectedDefaultValue(defaultValue, "a string of array")
      }
    }
    throw missingEnv(this.key)
  }

  port = () => {
    const raw = this.raw()
    let p: number
    if (raw !== undefined) {
      p = parseInt(raw)
    } else {
      const defaultValue = this.getDefaultValue()
      if (typeof defaultValue === "number") {
        p = defaultValue
      } if (defaultValue !== undefined) {
        throw unexpectedDefaultValue(defaultValue, "a float")
      } else {
        throw missingEnv(this.key)
      }
    }
    if (0 <= p && p <= 65535) {
      return p
    }
    throw new Error(`${p} is not a valid port number.`)
  }
}

const env = <TDefault = string>(key: string): EnvVar<TDefault> => {
  return new EnvVarImpl<TDefault>({ key })
}

export default env
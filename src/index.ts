export interface EnvVarEvalutor {
  /**
   * Get the raw value
   * @returns the raw value of the environment variable, or undefined if it was missing.
   */
  raw: () => string | undefined
  string: () => string
  int: (radix?: number) => number
  float: () => number
  bool: () => boolean
  json: () => any
  /**
   * Dangerous!
   * @returns 
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
export type DefaultGetter = () => string

export interface EnvVar extends EnvVarEvalutor {
  readonly key: string
  /**
   * Set the default value.
   * @param defaultValue a string, or a function for lazy evaluation.
   * @returns a new EnvVar instance
   */
  default: (defaultValue: string | DefaultGetter) => EnvVar
  /**
   * Set the env store.
   * The default enc store is `process.env`.
   * @param store an object or a map
   * @returns a new EnvVar instance
   */
  from: (store: EnvStore) => EnvVar
  /**
   * @deprecated This will be removed at `v1.0.0`.
   * @returns Return a new EnvVar instance
   */
  end: () => EnvVar
}

class EnvVarImpl implements EnvVar {
  readonly key: string
  readonly defaultValue?: string | DefaultGetter
  readonly store?: EnvStore
  constructor({
    key, defaultValue, store
  }: {
    key: string
    defaultValue?: string | DefaultGetter
    store?: EnvStore
  }) {
    this.key = key
    this.defaultValue = defaultValue
    this.store = store
  }

  private copyWith = ({
    defaultValue, store
  }: {
    defaultValue?: string | DefaultGetter
    store?: EnvStore
  }): EnvVar => {
    return new EnvVarImpl({
      key: this.key,
      defaultValue: defaultValue ?? this.defaultValue,
      store: store ?? this.store,
    })
  }

  default = (defaultValue: string | DefaultGetter): EnvVar => {
    return this.copyWith({
      defaultValue,
    })
  }


  from = (store: EnvStore): EnvVar => {
    return this.copyWith({
      store,
    })
  }

  end = (): EnvVar => {
    return new EnvVarImpl(this)
  }

  private getDefaultValue = (): string | undefined => {
    if (typeof this.defaultValue === "function") {
      return this.defaultValue()
    }
    return this.defaultValue
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
    return this.getValueFromStore() ?? this.getDefaultValue()
  }

  get safeValue(): string {
    const value = this.raw()
    if (value === undefined) {
      throw new Error(`Missing the environment variable "${this.key}".`)
    }
    return value
  }

  string = () => {
    return this.safeValue
  }

  int = (radix?: number) => {
    return parseInt(this.safeValue, radix)
  }

  float = () => {
    return parseFloat(this.safeValue)
  }

  bool = () => {
    // TODO: improve this behavior
    return Boolean(this.raw)
  }

  json = () => {
    return JSON.parse(this.safeValue)
  }

  eval = () => {
    return eval(this.safeValue)
  }

  array = (splitter: string | RegExp = /\s|,|\r|\n|\r\n/) => {
    const vars = this.safeValue.split(splitter)
    return vars.filter(v => Boolean(v))
  }

  port = () => {
    const p = parseInt(this.safeValue)
    if (0 <= p && p <= 65535) {
      return p
    }
    throw new Error(`${p} is not a valid port number.`)
  }
}

const env = (key: string): EnvVar => {
  return new EnvVarImpl({ key })
}

export default env
export type EnvStore = typeof process.env | Record<string, string | undefined>
export type DefaultGetter = () => string
export interface EnvVar {
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
   * @param store a string, or a function for lazy evaluation.
   * @returns a new EnvVar instance
   */
  from: (store: EnvStore) => EnvVar
  end: () => EnvVarValue
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

  copyWith = ({
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

  getDefaultValue = (): string | undefined => {
    if (typeof this.defaultValue === "function") {
      return this.defaultValue()
    }
    return this.defaultValue
  }

  from = (store: EnvStore): EnvVar => {
    return this.copyWith({
      store,
    })
  }

  end = (): EnvVarValue => {
    return new EnvVarValueImpl(this)
  }
}
export interface EnvVarValue {
  raw: () => string | undefined
  string: () => string
  int: (radix?: number) => number
  float: () => number
  bool: () => boolean
  json: () => any
  eval: () => any
  array: () => string[]
  port: () => number
}
class EnvVarValueImpl implements EnvVarValue {
  readonly parent: EnvVarImpl
  constructor(parent: EnvVarImpl) {
    this.parent = parent
  }

  raw = (): string | undefined => {
    const parent = this.parent
    const store = parent.store ? parent.store : process.env
    const value = store[parent.key] ?? parent.getDefaultValue()
    return value
  }

  get safeValue(): string {
    const value = this.raw()
    if (value === undefined) {
      throw new Error(`Missing the environment variable "${this.parent.key}".`)
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
  /**
   * Dangerous!
   * @returns 
   */
  eval = () => {
    return eval(this.safeValue)
  }
  /**
   * @param splitter By default, it splits a string by white space, new line and comma.
   * @returns 
   */
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
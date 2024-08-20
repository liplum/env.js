export type EnvStore = typeof process.env | Record<string, string | undefined>
export interface EnvVar {
  readonly key: string
  default: (defaultValue: string) => EnvVar
  from: (store: EnvStore) => EnvVar
  get: () => EnvVarValue
}
class EnvVarImpl implements EnvVar {
  readonly key: string
  readonly defaultValue?: string
  readonly store?: EnvStore
  constructor({
    key, defaultValue, store
  }: {
    key: string
    defaultValue?: string
    store?: EnvStore
  }) {
    this.key = key
    this.defaultValue = defaultValue
    this.store = store
  }

  copyWith = ({
    defaultValue, store
  }: {
    defaultValue?: string
    store?: EnvStore
  }): EnvVar => {
    return new EnvVarImpl({
      key: this.key,
      defaultValue: defaultValue ?? this.defaultValue,
      store: store ?? this.store,
    })
  }

  default = (defaultValue: string): EnvVar => {
    return this.copyWith({
      defaultValue,
    })
  }

  from = (store: EnvStore): EnvVar => {
    return this.copyWith({
      store,
    })
  }

  get = (): EnvVarValue => {
    const store = this.store ? this.store : process.env
    const value = store[this.key] ?? this.defaultValue
    if (value === undefined) {
      throw new Error(`Environment variable "${this.key}" not undefined.`)
    }
    return new EnvVarValueImpl(this, value)
  }
}
export interface EnvVarValue {
  readonly value?: string
  string: () => string
  int: (radix?: number) => number
  float: () => number
  bool: () => boolean
  json: () => any
  array: () => string[]
  port: () => number
}
class EnvVarValueImpl implements EnvVarValue {
  readonly parent: EnvVarImpl
  readonly value?: string
  constructor(parent: EnvVarImpl, value?: string) {
    this.parent = parent
    this.value = value
  }
  get safeValue(): string {
    if (this.value === undefined) {
      throw new Error(`"${this.parent.key}" is required but no value given.`)
    }
    return this.value
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
    return Boolean(this.value)
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
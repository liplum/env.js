export interface EnvVar {
  readonly key: string
  default: (defaultValue: string) => EnvVar
  optional: () => EnvVar
  required: () => EnvVar
  get: () => EnvVarValue
}
class EnvVarImpl implements EnvVar {
  readonly key: string
  readonly defaultValue?: string
  readonly isOptional: boolean
  constructor({
    key, defaultValue, isOptional = false
  }: {
    key: string
    defaultValue?: string
    isOptional?: boolean
  }) {
    this.key = key
    this.defaultValue = defaultValue
    this.isOptional = isOptional
  }

  copyWith = ({
    defaultValue, isOptional
  }: {
    defaultValue?: string
    isOptional?: boolean
  }) => {
    return new EnvVarImpl({
      key: this.key,
      defaultValue: defaultValue ?? this.defaultValue,
      isOptional: isOptional ?? this.isOptional,
    })
  }

  default = (defaultValue: string): EnvVarImpl => {
    return this.copyWith({
      defaultValue,
    })
  }

  optional = (): EnvVarImpl => {
    return this.copyWith({
      isOptional: true,
    })
  }

  required = (): EnvVarImpl => {
    return this.copyWith({
      isOptional: false,
    })
  }

  get = (): EnvVarValueImpl => {
    const value = process.env[this.key] ?? this.defaultValue
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
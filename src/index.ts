export class EnvVar {
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

  default = (defaultValue: string): EnvVar => {
    return new EnvVar({
      key: this.key,
      defaultValue,
      isOptional: this.isOptional,
    })
  }

  optional = (): EnvVar => {
    return new EnvVar({
      key: this.key,
      defaultValue: this.defaultValue,
      isOptional: true,
    })
  }

  required = (): EnvVar => {
    return new EnvVar({
      key: this.key,
      defaultValue: this.defaultValue,
      isOptional: false,
    })
  }

  get = (): EnvVarValue => {
    const value = process.env[this.key] ?? this.defaultValue
    if (value === undefined) {
      throw new Error(`Environment variable "${this.key}" not undefined.`)
    }
    return new EnvVarValue(this, value)
  }
}
export class EnvVarValue {
  readonly parent: EnvVar
  readonly value?: string
  constructor(parent: EnvVar, value?: string) {
    this.parent = parent
    this.value = value
  }
  get safeValue(): string {
    if (this.value === undefined) {
      throw new Error(`"${this.parent.key}" is required but no value given.`)
    }
    return this.value
  }
  string = (): string => {
    return this.safeValue
  }
  int = (radix?: number): number => {
    return parseInt(this.safeValue, radix)
  }
  float = (): number => {
    return parseFloat(this.safeValue)
  }
  bool = (): boolean => {
    // TODO: improve this behavior
    return Boolean(this.value)
  }
  json = (): any => {
    return JSON.parse(this.safeValue)
  }
  /**
   * @param splitter By default, it splits a string by white space, new line and comma.
   * @returns 
   */
  array = (splitter: string | RegExp = /\s|,|\r|\n|\r\n/): string[] => {
    const vars = this.safeValue.split(splitter)
    return vars.filter(v => Boolean(v))
  }
  port = (): number => {
    const p = parseInt(this.safeValue)
    if (0 <= p && p <= 65535) {
      return p
    }
    throw new Error(`${p} is not a valid port number.`)
  }
}

const env = (key: string): EnvVar => {
  return new EnvVar({ key })
}

export default env
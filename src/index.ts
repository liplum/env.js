export class EnvVar {
  readonly key: string
  readonly defaultValue?: string
  constructor({
    key, defaultValue
  }: {
    key: string
    defaultValue?: string
  }) {
    this.key = key
    this.defaultValue = defaultValue
  }
  default = (defaultValue: string): EnvVar => {
    return new EnvVar({
      key: this.key,
      defaultValue,
    })
  }
  get = (): EnvVarValue => {
    const value = process.env[this.key] ?? this.defaultValue
    if (value === undefined) {
      throw new Error(`Environment variable "${this.key}" not undefined.`)
    }
    return new EnvVarValue(value)
  }
}
export class EnvVarValue {
  readonly value: string
  constructor(value: string) {
    this.value = value
  }
  string = () => {
    return this.value
  }
  int = (radix?: number) => {
    return parseInt(this.value, radix)
  }
  float = () => {
    return parseFloat(this.value)
  }
  bool = () => {
    return Boolean(this.value)
  }
  json = () => {
    return JSON.parse(this.value)
  }
  /**
   * @param splitter By default, it splits a string on any combination of whitespace, optional commas surrounded by whitespace, or multiple consecutive whitespace characters globally.
   * @returns 
   */
  array = (splitter: string | RegExp = /\s*,?\s*|\s+/g): string[] => {
    return this.value.split(splitter)
  }
  port = () => {
    const p = parseInt(this.value)
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
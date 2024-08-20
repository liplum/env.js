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
    // TODO: improve this behavior
    return Boolean(this.value)
  }
  json = () => {
    return JSON.parse(this.value)
  }
  /**
   * @param splitter By default, it splits a string by white space, new line and comma.
   * @returns 
   */
  array = (splitter: string | RegExp = /\s|,|\r|\n|\r\n/): string[] => {
    const vars = this.value.split(splitter)
    return vars.filter(v => Boolean(v))
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
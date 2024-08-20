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
  byDefault = (defaultValue: string): EnvVar => {
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
  asString = () => {
    return this.value
  }
  asInt = (radix?: number) => {
    return parseInt(this.value, radix)
  }
  asFloat = () => {
    return parseFloat(this.value)
  }
  asJson = () => {
    return JSON.parse(this.value)
  }
}

const env = (key: string): EnvVar => {
  return new EnvVar({ key })
}

export default env
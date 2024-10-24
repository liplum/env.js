import str2bool from "@liplum/str2bool"

export interface Env {
  readonly key: string
  get: () => string | undefined
  string: () => StrEnv
  bool: () => BoolEnv
  int: () => IntEnv
  float: () => FloatEnv
  port: () => PortEnv
  array: () => ArrayEnv
  url: () => UrlEnv
}

export type EnvResolver = (key: string) => string | undefined
export type EnvStore = typeof process.env | Record<string, string | undefined> | Map<string, string> | EnvResolver

class EnvImpl {
  readonly key: string
  readonly store?: EnvStore
  constructor({ key, store }: { key: string, store?: EnvStore }) {
    this.key = key
    this.store = store
  }

  from = (store: EnvStore): EnvImpl => {
    return new EnvImpl({
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
    return this.getValueFromStore()
  }

  string = () => {
    return new StrEnv(this)
  }

  bool = () => {
    return new BoolEnv(this)
  }

  int = () => {
    return new IntEnv(this)
  }

  float = () => {
    return new FloatEnv(this)
  }

  port = () => {
    return new PortEnv(this)
  }

  array = () => {
    return new ArrayEnv(this)
  }

  url = () => {
    return new UrlEnv(this)
  }
}

const missingEnvError = (key: string): Error => {
  return new Error(`Missing the environment variable "${key}".`)
}

class EnvMixin {
  readonly env: Env
  constructor(env: Env) {
    this.env = env
  }
  missingEnvError = (): Error => {
    return missingEnvError(this.env.key)
  }
}

class StrEnv extends EnvMixin {
  getOrNull = (): string | undefined => {
    const raw = this.env.get()
    if (raw === undefined) {
      return
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

class BoolEnv extends EnvMixin {
  getOrNull = (options?: BoolEnvValueOptions): boolean | undefined => {
    const raw = this.env.get()
    if (raw === undefined) {
      return
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

class IntEnv extends EnvMixin {
  getOrNull = (radix?: number): number | undefined => {
    const raw = this.env.get()
    if (raw === undefined) {
      return
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

class FloatEnv extends EnvMixin {
  getOrNull = (): number | undefined => {
    const raw = this.env.get()
    if (raw === undefined) {
      return
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

class PortEnv extends EnvMixin {
  getOrNull = (): number | undefined => {
    const raw = this.env.get()
    if (raw === undefined) {
      return
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
class ArrayEnv extends EnvMixin {
  getOrNull = (splitter: string | RegExp = defaultArraySpliter): string[] | undefined => {
    const raw = this.env.get()
    if (raw === undefined) {
      return
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

class UrlEnv extends EnvMixin {
  getOrNull = (): URL | undefined => {
    const raw = this.env.get()
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
}

const env = (key: string): Env => {
  return new EnvImpl({ key })
}

export default env
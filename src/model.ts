
export type DefaultValue<TDefault> = TDefault | (() => TDefault)

export interface IEnv {
    key?: string
    get: () => string
    getOrNull: () => string | undefined
}

export interface IEnvCreator {
    string: (options?: { default?: DefaultValue<string> }) => IStringEnv
    bool: (options?: { default?: DefaultValue<boolean> }) => IBoolEnv
    int: (options?: { default?: DefaultValue<number> }) => IIntEnv
    float: (options?: { default?: DefaultValue<number> }) => IFloatEnv
    port: (options?: { default?: DefaultValue<number> }) => IPortEnv
    array: (options?: { default?: DefaultValue<string[]> }) => IArrayEnv
    url: (options?: { default?: DefaultValue<URL | string> }) => IUrlEnv
}
export type Constructor<T = {}> = new (...args: any[]) => T
export type IEnvObj = IEnv & IEnvCreator


export type EnvResolver = (key: string) => string | undefined
export type EnvStore = typeof process.env | Record<string, string | undefined> | Map<string, string> | EnvResolver

export interface EnvObj extends IEnvObj {
    readonly key: string
    from: (store: EnvStore) => EnvObj
}

export interface IStringEnv {
    getOrNull: () => string | undefined
    get: () => string
}

export interface BoolEnvValueOptions {
    /**
     * If enabled, "yes" and "y" will be considered as `true`,
     * while "no" and "n" will be considered as `false`.
     *
     * false by default.
     */
    yesOrNo?: boolean
    /**
     * The strings will be considered as `true`
     */
    truthy?: string[]
    /**
     * The strings will be considered as `false`
     */
    falsy?: string[]
}

export interface IBoolEnv {
    getOrNull: (options?: BoolEnvValueOptions) => boolean | undefined
    get: (options?: BoolEnvValueOptions) => boolean
}

export interface IFloatEnv {
    getOrNull: () => number | undefined
    get: () => number
}

export interface IPortEnv {
    getOrNull: () => number | undefined
    get: () => number
}
export interface IIntEnv {
    getOrNull: (radix?: number) => number | undefined
    get: (radix?: number) => number
}

export interface IArrayEnv {
    getOrNull: (splitter?: string | RegExp) => string[] | undefined
    get: (splitter?: string | RegExp) => string[]
}

export interface IUrlEnv {
    getOrNull: () => URL | undefined
    get: () => URL
    getStringOrNull: () => string | undefined
    getString: () => string
}

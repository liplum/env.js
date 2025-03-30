export type DefaultValue<TDefault> = TDefault | (() => TDefault)

export interface IEnv {
    key?: string
    get: () => string
    getOrNull: () => string | undefined
}

export type Constructor<T = {}> = new (...args: any[]) => T

export type EnvResolver = (key: string) => string | undefined
export type EnvStore = typeof process.env | Record<string, string | undefined> | Map<string, string> | EnvResolver

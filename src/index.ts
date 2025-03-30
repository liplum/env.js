import { createLateinitGetter } from "./shared.js"
import { getValueFromStore, missingEnvError } from "./utils.js"
import { NodeEnv } from "./node.js"
import { IArrayEnv, ArrayEnv } from "./env/array.js"
import { IBoolEnv, BoolEnv } from "./env/bool.js"
import { IFloatEnv, FloatEnv } from "./env/float.js"
import { IIntEnv, IntEnv } from "./env/int.js"
import { IPortEnv, PortEnv } from "./env/port.js"
import { IStringEnv, StringEnv } from "./env/string.js"
import { IUrlEnv, UrlEnv } from "./env/url.js"
import { IEnv, DefaultValue, Constructor, EnvStore } from "./model.js"
import { NextPhase } from "./nextjs.js"
export * from "./model.js"
export {
  IArrayEnv,
  IBoolEnv,
  IFloatEnv,
  IIntEnv,
  IPortEnv,
  IStringEnv,
  IUrlEnv,
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

export type IEnvObj = IEnv & IEnvCreator

export interface EnvObj extends IEnvObj {
  readonly key: string
  from: (store: EnvStore) => EnvObj
}

const mixinWithValueEnvs = <TBase extends (new (...args: any[]) => IEnv)>(Base: TBase) => {
  return class MixinWithValueEnvs extends Base implements IEnvCreator {
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    string = (options?: { default?: DefaultValue<string> }): IStringEnv => {
      const { default: defaultValue } = options ?? {}
      return new StringEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    bool = (options?: { default?: DefaultValue<boolean> }): IBoolEnv => {
      const { default: defaultValue } = options ?? {}
      return new BoolEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    int = (options?: { default?: DefaultValue<number> }): IIntEnv => {
      const { default: defaultValue } = options ?? {}
      return new IntEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    float = (options?: { default?: DefaultValue<number> }): IFloatEnv => {
      const { default: defaultValue } = options ?? {}
      return new FloatEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    port = (options?: { default?: DefaultValue<number> }): IPortEnv => {
      const { default: defaultValue } = options ?? {}
      return new PortEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    array = (options?: { default?: DefaultValue<string[]> }): IArrayEnv => {
      const { default: defaultValue } = options ?? {}
      return new ArrayEnv(this, createLateinitGetter(defaultValue))
    }
    /**
     * 
     * @param options If a default value lazy callback is provided, it will be called only once.
     * @returns 
     */
    url = (options?: { default?: DefaultValue<URL | string> }): IUrlEnv => {
      const { default: defaultValue } = options ?? {}
      return new UrlEnv(this, createLateinitGetter(defaultValue))
    }
  }
}

const Env: Constructor<EnvObj> = mixinWithValueEnvs(class implements IEnv {
  readonly key: string
  readonly store?: EnvStore
  constructor({ key, store }: { key: string, store?: EnvStore }) {
    this.key = key
    this.store = store
  }

  from = (store: EnvStore) => {
    return new Env({
      key: this.key,
      store: store,
    })
  }

  get = () => {
    const raw = this.getOrNull()
    if (raw === undefined) {
      throw missingEnvError(this.key)
    }
    return raw
  }

  getOrNull = () => {
    return getValueFromStore({
      key: this.key,
      store: this.store,
    })
  }
})

const EnvFromValue: Constructor<IEnvObj> = mixinWithValueEnvs(class implements IEnv {
  readonly key?: string
  readonly value?: string
  constructor({ value }: { value?: string }) {
    this.value = value
  }

  get = () => {
    const raw = this.getOrNull()
    if (raw === undefined) {
      throw missingEnvError(this.key)
    }
    return raw
  }

  getOrNull = () => {
    return this.value
  }
})

const env = (key: string): EnvObj => {
  return new Env({ key })
}

env.NODE_ENV = new NodeEnv()
env.NEXT_PHASE = new NextPhase()

env.fromValue = (value?: string): IEnvObj => {
  return new EnvFromValue({ value })
}

export const NODE_ENV = env.NODE_ENV

export default env

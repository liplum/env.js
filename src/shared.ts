import lateinit, { Get } from "@liplum/lateinit"

export const isFunction = (arg: any): arg is Function => typeof arg === 'function'

export const createLateinitGetter = <T>(valueOrGetter?: T | (() => T)): Get<T> | undefined => {
  return valueOrGetter === undefined
    ? undefined : isFunction(valueOrGetter)
      ? lateinit(valueOrGetter)
      : () => valueOrGetter
}
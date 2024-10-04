/* eslint-disable @typescript-eslint/no-explicit-any */
declare type Recordable<T = any> = Record<string, T>

declare type Nullable<T = any> = T | null

declare type Fn<P extends any[] = any[], R = any> = (...args: P) => R

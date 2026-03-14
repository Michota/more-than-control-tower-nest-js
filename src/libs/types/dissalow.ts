/**
 * * @description Disallow types that extend D from T
 */
export type Disallow<D, T> = T extends D ? never : T;
export type DisallowProperty<D, T> = T extends { [K in keyof D]: any } ? never : T;

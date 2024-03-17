import { EMPTY_ARR } from '../constants'

export const slice = EMPTY_ARR.slice;
export const isArray = Array.isArray;
export const toArray = (value) => isArray(value) ? value : [value];

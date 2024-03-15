export const EMPTY_ARR = [];
export const slice = EMPTY_ARR.slice;
export const isArray = Array.isArray;
export const array = (value) => isArray(value) ? value : [value];

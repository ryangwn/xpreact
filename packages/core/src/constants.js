/** Normal hydration that attaches to a DOM tree but does not diff it. */
export const MODE_HYDRATE = 1 << 5;
/** Signifies this VNode suspended on the previous render */
export const MODE_SUSPENDED = 1 << 7;
/** Indicates that this node needs to be inserted while patching children */
export const INSERT_VNODE = 1 << 16;
/** Indicates a VNode has been matched with another VNode in the diff */
export const MATCHED = 1 << 17;
/** */
export const RE_RENDER = 1 << 18; 

export const EMPTY_OBJ = /** @type {any} */ ({});
export const EMPTY_ARR = [];

import { Fragment, options } from 'xpreact'

/**
 * JSX.Element factory used by Babel's {runtime:"automatic"} JSX transform
 * @param {VNode['type']} type
 * @param {VNode['props']} props
 * @param {VNode['key']} [key]
 * @param {unknown} [isStaticChildren]
 * @param {unknown} [__source]
 * @param {unknown} [__self]
 */
function createVNode(type, props, key, isStaticChildren, __source, __self) {
  // We'll want to preserve `ref` in props to get rid of the need for
  // forwardRef components in the future, but that should happen via
  // a separate PR.
  let normalizedProps = {}
  let ref
  let i
  for (i in props) {
    if (i == 'ref')
      ref = props[i]
		 else
      normalizedProps[i] = props[i]
  }

  /** @type {VNode & { __source: any; __self: any }} */
  const vnode = {
    type,
    props: normalizedProps,
    key,
    ref,

    _children: null,
    _dom: null,
    _component: null,

    constructor: undefined,

    __source,
    __self,
  }

  // If a Component VNode, check for and apply defaultProps.
  // Note: `type` is often a String, and can be `undefined` in development.
  if (typeof type === 'function' && (ref = type.defaultProps)) {
    for (i in ref) {
      if (typeof normalizedProps[i] === 'undefined')
        normalizedProps[i] = ref[i]
    }
  }

  if (options.vnode)
    options.vnode(vnode)
  return vnode
}

export {
  createVNode as jsx,
  createVNode as jsxs,
  createVNode as jsxDEV,
  Fragment,
  // precompiled JSX transform
  // jsxTemplate,
  // jsxAttr,
  // jsxEscape
}

import { isFunction } from './shared/is'
import { slice } from './shared/array'

export const VNodeFlags = {
  Unknown: 0,
  HtmlElement: 1,
  Component: 1 << 1,
  Text: 1 << 2,
  SvgElement: 1 << 3,
}

export function createElement(type, props, children) {
  let normalizedProps = {}
  let key
  let ref
  let i

  for (i in props) {
    if (i === 'key')
      key = props[i]
    else if (i === 'ref')
      ref = props[i]
    else normalizedProps[i] = props[i]
  }

  if (arguments.length > 2) {
    normalizedProps.children
      = arguments.length > 3 ? slice.call(arguments, 2) : children
  }

  // If a component VNode, check for and apply defaultProps
  if (isFunction(type) && type.defaultProps != null) {
    for (i in type.defaultProps) {
      if (normalizedProps[i] === undefined)
        normalizedProps[i] = type.defaultProps[i]
    }
  }

  return createVNode(type, normalizedProps, key, ref, null)
}

export function createVNode(type, props, key, ref, flags) {
  /**
   * type: the node name or Component
   */
  const vnode = {
    type,
    props,
    key,
    ref,
    flags,

    _children: null,

    _component: null,

    constructor: undefined,
  }

  return vnode
}

export function createTextNode(text, key) {
  return {
    type: null,
    props: text,
    key,
    ref: null,
    flags: VNodeFlags.Text,
  }
}

export function createRef() {
  return { current: null }
}

export function Fragment(props) {
  return props.children
}

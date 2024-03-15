import { isFunction } from './shared/is.js'
import { slice } from './shared/array.js'

export function createElement(type, props, children) {
  let normalizedProps = {},
    key,
    ref,
    i;

  for (i in props) {
    if (i === 'key') key = props[i];
    else if (i === 'ref') ref = props[i];
    else normalizedProps[i] = props[i];
  }

  if (arguments.length > 2) {
    normalizedProps.children = 
      arguments.length > 3 ? slice.call(arguments, 2) : children
  }

  // If a component VNode, check for and apply defaultProps
  if (isFunction(type) && type.defaultProps != null) {
    for (i in type.defaultProps) {
      if (normalizedProps[i] === undefined) {
        normalizedProps[i] = type.defaultProps[i]
      }
    }
  }

  return createVNode(type, normalizedProps, key, ref, null)
}

export function createVNode(type, props, key, ref, original) {
  /**
   * type: the node name or Component
   */
  const vnode = {
    type,
    props,
    key,
    ref,

    _children: null,
    _parent: null,

    _sibling: undefined,

    _component: null,
    
    constructor: undefined
  }

  return vnode;
}

export function createRef() {
  return { current: null };
}

export function Fragment(props) {
	return props.children;
}

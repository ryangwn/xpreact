import { EMPTY_OBJ } from './constants.js'
import { Fragment, createElement } from './create-element.js'
import { diff } from './diff'

export function render(vnode, parentDom) {
  
  let oldVNode = parentDom._children
  
  vnode = parentDom._children = createElement(Fragment, null, [vnode])

  // List of effects that need to called after diffed
  let commitQueue = [],
    refQueue = [];

  diff(
    parentDom,
    // Determine the new vnode tree and store it on the DOM element on
    // our custom '_children' property
    vnode,
    oldVNode || EMPTY_OBJ,
    parentDom.ownerSVGElement !== undefined,
    commitQueue,
    refQueue,
  )

  vnode._nextDom = undefined;
  // Execute available Lifecycle methods
  // commitRoot(commitQueue, vnode, refQueue);
}

export function hydrate(vnode, parentDom) {
  render(vnode, parentDom, hydrate);
}

import { EMPTY_OBJ } from './constants.js'
import { Fragment, createElement } from './create-element.js'
import { diff } from './diff'

export function render(vnode, parentDom) {
  let oldVNode = parentDom._children

  vnode = parentDom._children = createElement(Fragment, null, [vnode])

  // List of effects that need to called after diffed
  let commitQueue = []
  let refQueue = []

  diff(
    oldVNode || EMPTY_OBJ,
    // Determine the new vnode tree and store it on the DOM element on
    // our custom '_children' property
    vnode,
    parentDom,
    null,
    parentDom.ownerSVGElement !== undefined,
    commitQueue,
    refQueue,
  )

  // Execute available Lifecycle methods
  // commitRoot(commitQueue, vnode, refQueue);
}

export function hydrate(vnode, parentDom) {
  render(vnode, parentDom, hydrate)
}

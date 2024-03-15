import { createVNode } from '../create-element'
import { INSERT_VNODE, EMPTY_ARR, EMPTY_OBJ } from '../constants'
import { diff } from './index'
import { isArray } from '../shared/array'
import { isFunction } from '../shared/is'

/**
 * Diff the children of a virtual node
 * @param {} parentDom The DOM element whose children are being diffed
 * @param {[]} renderResult ComponentChildren[]
 * @param {} newParentVNode The virtual node whose children should be diff'ed against oldParentVNode
 * @param {} oldParentVNode The virtual node whose children should be diff'ed against newParentVNode
 * @param {boolean} isSvg Whether or not this DOM node is an SVG node
 * @param {Array<>} commitQueue Lists of components which have callbacks to invoke in commitRoot
 * @param {} oldDom The current attach DOM element any new DOM element should be placed around
 * @param {any[]} refQueue an array of element needed invoke refs
 */
export function diffChildren(
  parentDom,
  newParentVNode,
  oldParentVNode,
  isSvg,
  commitQueue,
  oldDom,
  refQueue
) {
  let oldChildren = (oldParentVNode && oldParentVNode._children) || EMPTY_ARR;
  let newChildren = newParentVNode._children || EMPTY_ARR;

  constructNewChildrenArray(newParentVNode);

  let j = 0,
    oldEndIdx = oldChildren.length - 1,
    newEndIdx = newChildren.length - 1,
    oldVNode = oldChildren[j] || EMPTY_OBJ,
    newVNode = newChildren[j];

  outer: {
    while (oldVNode.type === newVNode.type) {
      // console.log('xtype:', newVNode, oldVNode, oldVNode.props == newVNode.props);
      diff(
        parentDom,
        newVNode,
        oldVNode,
        isSvg,
        commitQueue,
        refQueue
      )

      j++
      if (j > oldEndIdx || j > newEndIdx) break outer
      oldVNode = oldChildren[j] || EMPTY_OBJ
      newVNode = newChildren[j]
    }

    oldVNode = oldChildren[oldEndIdx] || EMPTY_OBJ
    newVNode = newChildren[newEndIdx]

    while (oldVNode.type === newVNode.type) {
      diff(
        parentDom,
        newVNode,
        oldVNode,
        isSvg,
        commitQueue,
        refQueue
      )

      oldEndIdx--
      newEndIdx--

      if (j > oldEndIdx || j > newEndIdx) break outer

      oldVNode = oldChildren[oldEndIdx] || EMPTY_OBJ
      newVNode = newChildren[newEndIdx]
    }
  }

  if (j > oldEndIdx && j <= newEndIdx) {
    let nextPos = newEndIdx + 1,
      refNode = nextPos >= newChildren.length
        ? null
        : newChildren[nextPos].el;

    while (j <= newEndIdx) {
      let childVNode = newChildren[j++]
      diff(
        parentDom,
        childVNode,
        oldVNode,
        isSvg,
        commitQueue,
        refQueue,
      )
      insert(childVNode, null, parentDom);
    }
  } else if (j > newEndIdx && j <= newEndIdx) {
    while (j <= newEndIdx) {
      // Remove nodes
    }
  } else {
    
  }
}

function constructNewChildrenArray(newParentVNode) {
  let i,
    childVNode;

  let newChildrenLength = newParentVNode._children.length

  for (i = 0; i < newChildrenLength; i++) {
    childVNode = newParentVNode._children[i];
    if (
      typeof childVNode == 'string' ||
      typeof childVNode == 'number' ||
      // eslint-disable-next-line valid-typeof
      typeof childVNode == 'bigint' ||
      childVNode.constructor == String
    ) {
      childVNode = newParentVNode._children[i] = createVNode(
        null,
        childVNode,
        null,
        null,
        null
      );
    } else if (isArray(childVNode)) {
      childVNode = newParentVNode._children[i] = createVNode(
        Fragment,
        { children: childVNode },
        null,
        null,
        null
      );
    } else if (childVNode.constructor === undefined && childVNode._depth > 0) {
      // VNode is already in use, clone it. This can happen in the following
      // scenario:
      //   const reuse = <div />
      //   <div>{reuse}<span />{reuse}</div>
      childVNode = newParentVNode._children[i] = createVNode(
        childVNode.type,
        childVNode.props,
        childVNode.key,
        childVNode.ref ? childVNode.ref : null,
        childVNode._original
      );
    } else {
      childVNode = newParentVNode._children[i] = childVNode;
    }
  }
}

function insert(parentVNode, oldDom, parentDom) {
  if (parentVNode._dom != oldDom) {
    parentDom.insertBefore(parentVNode._dom, oldDom || null);
    oldDom = parentVNode._dom;
  }
}

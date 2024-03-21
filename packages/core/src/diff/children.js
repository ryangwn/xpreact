import { createVNode, createTextNode } from '../create-element'
import { INSERT_VNODE, EMPTY_ARR, EMPTY_OBJ } from '../constants'
import { diff } from './index'
import { isArray, toArray, isFunction, lisAlgorithm } from '../shared'
import { insertOrAppend as insertOrAppendApi, remove } from '../dom/api'

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
  refQueue
) {
  let oldChildren = (oldParentVNode && oldParentVNode._children) || EMPTY_ARR;
  let newChildren = newParentVNode._children || EMPTY_ARR;

  let j = 0,
    oldEndIdx = oldChildren.length - 1,
    newEndIdx = newChildren.length - 1,
    oldVNode = oldChildren[j] || EMPTY_OBJ,
    newVNode = newChildren[j];

  // Step 1
  outer: {
    // Sync nodes with the same key at the beginning.
    while (isSameVNode(newVNode, oldVNode)) {
      diff(
        parentDom,
        newVNode,
        oldVNode,
        isSvg,
        commitQueue,
        refQueue,
      )

      newVNode._index = j++;
      newVNode._parent = newParentVNode;

      if (j > oldEndIdx || j > newEndIdx) break outer
      oldVNode = oldChildren[j] || EMPTY_OBJ
      newVNode = newChildren[j];
    }

    oldVNode = oldChildren[oldEndIdx] || EMPTY_OBJ
    newVNode = newChildren[newEndIdx];

    // Sync nodes with the same key at the end.
    while (isSameVNode(newVNode, oldVNode)) {
      diff(
        parentDom,
        newVNode,
        oldVNode,
        isSvg,
        commitQueue,
        refQueue,
      )

      newVNode._index = newEndIdx;
      newVNode._parent = newParentVNode;

      oldEndIdx--
      newEndIdx--

      if (j > oldEndIdx || j > newEndIdx) break outer

      oldVNode = oldChildren[oldEndIdx] || EMPTY_OBJ
      newVNode = newChildren[newEndIdx];
    }
  }

  if (j > oldEndIdx && j <= newEndIdx) {
    let nextPos = newEndIdx + 1,
      refNode = nextPos >= newChildren.length
        ? null
        : newChildren[nextPos]._dom;

    // Create new _dom
    while (j <= newEndIdx) {
      let childVNode = newChildren[j];
      diff(
        parentDom,
        childVNode,
        EMPTY_OBJ,
        isSvg,
        commitQueue,
        refQueue,
      )
      childVNode._index = j;
      childVNode._parent = newParentVNode;
      insertOrAppend(parentDom, childVNode, refNode);
      j++
    }
  } else if (j > newEndIdx && j <= oldEndIdx) {
    while (j <= oldEndIdx) {
      // Remove nodes
      remove(parentDom, oldChildren[j++]._dom);
    }
  } else {
    let oldStartIdx = j,
      newStartIdx = j,
      newLeft = newEndIdx - newStartIdx + 1,
      source = new Array(newLeft).fill(-1),
      newIdxMap = {},
      patched = 0,
      move = false,
      endIdx = 0;

    for (let i = newStartIdx; i <= newEndIdx; i++) {
      let key = newChildren[i].key
      newIdxMap[key] = i
    }

    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      let oldNode = oldChildren[i],
        oldNodeKey = oldNode.key,
        newIdx = newIdxMap[oldNodeKey];

      if (newIdx === undefined) {
        remove(parentDom, oldNode._dom);
        continue
      }

      let newNode = newChildren[newIdx]
      // patch
      diff(
        parentDom,
        newNode,
        oldNode,
        isSvg,
        commitQueue,
        refQueue,
      )
      source[newIdx - newStartIdx] = i
      patched++

      if (newIdx < endIdx) {
        move = true
      } else {
        endIdx = newIdx
      }
    }

    if (move) {
      const seq = lisAlgorithm(source) // {@link https://leetcode.com/problems/longest-increasing-subsequence/}
      let j = seq.length - 1

      for (let i = newLeft - 1; i >= 0; i--) {
        let pos = newStartIdx + i,
          newNode = newChildren[pos],
          refNode = pos + 1 >= newChildren.length ? null : newChildren[newPos]._dom;

        if (source[i] === -1) {
          // New node appear
          diff(
            parentDom,
            newNode,
            EMPTY_OBJ,
            isSvg,
            commitQueue,
            refQueue
          )
          insertOrAppend(parentDom, newNode, refNode)
        } else if (j < 0 || i != seq[j]) {
          insertOrAppend(parentDom, newNode, refNode)
        } else {
          j--
        }

        newNode._index = pos;
        newNode._parent = newParentVNode;
      }
    } else {
      for (let i = newLeft - 1; i >= 0; i--) {
        if (source[i] === -1) {
          let pos = newStartIdx + i,
            newNode = newChildren[pos],
            newPos = pos + 1,
            refNode = newPos >= newChildren.length ? null : newChildren[newPos]._dom

          // mount
          diff(
            parentDom,
            newNode,
            EMPTY_OBJ,
            isSvg,
            commitQueue,
            refQueue
          )
          newNode._index = pos;
          newNode._parent = newParentVNode;

          insertOrAppend(parentDom, newNode, refNode)
        }
      }
    }
  }
}

function isSameVNode(newVNode, oldVNode) {
  let key = newVNode.key,
    type = newVNode.type;

  return (
    oldVNode === null ||
    (oldVNode &&
      key == oldVNode.key &&
      type === oldVNode.type)
  )
}

export const normalizeKey = ({ key }) => key != null ? key : null
export function normalizeChildren(children) {
  let i,
    childVNode,
    _children = toArray(children);

  if (typeof children != null) {
    for (i = 0; i < _children.length; i++) {
      childVNode = _children[i];
      if (
        typeof childVNode == 'string' ||
        typeof childVNode == 'number' ||
        // eslint-disable-next-line valid-typeof
        typeof childVNode == 'bigint' ||
        childVNode.constructor == String
      ) {
        childVNode = _children[i] = createTextNode(
          childVNode,
          null,
        );
      } else if (isArray(childVNode)) {
        childVNode = _children[i] = createVNode(
          Fragment,
          { children: childVNode },
          null,
          null,
          null
        );
      } else {
        childVNode = _children[i] = childVNode;
      }
      childVNode._index = i;
    }
  }

  return _children;
}

function insertOrAppend(parentDom, newNode, refNode) {
  // Mounting a DOM VNode
  if (!isFunction(newNode.type)) {
    insertOrAppendApi(parentDom, newNode._dom, refNode)
  }
}

function lis(nums) {
  if (nums.length === 0) return [];

  const n = nums.length;
  const lisLengths = new Array(n).fill(1);
  const prevIndices = new Array(n).fill(-1);
  let maxLength = 1;
  let lastIndex = 0;

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j] && lisLengths[i] < lisLengths[j] + 1) {
        lisLengths[i] = lisLengths[j] + 1;
        prevIndices[i] = j;
        if (lisLengths[i] > maxLength) {
          maxLength = lisLengths[i];
          lastIndex = i;
        }
      }
    }
  }

  const lis = [];
  let currentIndex = lastIndex;
  while (currentIndex !== -1) {
    lis.push(nums[currentIndex]);
    currentIndex = prevIndices[currentIndex];
  }

  return lis.reverse();
}

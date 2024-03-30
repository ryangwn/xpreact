import { createVNode, createTextNode } from "../create-element";
import { INSERT_VNODE, EMPTY_ARR, EMPTY_OBJ } from "../constants";
import { diff } from "./index";
import { isArray, toArray, isFunction, lisAlgorithm } from "../shared";
import { insert as insertApi, remove } from "../dom/api";

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
  refQueue,
) {
  let oldChildren = (oldParentVNode && oldParentVNode._children) || EMPTY_ARR;
  let newChildren = newParentVNode._children || EMPTY_ARR;

  // Todo: oldDom([]) -> newDom(null) unmount process
  if (!newChildren.length) {
    parentDom.textContent = "";
    return
  }

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
        refQueue
      );

      j++

      if (j > oldEndIdx || j > newEndIdx) break outer;
      oldVNode = oldChildren[j];
      newVNode = newChildren[j];
    }

    oldVNode = oldChildren[oldEndIdx];
    newVNode = newChildren[newEndIdx];

    // Sync nodes with the same key at the end.
    while (isSameVNode(newVNode, oldVNode)) {
      diff(parentDom, newVNode, oldVNode, isSvg, commitQueue, refQueue);

      oldEndIdx--;
      newEndIdx--;

      if (j > oldEndIdx || j > newEndIdx) break outer;

      oldVNode = oldChildren[oldEndIdx];
      newVNode = newChildren[newEndIdx];
    }
  }

  if (j > oldEndIdx && j <= newEndIdx) {
    let nextPos = newEndIdx + 1,
      refNode =
        nextPos >= newChildren.length ? null : newChildren[nextPos]._dom;

    // Create new _dom
    while (j <= newEndIdx) {
      let childVNode = newChildren[j];
      diff(
        parentDom,
        childVNode,
        EMPTY_OBJ,
        isSvg,
        commitQueue,
        refQueue
      );
      insert(parentDom, childVNode, refNode);
      j++;
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
      source = new Array(newLeft).fill(0),
      newIdxMap = {},
      patched = 0,
      moved = false,
      endIdx = 0;

    for (let i = newStartIdx; i <= newEndIdx; i++) {
      let key = newChildren[i].key;
      newIdxMap[key] = i;
    }

    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      let oldNode = oldChildren[i],
        oldNodeKey = oldNode.key,
        newIdx = newIdxMap[oldNodeKey];

      if (newIdx === undefined) {
        remove(parentDom, oldNode._dom);
        continue;
      }

      let newNode = newChildren[newIdx];
      // patch
      diff(parentDom, newNode, oldNode, isSvg, commitQueue, refQueue);
      source[newIdx - newStartIdx] = i + 1;
      patched++;

      if (newIdx < endIdx) {
        moved = true;
      } else {
        endIdx = newIdx;
      }
    }

    // move and mount
    const seq = moved ? lisAlgorithm(source) : EMPTY_ARR; // {@link https://leetcode.com/problems/longest-increasing-subsequence/}
    j = seq.length - 1;

    for (let i = newLeft - 1; i >= 0; i--) {
      let pos = newStartIdx + i,
        newNode = newChildren[pos],
        newPos = pos + 1,
        refNode =
          newPos >= newChildren.length ? null : newChildren[newPos]._dom;

      if (source[i] === 0) {
        // mount new
        diff(parentDom, newNode, EMPTY_OBJ, isSvg, commitQueue, refQueue);
        insert(parentDom, newNode, refNode);
      } else if (moved) {
        if (j < 0 || i != seq[j]) {
          move(parentDom, newNode, refNode);
        } else {
          j--;
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
    (oldVNode && key == oldVNode.key && type === oldVNode.type)
  );
}

// export const normalizeKey = ({ key }) => (key != null ? key : null);
export function normalizeChildren(children) {
  let i,
    childVNode,
    normalizedChildren = toArray(children);

  if (typeof children != null) {
    for (i = 0; i < normalizedChildren.length; i++) {
      childVNode = normalizedChildren[i];
      if (
        typeof childVNode == "string" ||
        typeof childVNode == "number" ||
        // eslint-disable-next-line valid-typeof
        typeof childVNode == "bigint" ||
        childVNode.constructor == String
      ) {
        normalizedChildren[i] = createTextNode(childVNode, null);
      } else if (isArray(childVNode)) {
         normalizedChildren[i] = createVNode(
          Fragment,
          { children: childVNode },
          null,
          null,
          null,
        );
      } else {
        normalizedChildren[i] = childVNode;
      }
    }
  }

  return normalizedChildren;
}

function move(parentDom, newNode, refNode) {
  return insert(parentDom, newNode, refNode)
}

function insert(parentDom, newNode, refNode) {
  // Mounting a DOM VNode
  if (!isFunction(newNode.type)) {
    insertApi(parentDom, newNode._dom, refNode);
  }
}

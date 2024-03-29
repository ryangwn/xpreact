import { options } from "../options";
import { BaseComponent } from "../component";
import { Fragment, createVNode } from "../create-element";
import { diffChildren, normalizeChildren } from "./children";
import { EMPTY_OBJ, EMPTY_ARR, RE_RENDER } from "../constants";
import { toArray, shallowCompare, assign, isFunction } from "../shared";
import { setProperty } from "./props";
import { setTextContent } from "../dom/api";

export function diff(
  parentDom,
  newVNode,
  oldVNode,
  isSvg,
  commitQueue,
  refQueue,
) {
  let tmp,
    newType = newVNode.type;

  if ((tmp = options._diff)) tmp(newVNode);

  outer: if (isFunction(newType)) {
    let c,
      isNew,
      oldProps = oldVNode.props || EMPTY_OBJ;
    let newProps = newVNode.props;

    // Get component and set it to `c`
    if (oldVNode._component) {
      c = newVNode._component = oldVNode._component;
    } else {
      if ("prototype" in newType && newType.prototype.render) {
        newVNode._component = c = new newType(newProps);
      } else {
        newVNode._component = c = new BaseComponent(newProps);
        c.constructor = newType;
        c.render = doRender; // Will call newType func
      }
    }

    c.props = newProps;
    if (!c.state) c.state = {};
    isNew = c._dirty = true;
    c.renderCallbacks = [];
    c.stateCallbacks = [];
    c._vnode = newVNode;
    c._parentDom = parentDom;
    c._flags = newVNode._flags;

    // Invoke pre-render lifecycle methods

    let renderHook = options._render,
      count = 0;
    if ("prototype" in newType && newType.prototype.render) {
      c.state = c._nextState;

      if (renderHook) renderHook(newVNode);

      tmp = c.render(c.props, c.state);

      for (let i = 0; i < c._stateCallbacks.length; i++) {
        c._renderCallbacks.push(c._stateCallbacks[i]);
      }
      c._stateCallbacks = [];
    } else {
      do {
        if (
          !shallowCompare(oldVNode, {}) ||
          c._flags & RE_RENDER ||
          shallowCompare(c.props, oldProps)
        ) {
          c._dirty = false;

          if (renderHook) renderHook(newVNode);

          tmp = c.render(c.props, c.state, c.context);

          c.state = c._nextState;
        } // If same VNode doesn't need to re-create components
        else {
          c._dirty = false;
          copyVNode(newVNode, oldVNode);
          return;
        }
      } while (c._dirty && ++count < 25);
    }

    let isTopLevelFragment =
      tmp != null && tmp.type === Fragment && tmp.key == null;
    newVNode._children = toArray(isTopLevelFragment ? tmp.props.children : tmp);

    diffChildren(parentDom, newVNode, oldVNode, isSvg, commitQueue, refQueue);
  } else {
    newVNode._dom = diffElementNodes(
      oldVNode._dom,
      newVNode,
      oldVNode,
      isSvg,
      commitQueue,
      refQueue,
    );
  }

  if ((tmp = options._diffed)) tmp(newVNode);
}

/**
 * Diff two virtual nodes representing DOM element
 * @param {Element} dom the dom element representing the virtual nodes being diffed
 * @param {*} newVNode the new virtual node
 * @param {*} oldVNode the old virtual node
 * @param {*} commitQueue
 * @param {*} refQueue
 */
function diffElementNodes(
  dom,
  newVNode,
  oldVNode,
  isSvg,
  commitQueue,
  refQueue,
) {
  let i, value, newChildren, newHtml;

  let oldProps = oldVNode.props || EMPTY_OBJ;
  let newProps = newVNode.props || EMPTY_OBJ;

  let nodeType = /** @type {string} */ (newVNode.type);

  // Tracks entering and exiting SVG namespace when descending through the tree.
  if (nodeType === "svg") isSvg = true;

  /**
   * Create dom element at first render call or //
   */
  if (dom == null) {
    if (nodeType === null) {
      return document.createTextNode(newProps);
    }

    if (isSvg) {
      dom = document.createElementNS("http://www.w3.org/2000/svg", nodeType);
    } else {
      dom = document.createElement(nodeType, newProps.is && newProps);
    }
  }

  // nodeType = null is number|string node (replace textContent)
  if (nodeType === null) {
    if (oldProps !== newProps && dom.data !== newProps) {
      setTextContent(dom, newProps);
    }
  } else {
    for (i in oldProps) {
      value = oldProps[i];
      if (i == "children") {
      } else if (i == "dangerouslySetInnerHTML") {
        oldHtml = value;
      } else if (i !== "key" && !(i in newProps)) {
        setProperty(dom, i, null, oldProps[i], isSvg);
      }
    }

    for (i in newProps) {
      value = newProps[i];
      if (i == "children") {
        newChildren = normalizeChildren(value);
      } else if (i == "dangerouslySetInnerHTML") {
        newHtml = value;
      } else if (i == "value") {
        inputValue = value;
      } else if (i == "checked") {
        checked = value;
      } else if (
        i !== "key" &&
        // (!isHydrated && typeof value == 'function') &&
        oldProps[i] !== value
      ) {
        setProperty(dom, i, value, oldProps[i], isSvg);
      }
    }

    if (newHtml) {
    } else {
      if (oldVNode._children || newChildren) {
        newVNode._children = toArray(newChildren);
        diffChildren(
          dom,
          newVNode,
          oldVNode,
          isSvg,
          commitQueue,
          null,
          refQueue,
        );
      }
    }
  }

  return dom;
}

function copyVNode(newVNode, oldVNode) {
  assign(newVNode, oldVNode);
}

/** The `.render()` method for a PFC backing instance. */
function doRender(props, state, context) {
  return this.constructor(props, context);
}

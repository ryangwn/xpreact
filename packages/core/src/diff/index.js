import { options } from '../options'
import { BaseComponent } from '../component'
import { Fragment } from '../create-element'
import { diffChildren, normalizeChildren } from './children'
import { EMPTY_OBJ, INSERT_VNODE, RE_RENDER_VNODE } from '../constants'
import { isFunction, shallowCompare, toArray } from '../shared'
import { setProperty } from './props'
import { insert, setTextContent } from '../dom/api'

export function diff(
  oldVNode,
  newVNode,
  parentDom,
  anchor,
  isSvg,
  commitQueue,
  refQueue,
) {
  let tmp
  let newType = newVNode.type

  if ((tmp = options._diff))
    tmp(newVNode)

  outer: if (isFunction(newType)) {
    let c
    let isNew
    let oldProps = oldVNode.props || EMPTY_OBJ
    let newProps = newVNode.props

    // Get component and set it to `c`
    if (oldVNode._component) {
      c = newVNode._component = oldVNode._component
    }
    else {
      if ('prototype' in newType && newType.prototype.render) {
        newVNode._component = c = new newType(newProps)
      }
      else {
        newVNode._component = c = new BaseComponent(newProps)
        c.constructor = newType
        c.render = doRender // Will call newType func
      }

      isNew = c._dirty = true
      c.renderCallbacks = []
      c.stateCallbacks = []
    }

    c.props = newProps
    if (!c.state)
      c.state = {}
    c._vnode = newVNode
    c._parentDom = parentDom
    c._flags = newVNode._flags

    if (c._nextState == null)
      c._nextState = c.state

    if (
      !isNew
      && !c._force
      && !(c._flags & RE_RENDER_VNODE
      || shallowCompare(c.props, oldProps))
    ) {
      newVNode._dom = oldVNode._dom
      newVNode._children = oldVNode._children
      break outer
    }

    let renderHook = options._render
    let count = 0
    if ('prototype' in newType && newType.prototype.render) {
      c.state = c._nextState

      if (renderHook)
        renderHook(newVNode)

      tmp = c.render(c.props, c.state)

      for (let i = 0; i < c._stateCallbacks.length; i++)
        c._renderCallbacks.push(c._stateCallbacks[i])

      c._stateCallbacks = []
    }
    else {
      do {
        c._dirty = false

        if (renderHook)
          renderHook(newVNode)

        tmp = c.render(c.props, c.state, c.context)

        c.state = c._nextState
      } while (c._dirty && ++count < 25)
    }

    let isTopLevelFragment
      = tmp != null && tmp.type === Fragment && tmp.key == null
    newVNode._children = toArray(isTopLevelFragment
      ? tmp.props.children
      : tmp,
    )

    diffChildren(
      oldVNode,
      newVNode,
      parentDom,
      isSvg,
      commitQueue,
      refQueue,
    )
  }
  else {
    newVNode._dom = oldVNode._dom

    diffElementNodes(
      oldVNode,
      newVNode,
      parentDom,
      anchor,
      isSvg,
      commitQueue,
      refQueue,
    )
  }

  if ((tmp = options._diffed))
    tmp(newVNode)
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
  oldVNode,
  newVNode,
  parentDom,
  anchor,
  isSvg,
  commitQueue,
  refQueue,
) {
  let
    i
  let value
  let dom = oldVNode._dom || null
  let newChildren
  let oldHtml
  let newHtml

  let oldProps = oldVNode.props || EMPTY_OBJ
  let newProps = newVNode.props

  let nodeType = /** @type {string} */ (newVNode.type)

  if (nodeType === null) {
    processTextNode(parentDom, oldVNode, newVNode, anchor)
    return
  }

  // Tracks entering and exiting SVG namespace when descending through the tree.
  if (nodeType === 'svg')
    isSvg = true

  /**
   * Create dom element at first render call or //
   */
  if (dom == null) {
    if (isSvg)
      dom = newVNode._dom = document.createElementNS('http://www.w3.org/2000/svg', nodeType)
    else
      dom = newVNode._dom = document.createElement(nodeType, newProps.is && newProps)
  }

  for (i in oldProps) {
    value = oldProps[i]
    if (i == 'children') {
    }
    else if (i == 'dangerouslySetInnerHTML') {
      oldHtml = value
    }
    else if (i !== 'key' && !(i in newProps)) {
      setProperty(dom, i, null, oldProps[i], isSvg)
    }
  }

  for (i in newProps) {
    value = newProps[i]
    if (i == 'children')
      newChildren = normalizeChildren(value)
    else if (i == 'dangerouslySetInnerHTML')
      newHtml = value
    else if (i == 'value')
      inputValue = value
    else if (i == 'checked')
      checked = value
    else if (
      i !== 'key'
      && oldProps[i] !== value
    )
      setProperty(dom, i, value, oldProps[i], isSvg)
  }

  if (newHtml) {
    if (!oldHtml
      || (newHtml.__html !== oldHtml.__html
      && newHtml.__html !== dom.innerHTML))
      dom.innerHTML = newHtml.__html

    newVNode._children = []
  }
  else {
    if (oldHtml)
      dom.innerHTML = ''

    if (oldVNode._children || newChildren) {
      newVNode._children = toArray(newChildren)
      diffChildren(
        oldVNode,
        newVNode,
        dom,
        isSvg,
        commitQueue,
        null,
        refQueue,
      )
    }
  }
  if (newVNode._flags & INSERT_VNODE)
    insert(parentDom, dom, anchor)
}

function processTextNode(parentDom, oldVNode, newVNode, anchor) {
  let dom = oldVNode._dom || null
  if (newVNode._flags & INSERT_VNODE) {
    insert(
      parentDom,
      (newVNode._dom = document.createTextNode(newVNode.props)),
      anchor,
    )
  }
  else if (oldVNode.props !== newVNode.props && dom.data !== newVNode.props) {
    setTextContent(dom, newVNode.props)
  }
}

/** The `.render()` method for a PFC backing instance. */
function doRender(props, state, context) {
  return this.constructor(props, context)
}

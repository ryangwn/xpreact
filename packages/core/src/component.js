import { assign } from './shared/object.js'
import { diff } from './diff'
import { RE_RENDER_VNODE } from './constants'

export function BaseComponent(props, context) {
  this.props = props
  this.context = context
}

BaseComponent.prototype.setState = function () {
  if (this._vnode)
    enqueueRender(this)
}

BaseComponent.prototype.forceUpdate = function (callback) {
  if (this._vnode) {
    // Set render mode so that we can differentiate where the render request
    // is coming from. We need this because forceUpdate should never call
    // shouldComponentUpdate
    this._force = true
    if (callback)
      this._renderCallbacks.push(callback)
    enqueueRender(this)
  }
}

BaseComponent.prototype.render = function () {

}

/**
 * Trigger in-place re-rendering of a component.
 * @param {Component} component The component to rerender
 */
function renderComponent(component, commitQueue, refQueue) {
  let oldVNode = component._vnode
  let parentDom = component._parentDom

  if (parentDom) {
    const newVNode = assign({}, oldVNode)

    newVNode._flags = RE_RENDER_VNODE

    diff(
      oldVNode,
      newVNode,
      parentDom,
      null,
      parentDom.ownerSVGElement !== undefined,
      commitQueue,
      refQueue,
    )
    // Pointer to parent
    oldVNode._children = newVNode._children

    newVNode._flags = null
  }
}

/**
 * The render queue
 * @type {Array<Component>}
 */
let rerenderQueue = []

const defer
  = typeof Promise == 'function'
    ? Promise.prototype.then.bind(Promise.resolve())
    : setTimeout

/**
 * Enqueue a rerender of a component
 * @param {Component} c The component to rerender
 */
export function enqueueRender(c) {
  if (
    (!c._dirty
    && (c._dirty = true)
    && rerenderQueue.push(c)
    && !process._rerenderCount++)
  )
    defer(process)
}

function process() {
  let c
  let commitQueue = []
  let refQueue = []

  // Don't update `renderCount` yet. Keep its value non-zero to prevent unnecessary
  // process() calls from getting scheduled while `queue` is still being consumed.
  while ((c = rerenderQueue.shift())) {
    if (c._dirty)
      renderComponent(c, commitQueue, refQueue)
  }
  process._rerenderCount = 0
}

process._rerenderCount = 0

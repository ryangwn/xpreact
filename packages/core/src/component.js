import { assign } from './shared/object.js'
import { diff } from './diff'
import { RE_RENDER } from './constants'

export function BaseComponent(props, context) {
  this.props = props;
  this.context = context;
}

BaseComponent.prototype.setState = function () {
  if (this._vnode) {
    enqueueRender(this)
  }
}

BaseComponent.prototype.forceUpdate = function () {
  if (this._vnode) {
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
  let oldVNode = component._vnode,
    parentDom = component._parentDom;

  if (parentDom) {
		const newVNode = assign({}, oldVNode);

    newVNode._flags = RE_RENDER;
    diff(
      parentDom,
      newVNode,
      oldVNode,
      parentDom.ownerSVGElement !== undefined,
      commitQueue,
      refQueue
    )

    newVNode._parent._children[newVNode._index] = newVNode;

    newVNode._flags = null;
  }
}

/**
 * The render queue
 * @type {Array<Component>}
 */
let rerenderQueue = [];

const defer =
  typeof Promise == 'function'
    ? Promise.prototype.then.bind(Promise.resolve())
    : setTimeout;

/**
 * Enqueue a rerender of a component
 * @param {Component} c The component to rerender
 */
export function enqueueRender(c) {
  if (
    (!c._dirty &&
      (c._dirty = true) &&
      rerenderQueue.push(c) &&
      !process._rerenderCount++)
  ) {
    defer(process);
  }
}

function process() {
  let c,
    commitQueue = [],
    refQueue = [];

  // Don't update `renderCount` yet. Keep its value non-zero to prevent unnecessary
  // process() calls from getting scheduled while `queue` is still being consumed.
  while ((c = rerenderQueue.shift())) {
		if (c._dirty) {
      renderComponent(c, commitQueue, refQueue)
    }
  }
  process._rerenderCount = 0;
}

process._rerenderCount = 0;

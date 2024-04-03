import { options } from '../options'
import { isFunction } from '../shared/is'

export function setProperty(dom, name, value, oldValue, isSvg) {
  let useCapture

  o: if (name === 'style') {
    if (typeof value === 'string')
      dom.style.cssText = value
  }
  else if (name === 'class') {
    // Todo: Implement basic className func for class process
    dom.className = value
  }
  else if (name[0] === 'o' && name[1] === 'n') {
    useCapture
      = name !== (name = name.replace(/(PointerCapture)$|Capture$/i, '$1'))

    // Infer correct casing for DOM built-in events:
    if (name.toLowerCase() in dom)
      name = name.toLowerCase().slice(2)
    else name = name.slice(2)

    if (!dom._listeners)
      dom._listeners = {}
    dom._listeners[name + useCapture] = value

    if (value) {
      if (!oldValue) {
        const handler = useCapture ? eventProxyCapture : eventProxy
        dom.addEventListener(name, handler, useCapture)
      }
    }
    else {
      const handler = useCapture ? eventProxyCapture : eventProxy
      dom.removeEventListener(name, handler, useCapture)
    }
  }
  else {
    if (isSvg) {
      // Normalize incorrect prop usage for SVG:
      // - xlink:href / xlinkHref --> href (xlink:href was removed from SVG and isn't needed)
      // - className --> class
      name = name.replace(/xlink(H|:h)/, 'h').replace(/sName$/, 's')
    }
    else if (
      name !== 'width'
      && name !== 'height'
      && name !== 'href'
      && name !== 'list'
      && name !== 'form'
      // Default value in browsers is `-1` and an empty string is
      // cast to `0` instead
      && name !== 'tabIndex'
      && name !== 'download'
      && name !== 'rowSpan'
      && name !== 'colSpan'
      && name !== 'role'
      && name in dom
    ) {
      try {
        dom[name] = value == null ? '' : value
        // labelled break is 1b smaller here than a return statement (sorry)
        break o
      }
      catch (e) { }
    }

    // aria- and data- attributes
    if (isFunction(value)) {
      // ignore
    }
    else if (value != null && (value !== false || name[4] === '-')) {
      dom.setAttribute(name, value)
    }
    else {
      dom.removeAttribute(name)
    }
  }
}

/**
 * Proxy an event to hooked event handlers
 * @param {PreactEvent} e The event object from the browser
 * @private
 */
function eventProxy(e) {
  if (this._listeners) {
    const eventHandler = this._listeners[e.type + false]
    /**
     * This trick is inspired by Vue https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/modules/events.ts#L90-L101
     * when the dom performs an event it leaves micro-ticks in between bubbling up which means that an event can trigger on a newly
     * created DOM-node while the event bubbles up, this can cause quirky behavior as seen in https://github.com/preactjs/preact/issues/3927
     */
    if (!e._dispatched) {
      // When an event has no _dispatched we know this is the first event-target in the chain
      // so we set the initial dispatched time.
      e._dispatched = Date.now()
      // When the _dispatched is smaller than the time when the targetted event handler was attached
      // we know we have bubbled up to an element that was added during patching the dom.
    }
    else if (e._dispatched <= eventHandler._attached) {
      return
    }
    return eventHandler(options.event ? options.event(e) : e)
  }
}

/**
 * Proxy an event to hooked event handlers
 * @param {PreactEvent} e The event object from the browser
 * @private
 */
function eventProxyCapture(e) {
  if (this._listeners)
    return this._listeners[e.type + true](options.event ? options.event(e) : e)
}

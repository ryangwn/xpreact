import { isNull } from '../shared'

export function appendChild(parentDom, newNode) {
  parentDom.appendChild(newNode)
}

export function insertBefore(parentDom, newNode, nextNode) {
  parentDom.insertBefore(newNode, nextNode)
}

export function insert(parentDom, newNode, nextNode) {
  if (isNull(nextNode)) {
    appendChild(parentDom, newNode)
  } else {
    insertBefore(parentDom, newNode, nextNode)
  }
}

export function insertOrAppend(parentDom, newNode, nextNode) {
  if (isNull(nextNode)) {
    appendChild(parentDom, newNode)
  } else {
    insertBefore(parentDom, newNode, nextNode)
  }
}

export function remove(parentDom, oldNode) {
  parentDom.removeChild(oldNode)
}

export function setTextContent(dom, text) {
  dom.textContent = text;
}

export function documentCreateElement(tag, isSVG) {
  if (isSVG) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  return document.createElement(tag);
}

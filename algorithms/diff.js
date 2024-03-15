/**
 * Idea of snabbdom
 * 
 * 
 */

/**
 *
 * @param {string} sel
 * @param {object} data
 * @param {array} children
 * @param {string} text
 * @param {dom} elm DOM
 * @returns object
 */
function vnode(
  sel,
  data,
  children,
  text,
  elm
) {
  return {
    sel,
    data,
    children,
    text,
    elm
  }
}

/**
 *
 * @param {string} a sel: attribute
 * @param {object} b data: props
 * @param {any} c
 */
function h(a, b, c) {
  if (arguments.length < 3) throw Error('');
  // 1. text node
  if (typeof c === 'string' || typeof c === 'number') {
    return vnode(a, b, undefined, c, undefined);
  } // 2. [h(),h()] [h(),text]
  else if (Array.isArray(c)) {
    let children = [];
    for (let i = 0; i < c.length; i++) {
      if (!(typeof c[i] === 'object' && c[i].sel))
        throw new Error('')
      children.push(c[i]);
    }
    return vnode(a, b, children, undefined, undefined);
  } // 3. {sel,data,children,text,elm}
  else if (typeof c === 'object' && c.sel) {
    let children = [c];
    return vnode(a, b, children, undefined, undefined);
  }
}

/**
 * Diff algorithm
 * const oldVnode = [a, b, c, d];
 * const newVnode = [b, d, a];
 * 
 * :will rearrange of node and remove old new node.
 * 
 * @param {dom} parentElm
 * @param {*} oldChild 
 * @param {*} newChild 
 */
function updateChildren(parentElm, oldChild, newChild) {
  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldChild.length - 1
  let newEndIdx = newChild.length - 1
  let oldStartVnode = oldChild[0]
  let oldEndVnode = oldChild[oldEndIdx]
  let newStartVnode = newChild[0]
  let newEndVnode = newChild[newEndIdx]
  let keyMap = null

  while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {

    if (oldChild[oldStartIdx] === undefined) {
      oldStartVnode = oldChild[++oldStartIdx]
    } else if (oldChild[oldEndIdx] === undefined) {
      oldEndVnode = oldChild[--oldEndIdx]
    } // 1. 
    else if (sameVnode(oldStartVnode, newStartVnode)) {
      console.log('1.')

      patchVnode(oldStartVnode, newStartVnode)

      newStartVnode = newChild[++newStartIdx]
      oldStartVnode = oldChild[++oldStartIdx]
    } // 2.
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      console.log('2.')
      patchVnode(oldEndVnode, newEndVnode)

      newEndVnode = newChild[--newEndIdx]
      oldEndVnode = oldChild[--oldEndIdx]
    } // 3. Vnode moved right
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      console.log('3.')
      patchVnode(oldStartVnode, newEndVnode)

      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)

      newEndVnode = newChild[--newEndIdx]
      oldStartVnode = oldChild[++oldStartIdx]
    } // 4. Vnode move left
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      console.log('4.')
      patchVnode(oldEndVnode, newStartVnode)

      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm)

      newStartVnode = newChild[++newStartIdx]
      oldEndVnode = oldChild[--oldEndIdx]
    } else {
      console.log('5.')

      if (!keyMap) {
        keyMap = {}
        for (let i = oldStartIdx; i < oldEndIdx; i++) {
          if (oldChild[i]) {
            const key = oldChild[i].data.key
            if (key) keyMap[key] = i
          }
        }
      }

      let idInOld = keyMap[newStartVnode.data.key]

      if (idInOld) {
        // Neither of the new endpoints are new vnodes, so we make progess by
        // moving `newStartVnode` into position
        let moveElm = oldChild[idInOld]

        patchVnode(moveElm, newStartVnode)

        oldChild[idInOld] = undefined

        parentElm.insertBefore(moveElm.elm, oldStartVnode.elm)
      } else {
        console.log('6.')
        // Create elm if not match with old key
        parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm)
      }

      newStartVnode = newChild[++newStartIdx]
    }
  }
  if (newStartIdx <= newEndIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      // Create new element and insert to the dom
      let beforeFlag = parentElm.childNodes[newStartIdx]

      parentElm.insertBefore(createElm(newChild[i]), beforeFlag)
    }
  }
  if (oldStartIdx <= oldEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      // Remove old element when newChild.length < oldChild.length
      if (oldChild[i]?.elm) parentElm.removeChild(oldChild[i].elm)
    }
  }
}

/**
 * 
 * @param {vnode} vnode1
 * @param {vnode} vnode2
 * @returns {boolean}
 */
function sameVnode(vnode1, vnode2) {
  return (
    (vnode1.data ? vnode1.data.key : undefined) ===
    (vnode2.data ? vnode2.data.key : undefined) && vnode1.sel === vnode2.sel
  )
}

/**
 * @param {vnode/DOM} oldVnode
 * @param {vnode} newVnode
 */
function patch(oldVnode, newVnode) {
  // 1. Does oldVnode is vnode?
  if (!oldVnode.sel) {
    oldVnode = emptyNodeAt(oldVnode)
  }

  if (sameVnode(oldVnode, newVnode)) {
    patchVnode(oldVnode, newVnode)
  } else {
    let newNode = createElm(newVnode);

    if (oldVnode.elm.parentNode) {
      let parentNode = oldVnode.elm.parentNode

      parentNode.insertBefore(newNode, oldVnode.elm)
      parentNode.removeChild(oldVnode.elm)
    }
  }

  newVnode.elm = oldVnode.elm
  return newVnode
}

/**
 * 
 * @param {vnode} oldVnode 
 * @param {vnode} newVnode
 * @returns
 */
function patchVnode(oldVnode, newVnode) {
  // 1.
  if (oldVnode === newVnode) return
  // 2.
  if (newVnode.text && !newVnode.children) {
    // 
    if (oldVnode.text != newVnode.text) {
      oldVnode.elm.textContent = newVnode.text;
    }
  } else {
    // 3.
    if (oldVnode.children) {
      updateChildren(oldVnode.elm, oldVnode.children, newVnode.children)
    } else {
      oldVnode.elm.innerHTML = ''
      let newChildren = newVnode.children;
      newChildren.map(child => {
        const childNode = createElm(child);
        oldVnode.elm.appendChild(childNode);
      })
    }
  }
}

/**
 *
 * @param {DOM} elm DOM
 * @returns {object}
 */
function emptyNodeAt(elm) {
  return vnode(elm.tagName.toLowerCase(), undefined, undefined, undefined, elm)
}

/**
 * 
 * @param {vnode} vnode 
 */
function createElm(vnode) {
  let node = document.createElement(vnode.sel);

  // Text content
  if (vnode.text !== '' && (
    vnode.children === undefined || vnode.children.length === 0
  )) {
    node.textContent = vnode.text;
  } else if (Array.isArray(vnode.children) && vnode.children.length > 0) {
    let children = vnode.children;

    children.map(child => {
      let childNode = createElm(child);
      node.appendChild(childNode);
    })
  }

  vnode.elm = node;
  return node;
}

let app = document.querySelector('#app')

let vnode1 = h('ul', {}, [
  h('li', { key: 'A' }, 'A'),
  h('li', { key: 'B' }, 'B'),
  h('li', { key: 'C' }, 'C'),
  h('li', { key: 'D' }, 'D'),
])

let oldVnode = patch(app, vnode1)

let vnode2 = h('ul', {}, [
  h('li', { key: 'G' }, 'G'),
  h('li', { key: 'C' }, 'C'),
  h('li', { key: 'A' }, 'A'),
  h('li', { key: 'H' }, 'H'),
  h('li', { key: 'D' }, 'D'),
  h('li', { key: 'B' }, 'B'),
])
let vnode3 = h('ul', {}, [
  h('li', { key: 'E' }, 'E'),
  h('li', { key: 'D' }, 'D'),
  h('li', { key: 'J' }, 'J'),
  h('li', { key: 'Q' }, 'Q'),
  h('li', { key: 'Z' }, 'Z'),
  h('li', { key: 'C' }, 'C'),
  h('li', { key: 'K' }, 'K'),
  h('li', { key: 'M' }, 'M'),
  h('li', { key: 'N' }, 'N'),
  h('li', { key: 'A' }, 'A'),
  h('li', { key: 'B' }, 'B'),
])
let vnode4 = h('ul', {}, [
  h('li', { key: 'A' }, 'A'),
  h('li', { key: 'B' }, 'B'),
  h('li', { key: 'C' }, 'C'),
])
let vnode5 = h('ul', {}, [
  h('li', { key: 'E' }, 'E'),
  h('li', { key: 'C' }, 'C'),
  h('li', { key: 'V' }, 'V'),
])
let vnode6 = h('ul', {}, [
  h('li', { key: 'A' }, 'A'),
  h('li', { key: 'B' }, 'B'),
  h('li', { key: 'C' }, 'C'),
  h('li', { key: 'D' }, 'D'),
  h(
    'li',
    { key: 'E' },
    h('ul', {}, [
      h('li', { key: 'A' }, 'A'),
      h('li', { key: 'B' }, 'B'),
      h('li', { key: 'C' }, 'C'),
      h('li', { key: 'D' }, 'D'),
      h('li', { key: 'E' }, h('div', { key: 'R' }, 'R')),
    ])
  ),
])
let vnodeList = [vnode2, vnode3, vnode4, vnode5, vnode6]
let btn = document.querySelectorAll('.btn')
for (let i = 0; i < btn.length; i++) {
  btn[i].onclick = () => {
    patch(vnode1, vnodeList[i])
  }
}

/**
 *
 * @param {*} params
 *
 */
function diff(prevChild, nextChild) {
  // 1. react diff one by one
  let nextIdx = 0
  let prevIdx = 0
  let nextChildLen = nextChild.length
  let prevChildLen = prevChild.length
  let oldVnode
  let newVnode

  while (nextIdx < nextChildLen) {
    oldVnode = prevChild[prevIdx]
    newVnode = nextChild[nextIdx]
    if (newVnode === oldVnode) {
      console.log('1. path')
      // path
      nextIdx++
      prevIdx++
    }
    else {
      break
    }
  }

  if (prevIdx > prevChildLen) {
    while (nextIdx < nextChildLen) {
      console.log('2. create')
      nextIdx++
    }
  }
  else if (nextIdx > nextChildLen) {
    while (prevIdx <= prevChildLen) {
      console.log('3. remove prevChild')
      prevIdx++
    }
  }
  else {
    let prevIdxMap = {}
    while (prevIdx < prevChildLen) {
      prevIdxMap[prevChild[prevIdx]] = prevIdx
      prevIdx++
    }

    while (nextIdx < nextChildLen) {
      newVnode = nextChild[nextIdx]
      if (typeof prevIdxMap[newVnode] !== 'undefined') {
        console.log('4. path pos')
        delete prevIdxMap[newVnode]
      }
      nextIdx++
    }
    console.log('prevIdxMap', prevIdxMap)
  }

  while (nextIdx < nextChildLen) {
    console.log('5. create remaining vnode')
    nextIdx++
  }
}

diff(['A', 'B', 'C', 'D'], ['C', 'B', 'D', 'A'])

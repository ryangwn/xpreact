const lis = function (nums) {
  let len = nums.length
  if (len <= 1)
    return len

  let tails = [nums[0]]
  for (let i = 0; i < len; i++) {
    if (nums[i] > tails[tails.length - 1]) {
      tails.push(nums[i])
    }
    else {
      let left = 0
      let right = tails.length - 1
      while (left < right) {
        let mid = (left + right) >> 1
        if (tails[mid] < nums[i])
          left = mid + 1
        else
          right = mid
      }
      tails[left] = nums[i]
    }
  }
  return tails.length
}

function diff(prevChild, nextChild, parent) {
  let j = 0
  let prevEndIdx = prevChild.length - 1
  let nextEndIdx = nextChild.length - 1
  let prevNode = prevChild[j]
  let nextNode = nextChild[j]

  outer: {
    while (prevNode === nextNode) {
      // patch
      j++
      if (j > prevEndIdx || j > nextEndIdx)
        break outer
      prevNode = prevChild[j]
      nextNode = nextChild[j]
    }

    prevNode = prevChild[prevEndIdx]
    nextNode = nextChild[nextEndIdx]

    while (prevNode === nextNode) {
      console.log('b.')
      // patch
      prevEndIdx--
      nextEndIdx--
      if (j > prevEndIdx || j > nextEndIdx)
        break outer
      prevNode = prevChild[prevEndIdx]
      nextNode = nextChild[nextEndIdx]
    }
  }

  if (j > prevEndIdx && j <= nextEndIdx) {
    console.log('c.')
    let nextPos = nextEndIdx + 1
    let refNode = nextPos >= nextChild.length
      ? null
      : nextChild[nextPos].el
    while (j <= nextEndIdx) mount(nextChild[j++], null, refNode)
  }
  else if (j > nextEndIdx && j <= nextEndIdx) {
    console.log('d.')
    while (j <= nextEndIdx) {
      // Remove nodes
    }
  }
  else {
    let prevStartIdx = j
    let nextStartIdx = j
    let nextLeft = nextEndIdx - nextStartIdx + 1
    source = new Array(nextLeft).fill(-1),
    nextIdxMap = {},
    patched = 0,
    move = false,
    lastIdx = 0

    for (let i = nextStartIdx; i <= nextEndIdx; i++) {
      let key = nextChild[i]
      nextIdxMap[key] = i
    }

    for (let i = prevStartIdx; i <= prevEndIdx; i++) {
      let prevNode = prevChild[i]
      let prevNodeKey = prevNode
      let nextIdx = nextIdxMap[prevNodeKey]

      if (nextIdx === undefined) {
        // Remove row
        continue
      }

      let nextNode = nextChild[nextIdx]
      // patch
      source[nextIdx - nextStartIdx] = i
      patched++

      if (nextIdx < lastIdx)
        move = true
      else
        lastIdx = nextIdx

      if (move) {
        const seq = lis(source) // {@link https://leetcode.com/problems/longest-increasing-subsequence/}
        let j = seq.length - 1

        for (let i = nextLeft - 1; i >= 0; i--) {
          let pos = nextStartIdx + i
          let nextNode = nextChild[pos]
          let nextPos = pos + 1
          let refNode = nextPos >= nextChild.length ? null : nextChild[nextPos].el
          let cur = source[i]

          if (cur === -1) {
            // Create new node
          }
          else if (cur === seq[j]) {
            j--
          }
          else {
            // insertBefore
          }
        }
      }
      else {
        for (let i = nextLeft - 1; i >= 0; i--) {
          let cur = source[i]

          if (cur === -1) {
            let pos = nextStartIdx + i
            let nextNode = nextChild[pos]
            let nextPos = pos + 1
            let refNode = nextPos >= nextChild.length ? null : nextChild[nextPos].el
            // mount
          }
        }
      }
    }

    console.log('source', source)
  }

  console.log('j', j)
  console.log('prevEndIdx', prevEndIdx)
  console.log('nextEndIdx', nextEndIdx)
}

function mount() {
  console.log('Mount new node')
}

diff([], ['A', 'B', 'C', 'D', 'E']) // create rows
// diff(['A', 'B', 'C', 'D', 'E'], ['A', 'C', 'D', 'E']) // remove row
// diff(['A', 'B', 'C', 'D', 'E'], [ 'G', 'A', 'C', 'B', 'F', 'D', 'E']) // swap rows
// diff(['A', 'B', 'C', 'D', 'E'], ['A', 'B', 'C']) // same rows

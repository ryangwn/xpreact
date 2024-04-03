let result
let p
let maxLen = 0

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
export function lisAlgorithm(arr) {
  let arrI = 0
  let i = 0
  let j = 0
  let k = 0
  let u = 0
  let v = 0
  let c = 0
  const len = arr.length

  if (len > maxLen) {
    maxLen = len
    result = new Int32Array(len)
    p = new Int32Array(len)
  }

  for (; i < len; ++i) {
    arrI = arr[i]

    if (arrI !== 0) {
      j = result[k]
      if (arr[j] < arrI) {
        p[i] = j
        result[++k] = i
        continue
      }

      u = 0
      v = k

      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI)
          u = c + 1
        else
          v = c
      }

      if (arrI < arr[result[u]]) {
        if (u > 0)
          p[i] = result[u - 1]

        result[u] = i
      }
    }
  }

  u = k + 1
  const seq = new Int32Array(u)
  v = result[u - 1]

  while (u-- > 0) {
    seq[u] = v
    v = p[v]
    result[u] = 0
  }

  return seq
}

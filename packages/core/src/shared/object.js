/**
 * Assign properties from `props` to `obj`
 * @template O, P The obj and props types
 * @param {O} obj The object to copy properties to
 * @param {P} props The object to copy properties from
 * @returns {O & P}
 */
export function assign(obj, props) {
  // @ts-expect-error We change the type of `obj` to be `O & P`
  for (let i in props) obj[i] = props[i]
  return /** @type {O & P} */ (obj)
}

export function shallowCompare(newObj, prevObj) {
  for (const key in newObj) {
    if (newObj[key] !== prevObj[key])
      return true
  }

  return false
}

export function objectLiteral(obj) {
  return (
    obj != null
    && typeof obj === 'object'
    && !Array.isArray(obj)
    && !(obj instanceof RegExp)
    && !(obj instanceof Date)
  )
}

export function emptyObject(obj) {
  if (!objectLiteral(obj))
    return false

  for (let key in obj) {
    if (hasOwnProperty.call(obj, key))
      return false
  }

  return true
}

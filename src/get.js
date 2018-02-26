import trimCache, { MAX_KEYS } from './helpers/trimCache'

const memoizeString = func => {
  const map = new Map()
  return string => {
    if (map.has(string)) {
      return map.get(string)
    } else {
      const result = func(string)
      map.set(string, result)
      if (map.size > MAX_KEYS) {
        trimCache(map)
      }
      return result
    }
  }
}

// Borrowed from Lodash
// https://github.com/lodash/lodash/blob/4.17.4/lodash.js
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

const reEscapeChar = /\\(\\)?/g
const reLeadingDot = /^\./
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g

const stringToPath = memoizeString(string => {
  const result = []
  if (reLeadingDot.test(string)) {
    result.push('')
  }
  string.replace(rePropName, (match, number, quote, string) => {
    result.push(quote ? string.replace(reEscapeChar, '$1') : number || match)
  })
  return result
})

const baseGet = (obj, path) => {
  const paths = Array.isArray(path) ? path : stringToPath(path)
  let val = obj
  let index = 0
  while (index < paths.length) {
    if (val == null) {
      return
    }
    val = val[paths[index]]
    index += 1
  }
  return val
}

const get = (obj, path, defaultValue) => {
  const result = obj == null ? undefined : baseGet(obj, path)
  return result === undefined ? defaultValue : result
}
export default get

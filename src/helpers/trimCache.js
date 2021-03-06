export const MAX_KEYS = 8192

const trimCache = (map) => {
  const keys = map.keys()
  while (map.size > MAX_KEYS) {
    map.delete(keys.next().value)
  }
}

export default trimCache

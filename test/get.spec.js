import get from '../src/get'
import { MAX_KEYS } from '../src/helpers/trimCache'

describe('redux-selectors', () => {
  let obj
  beforeEach(() => {
    obj = {
      '': { a: 'hi!', b: null },
      a: 'a',
      b: {
        c: 'c',
        d: ['d']
      }
    }
  })
  describe('get', () => {
    it('single string', () => {
      const result = get(obj, 'a')
      expect(result).toBe('a')
    })
    it('single array', () => {
      const result = get(obj, ['a'])
      expect(result).toBe('a')
    })
    it('chain string', () => {
      const result = get(obj, 'b.c')
      expect(result).toBe('c')
    })
    it('chain string with quotesx', () => {
      const result = get(obj, 'b["c"]')
      expect(result).toBe('c')
    })
    it('chain array', () => {
      const result = get(obj, ['b', 'c'])
      expect(result).toBe('c')
    })
    it('chain string with number', () => {
      const result = get(obj, 'b.d[0]')
      expect(result).toBe('d')
    })
    it('chain array with number', () => {
      const result = get(obj, ['b', 'd', 0])
      expect(result).toBe('d')
    })
    it('key is empty string (array)', () => {
      const result = get(obj, ['', 'a'])
      expect(result).toBe('hi!')
    })
    it('key is empty string', () => {
      const result = get(obj, '.a')
      expect(result).toBe('hi!')
    })
    it('returns undefined when encountering null', () => {
      const result = get(obj, '.b.c')
      expect(result).toBe(undefined)
    })
    it('returns undefined when encountering undefined', () => {
      const result = get(obj, '.c.c')
      expect(result).toBe(undefined)
    })
    it('returns undefined when object is null', () => {
      const result = get(null, '.c.c')
      expect(result).toBe(undefined)
    })
    it('trims cache after too many paths', () => {
      let i = 0
      while (i <= MAX_KEYS) {
        get(obj, `b.d[${i}]`)
        i += 1
      }
      // TODO: test number of calls
      const result = get(obj, 'a')
      expect(result).toBe('a')
    })
  })
})

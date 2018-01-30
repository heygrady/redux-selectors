# `createSelector(...selectors, resultsFunc)` and `createSelector(string)`


## Simple selector

If you pass only a single argument, it is passed into `createStateSelector` to enable creation of string selectors. Passing a function simply returns that function unaltered.

```js
import { createSelector } '@comfy/redux-selectors'

// a string selector, not memoized
export const selectOne = createSelector('section.one')

// a function selector, not memoized
export const selectTwo = createSelector(state => state.section.two)

// ---

const state = {
  section: {
    one: 1,
    two: 2
  }
}

selectOne(state) // --> 1
selectTwo(state) // --> 2
```

## Chained selector

```js
import { createSelector } '@comfy/redux-selectors'

import { selectOne, selectTwo } from './selectors'

// memoized, last selector received a spread of all previous selector results
export const selectTotal = createSelector(
  selectOne,
  selectTwo,
  (one, two) => one + two
)

// ---

const state = {
  section: {
    one: 1,
    two: 2
  }
}

selectTotal(state) // --> 3
```

## With Combine selectors

```js
import { createSelector, combineSelectors } '@comfy/redux-selectors'

import { selectOne, selectTwo } from './selectors'

// memoized, combines selectors into an object
export const selectTotal = createSelector(
  combineSelectors({
    one: selectOne,
    two: selectTwo
  }),
  ({ one, two }) => one + two
)

// ---

const state = {
  section: {
    one: 1,
    two: 2
  }
}

selectTotal(state) // --> 3
```

## With Compose selectors

```js
import { createSelector, composeSelectors } '@comfy/redux-selectors'

export const selectRoot = createSelector('section')
export const selectOne = composeSelectors(selectRoot, 'one')
export const selectTwo = composeSelectors(selectRoot, 'two')
export const selectTotal = createSelector(
  selectOne,
  selectTwo,
  (one, two) => one + two
)

// ---

const state = {
  section: {
    one: 1,
    two: 2
  }
}

selectOne(state) // --> 1
selectTwo(state) // --> 2
selectTotal(state) // --> 3
```

# `createSelector(...selectors, resultsFunc)` and `createSelector(string)`


## Basic Usage

If you pass only a single argument, it is passed into `createStateSelector` to enable creation of string selectors. Passing a function simply returns that function unaltered. Passing several selectors is a special form which collects the results of each selector and passes them to a results function.

```js
import { createSelector } '@comfy/redux-selectors'

export const selectOne = createSelector('section.one')
export const selectTotal = createSelector(
  selectOne,
  'section.two',
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
selectTotal(state) // --> 3
```

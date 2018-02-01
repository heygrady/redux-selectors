# Composing selectors



## Difference from `createSelector`

`composeSelectors` works somewhat differently than [`createSelector`](/docs/api/createSelector.md) but these differences may seem subtle at first glance. With `composeSelectors`, the result of each selector is fed into the next selector in the list. In the cases where there are only two selectors, `composeSelectors` and `createSelector` will return that same results. However, for three or more selectors, they will return wildly different results.

In the examples below, notice that `selectA` and `selectB` will return the same value. This works because in `composeSelectors` and `createSelector`, the value is fed-forward into the last selector. Notice that `selectWhoops` totally fails because `createSelector` expects each selector to read from the state and sends all of the results to the "results function". By contrast, `composeSelectors` treats each successive selector as the "results function" for the previous selector.

If this example is confusing, skip ahead to see how `composeSelectors` can help make more maintainable libraries of selectors.

```js
import { createSelector, composeSelectors } from '@comfy/redux-selectors'

const selectA = composeSelectors('department.produce', 'fruit')
const selectB = createSelector('department.produce', 'fruit')
const selectDeep = composeSelectors('department.produce', 'fruit', 'apples')
const selectWhoops = createSelector('department.produce', 'fruit', 'apples')

// ---

const state = {
  department: {
    produce: {
      fruit: { apples: 1, oranges: 2 }
    }
  }
}

selectA(state) === selectB(state) // => true
selectDeep(state) // => 1
selectWhoops(state) // => undefined
```

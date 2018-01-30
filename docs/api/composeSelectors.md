# `composeSelectors(...selectors)`

Compose selectors is based on redux's [`compose`](https://github.com/reactjs/redux/blob/master/docs/api/compose.md) function. This is the reason that redux is a peer dependency to Comfy redux-selectors.

**Note:** Comfy redux-selectors composes selectors left to right. Redux's `compose` function goes right to left.

## Usage

```js
import { createSelector, composeSelectors, createSelectorWithArgs } from '@comfy/redux-selectors'

export const selectRoot = createSelector('department.produce')

export const selectFruit = composeSelectors(selectRoot, 'fruit') // <-- composes left to right

export const selectApples = composeSelectors(selectFruit, 'apples') // <-- compose a composed selector
export const selectOranges = composeSelectors(selectFruit, 'oranges')

// -->

const state = {
  department: {
    meat: { pork: 1, chicken: 2, beef: 3 },
    fruit: { apples: 4, oranges: 5 },
  }
}

const value = selectOranges(state)

console.log(value) // --> 5
```

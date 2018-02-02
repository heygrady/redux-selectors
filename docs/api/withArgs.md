# `withArgs(selectorCreator)`

This is a convenience method for creating configurable selectors. Configurable selectors can accept arguments that affect the return value. For example, imagine a generic selector that can return an object based on an ID.

It is a memoized wrapper that allows you to provide a selector creator function that accepts arguments and returns a selector. Under the hood, `withArgs` simply memoizes the selectors the provided `selectorCreator` returns for the given `args`.

You may wish to [compare `withArgs` to reselect](/docs/usage/comparing-with-reselect.md)

## Basic Usage

The `withArgs` function expects you to provide a "selector creator" function that accepts arguments and returns a selector function. Below you can see a contrived example for creating a generic selector that can be used to select any key from the state. The `withArgs` function will memoize your creator function so that multiple calls with the same args will re-use a previously created selector.

```js
import { withArgs } from '@comfy/redux-selectors'

const selectFoo = withArgs(key => state => state[key])

const state = { foo: 'bar' }
selectFoo('foo')(state) // => bar
```

**Note:** The above example does not benefit from memoization and could be better written as a plain function.

```js
const selectFoo = key => state => state[key]

const state = { foo: 'bar' }
selectFoo('foo')(state) // => bar
```

## Advanced Usage

Imagine that we have an array of objects in state. Below we will write a generic selector that returns objects by ID.

You can see below that `selectOranges` is a normal selector that simply returns an array. `selectOrangeById` is a configurable, curried selector. First you pass an `id` and then you pass `state`. The `withArgs` function memoizes the selector for each ID while `createSelector` memoizes the result.

`selectSizeById` showcases how configurable selectors can be composed together. Because it depends on a fully memoized selector, it does not need to be memoized itself. [`composeSelectors`](/docs/api/composeSelectors.md) is used to return only the size attribute.

```js
import { createSelector, composeSelectors, withArgs } from '@comfy/redux-selectors'

export const selectOranges = createSelector('oranges')
export const selectOrangeById = withArgs(id =>
  createSelector(
    selectOranges,
    oranges => oranges.find(orange => orange.id === id)
  )
)
export const selectSizeById = id => composeSelectors(
  selectOrangeById(id),
  'size'
)

// ---

const state = {
  oranges: [
    { id: 1, size: 'big' },
    { id: 2, size: 'medium' },
    { id: 3, size: 'small' }
  ]
}

selectOrangeById(3)(state) // => { id: 3, size: 'small' }
selectSizeById(3)(state)  // => small
```

# `withArgs(selectorCreator)`

This is a convenience method for creating configurable curried selectors. Configurable selectors can accept arguments that affect the return value. For example, imagine a generic selector that can return an object based on an ID.

In order to smooth over some of the pain of creating curried selectors, redux-selectors provides `withArgs`. It is a memoized wrapper that allows you to provide a selector creator function that accepts arguments and returns a selector. Under the hood, `withArgs` simply memoizes the selectors the provided `selectorCreator` returns for the given `args`.

If you are a current user of reselect you may have come across cases where you wanted to pass additional arguments to your selector. By design, [reselect discourages curried selectors](https://github.com/reactjs/reselect#q-how-do-i-create-a-selector-that-takes-an-argument) in favor of using either `state` or `props` to configure selectors &mdash; removing the need to create curried selectors in the first place. The reselect manual refers to [re-reselect](https://github.com/toomuchdesign/re-reselect) to solve the issue in a similar manner, without needing curried selectors.

## Basic Usage

The `withArgs` function expects you to provide a "selector creator" function that accepts arguments and returns a selector function. Below you can see a contrived example for creating a generic selector that can be used to select any key from the state. The `withArgs` function will memoize your creator function so that multiple calls with the same args will re-use a previously created selector.

```js
import { withArgs } from '@comfy/redux-selectors'

const selectFoo = withArgs(key => state => state[key])

const state = { foo: 'bar' }
selectFoo('foo')(state) // --> bar
```

**Note:** The above example does not benefit from memoization and could be better written as a plain function.

```js
const selectFoo = key => state => state[key]

const state = { foo: 'bar' }
selectFoo('foo')(state) // --> bar
```

## Advanced Usage

Imagine that we have a array of objects in state. Below we will write a generic selector that returns objects by ID.

You can see below that `selectOranges` is a normal selector that simply returns an array. `selectOrangeById` is a configurable, curried selector. First you pass an `id` and then you pass `state`. The `withArgs` function memoizes the selector for each ID while `createSelector` memoizes the result.

`selectSizeById` showcases how configurable selectors can be composed together. Because it depends on a fully memoized selector, it does not need to be memoized itself.

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
```

### Advanced usage example

```js
const state = {
  oranges: [
    { id: 1, size: 'big' },
    { id: 2, size: 'medium' },
    { id: 3, size: 'small' }
  ]
}

selectOrangeById(3)(state) // --> { id: 3, size: 'small' }
selectSizeById(3)(state)  // --> small
```

## With Reselect

Below we can see an example following the format recommended in the reselect manual. The idea is to create a selector that is called in stages, first with state and then with additional arguments.

We will see in examples further below that passing the arguments in the second call is awkward. Comfy redux-selectors offers a [`composeSelectors`](./composeSelectors.md) function that illustrates the issue.

```js
import { createSelector as createReselectSelector } from 'reselect' // <-- using reselect
import memoize from 'lodash.memoize'
import get from 'lodash.get'

export const selectOranges = state => get(state, 'oranges')

export const selectOrangeById = createReselectSelector(
  selectOranges,
  oranges => memoize(id => oranges.find(orange => orange.id === id))
)

export const selectSizeById = createReselectSelector(
  selectOrangeById,
  selectOrange => id => get(selectOrangeById(id), 'size')
)
```

### Reselect usage example

```js
const state = {
  oranges: [
    { id: 1, size: 'big' },
    { id: 2, size: 'medium' },
    { id: 3, size: 'small' }
  ]
}
selectOrangeById(state)(2) // --> { id: 2, size: 'medium' }
selectSizeById(state)(2) // --> medium
```

## Why use `withArgs`

It makes it easy to create curried selectors that are easily composed. It gives you control over how the selector is created, allowing you to configure dependent selectors too. By contrast, curried selectors created by reselect are not easily composed and cannot be pre-configured. Compare the two examples above to see this in more detail.

A selector should receive state and return a value, not a function. Using `withArgs` allows you to supply a "creator function" that will create a selector with the given args. By contrast, reselect encourages a pattern where a selector may sometimes return a results function that accepts arguments and returns the final value.

### Easier to compose

```js
import { createSelector } from '@comfy/redux-selectors'
import { createSelector as createReselectSelector} from 'reselect'

import { selectOrangesBySize, selectApplesBySize } from './selectors' // <-- args first
import { selectBySizeOranges, selectBySizeApples } from './reselectors' // <-- state first

const selectBigFruit = createSelector(
  selectApplesBySize('big'), // <-- preconfigure the selector
  selectOrangesBySize('big'),
  (bigApples, bigOranges) => bigApples.concat(bigOranges)
)

const selectFruitBig = createReselectSelector(
  selectBySizeOranges,
  selectBySizeApples,
  (selectApples, selectOranges) => {
    const bigApples = selectApples('big')
    const bigOranges = selectOranges('big')
    return bigApples.concat(bigOranges)
  })
)
```

### Composition usage example

```js
const state = {
  apples: [
    { id: 4, size: 'small' },
    { id: 5, size: 'big' },
    { id: 6, size: 'small' }
  ],
  oranges: [
    { id: 1, size: 'big' },
    { id: 2, size: 'medium' },
    { id: 3, size: 'small' }
  ]
}

selectBigFruit(state) // --> [{ id: 5, size: 'big' }, { id: 1, size: 'big' }]
selectFruitBig(state) // same
```

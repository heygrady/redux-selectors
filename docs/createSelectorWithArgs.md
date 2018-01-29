# createSelectorWithArgs

This is a convenience method for creating configurable curried selectors. This is most useful for creating a configurable selector library.

If you are a current user of reselect you may have come across cases where you wanted to pass additional arguments to your selector. By design, [reselect makes this difficult](https://github.com/reactjs/reselect#q-how-do-i-create-a-selector-that-takes-an-argument). The reselect docs do show an [advanced example](https://github.com/reactjs/reselect#accessing-react-props-in-selectors) to work around the issue. The redux manual refers to [re-reselect](https://github.com/toomuchdesign/re-reselect) to solve the issue in a different manner.

## Usage

```js
import { createSelector, createSelectorWithArgs, composeSelectors } from '@comfy/redux-selectors'

export const selectOranges = createSelector('oranges')

export const selectOrangeById = createSelectorWithArgs(id =>
  createSelector(
    selectOranges,
    oranges => oranges.find(orange => orange.id === id)
  )
)

export const selectSize = createSelectorWithArgs(id =>
  composeSelectors(
    selectOrangeById(id),
    'size'
  )
)

// ---

const state = {
  oranges: [
    { id: 1, size: 'big' },
    { id: 2, size: 'medium' },
    { id: 3, size: 'small' }
  ]
}

const value = selectSize(3)(state) // <-- state is last

console.log(value) // --> small
```

## With Reselect

Below we can see an example following the format recommended in the reselect manual. The idea is to create a curried select that first creates a selector that returns a function. This type of curried selector is called in stages, first with state and then with additional arguments.

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

export const selectSize = createReselectSelector(
  selectOrangeById,
  selectOrange => id => selectOrange(id).size
)

// ---

const state = {
  oranges: [
    { id: 1, size: 'big' },
    { id: 2, size: 'medium' },
    { id: 3, size: 'small' }
  ]
}
const value = selectSize(state)(2) // <-- argument is last
console.log(value) // --> medium
```

## Why use `createSelectorWithArgs`

It makes it easy to create curried selectors that are easily composed. It gives you control over how the selector is created, allowing you to configure dependent selectors too. By contrast, curried selectors created by reselect are not easily composed and cannot be pre-configured. Compare the two examples above to see this in more detail.

A selector should receive state and return a value, not a function. Using `createSelectorWithArgs` allows you to supply a "creator function" that will create a selector with the given args. By contrast, reselect encourages a pattern where a selector may sometimes return a results function that accepts arguments and returns the final value.

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

// ---

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

const value = selectBigFruit(state)
const sameValue = selectFruitBig(state)

console.log(value) // --> [  { id: 5, size: 'big' }, { id: 1, size: 'big' }]
```

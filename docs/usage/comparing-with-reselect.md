# Comparing redux-selectors with reselect

If you are a current user of reselect you may have come across cases where you wanted to pass additional arguments to your selector. By design, [reselect discourages curried selectors](https://github.com/reactjs/reselect#q-how-do-i-create-a-selector-that-takes-an-argument) in favor of using either `state` or `props` to configure selectors &mdash; removing the need to create curried selectors in the first place. The reselect manual refers to [re-reselect](https://github.com/toomuchdesign/re-reselect) to solve the issue in a similar manner, without needing curried selectors.

## With Reselect

Below we can see an example following the format recommended in the reselect manual. A curried selector created following this method will accept the arguments in the opposite order than `withArgs`; first state and then args.

We will see in examples further below that passing the arguments in the second call is awkward. Comfy redux-selectors offers a [`composeSelectors`](./composeSelectors.md) function which illustrates the issue. Imagine composing several state-first configurable selectors.

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
  byId => id => get(byId(id), 'size')
)

// ---

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

*Opinion:* A selector should receive state and return a value, not a function.

Using `withArgs` allows you to supply a "creator function" that will create a selector with the given args. By contrast, reselect encourages a pattern where a selector may sometimes return a "results function" that accepts arguments and returns the final value.

### Easier to compose

Below you can see

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

selectBigFruit(state) // --> [{ id: 5, size: 'big' }, { id: 1, size: 'big' }]
selectFruitBig(state) // same
```

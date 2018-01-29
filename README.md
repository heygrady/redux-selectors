# Comfy Redux Selectors
Standard API for creating memoized state selectors. Very similar to [reselect](https://github.com/reactjs/reselect). If reselect is working for you, keep using it. If you find yourself commonly bumping in "missing features" in reselect, keep reading.

## Differences from reselect
Reselect is really awesome! Comfy redux-selectors was created to smooth over some common edge cases that you run into with reselect. Notably, [`createSelectorWithArgs`](./docs/createSelectorWithArgs.md) is not available with reselect directly. Comfy redux-selectors also offers a thin wrapper around [lodash.get](https://www.npmjs.com/package/lodash.get) for quickly creating selectors from a selector string.

### Important notes:

- Comfy redux-selectors uses [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) for the memoizer. A future version may allow you to specify your own memoizer. If you are targeting a browser that does not support WeakMap, you probably need to use a [polyfill](https://babeljs.io/docs/usage/polyfill/).
- Comfy redux-selectors allows you to create a selector from a simple selector string. Under the hood it uses lodash.get, which must be added as a peer dependency. A future version will (hopefully) make it easy to use either lodash.get, lodash/get, or your own get.

## Installation

```bash
yarn add @comfy/redux-selectors lodash.get redux
```

## Examples

### Simple text selector

Here you can see a simple selector that uses lodash.get to select a value from the state. Notably, this selector isn't memoized. There isn't a need to memoize a selector that simply reads a value from the state. The great benefit of using lodash.get is that it will return undefined if the state is not available. This makes it simple to create selectors that won't throw errors if the state isn't fully initialized.

```js
import { createSelector } from '@comfy/redux-selectors'

export const selectOne = createSelector('branchOne.one') // <-- not memoized

// --- usage

const state = {
  branchOne: { one: 1, two: 2 },
  branchTwo: { three: 3, four: 4 }
}
const value = selectOne(state)
console.log(value) // --> 1
```

- `selectOne` is a selector function that accepts state and returns a value
- It is not memoized because it's faster to simply return the value from state
- `createSelector` is a convenience function for creating a selector around lodash.get

### Writing this yourself
Here is an example of how to recreate what `createSelector` is doing.

```js
import { createSelector } from '@comfy/redux-selectors'
import get from 'lodash.get'

// these are equivalent
export const selectOne = createSelector('branchOne.one')
export const selectOneAlso = state => get(state, 'branchOne.one')
```

### Passing a custom function as a selector

You can also pass a single function to `createSelector`, although it's not strictly necessary. Under the hood, the `createSelector` function doesn't do anything with a passed selector function.

```js
import { createSelector } from '@comfy/redux-selectors'

// these are equivalent
export const selectTwo = createSelector(state => state.branchOne.two) // <-- not terribly useful
export const selectTwoAlso = state => state.branchOne.two

// --- usage

const state = {
  branchOne: { one: 1, two: 2 },
  branchTwo: { three: 3, four: 4 }
}
const value = selectTwo(state)
console.log(value) // --> 2
```

### Creating meta selectors

The real benefit of `createSelector` is in combining multiple selectors together into a meta selector. This form is similar to reselect.

If you pass two or more arguments to `createSelector`, it will presume that the last argument is a "results function." The rest of the functions are selectors. This makes it easy to gather a bunch of values from the state and glue them together.

Below you can see that we are able to specify a number of selectors and feed their values to a results function that combines them.

```js
import { createSelector } from '@comfy/redux-selectors'

export const selectOne = createSelector('branchOne.one')
export const selectTwo = state => state.branchOne.two

// a meta selector
export const selectTotal = createSelector(
  selectOne, // <-- use existing selectors
  selectTwo,
  'branchTwo.three', // <-- create new selectors
  state => state.branchTwo.four,
  (one, two, three, four) => one + two + three + four // <-- results function
)

// --- usage

const state = {
  branchOne: { one: 1, two: 2 },
  branchTwo: { three: 3, four: 4 }
}
const value = selectTotal(state) // <-- memoized by state
console.log(value) // --> 10
```

### Creating selectors with arguments

Sometimes you need to pass arguments to selectors. For philosophical reasons reselect advises against this pattern, reasoning that the input arguments should be stored in the state. However, inevitably you need to configure selectors to make them more reusable.

```js
import { createSelector, createSelectorWithArgs } from '@comfy/redux-selectors'
import { selectTotal } from './selectors'

export const selectTotalPlus = createSelectorWithArgs((plus = 0, minus = 0) => createSelector(
  selectTotal,
  total => total + plus - minus
))

// ---

const state = {
  branchOne: { one: 1, two: 2 },
  branchTwo: { three: 3, four: 4 }
}
const selector = selectTotalPlus(2, 3) // <-- memoized by args
const value = selector(state) // <-- memoized by state

console.log(value) // --> 9

// use it like a curried function
selectTotalPlus(2, 3)(state)
```

### Combining selectors (mapStateToProps)

Sometimes you need to take combine several selectors into a single object. A classic case would be the `mapStateToProps` function from react-redux.

```js
import { combineSelectors } from '@comfy/redux-selectors'

import { selectOne, selectTwo, selectTotal, selectTotalPlus } from './selectors'

const mapStateToProps = combineSelectors({
  one: selectOne, // <-- use existing selectors
  two: selectTwo,
  total: selectTotal,
  totalPlus: selectTotalPlus(3), // <-- initialize selectors with args
  appleCount: 'fruit.apples', // <-- create new selectors
  orangeCount: state => state.fruit.oranges,
})

// ---

const state = {
  branchOne: { one: 1, two: 2 },
  branchTwo: { three: 3, four: 4 },
  fruit: { apples: 5, oranges: 6 }
}

const props = mapStateToProps(state)

console.log(props) // --> { one: 1, two: 2, total: 10, totalPlus: 13, appleCount: 5, orangeCount: 6 }
```

### Combining selectors (createSelector)

You might also enjoy using `combineSelectors` along with `createSelector` in order to pass a props object to the results function.

```js
import { createSelector, combineSelectors } from '@comfy/redux-selectors'
import { selectOne, selectTwo, selectTotal } from './selectors'

export const selectSubTotal = createSelector(
  combineSelectors({
    one: selectOne,
    two: selectTwo,
    total: selectTotal
  }),
  ({ one, two, total }) => total - one - two
)

// ---

const state = {
  branchOne: { one: 1, two: 2 },
  branchTwo: { three: 3, four: 4 }
}
const value = selectSubTotal(state)

console.log(value) // --> 7
```

### Composing selectors

When you are building out selectors for your reducer, you may want to compose all of your selectors from a `rootSelector`. A root selector finds the root of the state that is managed by your reducer. This enables you to cleanly write selectors that can be "moved" if you need to reconfigure where your reducer is attached to the state.

```js
import { createSelector, composeSelectors } from '@comfy/redux-selectors'

export const selectRoot = createSelector('sectionA.subSectionC') // <-- imagine if the reducer is moved to subSectionB
export const selectFruit = composeSelectors(selectRoot, 'fruit')
export const selectAppleCount = composeSelectors(selectFruit, fruit => fruit.apples)

// ---

const state = {
  sectionA: {
    subSectionC: {
      fruit: { apples: 5, oranges: 6 }
    }
  }
}
const value = selectAppleCount(state)

console.log(value) // --> 5
```

# Comfy Redux Selectors
Standard API for creating memoized state selectors... very similar to [reselect](https://github.com/reactjs/reselect). If reselect is working for you, keep using it. If you find yourself commonly bumping in "missing features" in reselect, keep reading.

In addition to everything reselect lets you do, comfy redux-selectors allows you to:

- Create curried selectors
- Create selectors from a string
- `combineSelectors` and `composeSelectors`

### Important notes:

- Comfy redux-selectors uses [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) for the memoizer. A future version may allow you to specify your own memoizer (reselect [already allows this](https://github.com/reactjs/reselect/blob/master/README.md#createselectorcreatormemoize-memoizeoptions)). If you are targeting a browser that does not support `WeakMap`, you probably need to use a [polyfill](https://babeljs.io/docs/usage/polyfill/).
- Comfy redux-selectors allows you to create a selector from a simple selector string. Under the hood it uses `lodash.get`, which must be added as a peer dependency. A future version will (hopefully) make it easy to use either `lodash.get`, `lodash/get`, or your own get.
- If you use `composeSelectors` you must have redux installed as a peer dependency. Under the hood, `composeSelectors` uses `compose` from redux.

## Installation

```bash
yarn add @comfy/redux-selectors lodash.get redux
```

## API

- [`createSelector(...selectors, resultsFunc)` and `createSelector(string)`](/docs/api/createSelector.md)
- [`withArgs((...args) => selector)`](/docs/api/withArgs.md)
- [`combineSelectors(selectorMap)`](/docs/api/combineSelectors.md)
- [`composeSelectors(...selectors)`](/docs/api/composeSelectors.md)
- [`memoizeSelector(selector)`](/docs/api/memoizeSelector.md)
- [`createStateSelector(selector)`](/docs/api/createStateSelector.md)
- [`createPropsSelector(selector)`](/docs/api/createPropsSelector.md)

## Usage Examples

### Simple text selector

Here you can see a simple selector that uses lodash.get to select a value from the state. Notably, this selector isn't memoized. There isn't a need to memoize a selector that simply reads a value from the state. The great benefit of using lodash.get is that it will return `undefined` (instead of throwing an error) if the state is not available.

```js
import { createSelector } from '@comfy/redux-selectors'

export const selectApples = createSelector('fruit.apples') // <-- not memoized

// --- usage

const state = {
  fruit: { apples: 1, oranges: 2 }
}

selectApples(state) // --> 1
```

- `selectApples` is a selector function that accepts state and returns a value
- It is not memoized because it's faster to simply return the value from state
- `createSelector` is a convenience function for creating a selector around lodash.get

### Writing this yourself

Here is an example of how to recreate what `createSelector` is doing. Using lodash.get, it's easy to select a value from the state.

```js
import get from 'lodash.get'

export const selectOranges = state => get(state, 'fruit.oranges')
```

### Passing a function as a selector

You can also pass a function to `createSelector`, although it's particularly useful. Under the hood, the `createSelector` function simply returns a passed function.

```js
import { createSelector } from '@comfy/redux-selectors'

// these are equivalent
export const selectOranges = state => state.fruit.oranges
export const selectOrangesToo = createSelector(selectOranges)

console.log(selectOranges === selectOrangesToo) // --> true
```

### Creating dependent selectors

The real benefit of `createSelector` is in computing values from dependent selectors. If you pass two or more arguments to `createSelector` it will presume that the last argument is a "results function." The rest of the arguments are treated as selectors. This makes it easy to gather a bunch of values from the state and glue them together.

Below you can see that we are able to specify a number of selectors and feed their values to a results function that combines them.

```js
import { createSelector } from '@comfy/redux-selectors'

export const selectApples = createSelector('fruit.apples')
export const selectOranges = createSelector('fruit.oranges')

// a meta selector
export const selectTotal = createSelector(
  // use existing selectors
  selectApples,
  selectOranges,

  // or create new selectors
  'veggies.peas',
  state => state.veggies.carrots,

  // results function
  (apples, oranges, peas, carrots) => apples + oranges + peas + carrots
)

// --- usage

const state = {
  fruit: { apples: 1, oranges: 2 },
  veggies: { peas: 3, carrots: 4 }
}

selectTotal(state) // --> 10
```

### Creating selectors with arguments

Sometimes you need to pass arguments to selectors. Reselect advises that the arguments should preferably [come from props](https://github.com/reactjs/reselect/blob/master/README.md#q-how-do-i-create-a-selector-that-takes-an-argument). However, inevitably you need to configure selectors to make them more reusable.

```js
import { createSelector, withArgs } from '@comfy/redux-selectors'
import { selectTotal } from './selectors'

export const selectTotalPlus = withArgs((plus = 0, minus = 0) => createSelector(
  selectTotal,
  total => total + plus - minus
))

// ---

const state = {
  fruit: { apples: 1, oranges: 2 },
  veggies: { peas: 3, carrots: 4 }
}
selectTotalPlus(2, 3)(state) // --> 9
```

### Combining selectors (mapStateToProps)

Sometimes you need to take combine several selectors into a single object. A classic case would be the `mapStateToProps` function from react-redux.

```js
import { combineSelectors } from '@comfy/redux-selectors'

import { selectApples, selectOranges, selectTotal, selectTotalPlus } from './selectors'

const mapStateToProps = combineSelectors({
  // use existing selectors
  apples: selectApples,
  oranges: selectOranges,
  total: selectTotal,

  // initialize selectors with args from ownProps
  totalPlus: (state, ownProps) => selectTotalPlus(ownProps.plus, ownProps.minus)(state),

  // create new selectors
  peas: 'veggies.peas',
  carrots: state => state.veggies.carrots,
})

// ---

const state = {
  fruit: { apples: 1, oranges: 2 },
  veggies: { peas: 3, carrots: 4 }
}

mapStateToProps(state)
// --> { apples: 1, oranges: 2, total: 10, totalPlus: 13, peas: 5, carrots: 6 }
```

### Combining selectors (createSelector)

You might also enjoy using `combineSelectors` along with `createSelector` in order to pass a props object to the results function.

```js
import { createSelector, combineSelectors } from '@comfy/redux-selectors'
import { selectApples, selectOranges, selectTotal } from './selectors'

export const selectFruitlessTotal = createSelector(
  combineSelectors({
    apples: selectApples,
    oranges: selectOranges,
    total: selectTotal
  }),
  ({ apples, oranges, total }) => total - apples - oranges
)

// ---

const state = {
  fruit: { apples: 1, oranges: 2 },
  veggies: { peas: 3, carrots: 4 }
}

selectFruitlessTotal(state) // --> 7
```

### Composing selectors

When you are building out selectors for your reducer, you may want to compose all of your selectors from a `rootSelector`. A root selector finds the root of the state that is managed by your reducer. This enables you to cleanly write selectors that can be "moved" if you need to reconfigure where your reducer is attached to the state.

```js
import { createSelector, composeSelectors } from '@comfy/redux-selectors'

export const selectRoot = createSelector('section.produce') // <-- imagine if the "section" reducer is renamed to "department"
export const selectFruit = composeSelectors(selectRoot, 'fruit')
export const selectApples = composeSelectors(selectFruit, 'apples')

// ---

const state = {
  section: {
    produce: {
      fruit: { apples: 1, oranges: 2 },
      veggies: { peas: 3, carrots: 4 }
    }
  }
}

selectApples(state) // --> 1
```

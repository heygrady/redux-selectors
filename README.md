# Comfy Redux Selectors
Standard API for creating memoized state selectors... very similar to [reselect](https://github.com/reactjs/reselect). If reselect is working for you, keep using it. If you find yourself commonly bumping in "missing features" in reselect, keep reading.

In addition to everything reselect lets you do, redux-selectors allows you to:

- Easily create selectors from a path string
- Easily memoize dependent and complex selectors
- Easily create configurable, curried selectors
- Utility functions like [`combineSelectors`](/docs/api/combineSelectors.md) and [`composeSelectors`](/docs/api/composeSelectors.md)

## Installation

```bash
yarn add @comfy/redux-selectors lodash.get redux
```

- `createSelector` depends on `lodash.get`
- `composeSelectors` depends on `compose` from redux

## API

See the [docs](/docs/) for more. Here are the key functions:

- [`createSelector(path)`](/docs/api/createSelector.md)
- [`withArgs(creator)`](/docs/api/withArgs.md)
- [`withProps(creator)`](/docs/api/withProps.md)
- [`withState(selector)`](/docs/api/withState.md)
- [`combineSelectors(selectorMap)`](/docs/api/combineSelectors.md)
- [`composeSelectors(...selectors)`](/docs/api/composeSelectors.md)
- [`memoizeSelector(selector)`](/docs/api/memoizeSelector.md)

## Usage Examples

### Simple path selector

Here you can see a path selector that uses lodash.get. Notably, this selector isn't memoized. There isn't a need to memoize a selector that simply reads a value from the state. The great benefit of using lodash.get is that it will return `undefined` (instead of throwing an error) if the state is not available.

```js
import { createSelector } from '@comfy/redux-selectors'

export const selectApples = createSelector('fruit.apples') // <-- not memoized

// ---

const state = {
  fruit: { apples: 1, oranges: 2 }
}

selectApples(state) // => 1
```

- `selectApples` is a selector function that accepts `state` and returns a value
- It is not memoized because it's faster to simply return the value from state
- `createSelector(path)` is a convenience function for creating a selector that uses lodash.get
- [lodash.get](https://lodash.com/docs/4.17.4#get) allows the `path` to be a string or an array (and so does `createSelector`).

### Writing this yourself (with lodash.get)

Here is an example of how to recreate what `createSelector` is doing. Using lodash.get, it's easy to select a value from the state.

```js
import get from 'lodash.get'

export const selectOranges = state => get(state, 'fruit.oranges')
```

### Creating dependent selectors

The real benefit of `createSelector` is in computing values from dependent selectors. If you pass two or more arguments to `createSelector` it will presume that the last argument is a "results function." The rest of the arguments are treated as selectors. This makes it easy to gather a bunch of values from the state and glue them together.

Below you can see that we are able to specify a number of selectors and feed their values to a results function that combines them. You can read more about [dependent selectors](/docs/usage/dependent-selectors.md) in the docs.

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

// ---

const state = {
  fruit: { apples: 1, oranges: 2 },
  veggies: { peas: 3, carrots: 4 }
}

selectTotal(state) // => 10
```

### Creating selectors with arguments

Sometimes you need to pass configuration to selectors. The [`withArgs`](/docs/api/withArgs.md) function makes it easy to create a configurable, curried, composable selector.

Reselect advises that the selector configuration should preferably [come from `props` or `state`](https://github.com/reactjs/reselect/blob/master/README.md#q-how-do-i-create-a-selector-that-takes-an-argument). However, inevitably you need to configure selectors to make them more reusable.

There are many ways to create configurable selectors, you might enjoy reading more about creating [selectors with args](/docs/usage/selectors-with-args.md).

```js
import { createSelector, withArgs } from '@comfy/redux-selectors'
import { selectTotal } from './selectors' // see previous example

export const selectTotalPlus = withArgs((plus = 0, minus = 0) => createSelector(
  selectTotal,
  total => total + plus - minus
))

// ---

const state = {
  fruit: { apples: 1, oranges: 2 },
  veggies: { peas: 3, carrots: 4 }
}
selectTotalPlus(2, 3)(state) // => 9
```

### Combining selectors (to use with mapStateToProps)

Sometimes you need to combine several selectors into a "props object". A classic case would be `mapStateToProps` argument for react-redux's [`connect`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) function.

Notice how we use `ownProps` to configure `selectTotalPlus`. You might prefer to use [`withProps`](/docs/api/withProps.md) or read about advanced usage [with `mapStateToProps`](/docs/usage/with-mapStateToProps.md)

```js
import { combineSelectors } from '@comfy/redux-selectors'

import {
  selectApples,
  selectOranges,
  selectTotal,
  selectTotalPlus
} from './selectors' // see examples above

const mapStateToProps = combineSelectors({
  // use existing selectors
  apples: selectApples,
  oranges: selectOranges,
  total: selectTotal,

  // configure selectors
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
// => { apples: 1, oranges: 2, total: 10, totalPlus: 13, peas: 5, carrots: 6 }
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

selectApples(state) // => 1
```

### Important notes:

- redux-selectors uses [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) for the memoizer. A future version may allow you to specify your own memoizer ([reselect already allows this](https://github.com/reactjs/reselect/blob/master/README.md#createselectorcreatormemoize-memoizeoptions)). If you are targeting a browser that does not support `WeakMap`, you need to use a [polyfill](https://babeljs.io/docs/usage/polyfill/).
- redux-selectors allows you to create a selector from a "path string". Under the hood it uses `lodash.get`, which _must_ be added as a peer dependency. A future version will (somehow?) make it easy to use either `lodash.get`, `lodash/get`, or your own `get`.
- If you use `composeSelectors` you _must_ have redux installed as a peer dependency. Under the hood, `composeSelectors` uses `compose` from redux.

# Comfy Redux Selectors

A suite of composable functions that make it very easy to work with selectors. This library is intended to be used with redux but it works for any situation where you need to read values from structured objects.

Redux-selectors allows you to:

- Easily create selectors from a path string
- Easily memoize dependent selectors
- Easily create configurable selectors
- Plus: utility functions like [`combineSelectors`](/docs/api/combineSelectors.md) and [`composeSelectors`](/docs/api/composeSelectors.md) make it easy to stitch selectors together

**Note:** If [reselect](https://github.com/reactjs/reselect) is working for you, keep using it. If you find yourself commonly bumping in "missing features" in reselect, keep reading.

## Installation

```bash
yarn add @comfy/redux-selectors redux
```

**Note:** `composeSelectors` depends on `compose` from redux

## Getting started

The main point of this library is to create selectors that will read from `state`. Here you can see an example of creating a "path selector" that will return the value of `state.fruit.apples`.

```js
import { createSelector } from '@comfy/redux-selectors'

const selectApples = createSelector('fruit.apples')

// ---

const state = {
  fruit: { apples: 1, oranges: 2 }
}

selectApples(state) // => 1
```

## API

Docs:
- https://heygrady.github.io/redux-selectors/
- https://github.com/heygrady/redux-selectors/tree/master/docs

Here are the key functions:

- [`createSelector(path)`](/docs/api/createSelector.md) or `createSelector(...selectors, resultsFunc)`
- [`withOptions(creator, argsFilter)`](/docs/api/withOptions.md)
- [`withProps(creator, ...propsSelectors)`](/docs/api/withProps.md)
- [`withState(selector)`](/docs/api/withState.md)
- [`combineSelectors(selectorMap)`](/docs/api/combineSelectors.md)
- [`composeSelectors(...selectors)`](/docs/api/composeSelectors.md)
- [`memoizeSelector(selector)`](/docs/api/memoizeSelector.md)

## Examples

For each of the examples below, we'll be using the following structure for `state` and `ownProps`.

Why `state` and `ownProps`? Typically selectors are used to select values from `state` within a `mapStateToProps` function. React-redux provides a `connect` function which supplies `mapStateToProps` with the current redux `state` and the wrapper component's `ownProps`.

```js
const state = {
  department: {
    produce: {
      fruit: {
        apples: [
          { id: 1, size: 'big' }
        ],
        oranges: [
          { id: 2, size: 'medium' }
        ]
      },
      veggies: {
        potatoes: [
          { id: 3, size: 'small' }
        ]
      }
    }
  },
  filter: { size: 'big' }
}
const ownProps = { id: 1, type: 'apples' }
```

### Path selectors: `createSelector(path)`

You can create a selector from a path. Under the hood it uses `get(state, path)` (with the same API as [lodash `get`](https://lodash.com/docs/latest#get)) to read the value. The `get` function allows `path` to be either a string or an array. You can read more about [path selectors](/docs/usage/path-selectors.md) in the docs.

Path selectors are not memoized.

```js
import { createSelector } from '@comfy/redux-selectors'

const selectFirstApple = createSelector('department.produce.fruit.apples[0]')
const selectFirstPotato = createSelector(['department', 'produce', 'veggies', 'potatoes', 0])

selectFirstApple(state) // => { id: 1, size: 'big' }
selectFirstPotato(state) // => { id: 3, size: 'small' }
```

You can also create a path selector by hand, using [`get(state, path)`](https://lodash.com/docs/#get).

```js
import get from 'lodash.get'

const selectFirstOrange = state => get(state, 'department.produce.fruit.oranges[0]')

selectFirstOrange(state) // => { id: 2, size: 'medium' }
```

### Dependent selectors: `createSelector(...selectors, resultsFunc)`

You can also combine many dependent selectors using a "results function". This is very similar to how reselect works. You can supply several selectors and the results will be fed into a final results function. You can see below that the `resultsFunc` receives an argument for each selector. You can read more about [dependent selectors](/docs/usage/dependent-selectors.md) in the docs.

Dependent selectors are memoized.

```js
import { createSelector } from '@comfy/redux-selectors'

const selectAppleCount = createSelector('department.produce.fruit.apples.length')

const selectTotal = createSelector(
  selectAppleCount, // selector
  'department.produce.fruit.oranges.length', // path selector
  state => state.department.produce.veggies.potatoes.length,
  (apples, oranges, potatoes) => apples + oranges + potatoes // resultsFunc
)

selectTotal(state) // => 3
```

### Configurable selectors: `withOptions(creator)`

Sometimes you need to configure your selectors to make them more reusable. A configurable selector is a curried function that accepts configuration on the first call and state on the second. You can read more about [configurable selectors](/docs/usage/configurable-selectors.md) in the docs.

Configurable selectors are memoized.

```js
import { composeSelectors, createSelector, withOptions } from '@comfy/redux-selectors'

const selectApples = createSelector('department.produce.fruit.apples')
const selectAppleById = withOptions(id => composeSelectors(
  selectApples,
  apples => apples.find(apple => apple.id === id)
))

selectAppleById(id)(state) // => { id: 1, size: 'big' }
```

###  Configurable selectors: `withProps(creator)`

It is recommendable to use `ownProps` to provide configuration for your selectors. Using [`withProps`](/docs/api/withProps.md) will create a selector that accepts both `state` ane `ownProps`. Under the hood, `withProps` is a thin wrapper around `withOptions`. There is an important memoization edge case that `withProps` will optimize for you. You can read more about [configurable selectors](/docs/usage/configurable-selectors.md) in the docs.

Configurable selectors are memoized.

```js
import { composeSelectors, createSelector, withProps } from '@comfy/redux-selectors'

const selectFruit = createSelector('department.produce.fruit')
const selectFruitById = withProps(props => composeSelectors(
  selectFruit,
  props.type,
  items => items.find(item => item.id === props.id)
))

selectFruitById(state, ownProps) // => { id: 1, size: 'big' }
```

### Configurable selector: using `state`

```js
const selectSizeFilter = createSelector('filter.size')
const selectApples = createSelector('department.produce.fruit.apples')
const selectApplesBySize = withOptions(size => composeSelectors(
  selectApples,
  apples => apples.filter(apple => apple.size === size)
))
const selectApplesBySizeFilter = state => composeSelectors(
  selectSizeFilter,
  selectApplesBySize,
  selectFilteredApples => selectFilteredApples(state)
)(state)

selectApplesBySizeFilter(state) // => [{ id: 1, size: 'big' }]
```

### Using `mapStateToProps` and `withProps(creator)`

In cases where you are combining your selectors using `mapStateToProps`, you can use `withProps` to efficiently pass configuration from `ownProps` to selectors created with `withOptions`.

You can read more about [using `mapStateToProps`](/docs/usage/with-mapStateToProps.md) in the docs.

```js
import { composeSelectors, createSelector, withOptions, withProps } from '@comfy/redux-selectors'

const selectApples = createSelector('department.produce.fruit.apples')
const selectAppleById = withOptions(id => composeSelectors(
  selectApples,
  apples => apples.find(apple => apple.id === id)
))

const mapStateToProps = withProps(props => combineSelectors({
  apple: selectAppleById(props.id)
}))

mapStateToProps(state, ownProps) // => { apple: { id: 1, size: 'big' } }
```

### Using `mapStateToProps` and `withState(selector)`

Sometimes you need to ensure that your selector function accepts only a single argument. If you are using react-redux's `connect` function, you will see a small performance boost by specifying `mapStateToProps` functions that only accept state. This tells `connect` to recompute your selectors only when `state` changes, ignoring `props` altogether.

You can read more about [using `mapStateToProps`](/docs/usage/with-mapStateToProps.md) in the docs.

```js
import { withState } from '@comfy/redux-selectors'

const selectApples = createSelector('department.produce.fruit.apples')
const selectAppleById = withOptions(id => composeSelectors(
  selectApples,
  apples => apples.find(apple => apple.id === id)
))

const mapStateToProps = withState(combineSelectors({
  apple: selectAppleById(1)
}))

mapStateToProps(state, ownProps) // => { apple: { id: 1, size: 'big' } }
```

### Combining selectors: `combineSelectors(selectorMap)`

You can read more about [combining selectors for usage with `mapStateToProps`](/docs/usage/with-mapStateToProps.md) in the docs.

```js
import { combineSelectors, composeSelectors, createSelector, withProps } from '@comfy/redux-selectors'

const selectFruit = createSelector('department.produce.fruit')
const selectFruitById = withProps(props => composeSelectors(
  selectFruit,
  props.type,
  items => items.find(items => items.id === props.id)
))
const selectFruitSize = composeSelectors(
  selectFruitById,
  'size'
)

const mapStateToProps = combineSelectors({
  size: selectFruitSize
})

mapStateToProps(state, ownProps) // => { size: 'big' }
```

### Composing selectors: `composeSelectors(...selectors)`

You can read more about [composing selectors](/docs/usage/composing-selectors.md) in the docs.

```js
import { composeSelectors, createSelector, withOptions, withProps, withState } from '@comfy/redux-selectors'

const selectProduce = createSelector('department.produce')
const selectFruit = composeSelectors(selectProduce, 'fruit')
const selectApples = composeSelectors(selectFruit, 'apples')
const selectAppleById = withOptions(id => composeSelectors(
  selectApples,
  apples => apples.find(apple => apple.id === id)
))
const selectFruitSize = withProps(props => composeSelectors(
  withState(selectAppleById(props.id)),
  'size'
))

selectFruitSize(state, ownProps) // => 'big'
```

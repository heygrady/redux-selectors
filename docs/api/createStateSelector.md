# `createStateSelector(selector)`

Convenience function for creating a selector from a path. It will also return any non-path value, making it useful for converting a mixed array of path strings and selector functions to contain only selector functions.

## Basic Example

Below you can see an example of passing a path to `createStateSelector` to create a selector. Notice that path selectors completely ignore `ownProps`. If you want to create a path selector that reads from `ownProps`, try [`createPropsSelector`](/docs/api/createPropsSelector.md).

```js
import { createStateSelector } from '@comfy/redux-selectors'

const selectTitle = createStateSelector('title')

// ---

const state = { title: 'marco' }
const ownProps = { title: 'polo' }

selectTitle(state, ownProps) // => marco
```

## Using array paths

Because path selectors are created using `lodash.get`, any valid path argument will work. Lodash `get` allows path to be a string or an array. Below you can see an example where the path is specified in array format.

```js
import { createStateSelector } from '@comfy/redux-selectors'

const selectTitle = createStateSelector(['book', 'title'])

// ---

const state = { book: { title: 'marco' } }
const ownProps = { title: 'polo' }

selectTitle(state, ownProps) // => marco
```

## Passing selectors

Because `createStateSelector` is used internally by `createSelector` and other functions for ensuring that a selector is a function, `createStateSelector` will transparently return any non-path value.

Below you can see a few examples that illustrate how flexible `createStateSelector` can be.

- `selectTitle` is simply the function that was passed, unchanged
- `selectPropTitle` actually reads from props. Because it was not changed, it still works as expected
- `selectA` is literally the same function as `selectB`
- `selectWhoops` is literally the value `undefined`, not a function at all!

```js
import { createStateSelector } from '@comfy/redux-selectors'

const selectTitle = createStateSelector(state => state.book.title)
const selectPropTitle = createStateSelector((_, props) => props.title)

const selectA = state => state.book.title
const selectB = createStateSelector(selectA)
const selectWhoops = createStateSelector(undefined)

// ---

const state = { title: 'marco' }
const ownProps = { title: 'polo' }

selectTitle(state, ownProps) // => marco
selectPropTitle(state, ownProps) // => polo

selectA === selectB // => true
selectWhoops === undefined // => true
```

## Mapping a mixed array

Internally, `createStateSelector` is often mapped over an array of selectors. In the example below you can see that a mix of selectors can be quickly normalized by passing them all through `createStateSelector`, ensuring that all paths are converted to selectors.

```js
import { createStateSelector } from '@comfy/redux-selectors'

const selectors = [
  'title',
  ['title'],
  state => state.title,
  (_, ownProps) => ownProps.title
].map(createStateSelector)

// ---

const state = { title: 'marco' }
const ownProps = { title: 'polo' }

selectors.map(selector => selector(state)) // => [marco, marco, marco, polo]
```

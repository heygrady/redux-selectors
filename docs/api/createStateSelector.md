# `createStateSelector(selector)`

Convenience function for creating a selector from a path string. It will also return any non-string value, making it useful for converting a mixed array of path strings and selector functions to contain only selector functions.

## Basic Example

```js
import { createStateSelector } from '@comfy/redux-selectors'

const selectTitle = createStateSelector('title')

// ---

const state = { title: 'marco' }
const ownProps = { title: 'polo' }

selectTitle(state, ownProps) // => marco
```

## Mapping a mixed array

```js
import { createStateSelector } from '@comfy/redux-selectors'

const selectors = [
  'title',
  state => state.title,
  (_, ownProps) => ownProps.title
].map(createStateSelector)

// ---

const state = { title: 'marco' }
const ownProps = { title: 'polo' }

selectors.map(selector => selector(state)) // => [marco, marco, polo]
```

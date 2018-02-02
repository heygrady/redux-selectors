# `createPropsSelector(selector)`

Convenience function for creating a selector that ignores it's first property and instead reads the second property.

## Basic Example

In the example below, you can see that the selector completely ignores `state` and instead reads values from `ownProps`.

```js
import { createPropsSelector } from '@comfy/redux-selectors'

const selectTitle = createPropsSelector('title')

// ---

const state = { title: 'marco' }
const ownProps = { title: 'polo' }

selectTitle(state, ownProps) // => polo
```

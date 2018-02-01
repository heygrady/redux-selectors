# Composing selectors

Selectors are just functions and the can be composed using functional composition. The `composeSelectors` helper will "feed forward" the results of each selector into the next selector in the list. Under the hood, `composeSelectors` is using `compose` from redux. Unlike `compose`, `composeSelectors` will compose function right-to-left, to enhance readability.

The main benefit of composing selectors is for creating a library of maintainable selectors that can be reused, or combined to make novel new selectors.

## Basic example

Here's an example that composes deeply. In practice you won't normally need to compose more than one or two levels. However, for fun, here's what it looks like to compose many selectors together. Notice that each selector is fed into the next one.

```js
import { createSelector, composeSelectors } from '@comfy/redux-selectors'

const selectApples = composeSelectors(
  state => state.department,
  department => department.produce,
  produce => produce.fruit,
  fruit => fruit.apples
)

// ---

const state = {
  department: {
    produce: {
      fruit: { apples: 1, oranges: 2 }
    }
  }
}

selectApples(state) // => 1
```

## Using a "root selector"

The typical use-case for composing selectors is relying on a "root selector". In practice, a root selector knows how to find the part of the state that your other selectors need to work with. This isn't strictly necessary but it can make refactoring and reusing your selectors much easier.

Notice below how `selectRoot` is finding the produce department and passing it to the other selectors. As well, `selectApples` composes the `selectFruit` selector, making it easy to chain them together. When you are writing selectors for complex object structures, you can benefit greatly from being able to compose them with a "root", so that they can be located anywhere in `state`.

```js
import { createSelector, composeSelectors } from '@comfy/redux-selectors'

const selectRoot = createSelector('department.produce')
const selectFruit = composeSelectors(selectRoot, 'fruit')
const selectApples = composeSelectors(selectFruit, 'apples')

// ---

const state = {
  department: {
    produce: {
      fruit: { apples: 1, oranges: 2 }
    }
  }
}

selectApples(state) // => 1
```

### "Moving" a reducer

In the example above, you can see that the "root selector" is reading from `'department.produce'`. Under the hood, this is likely being managed by a reducer which is configured to manage that part of your state. Now imagine that we need to "move" that reducer from "department" to "section" because of some other refactor. This will break all of your selectors!

Below you can see how easy it is to refactor multiple selectors simply by changing one "root selector". Notice that the `selectRoot` selector is now reading from `'section.produce'`. All of the composed selectors will now read from the correct part of the state!

```js
import { createSelector, composeSelectors } from '@comfy/redux-selectors'

const selectRoot = createSelector('section.produce') // <-- one change
const selectFruit = composeSelectors(selectRoot, 'fruit')
const selectApples = composeSelectors(selectFruit, 'apples')

// ---

const state = {
  department: {
    produce: {
      fruit: { apples: 1, oranges: 2 }
    }
  }
}

selectApples(state) // => 1
```

## Difference from `createSelector`

`composeSelectors` works somewhat differently than [`createSelector`](/docs/api/createSelector.md) but these differences may seem subtle at first glance. With `composeSelectors`, the result of each selector is fed into the next selector in the list. In the cases where there are only two selectors, `composeSelectors` and `createSelector` will return that same results. However, for three or more selectors, they will return wildly different results.

In the examples below, notice that `selectA` and `selectB` will return the same value. This works because both `composeSelectors` and `createSelector` feed-forward results into the last selector. Notice, however, that `selectWhoops` totally fails. This is because `createSelector` expects each selector to read from the state and sends all of the results to the "results function". By contrast, `composeSelectors` treats each successive selector as the "results function" for the previous selector.

```js
import { createSelector, composeSelectors } from '@comfy/redux-selectors'

const selectA = composeSelectors('department.produce', 'fruit')
const selectB = createSelector('department.produce', 'fruit')
const selectDeep = composeSelectors('department.produce', 'fruit', 'apples')
const selectWhoops = createSelector('department.produce', 'fruit', 'apples')

// ---

const state = {
  department: {
    produce: {
      fruit: { apples: 1, oranges: 2 }
    }
  }
}

selectA(state) === selectB(state) // => true
selectDeep(state) // => 1
selectWhoops(state) // => undefined
```

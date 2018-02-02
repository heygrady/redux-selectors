# `composeSelectors(...selectors)`

Composing selectors means feed the value from one selector into another selector. `composeSelectors` is based on redux's [`compose`](https://github.com/reactjs/redux/blob/master/docs/api/compose.md) function. If you don't use `composeSelectors`, redux is not a required peer dependency.

**Note:** Comfy redux-selectors composes selectors left to right. Redux's `compose` function goes right to left.

## Basic usage

`composeSelectors` accepts a list of selectors as arguments. The result of each selector is "fed forward" into the next selector. Typically compose functions run right-to-left. However, redux-selectors composes left-to-right in order to make the composed functions more readable as a sentence.

Notice that you can supply a mix of path and functional selectors. Each selector is passed through [`createStateSelector`](/docs/api/createStateSelector.md) before being executed.

```js
import { composeSelectors } from '@comfy/redux-selectors'

const selectApple = composeSelectors(
  'department.produce',
  state => state.fruit,
  'apple'
)

// ---

const state = {
  department: {
    produce: {
      fruit: {
        apple: 1
      }  
    }
  }
}

selectApple(state) // => 1
```

## Example usage: `selectRoot`

Commonly, your selectors are dependent on the location of the `rootReducer` in the `state`. Meaning, typically you are writing selectors that read values from a specific part of the state, managed by a specific reducer. Comfy redux-selectors provides `composeSelectors` specifically to facilitate composing child selectors with a `selectRoot` function.

Using `selectRoot` is a huge benefit for refactoring code. This pattern enables you to change only a single function in the event that a reducer is relocated in the state.

```js
import { createSelector, composeSelectors } from '@comfy/redux-selectors'

export const selectRoot = createSelector('department.produce') // <-- root selector
export const selectFruit = composeSelectors(selectRoot, 'fruit') // <-- composes left to right
export const selectApples = composeSelectors(selectFruit, 'apples') // <-- compose a composed selector
export const selectOranges = composeSelectors(selectFruit, 'oranges')

// ---

const state = {
  department: {
    produce: {
      fruit: { apples: 1, oranges: 2 }
    }
  }
}

selectOranges(state) // => 2
```

## Advanced Usage

This example shows an advanced usage of selector composition to retrieve entities from a collection. This covers a common use-case where you need to select from an array of objects by ID.

Both `selectAppleById` and `selectApplesOfSize` demonstrate selectively memoizing portions of your selectors. In this case, there is no need to memoize `selectApples`. The result of `selectApples` can be considered as immutable as `state`.

You can also notice the usage of "object selectors" that expect to read from an object instead of the whole state. Below you can see that `selectSize` will blindly read the `size` from any object it receives. You can see it used in both `selectApplesOfSize` and `selectSizeFromId` to read the size of an apple.

```js
import { createSelector, withOptions, composeSelectors, memoizeSelector } from '@comfy/redux-selectors'

const selectRoot = createSelector('department.produce')
export const selectFruit = composeSelectors(selectRoot, 'fruit')
const selectApples = composeSelectors(selectFruit, 'apples')
const selectAppleById = withOptions(id => composeSelectors(
  selectApples,
  memoizeSelector(apples => apples.find(apple => selectId(apple) === id))  
))
const selectApplesOfSize = withOptions(size => composeSelectors(
  selectApples,
  memoizeSelector(apples => apples.filter(apple => selectSize(apple) === size))  
))
const selectSizeFromId = withOptions(id => composeSelectors(
  selectAppleById(id),
  selectSize
))

// object selectors
const selectId = createSelector('id')
const selectSize = createSelector('attributes.size')

const state = {
  department: {
    produce: {
      fruit: {
        apples: [
          { id: 1, type: 'apple', attributes: { size: 'big' } }
        ]
      }  
    }
  }
}

const apple1 = selectAppleById(1)(state)
const bigApples = selectApplesOfSize('big')(state)

apple1 === bigApples[0] // => true
selectSize(apple1) // => big
selectSizeFromId(1)(state) // => big
```

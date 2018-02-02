# `createSelector(path)`

`createSelector` is an overloaded function. It can do two things. This section demonstrates creating a selector from a path argument. If you would like to create a dependent selector, see below.

## Basic Usage (path selector)

If you pass only a single argument, `createSelector` will return a selector function. Under the hood, your arguments are passed to [`createStateSelector`](/docs/api/createStateSelector.md), which will convert path arguments into selectors.

You can a basic example below. Notice that the path string `'section.one'` is converted into a selector function that will return the correct value from the state.

```js
import { createSelector } '@comfy/redux-selectors'

export const selectOne = createSelector('section.one')
export const selectTotal = createSelector(
  selectOne,
  'section.two',
  (one, two) => one + two
)

// ---

const state = {
  section: {
    one: 1,
    two: 2
  }
}

selectOne(state) // => 1
```

**Note:** Passing a function simply returns that function unaltered. Passing several selectors is a special form which collects the results of each selector and passes them to a results function.

# `createSelector(...selectors, resultsFunc)`
If you pass two or more arguments to `createSelector` it will create a memoized dependent selector. The last argument is expected to be a results function, which will receive the values returned by all of the other selectors.

## Basic Usage (dependent selector)

Below you can see an example where two selectors are fed to a results function which adds them together. Notice that `selectOne` is a function and `'section.two'` is a path. Paths are converted to selectors for you. The last function is a results function. You can see that it receives two arguments, one for each selector. The value returned by the results function is memoized and returned.

```js
import { createSelector } '@comfy/redux-selectors'

export const selectOne = createSelector('section.one')
export const selectTotal = createSelector(
  selectOne,
  'section.two',
  (one, two) => one + two
)

// ---

const state = {
  section: {
    one: 1,
    two: 2
  }
}

selectTotal(state) // => 3
```

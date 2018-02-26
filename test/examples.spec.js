import {
  combineSelectors,
  composeSelectors,
  createSelector,
  filterState,
  withOptions,
  withProps,
  withState
} from '../src'

describe('redux-selectors', () => {
  describe('examples', () => {
    let state
    let ownProps
    beforeEach(() => {
      state = {
        department: {
          produce: {
            fruit: {
              apples: [{ id: 1, size: 'big' }],
              oranges: [{ id: 2, size: 'medium' }]
            },
            veggies: {
              potatoes: [{ id: 3, size: 'small' }]
            }
          }
        },
        filter: { size: 'big' }
      }
      ownProps = { id: 1, type: 'apples' }
    })
    describe('createSelector(path)', () => {
      it('creates a path selector with a string', () => {
        const selectFirstApple = createSelector(
          'department.produce.fruit.apples[0]'
        )

        expect(selectFirstApple(state)).toEqual({ id: 1, size: 'big' })
      })
      it('creates a path selector with an array', () => {
        const selectFirstPotato = createSelector([
          'department',
          'produce',
          'veggies',
          'potatoes',
          0
        ])

        expect(selectFirstPotato(state)).toEqual({ id: 3, size: 'small' })
      })
      it('creates a path selector with a function', () => {
        const selectFirstOrange = createSelector(
          state => state.department.produce.fruit.oranges[0]
        )

        expect(selectFirstOrange(state)).toEqual({ id: 2, size: 'medium' })
      })
    })
    describe('createSelector(...selectors, resultsFunc)', () => {
      it('creates a dependent selector', () => {
        const selectApples = createSelector(
          'department.produce.fruit.apples.length'
        )

        const selectTotal = createSelector(
          selectApples, // selector
          'department.produce.fruit.oranges.length', // path selector
          state => state.department.produce.veggies.potatoes.length,
          (apples, oranges, potatoes) => apples + oranges + potatoes // resultsFunc
        )

        expect(selectTotal(state)).toEqual(3)
      })
    })
    describe('withOptions(creator)', () => {
      it('creates a configurable selector', () => {
        const selectApples = createSelector('department.produce.fruit.apples')
        const selectAppleById = withOptions(id =>
          composeSelectors(selectApples, apples =>
            apples.find(apple => apple.id === id)
          )
        )

        expect(selectAppleById(ownProps.id)(state)).toEqual({
          id: 1,
          size: 'big'
        })
      })
      it('creates a selector configured by props', () => {
        const selectApples = createSelector('department.produce.fruit.apples')
        const selectAppleById = withOptions(props =>
          composeSelectors(selectApples, apples =>
            apples.find(apple => apple.id === props.id)
          )
        )

        expect(selectAppleById(ownProps)(state)).toEqual({ id: 1, size: 'big' })
      })
      it('creates a selector configured by state', () => {
        const selectSizeFilter = createSelector('filter.size')
        const selectApples = createSelector('department.produce.fruit.apples')
        const selectApplesBySize = withOptions(size =>
          composeSelectors(selectApples, apples =>
            apples.filter(apple => apple.size === size)
          )
        )
        const selectApplesByFilter = state =>
          composeSelectors(
            selectSizeFilter,
            selectApplesBySize,
            selectFilteredApples => selectFilteredApples(state)
          )(state)

        expect(selectApplesByFilter(state)).toEqual([{ id: 1, size: 'big' }])
      })
    })
    describe('withOptions(creator, attrFilter)', () => {
      it('creates a configurable selector that only receives state', () => {
        const selectApples = createSelector('department.produce.fruit.apples')
        const selectAppleById = withOptions(
          id =>
            composeSelectors(
              (state, props) => props || state,
              selectApples,
              apples => apples.find(apple => apple.id === id)
            ),
          filterState
        )

        expect(selectAppleById(ownProps.id)(state, ownProps)).toEqual({
          id: 1,
          size: 'big'
        })
      })
    })
    describe('withProps(creator)', () => {
      it('creates a configurable selector that is configured by props', () => {
        const selectFruit = createSelector('department.produce.fruit')
        const selectFruitById = withProps(props =>
          composeSelectors(selectFruit, props.type, items =>
            items.find(item => item.id === props.id)
          )
        )

        expect(selectFruitById(state, ownProps)).toEqual({ id: 1, size: 'big' })
      })

      it('creates a mapStateToProps function that is configured by props', () => {
        const selectApples = createSelector('department.produce.fruit.apples')
        const selectAppleById = withOptions(id =>
          composeSelectors(selectApples, apples =>
            apples.find(apple => apple.id === id)
          )
        )

        const mapStateToProps = withProps(props =>
          combineSelectors({
            apple: selectAppleById(props.id)
          })
        )

        expect(mapStateToProps(state, ownProps)).toEqual({
          apple: { id: 1, size: 'big' }
        })
      })
    })
    describe('withProps(creator, ...propsSelectors)', () => {
      it('creates a configurable selector that is configured by selected props', () => {
        const selectFruit = createSelector('department.produce.fruit')
        const selectFruitById = withProps(
          (id, type) =>
            composeSelectors(selectFruit, type, items =>
              items.find(item => item.id === id)
            ),
          'id',
          'type'
        )

        expect(selectFruitById(state, ownProps)).toEqual({ id: 1, size: 'big' })
      })
      it('creates a configurable selector that is configured by destructured props', () => {
        const selectFruit = createSelector('department.produce.fruit')
        const selectFruitById = withProps(({ id, type }) =>
          composeSelectors(selectFruit, type, items =>
            items.find(item => item.id === id)
          )
        )

        expect(selectFruitById(state, ownProps)).toEqual({ id: 1, size: 'big' })
      })

      it('creates a configurable selector that configures a different selector', () => {
        const selectFruit = createSelector('department.produce.fruit')
        const selectApples = composeSelectors(selectFruit, 'apples')
        const selectAppleById = withOptions(id =>
          composeSelectors(selectApples, apples =>
            apples.find(apple => apple.id === id)
          )
        )
        const selectApple = withProps(({ id }) => selectAppleById(id))

        expect(selectApple(state, ownProps)).toEqual({ id: 1, size: 'big' })
      })
    })

    describe('withState(selector)', () => {
      it('creates a mapStateToProps function that only receives state', () => {
        const selectApples = createSelector('department.produce.fruit.apples')
        const selectAppleById = withOptions(id =>
          composeSelectors(selectApples, apples =>
            apples.find(apple => apple.id === id)
          )
        )

        const mapStateToProps = withState(
          combineSelectors({
            apple: selectAppleById(1)
          })
        )

        expect(mapStateToProps(state)).toEqual({
          apple: { id: 1, size: 'big' }
        })
      })
    })

    describe('combineSelectors(selectorMap)', () => {
      it('creates a mapStateToProps function', () => {
        const selectFruit = createSelector('department.produce.fruit')
        const selectFruitById = withProps(props =>
          composeSelectors(selectFruit, props.type, items =>
            items.find(items => items.id === props.id)
          )
        )
        const selectFruitSize = composeSelectors(selectFruitById, 'size')

        const mapStateToProps = combineSelectors({
          size: selectFruitSize
        })

        expect(mapStateToProps(state, ownProps)).toEqual({ size: 'big' })
      })
    })

    describe('composeSelectors(...selectors)', () => {
      it('creates a composed selector', () => {
        const selectProduce = createSelector('department.produce')
        const selectFruit = composeSelectors(selectProduce, 'fruit')
        const selectApples = composeSelectors(selectFruit, 'apples')
        const selectAppleById = withOptions(id =>
          composeSelectors(selectApples, apples =>
            apples.find(apple => apple.id === id)
          )
        )
        const selectFruitSize = withProps(props =>
          composeSelectors(withState(selectAppleById(props.id)), 'size')
        )

        expect(selectFruitSize(state, ownProps)).toEqual('big')
      })
    })
  })
})

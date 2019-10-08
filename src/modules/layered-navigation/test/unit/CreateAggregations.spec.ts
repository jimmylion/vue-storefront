import CreateAggregations from '../../util/CreateAggregations'

describe('CreateAggregations', () => {

  it('it creates instance of CreateAggregations class', () => {
    const instance = new CreateAggregations([])
    expect(instance instanceof CreateAggregations).toBeTruthy()
  })

  it('it creates aggregation with one foreign filter', () => {
    const instance = new CreateAggregations([
      {
        name: 'color',
        path: 'configurable_children.color_group',
        aggName: 'colors',
        value: [2, 15]
      },
      {
        name: 'style',
        path: 'configurable_children.style',
        aggName: 'styles',
        value: [3]
      }
    ])
    
    const colorAgg = instance.appendFilterToAggregation('color')
    expect(colorAgg).toEqual({
        colors_wrapper: {
          filter: {
            terms: {
              "configurable_children.style": [3]
            }
          },
          aggs: {
            colors: {
              terms: {
                field: [
                  "configurable_children.color_group"
                ]
              }
            }
          }
        }
      }
    )
    
  })

})
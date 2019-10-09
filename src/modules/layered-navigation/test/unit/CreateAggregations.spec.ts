import CreateAggregations from '../../util/CreateAggregations'

describe('CreateAggregations', () => {

  it('it creates instance of CreateAggregations class', () => {
    const instance = new CreateAggregations([])
    expect(instance instanceof CreateAggregations).toBeTruthy()
  })

  it('it adds size: 0', () => {
    const instance = new CreateAggregations([])
    expect(instance.aggs).toEqual({
      aggs: {},
      size: 0
    })
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
                field: "configurable_children.color_group"
              }
            }
          }
        }
      }
    )

  })

  it('it creates aggregation with a few foreign filters', () => {
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
      },
      {
        name: 'length',
        path: 'configurable_children.length',
        aggName: 'lengths',
        value: ["Mid", "Knee"]
      }
    ])
    
    const colorAgg = instance.appendFilterToAggregation('color')
    expect(colorAgg).toEqual({
        colors_wrapper: {
          filter: {
            bool: {
              must: [
                {
                  terms: {
                    "configurable_children.style": [3]
                  }
                },
                {
                  terms: {
                    "configurable_children.length": ["Mid", "Knee"]
                  }
                }
              ]
            }
          },
          aggs: {
            colors: {
              terms: {
                field: "configurable_children.color_group"
              }
            }
          }
        }
      }
    )
    
  })

  it('it adds keyword if needed', () => {
    const instance = new CreateAggregations([
      {
        name: 'color',
        path: 'configurable_children.color_group',
        aggName: 'colors',
        value: [2, 15],
        keyword: true
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
                field: "configurable_children.color_group.keyword"
              }
            }
          }
        }
      }
    )

  })

  it('it adds size for agg if needed', () => {
    const instance = new CreateAggregations([
      {
        name: 'color',
        path: 'configurable_children.color_group',
        aggName: 'colors',
        value: [2, 15],
        keyword: true,
        size: 12
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
                field: "configurable_children.color_group.keyword",
                size: 12
              }
            }
          }
        }
      }
    )

  })

  it('it returns filterless agg with size', () => {
    const instance = new CreateAggregations([
      {
        name: 'color',
        path: 'configurable_children.color_group',
        aggName: 'colors',
        value: [2, 15]
      }
    ])
    
    expect(instance.filterlessAggs).toEqual({
        aggs: {
          colors: {
            terms: {
              field: "configurable_children.color_group"
            }
          }
        },
        size: 0
      }
    )

  })

  it('it returns 2 filterless aggs with size', () => {
    const instance = new CreateAggregations([
      {
        name: 'color',
        path: 'configurable_children.color_group',
        aggName: 'colors',
        value: [2, 15],
        keyword: true
      },
      {
        name: 'style',
        path: 'configurable_children.style',
        aggName: 'styles',
        value: [17]
      }
    ])
    
    expect(instance.filterlessAggs).toEqual({
        aggs: {
          colors: {
            terms: {
              field: "configurable_children.color_group.keyword"
            }
          },
          styles: {
            terms: {
              field: "configurable_children.style"
            }
          }
        },
        size: 0
      }
    )

  })

})
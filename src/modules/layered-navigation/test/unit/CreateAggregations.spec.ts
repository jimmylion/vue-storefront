import CreateAggregations from '../../util/CreateAggregations'

describe('CreateAggregations', () => {

  it('it returns base aggs object', () => {
    expect(CreateAggregations({})).toEqual({aggs:{}})
  })

})
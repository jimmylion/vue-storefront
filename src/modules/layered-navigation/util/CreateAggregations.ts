interface Aggregations {
  [key: string]: Array<Number> | Array<string>
}

interface Filter {
  name: string,
  path: string,
  aggName: string,
  value: Array<string> | Array<Number>,
  keyword?: Boolean,
  size?: Number
}

/**
 * Example of use
 * const instance = new CreateAggregations([
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
  
  instance.aggs === your aggregations query
 */

export default class AgregationsCreator {

  private aggregations;
  private applied;

  constructor(private filters: Array<Filter>) {
    this.aggregations = {
      aggs: {},
      size: 0
    }

    this.applied = filters.reduce((total, { value }) => {
      if (value && value.length) {
        total++
      }
      return total
    }, 0)
  }

  private createAggregation (filterName: string) {

    const filter = this.filters.find(filter => filter.name === filterName)
    if (!filter) {
      throw new Error('Requested filter does not exist')
    }

    const agg = {
      terms: {
        field: filter.path + (filter.keyword ? '.keyword' : ''),
        ...(filter.size ? { size: filter.size } : {})
      }
    }

    return agg
  }

  public appendFilterToAggregation (filterName: string): any {

    const filter = this.filters.find(filter => filter.name === filterName)
    if (!filter) {
      throw new Error('Requested filter does not exist')
    }

    const hasAppliedFilters: Boolean = !!(filter.value && filter.value.length)
    const fewFacets: Boolean = (this.applied - (hasAppliedFilters ? 1 : 0)) > 1

    const agg: any = {
      [`${filter.aggName}_wrapper`]: {
        filter: {

        }
      }
    }

    if (fewFacets) {
      // Diffrent structure for a few filters
      agg[`${filter.aggName}_wrapper`].filter = {
        bool: {
          must: []
        }
      }
    }

    // Pointer to filters
    for (let globalFilter of this.filters) {

      if (JSON.stringify(globalFilter) === JSON.stringify(filter)) {
        continue
      }
      
      if (globalFilter.value && globalFilter.value.length) {

        const condition = {
          terms: {
            [globalFilter.path]: globalFilter.value
          }
        }

        if(!fewFacets) {
          agg[`${filter.aggName}_wrapper`].filter = condition
          break;
        }

        // Push to array if there are a few
        agg[`${filter.aggName}_wrapper`].filter.bool.must.push(condition)
      }

    }

    agg[`${filter.aggName}_wrapper`] = {
      ...agg[`${filter.aggName}_wrapper`],
      aggs: {
        [filter.aggName]: this.createAggregation(filterName)
      }
    }

    return agg

  }

  get aggs () {
    const aggs = {...this.aggregations}

    for (let filter of this.filters) {
      aggs.aggs = {
        ...aggs.aggs,
        ...this.appendFilterToAggregation(filter.name)
      }
    }

    return aggs
  }

  get filterlessAggs () {
    const aggs = {...this.aggregations}

    for (let filter of this.filters) {
      aggs.aggs[filter.aggName] = this.createAggregation(filter.name)
    }

    return aggs
  }

}
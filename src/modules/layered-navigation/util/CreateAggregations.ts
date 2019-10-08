interface Aggregations {
  [key: string]: Array<Number> | Array<string>
}

interface Filter {
  name: string,
  path: string,
  aggName: string,
  value: Array<string> | Array<Number>
}

// interface Aggregation {
//   [key: string]: {
//     filter: {

//     }
//   }
// }

export default class AgregationsCreator {

  private aggregations;
  private applied;

  constructor(private filters: Array<Filter>) {
    this.aggregations = {
      aggs: {}
    }

    this.applied = filters.reduce((total, { value }) => {
      if (value && value.length) {
        total++
      }
      return total
    }, 0)
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

        },
        aggs: {
          [filter.aggName]: {

          }
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

    agg[`${filter.aggName}_wrapper`].aggs[filter.aggName] = {
      terms: {
        field: [filter.path]
      }
    }

    return agg

  }

}
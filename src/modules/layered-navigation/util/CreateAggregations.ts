interface Filters {
  [key: string]: Array<Number> | Array<string>
}

export default (filters: Filters) => {

  const base = {
    aggs: {}
  }

  return base

}
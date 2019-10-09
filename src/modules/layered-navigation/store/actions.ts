import rootStore from '@vue-storefront/core/store';
import { AttrState } from './../types/AttrState';
import { ActionTree } from 'vuex';
import * as types from './mutation-types'
import { cacheStorage } from '../'
import config from 'config'
import { quickSearchByQuery } from '@vue-storefront/core/lib/search';
import builder from 'bodybuilder'
import FiltersByProduct from 'src/modules/layered-navigation/util/FiltersByProduct.ts'
import CreateAggregations from '../util/CreateAggregations'
import fetch from 'isomorphic-fetch'
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { optionLabel } from '@vue-storefront/core/modules/catalog/helpers/optionLabel';

const getEmptyFilters = () => {
  return [
    {
      name: 'color',
      path: 'configurable_children.color_group',
      aggName: 'colors',
      value: [],
      keyword: true,
      size: 30
    },
    {
      name: 'talla',
      path: 'configurable_children.talla',
      aggName: 'sizes',
      value: [],
      keyword: true
    },
    {
      name: 'style',
      path: 'configurable_children.style',
      aggName: 'styles',
      value: []
    },
    {
      name: 'print',
      path: 'configurable_children.print',
      aggName: 'prints',
      value: []
    },
    {
      name: 'length',
      path: 'length',
      aggName: 'lengths',
      value: [],
      keyword: true
    },
    {
      name: 'featured',
      path: 'configurable_children.featured',
      aggName: 'featureds',
      value: [],
      keyword: true
    }
  ]
}

const attributeMap = {
  'colors': 'color_group',
  'sizes': 'talla',
  'styles': 'style',
  'prints': 'print',
  'lengths': 'length',
  'featureds': 'featured',
}

const reversedAttributeMap = {}
for (const [key, value] of Object.entries(attributeMap)) {
  reversedAttributeMap[value] = key
}

export const actions: ActionTree<AttrState, any> = {

  // Load preconfigured packs by IDs
  async loadProductAttrs ({ commit }, {
    index,
    cache = true,
    searchQuery = '',
    values = {}
  }) {
    
    let productsSearchQuery;

    // Creating base query
    if (index === 'search') {
      productsSearchQuery = builder().size(0).query('term', 'type_id', 'configurable')
        .filter('terms', 'status', [0, 1])
        .filter('terms', 'visibility', [2, 3, 4])
        .filter('term', 'stock.is_in_stock', true)
        .filter('range', 'configurable_children.stock.qty', { gt: 0 })
    } else {
      productsSearchQuery = builder().size(0).query('terms', 'category_ids', [index])
        .filter('term', 'type_id', 'configurable')
        .filter('terms', 'status', [0, 1])
        .filter('terms', 'visibility', [2, 3, 4])
        .filter('term', 'stock.is_in_stock', true)
        .filter('range', 'configurable_children.stock.qty', { gt: 0 })
    }

    if (searchQuery.length >= 3) {
      productsSearchQuery = productsSearchQuery.query('multi_match', {
        query: searchQuery,
        fuzziness: 5,
        prefix_length: 0,
        fields: ['name^4', 'sku^2', 'category.name^1']
      })
    }

    // Create aggregations
    let filtersToAggs = getEmptyFilters()
    let anyFilters: Boolean = false
    if (JSON.stringify(values) !== JSON.stringify({})) {
      anyFilters = true
      for (const [key, value] of Object.entries(values)) {
        const filter = filtersToAggs.find(filter => filter.aggName === reversedAttributeMap[key])
        if (!filter)
          continue
        filter.value = Array.isArray(value)
          ? (filter.keyword ? value.map(v=>v+'') : value.map(v=>+v))
          : [(filter.keyword ? value + '' : +value)]
      }
    }
    const instance = new CreateAggregations(filtersToAggs)

    try {
      const { storeCode } = currentStoreView()
      const response = await fetch(`${config.api.url}catalog/vue_storefront_catalog_${storeCode}/product/_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productsSearchQuery.build(),
          ...(anyFilters ? instance.aggs : instance.filterlessAggs)
        })
      })
      
      const { aggregations } = await response.json()
      let attrs;
      if (!anyFilters) {
        attrs = Object.keys(aggregations).reduce((total, curr) => {
          total[curr] = aggregations[curr].buckets.map(bucket => {
  
            return {
              ...bucket,
              label: optionLabel(rootStore.state.attribute, {
                attributeKey: attributeMap[curr],
                optionId: bucket.key
              })
            }
          })
          return total
        }, {})
      } else {
        attrs = Object.keys(aggregations).reduce((total, curr) => {

          total[curr.replace('_wrapper', '')] = aggregations[curr][curr.replace('_wrapper', '')].buckets.map(bucket => {
  
            return {
              ...bucket,
              label: optionLabel(rootStore.state.attribute, {
                attributeKey: attributeMap[curr.replace('_wrapper', '')],
                optionId: bucket.key
              })
            }
          })
          return total
        }, {})
      }

      debugger;

      commit(types.SET_ATTRS, {
        categoryId: index,
        attrs
      })

      if (cache && index !== 'search')
        await cacheStorage.setItem(`category-${index}-filters`, attrs)
      
    } catch (err) {

      console.log(err)

      const filters = await cacheStorage.getItem(`category-${index}-filters`)
      if (filters) {
        commit(types.SET_ATTRS, {
          categoryId: index,
          attrs: filters
        })
      } else {
        console.error(err)
        console.error('Filters no in cache also')
      }

    }
  },

  async loadCurrentProductsAttrs (context, { query, search = false, size = 4000, start = 0, sort = 'position:asc', includeFields = config.entities.optimize ? config.entities.category.includeFields : null }) {
    const commit = context.commit

    try {
      const { items } = await quickSearchByQuery({
        entityType: 'product',
        query,
        sort: sort,
        size: size,
        start: start, 
        includeFields: [
          'print',
          'length', // Length
          'style',
          'configurable_children.color_group',
          'configurable_children.featured',
          'configurable_children.print',
          'configurable_children.talla', // Size
          'configurable_children.print'
        ]
      })

      const filters = items.reduce(FiltersByProduct(), {})

      // commit(search ? types.SET_CURRENT_ATTRS_SEARCH : types.SET_CURRENT_ATTRS, {
      //   attrs: filters
      // })
      
    } catch (err) {

      console.error(err)

    }
  }

}

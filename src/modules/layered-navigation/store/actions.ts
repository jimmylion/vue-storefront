import { AttrState } from './../types/AttrState';
import { ActionTree } from 'vuex';
import * as types from './mutation-types'
import { cacheStorage } from '../'
import config from 'config'
import { quickSearchByQuery } from '@vue-storefront/core/lib/search';
import builder from 'bodybuilder'
import FiltersByProduct from 'src/modules/layered-navigation/util/FiltersByProduct.ts'

export const actions: ActionTree<AttrState, any> = {

  // Load preconfigured packs by IDs
  async loadProductAttrs ({ commit }, { index, cache = true, searchQuery = '', size = 4000, start = 0, sort = 'position:asc', includeFields = config.entities.optimize ? config.entities.category.includeFields : null }) {
    
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

    try {
      const { items } = await quickSearchByQuery({
        entityType: 'product',
        query: productsSearchQuery.build(),
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

      commit(types.SET_ATTRS, {
        categoryId: index,
        attrs: filters
      })

      if (cache && index !== 'search')
        await cacheStorage.setItem(`category-${index}-filters`, filters)
      
    } catch (err) {

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

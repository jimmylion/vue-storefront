import { RelatedProductsState } from '../types/RelatedProductsState'
import { ActionTree } from 'vuex';
import * as types from './mutation-types';
import builder from 'bodybuilder';
import config from 'config';
import { quickSearchByQuery } from '@vue-storefront/core/lib/search';

// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<RelatedProductsState, any> = {
  
  async list (context, { skus, size = 4000, start = 0, sort = 'position:asc', includeFields = config.entities.optimize ? config.entities.category.includeFields : null }) {
    
    const commit = context.commit

    let searchQuery = builder().query('terms', 'configurable_children.sku', skus)
      .filter('terms', 'status', [0, 1])
      .filter('terms', 'visibility', [2, 3, 4])
      .build()

    try {
      const response = await quickSearchByQuery({ 
        entityType: 'product', 
        query: searchQuery, 
        sort: sort, 
        size: size, 
        start: start, 
        includeFields: includeFields 
      })
      
      commit(types.SET_PRODUCTS, response.items)
      
    } catch (err) {
      console.error(err)
    }
  }
}
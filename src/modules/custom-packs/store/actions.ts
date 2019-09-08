import { PacksState } from './../types/PacksState';
import { ActionTree } from 'vuex';
import * as types from './mutation-types'
import { cacheStorage } from '../'
import fetch from 'isomorphic-fetch'
import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { quickSearchByQuery } from '@vue-storefront/core/lib/search';
import { buildFilterProductsQuery } from '@vue-storefront/core/helpers';

const urlWithSlash = (url: string) => {
  return url.endsWith('/') ? url : url+'/'
}

const getCurrentStoreCode = () => {
  const { storeCode } = currentStoreView()
  if (storeCode.length > 0)
    return storeCode
  else
    return ''
}

export const actions: ActionTree<PacksState, any> = {

  // Loads data for configurator with provided packId - it is being saved in the cache
  async loadConfigurator ({ commit }, { packId, useCache = true }) {

    try {
      let response = await fetch(`${urlWithSlash(config.api.url)}ext/custom-packs/creator/${packId}/${getCurrentStoreCode()}`)
      let { result } = await response.json()
      console.log(result)

      if (useCache) cacheStorage.setItem(`configurator-${packId}`, result)

      commit(types.SET_CONFIGURATION, {
        packId,
        configuration: result
      })
    } catch (err) {
      console.error('[CustomPacks] Couldn\'t fetch category\'s available packs', err)
      const configuration = cacheStorage.getItem(`configurator-${packId}`)
      if (!configuration) {
        return
      }
      commit(types.SET_CONFIGURATION, {
        packId,
        configuration
      })
    }

    const userData = cacheStorage.getItem('user')
    return userData
  },

  // 
  async loadProducts (context, { categoryId = 2, chosenFilters = {}, size = 4000, start = 0, sort = 'position:asc', includeFields = config.entities.optimize ? config.entities.category.includeFields : null }) {
    const commit = context.commit

    let searchQuery = buildFilterProductsQuery(categoryId, chosenFilters)

    try {
      const response = await quickSearchByQuery({ 
        entityType: 'product', 
        query: searchQuery, 
        sort: sort, 
        size: size, 
        start: start, 
        includeFields: includeFields 
      })

      console.log(response)
  
      commit(types.SET_AVAILABLE_PRODUCTS, response)
      
    } catch (err) {
      console.error(err)
    }
  }

}

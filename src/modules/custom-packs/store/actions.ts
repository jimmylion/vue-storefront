import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus/index'
import { PacksState } from './../types/PacksState';
import { ActionTree } from 'vuex';
import * as types from './mutation-types'
import { cacheStorage } from '../'
import fetch from 'isomorphic-fetch'
import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { quickSearchByQuery } from '@vue-storefront/core/lib/search';
import builder from 'bodybuilder'

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
  async loadConfigurator ({ dispatch, commit }, { packId, useCache = true, fetchPreconfigured = true, setCategoryId = false, packType = '' }) {
    let ids = []

    try {
      let response = await fetch(`${urlWithSlash(config.api.url)}ext/custom-packs/creator/${packId}/${getCurrentStoreCode()}`)
      let { result } = await response.json()

      if (useCache) cacheStorage.setItem(`configurator-${packId}`, Array.isArray(result) ? result[0] : result)
      if (fetchPreconfigured) ids = Array.isArray(result) ? result[0].preconfigured : result.preconfigured

      commit(types.SET_CONFIGURATION, {
        packId,
        configuration: Array.isArray(result) ? result[0] : result
      })

    } catch (err) {
      console.error('[CustomPacks] Couldn\'t fetch category\'s available packs', err)

      const configuration = cacheStorage.getItem(`configurator-${packId}`)
      if (!configuration) {
        return
      }
      if (fetchPreconfigured) ids = configuration.preconfigured

      commit(types.SET_CONFIGURATION, {
        packId,
        configuration
      })

    }

    if (setCategoryId && packType) {
      commit(types.SET_CATEGORY_ID, { packId, packType })
    }

    if (fetchPreconfigured) {
      await dispatch('loadPreconfiguredPacks', {
        ids,
        packId
      })
    }
  },

  // Load preconfigured packs by IDs
  async loadPreconfiguredPacks (context, { ids, packId, size = 4000, start = 0, sort = 'position:asc', includeFields = config.entities.optimize ? config.entities.category.includeFields : null }) {
    const commit = context.commit

    let searchQuery = builder().query('terms', 'id', ids)
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
  
      commit(types.SET_PRECONFIGURED_PRODUCTS, {
        packId,
        products: response.items
      })
      
    } catch (err) {
      console.error(err)
    }
  },

  async initPack ({ rootGetters, commit }, { packId, packSize, packType }) {

    try {

      const token = rootGetters['cart/getCartToken']
      if (!token) {
        throw new Error('[CustomPacks] No token!')
      }

      const body = {
        "cartItem": {
          "sku": `${packSize}-${packType}`,
          "qty": 1,
          "price": 0,
          "quote_id": token
        }
      }

      const { storeCode } = currentStoreView()

      const response = await fetch(`${urlWithSlash(config.api.url)}ext/custom-packs/init/${storeCode}?token=`, {
        body: JSON.stringify(<any>body),
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        method: 'POST'
      })

      const r = await response.json()
      console.log(r, 'RRR')

      commit(types.INIT_PACK, { packId, packType, initialState: r.result.item_id })

    } catch (err) {
      console.error(err)
    }


  },

  async addToPack ({ rootGetters, commit }, { sku, price, parentId, slug, image, discount = 0 }) {

    try {

      const token = rootGetters['cart/getCartToken']
      if (!token) {
        throw new Error('[CustomPacks] No token!')
      }

      const body = {
        "cartItem": {
          "sku": sku,
          "qty": 1,
          "price": price * (100-discount)/100,
          "quote_id": token
        }
      }

      const { storeCode } = currentStoreView()

      EventBus.$emit('pack-before-add-product', {
        ...body.cartItem,
        slug,
        image,
        discount
      })

      const response = await fetch(`${urlWithSlash(config.api.url)}ext/custom-packs/add/${parentId}/${storeCode}?token=`, {
        body: JSON.stringify(<any>body),
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        method: 'POST'
      })

      const { result } = await response.json()

      commit(types.ADD_TO_PACK, { 
        parentId, 
        item: {
          ...result,
          oldPrice: price,
          image
        }, 
        slug 
      })
    } catch (err) {
      console.error(err)
    }

  },

  async removeFromPack ({ rootGetters, commit }, { itemId, slug }) {

    try {

      const { storeCode } = currentStoreView()

      EventBus.$emit('pack-before-remove-product', {
        itemId
      })

      await fetch(`${urlWithSlash(config.api.url)}ext/custom-packs/remove/${itemId}/${storeCode}?token=`, {
        mode: 'cors',
        method: 'DELETE'
      })

      commit(types.REMOVE_FROM_PACK, { 
        itemId,
        slug
      })
    } catch (err) {
      console.error(err)
    }

  },

  setPack({ commit }, { packType, packId, initialState }) {
    commit(types.INIT_PACK, {
      packType,
      packId,
      initialState,
      forceReinit: true
    })
  }

}

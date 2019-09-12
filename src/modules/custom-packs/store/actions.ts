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

    let productsSearchQuery = builder().query('terms', 'category_ids', ids)
      .filter('term', 'type_id', 'configurable')
      .filter('terms', 'status', [0, 1])
      .filter('terms', 'visibility', [2, 3, 4])
      .build()

    let categoriesSearchQuery = builder().query('terms', 'id', ids)
      .build()

    try {
      const response = await Promise.all([
        quickSearchByQuery({ 
          entityType: 'product', 
          query: productsSearchQuery, 
          sort: sort, 
          size: size, 
          start: start, 
          includeFields: includeFields 
        }),
        quickSearchByQuery({ 
          entityType: 'category', 
          query: categoriesSearchQuery, 
          sort: sort, 
          size: size, 
          start: start, 
          includeFields: includeFields 
        })
      ])

      commit(types.SET_PRECONFIGURED_CATEGORIES, {
        packId,
        categories: response[1].items
      })
  
      commit(types.SET_PRECONFIGURED_PRODUCTS, {
        packId,
        products: response[0].items
      })
      
    } catch (err) {
      console.error(err)
    }
  },

  async initPack ({ rootGetters, commit }, { packId, packSize, packType }) {

    try {

      // const token = rootGetters['cart/getCartToken']
      // if (!token) {
      //   throw new Error('[CustomPacks] No token!')
      // }

      // const body = {
      //   "cartItem": {
      //     "sku": `${packSize}-${packType}`,
      //     "qty": 1,
      //     "price": 0,
      //     "quote_id": token
      //   }
      // }

      const { storeCode } = currentStoreView()

      // const response = await fetch(`${urlWithSlash(config.api.url)}ext/custom-packs/init/${storeCode}?token=`, {
      //   body: JSON.stringify(<any>body),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   mode: 'cors',
      //   method: 'POST'
      // })

      // const r = await response.json()

      commit(types.INIT_PACK, { packId, packType, packSize, initialState: [] })

    } catch (err) {
      console.error(err)
    }


  },

  async addToPack ({ rootGetters, commit }, { product, slug, discount }) {

    try {

      // const token = rootGetters['cart/getCartToken']
      // if (!token) {
      //   throw new Error('[CustomPacks] No token!')
      // }

      // const body = {
      //   "cartItem": {
      //     "sku": sku,
      //     "qty": 1,
      //     "price": price * (100-discount)/100,
      //     "quote_id": token
      //   }
      // }

      // const { storeCode } = currentStoreView()

      const discountPrice = product.priceInclTax * (100-discount)/100
      EventBus.$emit('pack-before-add-product', {
        product
      })

      // const response = await fetch(`${urlWithSlash(config.api.url)}ext/custom-packs/add/${parentId}/${storeCode}?token=`, {
      //   body: JSON.stringify(<any>body),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   mode: 'cors',
      //   method: 'POST'
      // })

      // const { result } = await response.json()

      commit(types.ADD_TO_PACK, { 
        item: {
          ...product,
          discountPrice
        }, 
        slug 
      })
    } catch (err) {
      console.error(err)
    }

  },

  async removeFromPack ({ rootGetters, commit }, { product, slug, index }) {

    try {

      // const { storeCode } = currentStoreView()

      EventBus.$emit('pack-before-remove-product', {
        product
      })

      // await fetch(`${urlWithSlash(config.api.url)}ext/custom-packs/remove/${itemId}/${storeCode}?token=`, {
      //   mode: 'cors',
      //   method: 'DELETE'
      // })

      commit(types.REMOVE_FROM_PACK, { 
        product,
        index,
        slug
      })
    } catch (err) {
      console.error(err)
    }

  },

  async addToCart ({ state, commit, rootGetters }, { slug, packType, packSize }) {

    const token = rootGetters['cart/getCartToken']
    if (!token) {
      throw new Error('[CustomPacks] No token!')
    }

    const { storeCode } = currentStoreView()

    const body = {
      packType,
      packSize,
      quote_id: token,
      packagingId: state.packs[slug].packagingId,
      childs: state.packs[slug].items.map(v => ({
        sku: v.sku,
        qty: 1,
        price: v.discountPrice,
        quote_id: token
      }))
    }

    try {

      EventBus.$emit('pack-before-add-to-cart', {
        body
      })

      commit(types.ADDING_TO_CART_STATUS, true)

      const baseUrl = 'http://localhost:8080/api/'//urlWithSlash(config.api.url)

      let response = await fetch(`${baseUrl}ext/custom-packs/add/${storeCode}?token=`, {
        body: JSON.stringify(<any>body),
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        method: 'POST'
      })

      await response.json()

      commit(types.ADDING_TO_CART_STATUS, false)
      EventBus.$emit('pack-after-add-to-cart', {
        body
      })

      // Now let's remove cart
      commit(types.REMOVE_PACK, { slug })

    } catch (err) {
      console.error('[CustomPacks] Could not add pack to the cart', err)
      EventBus.$emit('pack-after-add-to-cart', {
        body
      })
    }

  },

  setPack({ commit }, { packType, packId, packSize, initialState }) {
    commit(types.INIT_PACK, {
      packType,
      packId,
      packSize,
      initialState,
      forceReinit: true
    })
  }

}

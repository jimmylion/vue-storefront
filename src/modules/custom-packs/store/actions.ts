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
import rootStore from '@vue-storefront/core/store'
import * as cartTypes from '@vue-storefront/core/modules/cart/store/mutation-types'

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
      .filter('term', 'stock.is_in_stock', true)
      .filter('range', 'configurable_children.stock.qty', { gt: 0 })
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

      const discountPrice = product.priceInclTax * (100-discount)/100
      EventBus.$emit('pack-before-add-product', {
        product
      })

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

      EventBus.$emit('pack-before-remove-product', {
        product
      })

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
      cartId: token,
      packagingId: state.packs[slug].packagingId,
      childs: state.packs[slug].items.map(v => ({
        sku: v.sku,
        qty: 1,
        price: v.discountPrice,
        pack_type: 'child'
      }))
    }

    // I should find safer method
    const parentSku = `${packSize}-${packType}`

    try {

      EventBus.$emit('pack-before-add-to-cart', {
        body
      })

      commit(types.ADDING_TO_CART_STATUS, true)

      const baseUrl = urlWithSlash(config.api.url)//'http://localhost:8080/api/'

      let response = await fetch(`${baseUrl}ext/custom-packs/add/${storeCode}?token=`, {
        body: JSON.stringify(<any>body),
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        method: 'POST'
      })

      let { result } = await response.json()

      const childs = JSON.parse(JSON.stringify(state.packs[slug].items)).reduce((total, curr) => {
        const index = total.findIndex(v => v.sku === curr.sku)
        if (index !== -1) {
          total[index].qty++
        } else {
          total.push({
            ...curr,
            qty: 1
          })
        }
        return total
      }, [])

      // In response I have whole Cart
      // I need to find last added
      // I can do it by exclude ones with the current cart
      const cartItems = rootGetters['cart/getCartItems']
      const parent = result.items.find(item => item.sku === parentSku && !cartItems.some(cartItem => cartItem.item_id === item.item_id))

      commit(`cart/${cartTypes.CART_ADD_ITEM}`, {
        product: {

          ...parent,

          length: state.packs[slug].items[0].length,

          childs,

          isPack: true,

          priceInclTax: state.packs[slug].items.reduce((total, curr) => {
            return total + curr.priceInclTax
          }, 0),

          special_price: state.packs[slug].items.reduce((total, curr) => {
            return total + curr.discountPrice
          }, 0),

          sizes: state.packs[slug].items.reduce((total, curr) => {
            total.push(curr.talla)
            return total
          }, []).filter((value, index, self) => self.indexOf(value) === index)

        }
      }, { root: true })
      
      await rootStore.dispatch('cart/sync', { forceClientState: true })

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

  async removeFromCart ({ rootGetters, commit }, { item_id }) {

    const cartId = rootGetters['cart/getCartToken']
    if (!cartId) {
      throw new Error('[CustomPacks] No cartId!')
    }

    const { storeCode } = currentStoreView()

    try {

      EventBus.$emit('pack-before-remove-from-cart', { item_id })

      const baseUrl = urlWithSlash(config.api.url)

      let response = await fetch(`${baseUrl}ext/custom-packs/${item_id}/${storeCode}?cartId=${cartId}&token=`, {
        mode: 'cors',
        method: 'DELETE'
      })

      let r = await response.json()

      commit(`cart/${cartTypes.CART_DEL_ITEM}`, { product: {
        item_id
      }}, { root: true })

      EventBus.$emit('pack-after-remove-from-cart', {
        item_id
      })

    } catch (err) {
      console.error(err)
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

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus/index'
import { MutationTree } from 'vuex'
import * as types from './mutation-types'
import { cacheStorage } from '../'
import Vue from 'vue'
import GenerateSlug from '../util/GenerateSlug'

export const mutations: MutationTree<any> = {

  [types.SET_CONFIGURATION] (state, { packId, configuration }) {
    state.packOptions = {
      ...state.packOptions,
      [packId]: configuration
    }
  },

  [types.SET_CATEGORY_ID] (state, { packId, packType }) {
    if (!state.packOptions[packId] 
      || !state.packOptions[packId].values 
      || !state.packOptions[packId].values['pack-type']
      || !state.packOptions[packId].values['pack-type'][packType]
      || !state.packOptions[packId].values['pack-type'][packType].productsCategoryId) {
      console.error(`[CustomPacks] PackId ${packId} has not been fetched yet`)
      return
    }

    state.packOptions = {
      ...state.packOptions,
      [packId]: {
        ...state.packOptions[packId],
        categoryId: state.packOptions[packId].values['pack-type'][packType].productsCategoryId
      }
    }
  },

  [types.SET_PRECONFIGURED_PRODUCTS] (state, { packId, products }) {
    if (!state.packOptions.hasOwnProperty(packId) || !state.packOptions[packId].preconfigured) {
      console.error(`[CustomPacks] PackId ${packId} could not be found`)
      return
    }

    state.packOptions = {
      ...state.packOptions,
      [packId]: {
        ...state.packOptions[packId],
        preconfigured: state.packOptions[packId].preconfigured.map(v => products.find(product => product.id === v))
      }
    }

  },

  [types.INIT_PACK] (state, { packId, packType, packSize, forceReinit = false, initialState }) {
    const slug = GenerateSlug(packId, packType)

    if (forceReinit || !state.packs[slug]) {
      if (!forceReinit) {

        Vue.set(state.packs, slug, {
          packagingId: state.packOptions[packId].values['pack-size'][packSize].packagingId,
          items: []
        })
      } else {

        Vue.set(state.packs, slug, initialState)
      }
      cacheStorage.setItem(slug, state.packs[slug])
    } else {
      console.log('[CustomPacks] This type of pack has been initiated')
      return
    }
  },

  [types.ADD_TO_PACK] (state, { item, slug }) {

    if (!slug || !item) {
      console.log('[CustomPacks] Unknown slug or item')
      return
    }

    state.packs[slug].items.push(item)

    cacheStorage.setItem(slug, state.packs[slug])

    EventBus.$emit('pack-after-add-product', {
      ...item
    })
  },

  [types.REMOVE_FROM_PACK] (state, { product, slug, index }) {
    if (!slug) {
      console.log('[CustomPacks] Bad slug')
      return
    }

    if (!product || !product.inpackId === undefined) {
      console.log('[CustomPacks] Product or inpackId undefined - no idea what to remove!')
      return
    }

    state.packs[slug].items.splice(index, 1)

    cacheStorage.setItem(slug, state.packs[slug])

    EventBus.$emit('pack-after-remove-product', {
      ...product
    })
  },

  [types.ADDING_TO_CART_STATUS] (state, stance) {
    state.addingToCartNow = stance
  },

  [types.REMOVE_PACK] (state, { slug }) {
    Vue.set(state.packs[slug], 'items', [])
    cacheStorage.setItem(slug, state.packs[slug])
  }
}

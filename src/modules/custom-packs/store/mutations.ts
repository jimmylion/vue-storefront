import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus/index'
import { MutationTree } from 'vuex'
import * as types from './mutation-types'
import { cacheStorage } from '../'
import Vue from 'vue'

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

  [types.INIT_PACK] (state, { packSize, packType, forceReinit = false, initialState }) {
    const slug = `${packSize}-${packType}`
    if (forceReinit || !state.packs[slug]) {
      if (!forceReinit) {
        Vue.set(state.packs, slug, {
          itemId: initialState,
          items: []
        })
      } else {
        Vue.set(state.packs, slug, initialState)
      }
      
      cacheStorage.setItem(`pack-${slug}`, state.packs[slug])
    } else {
      console.log('[CustomPacks] This type of pack has been initiated')
      return
    }
  },

  [types.ADD_TO_PACK] (state, { parentId, item, slug }) {

    if (!slug || state.packs[slug].itemId !== parentId) {
      console.log('[CustomPacks] Pack with this parent does not exist')
      return
    }

    Vue.set(state.packs, slug, {
      ...state.packs[slug],
      items: [
        ...state.packs[slug].items,
        item
      ]
    })

    cacheStorage.setItem(`pack-${slug}`, state.packs[slug])

    EventBus.$emit('pack-after-add-product', {
      ...item
    })
  },

  [types.REMOVE_FROM_PACK] (state, { itemId, slug }) {
    if (!slug) {
      console.log('[CustomPacks] Bad slug')
      return
    }

    Vue.set(state.packs, slug, {
      ...state.packs[slug],
      items: state.packs[slug].items.filter(v => v.itemId !== itemId)
    })

    cacheStorage.setItem(`pack-${slug}`, state.packs[slug])

    EventBus.$emit('pack-after-remove-product', {
      ...itemId
    })
  }
}

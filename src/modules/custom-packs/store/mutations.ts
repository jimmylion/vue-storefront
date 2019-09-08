import { MutationTree } from 'vuex'
import * as types from './mutation-types'

export const mutations: MutationTree<any> = {

  [types.SET_CONFIGURATION] (state, { packId, configuration }) {
    state.packOptions = {
      ...state.packOptions,
      [packId]: configuration
    }
  },

  [types.SET_CATEGORY_ID] (state, { packId, packType }) {
    let categoryId = null
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

  [types.SET_AVAILABLE_PRODUCTS] (state, payload) {
    // state.users.push(payload)
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

  }
}

import { MutationTree } from 'vuex'
import * as types from './mutation-types'

export const mutations: MutationTree<any> = {
  [types.SET_CONFIGURATION] (state, { packId, configuration }) {
    state.packOptions = {
      ...state.packOptions,
      [packId]: configuration
    }
  },
  [types.SET_AVAILABLE_PRODUCTS] (state, payload) {
    // state.users.push(payload)
  }
}

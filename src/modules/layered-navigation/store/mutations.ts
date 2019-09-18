import { MutationTree } from 'vuex'
import * as types from './mutation-types'
import Vue from 'vue'

export const mutations: MutationTree<any> = {

  [types.SET_ATTRS] (state, { categoryId, attrs }) {
    Vue.set(state.attributes, categoryId, attrs)
  },

  [types.SET_CURRENT_ATTRS] (state, { attrs }) {
    Vue.set(state, 'filteredAttributes', attrs)
  }

}

import { Module } from 'vuex'
import { RelatedProductsState } from '../types/RelatedProductsState'
import { mutations } from './mutations'
import { getters } from './getters'
import { actions } from './actions'
import { state } from './state'

export const module: Module<RelatedProductsState, any> = {
  namespaced: true,
  mutations,
  actions,
  getters,
  state
}

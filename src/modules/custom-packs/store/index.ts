import { Module } from 'vuex'
import { PacksState } from '../types/PacksState'
import { mutations } from './mutations'
import { getters } from './getters'
import { actions } from './actions'
import { state } from './state'

export const module: Module<PacksState, any> = {
  namespaced: true,
  mutations,
  actions,
  getters,
  state
}

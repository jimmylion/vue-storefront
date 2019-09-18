import { Module } from 'vuex'
import { AttrState } from '../types/AttrState'
import { mutations } from './mutations'
import { getters } from './getters'
import { actions } from './actions'
import { state } from './state'

export const module: Module<AttrState, any> = {
  namespaced: true,
  mutations,
  actions,
  getters,
  state
}

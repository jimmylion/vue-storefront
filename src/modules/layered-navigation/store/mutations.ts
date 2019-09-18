import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus/index'
import { MutationTree } from 'vuex'
import * as types from './mutation-types'
import { cacheStorage } from '../'
import Vue from 'vue'

export const mutations: MutationTree<any> = {

  [types.SET_ATTRS] (state, { categoryId, attrs }) {
    state.attributes = {
      ...state.attributes,
      [categoryId]: attrs
    }
  }

}

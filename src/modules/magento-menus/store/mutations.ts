import { MutationTree } from 'vuex';
import * as types from './mutation-types';
import { Logger } from '@vue-storefront/core/lib/logger';
import Vue from 'vue';

export const mutations: MutationTree<any> = {
  [types.SET_MENUS](state, payload) {
    state.menus = [
      ...payload.map(v => ({
        ...v,
        items: []
      }))
    ];
  },
  [types.SET_MENU_ITEMS](state, { menuId, items }) {
    if (!Array.isArray(state.menus)) {
      Logger.warn('[MagentoMenus] state.menus is null');
      return;
    }
    const index = state.menus.findIndex(v => v.menu_id === menuId);

    if (index === -1) {
      Logger.warn('[MagentoMenus] Index not found');
      return;
    }

    Vue.set(state.menus, index, {
      ...state.menus[index],
      items
    });
  }
};

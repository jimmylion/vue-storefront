import { MenusState } from '../types/MenusState';
import { ActionTree } from 'vuex';
import * as types from './mutation-types';
import fetch from 'isomorphic-fetch';
import config from 'config';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { Logger } from '@vue-storefront/core/lib/logger';

export const actions: ActionTree<MenusState, any> = {
  async loadMenus({ commit }) {
    try {
      const { storeCode } = currentStoreView();
      let r = await fetch(`${config.api.url}ext/menus/menus/${storeCode}`);
      let { result } = await r.json();
      commit(types.SET_MENUS, result.items);
    } catch (e) {
      console.log(e);
    }
  },

  async loadNodes({ state, commit }, identifiers) {
    const { storeCode } = currentStoreView();
    const fetchIdentifier = async identifier => {
      const menu = state.menus.find(v => v.identifier === identifier);
      if (!menu || !menu.menu_id) {
        Logger.warn('[MagentoMenus] Requested identifier does not exist');
        return;
      }
      try {
        let r = await fetch(
          `${config.api.url}ext/menus/nodes/${storeCode}/${menu.menu_id}`
        );
        let { result } = await r.json();
        commit(types.SET_MENU_ITEMS, {
          menuId: menu.menu_id,
          items: result
        });
      } catch (err) {
        console.log(err);
      }
    };

    if (Array.isArray(identifiers)) {
      const requests = [];
      for (let identifier of identifiers) {
        requests.push(fetchIdentifier(identifier));
      }
      await Promise.all(requests);
    } else {
      await fetchIdentifier(identifiers);
    }
  }
};

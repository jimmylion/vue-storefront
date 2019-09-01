import { MenusState } from "../types/MenusState";
import { ActionTree } from "vuex";
import * as types from "./mutation-types";
import fetch from "isomorphic-fetch";
import config from "config";
import { currentStoreView } from "@vue-storefront/core/lib/multistore";

export const actions: ActionTree<MenusState, any> = {
  async loadMenus({ commit }) {
    const { storeCode } = currentStoreView();
    let r = await fetch(`${config.api.url}ext/menus/menus/${storeCode}`);
    let { result } = await r.json();
    commit(types.SET_MENUS, result);
  },

  async loadNodes({ commit }, menuId) {
    const { storeCode } = currentStoreView();
    let r = await fetch(
      `${config.api.url}ext/menus/nodes/${storeCode}/${menuId}`
    );
    let { result } = await r.json();
    commit(types.SET_MENU_ITEMS, {
      menuId,
      items: result
    });
  }
};

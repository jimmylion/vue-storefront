import { MutationTree } from "vuex";
import * as types from "./mutation-types";
import { Logger } from "@vue-storefront/core/lib/logger";

export const mutations: MutationTree<any> = {
  [types.SET_MENUS](state, payload) {
    state.menus = [...payload];
  },
  [types.SET_MENU_ITEMS](state, { menuId, items }) {
    if (!Array.isArray(state.menus)) {
      Logger.warn("[MagentoMenus] state.menus is null");
      return;
    }
    const index = state.menus.findIndex(v => v.menuId === menuId);
    if (!index) {
      Logger.warn("[MagentoMenus] Index not found");
      return;
    }

    state.menus[index].items = items;
  }
};

import * as types from "./mutation-types";
import fetch from "isomorphic-fetch";
import config from "config";
import { currentStoreView } from "@vue-storefront/core/lib/multistore";

export default {
  async loadSortOrder({ commit }, categoryId: number) {
    const { storeCode } = currentStoreView();
    const api = config.api.url;
    const target = `${api}ext/sort-order/category/${storeCode}/${categoryId}`;
    try {
      let response = await fetch(target);
      let { result } = await response.json();

      // It sends object in shape
      // SKU: Position
      commit(
        types.CATALOG_SET_SORT_ORDER,
        result.reduce((total, curr) => {
          total[curr.sku] = curr.position;
          return total;
        }, {})
      );
    } catch (e) {
      console.error(e);
    }
  }
};

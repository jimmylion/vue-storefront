import mutations from "./mutations";
import actions from "./actions";

const extendCategoryVuex = {
  mutations,
  state: {
    list: [],
    current: {},
    filters: {
      available: {},
      chosen: {}
    },
    breadcrumbs: {
      routes: []
    },
    current_product_query: null,
    current_path: [],
    sort_order: []
  },
  actions
};

export const categoryExtend = {
  key: "catalog",
  store: { modules: [{ key: "category", module: extendCategoryVuex }] }
};

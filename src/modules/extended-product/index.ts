import getters from "./getters";

const extendProductVuex = {
  getters
};

export const productExtend = {
  key: "catalog",
  store: { modules: [{ key: "product", module: extendProductVuex }] }
};

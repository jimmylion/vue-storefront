import { divideProduct } from "./logic/separate";

export default {
  separatedProducts(state) {
    return state.list.items
      ? [].concat.apply(
          [],
          state.list.items.map(v => {
            try {
              const tmp = divideProduct(v);
              return tmp;
            } catch (e) {
              console.error("[Extended-Product] ", e);
            }
          })
        )
      : [];
  }
};

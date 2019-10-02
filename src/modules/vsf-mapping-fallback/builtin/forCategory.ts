import { removeStoreCodeFromRoute, prepareStoreView, storeCodeFromRoute } from "@vue-storefront/core/lib/multistore";
import { Payload } from "../types/Payload";

export const forCategory = async ({ dispatch }, { url }: Payload) => {
  prepareStoreView(storeCodeFromRoute(url))
  url = removeStoreCodeFromRoute(url) as string;

  try {
    const category = await dispatch(
      "category/single",
      { key: "url_path", value: url },
      { root: true }
    );
    if (category !== null) {
      return {
        name: "category",
        params: {
          slug: category.slug
        }
      };
    }
  } catch(err) {
    return undefined;
  }
};

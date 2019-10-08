import SearchQuery from "@vue-storefront/core/lib/search/searchQuery";
import { storeCodeFromRoute, prepareStoreView } from "@vue-storefront/core/lib/multistore";
import { Payload } from "../types/Payload";
import config from "config";

export const forProduct = async ({ dispatch }, { url, params }: Payload) => {
  const storeCode = storeCodeFromRoute(url);
  prepareStoreView(storeCode)

  const prefix = config.storeViews[storeCode].productsPrefix;

  const productQuery = new SearchQuery();
  let productSlug = url
    .split("/")
    .reverse()[0]
    .replace(prefix + "/", "")
    .replace(".html", "")
    .replace(".htm", "");

  productQuery.applyFilter({ key: "url_key", value: { eq: productSlug } });

  const products = await dispatch(
    "product/list",
    { query: productQuery },
    { root: true }
  );

  if (products && products.items && products.items.length) {
    const product = products.items[0];

    return {
      name: product.type_id + "-product",
      meta: {
        componentName: 'product',
      },
      params: {
        slug: product.slug,
        parentSku: product.sku,
        childSku: params["childSku"] ? params["childSku"] : product.sku
      }
    };
  } else {
    console.log("FAIL");
  }
};

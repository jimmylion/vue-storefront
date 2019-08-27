import { Payload } from "../types/Payload";
import Prismic from "prismic-javascript";
import config from "config";
import { storeCodeFromRoute } from "@vue-storefront/core/lib/multistore";

export const forCmsPage = async ({ dispatch }, { url }: Payload) => {
  const slug = url.split("/").reverse()[0];

  try {
    const api = await Prismic.getApi(config.prismic.endpoint);

    const storeCode = storeCodeFromRoute(url);
    let locale = config.storeViews[storeCode].i18n.defaultLocale;

    switch (storeCode) {
      case "eu":
        locale = "en-gb";
        break;
      case "mx":
        locale = "es-mx";
        break;
    }

    const result = await api.getByUID("cms-page", slug, {
      lang: locale
    });
    if (result) {
      return {
        name: "static-page",
        params: {
          slug
        }
      };
    }
  } catch (e) {
    console.log(e);
  }
};

// import { extendModule } from '@vue-storefront/core/lib/module'
import { VueStorefrontModule } from "@vue-storefront/core/lib/module";
import { Catalog } from "@vue-storefront/core/modules/catalog";
import { Cart } from "@vue-storefront/core/modules/cart";
import { Checkout } from "@vue-storefront/core/modules/checkout";
import { Compare } from "@vue-storefront/core/modules/compare";
import { Review } from "@vue-storefront/core/modules/review";
import { Mailer } from "@vue-storefront/core/modules/mailer";
import { Wishlist } from "@vue-storefront/core/modules/wishlist";
// import { Mailchimp } from "../modules/mailchimp";
import { Notification } from "@vue-storefront/core/modules/notification";
import { RecentlyViewed } from "@vue-storefront/core/modules/recently-viewed";
import { Url } from "@vue-storefront/core/modules/url";
import { Homepage } from "./homepage";
import { Claims } from "./claims";
// import { PromotedOffers } from "./promoted-offers";
import { Ui } from "./ui-store";
// import { GoogleAnalytics } from './google-analytics';
// import { Hotjar } from './hotjar';
import { AmpRenderer } from "./amp-renderer";
import { PaymentBackendMethods } from "./payment-backend-methods";
import { PaymentCashOnDelivery } from "./payment-cash-on-delivery";
import { RawOutputExample } from "./raw-output-example";
// import { Magento2CMS } from "./magento-2-cms";
import { InstantCheckout } from "./instant-checkout";
import { FacebookPixel } from "./vsf-facebook-pixel";
import { ZendChat } from "./vsf-zend-chat";
import { Klaviyo } from "./vsf-klaviyo";
import { VsfYotpo } from "./vsf-yotpo";
import { PrismicInjector } from "./prismic-injector";
import { OrderHistory } from './order-history'
import { googleTagManager } from './google-tag-manager';

import {
  extendMappingFallback,
  Payload
} from "src/modules/vsf-mapping-fallback";
import { tap } from "src/modules/vsf-mapping-fallback/builtin";
import {
  removeStoreCodeFromRoute,
  currentStoreView
} from "@vue-storefront/core/lib/multistore";
import SearchQuery from "@vue-storefront/core/lib/search/searchQuery";
import config from "config";
import Prismic from 'prismic-javascript'

const getStoreCodeFromURL = (url: string) => {
  const urlWithStoreCode = url
  url = removeStoreCodeFromRoute(url) as string;
  return urlWithStoreCode.replace(url, '').replace('/', '')
}

const forProduct = async ({ dispatch }, { url, params }: Payload) => {
  const storeCode = getStoreCodeFromURL(url)
  
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

const forCategory = async ({ dispatch }, { url }: Payload) => {
  url = removeStoreCodeFromRoute(url) as string;
  // .split("/")
  // .slice(0, -1)
  // .join("/");
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
  } catch {
    console.log("Hi");
    return undefined;
  }
};

const forCmsPage = async ({ dispatch }, { url }: Payload) => {
  const slug = url.split("/").reverse()[0]

    try {
      const api = await Prismic.getApi(config.prismic.endpoint);

      const storeCode = getStoreCodeFromURL(url)
      let locale = config.storeViews[storeCode].i18n.defaultLocale;

      switch (storeCode) {
        case 'eu':
          locale = 'en-gb'
          break;
        case 'mx':
          locale = 'es-mx'
          break;
      }
  
      const result = await api.getByUID("cms-page", slug, {
        lang: locale
      });
      if(result) {
        return {
          name: 'static-page',
          params: {
            slug
          }
        }
      }

      
    } catch (e) {
      console.log(e);
    }
};

extendMappingFallback(forProduct, forCategory, forCmsPage, tap);

// import { Example } from './module-template'

// This is how you can extend any of VS modues
// const extendCartVuex = {
//   actions: {
//     load () {
//       Logger.info('New load function')()
//     }
//   }
//  }

//  const cartExtend = {
//   key: 'cart',
//   afterRegistration: function(isServer, config) {
//     Logger.info('New afterRegistration hook')()
//   },
//   store: { modules: [{ key: 'cart', module: extendCartVuex }] },
//  }

// END

/**
 * Some of the modules are registered lazily only when components from the module are appearing on current page.
 * If you want to use this module in pages without its components you need to remember about registering module first
 * In VS 1.8 this modules will be seamlessly lazyLoaded after proper action dispatch
 * - Wishlist
 */
export const registerModules: VueStorefrontModule[] = [
  Checkout,
  Catalog,
  Cart,
  Compare,
  Review,
  Mailer,
  Wishlist,
  // Newsletter,
  Notification,
  Ui,
  RecentlyViewed,
  Homepage,
  Claims,
  // PromotedOffers,
  googleTagManager,
  // GoogleAnalytics,
  // Hotjar,
  PaymentBackendMethods,
  PaymentCashOnDelivery,
  RawOutputExample,
  AmpRenderer,
  InstantCheckout,
  Url,
  FacebookPixel,
  ZendChat,
  Klaviyo,
  PrismicInjector,
  VsfYotpo,
  OrderHistory
  // Example
];

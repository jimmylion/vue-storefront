import { module } from "./store";
import { afterRegistration } from "./hooks/afterRegistration";
import { createModule } from "@vue-storefront/core/lib/module";
import { initCacheStorage } from "@vue-storefront/core/helpers/initCacheStorage";

export const KEY = "magento-menus";
export const MagentoMenus = createModule({
  key: KEY,
  store: { modules: [{ key: KEY, module }] },
  afterRegistration
});

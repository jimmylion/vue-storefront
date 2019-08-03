import { beforeRegistration } from "./hooks/beforeRegistration";
import { createModule } from "@vue-storefront/core/lib/module";
import { module } from "./store";

export const KEY = "prismic-injector";
export const PrismicInjector = createModule({
  key: KEY,
  beforeRegistration,
  store: { modules: [{ key: KEY, module }] }
});

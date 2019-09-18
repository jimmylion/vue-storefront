import { module } from './store'
import { createModule } from '@vue-storefront/core/lib/module'
import { initCacheStorage } from '@vue-storefront/core/helpers/initCacheStorage'

export const KEY = 'layered-navigation'
export const cacheStorage = initCacheStorage(KEY)
export const vsfLayeredNav = createModule({
  key: KEY,
  store: { modules: [{ key: KEY, module }] }
}
)

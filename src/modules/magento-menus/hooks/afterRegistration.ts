export async function afterRegistration({ Vue, config, store, isServer }) {
  if (!store.getters['magento-menus/areMenuFetched'] && isServer) {
    await store.dispatch('magento-menus/loadMenus');
  }
}

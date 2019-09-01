export async function afterRegistration({ Vue, config, store, isServer }) {
  if (!store.getters["magento-menus/areMenuFetched"]) {
    await store.dispatch("magento-menus/loadMenus");
  }
}

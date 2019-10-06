import { mapGetters } from 'vuex';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';

const prepareUrls = function(menuIdentifier: string) {

  if (!this.$store.state['magento-menus'].menus) {
    return null;
  }

  // Find menu with requested identifier
  const { storeCode } = currentStoreView()
  let menu
  if (storeCode) {
    menu = this.$store.state['magento-menus'].menus.find(
      v => v.identifier === `${menuIdentifier}-${storeCode}`
    );
  }
  if (!menu) {
    menu = this.$store.state['magento-menus'].menus.find(
      v => v.identifier === menuIdentifier
    );
  }

  if (menu) {
    // Links prepared
    // Set links and images
    menu = menu.items.map(v => {
      let url = '/';
      let title;
      let menuImage = null

      if (v.type === 'category') {
        const category = this.getCategories.find(a => a.id === +v.content);

        if (category) {
          url = category.slug;
          title = category.name
          if (category.mobile_menu_image) {
            menuImage = category.mobile_menu_image
          }
        }
      } else if (v.type === 'cms_page') {
        url = v.content;
      } else if (v.type === 'wrapper') {
        url = null;
      }

      let obj: any = {}
      if (title) {
        obj = {
          ...v,
          url,
          title
        }
      } else {
        obj = {
          ...v,
          url
        }
      }
      
      if (menuImage) {
        obj.image = menuImage
      }

      return obj
    });

    // Move childs to parents (one level deep only)
    const parents = menu
      .filter(v => !v.parent_id)
      .map(v => ({
        ...v,
        childs: []
      }));
    const childs = menu.filter(v => v.parent_id);
    for (let child of childs) {
      let parent = parents.findIndex(v => v.node_id === child.parent_id);
      if (parent !== -1) {
        parents[parent].childs.push(child);
      }
    }

    return parents;
  }
};

export default (menuIdentifier: string | Array<string>) => ({

  computed: {

    ...mapGetters('category', ['getCategories']),
    menu() {
      if (Array.isArray(menuIdentifier)) {
        return menuIdentifier.map(v => prepareUrls.call(this, v));
      } else {
        return prepareUrls.call(this, menuIdentifier);
      }
    }

  },

  methods: {
    async fetchMenu() {
      const { storeCode } = currentStoreView()

      if (this.$store.state['magento-menus'].menus) {
        if (Array.isArray(menuIdentifier)) {
          const identifiersToFetch = [];

          for (let identifier of menuIdentifier) {
            // Try to find menu in the current language
            const menuInCurrentStoreCode = this.$store.state['magento-menus'].menus.find(
              v => v.identifier === `${identifier}-${storeCode}`
            );
            if (menuInCurrentStoreCode && !menuInCurrentStoreCode.items.length) {
              identifiersToFetch.push(menuInCurrentStoreCode.identifier)
              continue;
            }

            // Fallback to the menu without store code
            const menu = this.$store.state['magento-menus'].menus.find(
              v => v.identifier === identifier
            );
            if (menu && !menu.items.length) {
              identifiersToFetch.push(identifier);
            }
          }

          await this.$store.dispatch(
            'magento-menus/loadNodes',
            identifiersToFetch
          );
        } else {

          // Try to find menu in the current language
          const menuInCurrentStoreCode = this.$store.state['magento-menus'].menus.find(
            v => v.identifier === `${menuIdentifier}-${storeCode}`
          );
          if (menuInCurrentStoreCode && !menuInCurrentStoreCode.items.length) {
            await this.$store.dispatch(
              'magento-menus/loadNodes',
              menuInCurrentStoreCode.identifier
            );
            return
          }

          // Fallback to the menu without store code
          const menu = this.$store.state['magento-menus'].menus.find(
            v => v.identifier === menuIdentifier
          );
          if (menu && !menu.items.length) {
            await this.$store.dispatch(
              'magento-menus/loadNodes',
              menuIdentifier
            );
          }
        }
      }
    }

  },

  async serverPrefetch() {
    await this.fetchMenu();
  },

  async mounted() {
    await this.fetchMenu();
  }
});

import { mapGetters } from 'vuex';

const prepareUrls = function(menuIdentifier: string) {
  if (!this.$store.state['magento-menus'].menus) {
    return null;
  }
  const menu = this.$store.state['magento-menus'].menus.find(
    v => v.identifier === menuIdentifier
  );
  let preparedMenu = menu;
  if (preparedMenu) {
    // Links prepared
    preparedMenu = preparedMenu.items.map(v => {
      let url = '/';
      let menuImage = null

      if (v.type === 'category') {
        const category = this.getCategories.find(a => a.id === +v.content);

        if (category) {
          url = category.slug;
          if (category.mobile_menu_image) {
            menuImage = category.mobile_menu_image
          }
        }
      } else if (v.type === 'cms_page') {
        url = v.content;
      } else if (v.type === 'wrapper') {
        url = null;
      }

      const obj = {
        ...v,
        url
      }
      if (menuImage) {
        obj.image = menuImage
      }

      return obj
    });

    const parents = preparedMenu
      .filter(v => !v.parent_id)
      .map(v => ({
        ...v,
        childs: []
      }));
    const childs = preparedMenu.filter(v => v.parent_id);
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
      if (this.$store.state['magento-menus'].menus) {
        if (Array.isArray(menuIdentifier)) {
          const identifiersToFetch = [];

          for (let identifier of menuIdentifier) {
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

import { mapGetters } from 'vuex';

const prepareUrls = function(menuIdentifier: string) {
  const menu = this.$store.state['magento-menus'].menus.find(
    v => v.identifier === menuIdentifier
  );
  return menu
    ? menu.items.map(v => {
        let url = '/';
        if (v.type === 'category') {
          const category = this.getCategories.find(a => a.id === +v.content);

          if (category) {
            url = category.slug;
          }
        } else if (v.type === 'cms_page') {
          url = v.content;
        } else if (v.type === 'wrapper') {
          url = null;
        }

        return {
          ...v,
          url
        };
      })
    : null;
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

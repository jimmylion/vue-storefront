import EventBus from "@vue-storefront/core/compatibility/plugins/event-bus/index";
import { currentStoreView } from "@vue-storefront/core/lib/multistore";
import { StoreView } from "@vue-storefront/core/lib/multistore";

declare const zE;

export function beforeRegistration({ Vue, config, store, isServer }) {
  if (!isServer) {
    // Inject Zendesk widget
    var head = document.getElementsByTagName("head")[0],
      script = document.createElement("script");

    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${
      config.zendChat.id
    }`;
    script.id = "ze-snippet";
    script.async = true;

    script.onload = function() {
      // Widget language
      const configData = (<StoreView[]>Object.values(config.storeViews))
        .filter(v => v.hasOwnProperty("storeCode"))
        .map(v => {
          return { storeCode: v.storeCode, lang: v.i18n.defaultLanguage };
        });

      const { storeCode } = currentStoreView();
      let widgetLang;

      for (const data of configData) {
        if (data.storeCode === storeCode) {
          widgetLang = data.lang.toLowerCase();
          zE(() => {
            zE("webWidget", "setLocale", widgetLang);
          });
        } else if (storeCode === "") {
          zE(() => {
            zE("webWidget", "setLocale", config.i18n.defaultLocale);
          });
        }
      }

      // User identify;
      EventBus.$on("user-after-loggedin", ({ firstname, lastname, email }) => {
        zE(() => {
          zE.identify({
            name: firstname + " " + lastname,
            email
          });
        });
      });

      EventBus.$on("user-after-logout", () => {
        zE(() => {
          zE("webWidget", "logout");
        });
      });

      return widgetLang;
    };

    head.appendChild(script);
  }
}

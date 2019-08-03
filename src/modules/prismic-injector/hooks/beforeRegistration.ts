import PrismicVue from "prismic-vue";
import linkResolver from "../plugins/link-resolver";
import htmlSerializer from "../plugins/html-serializer";

export function beforeRegistration({ Vue, config, store, isServer }) {
  Vue.use(PrismicVue, {
    linkResolver,
    htmlSerializer
  });

  if (!isServer) {
    const head = document.getElementsByTagName("head")[0],
      script = document.createElement("script"),
      script2 = document.createElement("script");

    script.innerHTML =
      '{ window.prismic = { endpoint: "' + config.prismic.endpoint + '"} }';
    script2.src = "//static.cdn.prismic.io/prismic.min.js";
    script2.async = true;
    head.appendChild(script);
    head.appendChild(script2);
  }
}

import { beforeRegistration } from "../../hooks/beforeRegistration";
jest.mock("@vue-storefront/core/lib/multistore", () => ({
  currentStoreView: () => ({
    storeCode: "fr"
  })
}));

describe("Zendesk", () => {
  const mock = {
    isServer: false,
    config: {
      zendChat: {
        id: "abc"
      }
    },
    Vue: {},
    store: {}
  };

  it("injects proper Zendesk script to our page", () => {
    beforeRegistration(mock);

    expect(document.querySelector("#ze-snippet")).not.toBeNull();
  });

  it("changes zendesk lang depending on region", () => {
    const lang = "fr";

    (<any>window).zE = () => {};

    beforeRegistration(mock);
    const elem = document.querySelector("#ze-snippet");
    const fn = (<any>elem).onload;

    const target = fn();

    expect(target).toBe(lang);
  });
});

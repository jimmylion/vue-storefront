import { currentStoreView } from '@vue-storefront/core/lib/multistore';

export default () => {
  const storeView = currentStoreView();
  let locale = storeView.i18n.defaultLocale.toLowerCase();
  switch (storeView.storeCode) {
    case 'eu':
      locale = 'en-en';
      break;
    case 'uk':
      locale = 'en-gb';
      break;
    case 'mx':
      locale = 'es-mx';
      break;
  }

  return locale;
};

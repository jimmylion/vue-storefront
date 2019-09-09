import { PacksState } from './../types/PacksState';
import { GetterTree } from 'vuex';

export const getters: GetterTree<PacksState, any> = {
  getPack: state => packId => state.packOptions[packId],
  getPackCategoryId: state => packId => state.packOptions[packId].categoryId,
  getPackItemId: state => packSlug => state.packs[packSlug].itemId,
  getPackItems: state => packSlug => state.packs[packSlug].items,
  smth: state => packSlug => state.packs[packSlug],
  getPackItemsLength: state => packSlug => state.packs[packSlug].items.length,
  getPacks: state => state.packOptions,
}

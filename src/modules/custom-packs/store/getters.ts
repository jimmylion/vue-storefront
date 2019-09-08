import { PacksState } from './../types/PacksState';
import { GetterTree } from 'vuex';

export const getters: GetterTree<PacksState, any> = {
  getPack: state => packId => state.packOptions[packId],
  getPackCategoryId: state => packId => state.packOptions[packId].categoryId,
  getPackItemId: state => packId => state.packs[packId].itemId,
  getPackItems: state => packId => state.packs[packId].items,
  getPackItemsLength: state => packId => state.packs[packId].items.length,
  getPacks: state => state.packOptions,
}

import { PacksState } from './../types/PacksState';
import { GetterTree } from 'vuex';

export const getters: GetterTree<PacksState, any> = {
  getPackId: state => packId => state.packOptions[packId],
  getPackCategoryId: state => packId => state.packOptions[packId].categoryId,
  getPacks: state => state.packOptions,
}

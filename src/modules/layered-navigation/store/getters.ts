import { AttrState } from './../types/AttrState';
import { GetterTree } from 'vuex';

export const getters: GetterTree<AttrState, any> = {
  products: state => categoryId => state.attributes[categoryId],
  current: state => state.filteredAttributes,
  currentSearch: state => state.filteredAttributesSearch,
}

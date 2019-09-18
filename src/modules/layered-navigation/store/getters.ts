import { AttrState } from './../types/AttrState';
import { GetterTree } from 'vuex';

export const getters: GetterTree<AttrState, any> = {
  products: state => state.attributes
}

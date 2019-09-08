import { RelatedProductsState } from '../types/RelatedProductsState'
import { GetterTree } from 'vuex';

export const getters: GetterTree<RelatedProductsState, any> = {
    products: state => state.products
}

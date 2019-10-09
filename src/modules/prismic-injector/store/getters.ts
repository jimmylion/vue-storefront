import { PrismicState } from "../types/PrismicState";
import { GetterTree } from "vuex";

export const getters: GetterTree<PrismicState, any> = {
  getPages: state => state.pages,
  getBlocks: state => state.blocks,
  getCategoryBanners: state => state.categoryBanners,
  getPageByAttribute: state => (attribute, value) =>
    state.pages.find(v => v[attribute] === value),
  getBlockByAttribute: state => (attribute, value) =>
    state.blocks.find(v => v[attribute] === value),
  getCategoryBannersByAttribute: state => (attribute, value) =>
    state.categoryBanners.find(v => v[attribute] === value)
};

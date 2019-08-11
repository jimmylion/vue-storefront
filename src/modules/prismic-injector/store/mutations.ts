import { MutationTree } from "vuex";
import * as types from "./mutation-types";

export const mutations: MutationTree<any> = {
  [types.SAVE_PAGES](state, payload) {
    if (Array.isArray(payload)) {
      state.pages.push(...payload);
    } else {
      state.pages.push(payload);
    }
  },
  [types.SAVE_BLOCKS](state, payload) {
    if (Array.isArray(payload)) {
      state.blocks.push(...payload);
    } else {
      state.blocks.push(payload);
    }
  }
};

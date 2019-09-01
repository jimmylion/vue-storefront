import { MenusState } from "../types/MenusState";
import { GetterTree } from "vuex";

export const getters: GetterTree<MenusState, any> = {
  areMenuFetched: state => state.menus !== null
};

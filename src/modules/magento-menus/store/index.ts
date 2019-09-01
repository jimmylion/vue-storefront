import { Module } from "vuex";
import { MenusState } from "../types/MenusState";
import { mutations } from "./mutations";
import { getters } from "./getters";
import { actions } from "./actions";
import { state } from "./state";

export const module: Module<MenusState, any> = {
  namespaced: true,
  mutations,
  actions,
  getters,
  state
};

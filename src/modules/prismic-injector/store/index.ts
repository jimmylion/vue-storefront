import { Module } from "vuex";
import { PrismicState } from "../types/PrismicState";
import { mutations } from "./mutations";
import { getters } from "./getters";
import { state } from "./state";

export const module: Module<PrismicState, any> = {
  namespaced: true,
  mutations,
  getters,
  state
};

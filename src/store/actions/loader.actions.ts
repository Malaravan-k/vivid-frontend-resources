// src/store/actions/loader.actions.ts

import { loaderConstants } from "../constants/loader.constants";

export const loaderActions = {
  start,
  end,
};

function start(ID?: string | number) {
  return { type: loaderConstants.LOADING, ID };
}

function end() {
  return { type: loaderConstants.END };
}

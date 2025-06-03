import { produce } from 'immer';
import { loaderConstants } from '../constants/loader.constants';

interface LoaderState {
  inprogress: boolean;
  ID: string | number | null;
}

interface LoaderAction {
  type: string;
  ID?: string | number;
}

const initialState: LoaderState = {
  inprogress: false,
  ID: null,
};

export default function loaderReducer(
  state: LoaderState = initialState,
  action: LoaderAction
): LoaderState {
  return produce(state, (draft) => {
    switch (action.type) {
      case loaderConstants.LOADING:
        draft.inprogress = true;
        draft.ID = action.ID ?? null;
        break;
      case loaderConstants.END:
        draft.inprogress = false;
        draft.ID = null;
        break;
      default:
        break;
    }
  });
}

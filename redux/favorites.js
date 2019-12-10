import * as ActionTypes from "./ActionTypes";

export const favorites = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.ADD_FAVORITE:
      //Some te devuelve un booleano "si hay o no 1 elemento" que cumpla con la condición dada
      if (state.some(el => el === action.payload)) return state;
      else return state.concat(action.payload);
    case ActionTypes.DELETE_FAVORITE:
      //Filter te crea una nueva lista con todos los elementos que cumplan con la condición
      return state.filter(favorite => favorite !== action.payload);
    default:
      return state;
  }
};

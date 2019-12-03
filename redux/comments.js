import * as ActionTypes from "./ActionTypes";

export const comments = (
  state = {
    errMess: null,
    comments: []
  },
  action
) => {
  switch (action.type) {
    case ActionTypes.ADD_COMMENTS:
      return {
        ...state,
        errMess: null,
        comments: action.payload
      };
    case ActionTypes.COMMENTS_FAILED:
      return {
        ...state,
        errMess: action.payload,
        comments: []
      };
    case ActionTypes.ADD_COMMENT:
      let commentId = state.comments.length;
      let comment = { ...action.payload, id: commentId };

      return {
        ...state,
        errMess: null,
        comments: state.comments.concat(comment)
      };

    default:
      return state;
  }
};

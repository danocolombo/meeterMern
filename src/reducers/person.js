import { GET_PEOPLE, PERSON_ERROR } from '../actions/types';

const initialState = {
  people: [],
  person: null,
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_PEOPLE:
      return {
        ...state,
        people: payload,
        loading: false
      };
    case PERSON_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}

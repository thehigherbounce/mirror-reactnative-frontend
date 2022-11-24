import { SETUSER } from '../constants';
const initialState = {
    user: null
};
const userReducer = (state = initialState, action) => {
    switch(action.type) {
        case SETUSER:
            return {
                ...state,
                user:action.payload
            };
        default:
            return state;
    }
}
export default userReducer;
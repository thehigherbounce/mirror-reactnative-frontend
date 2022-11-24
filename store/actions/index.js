import { SETUSER } from '../constants';
export function setUser(user) {
return {
        type: SETUSER,
        payload: user
    }
}

import { Platform,Dimensions} from 'react-native';
//export const API_URL = Platform.OS === 'ios' ? 'API_URL' : 'API_URL';
export const API_URL = Platform.OS === 'ios' ? API_URL : API_URL;

 export const SOCKET_URL = SOCKET_URL;

export const STORAGE_KEY = "@STORAGE_KEY";

export const default_photo = 'https://res.cloudinary.com/dpyy2o3xv/image/upload/v1629305856/selfie_zben0m.png';
export const upload_url = 'https://api.cloudinary.com/v1_1/dpyy2o3xv/image/upload';
export const upload_preset = 'uliks_upload';

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

import React, { useState , useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationActions, StackActions } from 'react-navigation';
import { useSelector , useDispatch } from 'react-redux';
import { setUser } from '../store/actions/index'

import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  } from '@expo-google-fonts/montserrat';
  
import AwesomeAlert from 'react-native-awesome-alerts';
import {API_URL , STORAGE_KEY} from '../config/config';

const AuthScreen = (props) => {
    
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const store_user = useSelector((state) => state.user.user);
    const dispatch = useDispatch()
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [showAlert , setShowAlert] = useState(false); //success alert
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold
      });
    useEffect(() => {
        checkLogin();
    }, [])

    //change sign in / sign up
    const onChangeHandler = () => {
        setIsLogin(!isLogin);
        setMessage('');
    };

    const goFeed = (cur_user) => {

        dispatch(setUser(cur_user));
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Feed'})],
        });

        props.navigation.dispatch(resetAction); 
    }

    const _storeData = async (token) => {
        try {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            token
          );
        } catch (error) {
          // Error saving data
        }
    };
    
    const checkLogin = async () => {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEY);
            console.log("token",token);
            if(token !== null)
            {
                setShowAlert(true);
                //Go to Feed
                fetch(`${API_URL}/check`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify({token}),
                })
                .then(async res => { 
                    try {
                        const jsonRes = await res.json();
                        if (res.status == 200) {
                            
                            goFeed( jsonRes.user );
                        }                     
                    } catch (err) {
                        console.log(err);
                    };
                    setShowAlert(false);
                })
                .catch(err => {
                    setShowAlert(false);
                });
            }      
            setShowAlert(false);
            // }
        } catch(e) {
            setShowAlert(false);
        // error reading value
        }
    }

    const onSubmitHandler = () => {  //Sign in & Sign up
        //validation
        if(!isLogin && name == ''){
            setIsError(true);
            setMessage("Name is empty");
            return;
        }
        if(email == ''){
            setIsError(true);
            setMessage("Email is empty");
            return;
        }
        
        
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
        if (reg.test(email) === false) {
            setIsError(true);
            setMessage("Invalid Email Address");
            return;
        }

        if(password == ''){
            setIsError(true);
            setMessage("Password is empty");
            return;
        }
        setShowAlert(true);
        setMessage('');
        //submit
        const capName = name.toUpperCase();
        const payload = {
            email,
            password,
            capName
        };
        fetch(`${API_URL}/${isLogin ? 'signin' : 'signup'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(async res => { 
            try {
                console.log(res);
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    setIsError(true);
                    setMessage(jsonRes.message);
                } else {
                    
                    setIsError(false);
                    setMessage(jsonRes.message);
                    
                        //save token on storage
                        _storeData(jsonRes.token);
                        //reset navigation
                        goFeed(jsonRes.user);
                      
                    //navigate to feed page

                }
                
                setShowAlert(false);
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    //set status message(error or success)
    const getMessage = () => {
        const status = isError ? `Error: ` : `Success: `;
        return status + message;
    }
    
    return (
            <View style={styles.card}>
                {fontsLoaded && <Text style={styles.heading}>Mirrer</Text>}
                {fontsLoaded && <View style={styles.form}>
                    <View style={styles.inputs}>
                        <Text style={[styles.message, {color: isError ? 'red' : 'green'}]}>{message ? getMessage() : null}</Text>
                        
                        {!isLogin && <TextInput style={styles.input} placeholder="FULL NAME" onChangeText={setName}></TextInput>}
                        <TextInput style={styles.input} placeholder={isLogin?'EMAIL':'INSERT EMAIL'} autoCapitalize="none" onChangeText={setEmail}></TextInput>
                        <TextInput secureTextEntry={true} style={styles.input} placeholder={isLogin?'PASSWORD':'INSERT PASSWORD'} onChangeText={setPassword}></TextInput>
                        <TouchableOpacity style={(email && password && (isLogin || name ))?styles.submit_sign_up:styles.submit_sign_in} onPress={onSubmitHandler}>
                            <Text style={styles.buttonText}>{isLogin?'SIGN IN':'SIGN UP'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.forgotPassword} onPress={() => props.navigation.navigate('Forgot')}>
                            <Text style={styles.forgotText}>{isLogin ? 'FORGOT PASSWORD?':''}</Text>
                        </TouchableOpacity>
                        <View
                            style={styles.hr}
                        /> 
                        <View style={{marginTop:85,flexDirection:'row'}}>
                            <Text style={{color:'rgba(0, 0, 0, 0.7)', fontFamily:'Montserrat_600SemiBold'}}>{isLogin ? 'new to ':'Already have an account?'}</Text>
                            <Text style={{color:'black', fontFamily:'Montserrat_600SemiBold'}}>{isLogin ? 'Mirrer?':''}</Text>
                        </View>
                        <TouchableOpacity style={isLogin?styles.buttonAlt_signin:styles.buttonAlt_signup} onPress={onChangeHandler}>
                            <Text style={{color: isLogin ? 'white' : 'rgba(0, 0, 0, 0.5)', fontFamily:'Montserrat_600SemiBold'}}>{isLogin ? 'SIGN UP' : 'SIGN IN'}</Text>
                        </TouchableOpacity>
                    </View>    
                </View>}
                
                <AwesomeAlert
                    show={showAlert}
                    showProgress={true}
                    title="Processing"
                    message="Wait a moment..."
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                />
            </View>
    );
};

const styles = StyleSheet.create({
    hr:{
        borderBottomColor: 'rgba(0, 0, 0, 0.3 )',
        borderBottomWidth: 0.5,
        width:'100%',
        marginTop:28
    }, 
    card: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop:'36%',
        alignItems:'center',
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
    },
    heading: {
        fontSize: 18,
        fontWeight: '700',
        color: 'black',
        fontFamily:'Montserrat_700Bold'
    },
    form: {
        flex: 1,
        marginTop:'15%',
        width:'100%',
        paddingLeft:45,
        paddingRight:45
    },
    inputs: {
        width: '100%',
        flex: 1,
        alignItems: 'center'
    },  
    input: {
        width: '100%',
        backgroundColor: '#FAFAFA',
        height:55,
        marginTop:11,
        textAlign:'center',
        fontFamily:'Montserrat_600SemiBold'
    },
    submit_sign_in: {
        width: '100%',
        justifyContent: 'center',
        height:55,
        marginTop:11,
        alignItems:'center',
        backgroundColor:'#C4C4C4'
    },
    submit_sign_up: {
        width: '100%',
        justifyContent: 'center',
        height:55,
        marginTop:11,
        alignItems:'center',
        backgroundColor:'rgba(221, 46, 68, 0.85)'
    },
    forgotPassword:{
        marginTop:28
    },
    forgotText:{
        color: 'rgba(0, 0, 0, 0.5)',
        fontSize: 12,
        fontFamily:'Montserrat_600SemiBold'
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontFamily:'Montserrat_600SemiBold'
    },
    buttonAlt_signin: {
        width: 144,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:27,
        backgroundColor:'rgba(221, 46, 68, 0.85)',
        fontSize: 12
    },
    buttonAlt_signup: {
        width: 144,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:27,
        fontSize: 12
    },
    message: {
        fontSize: 16,
        height:20
    },
});

export default AuthScreen;
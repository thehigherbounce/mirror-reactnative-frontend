import React, { useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  } from '@expo-google-fonts/montserrat';
import AwesomeAlert from 'react-native-awesome-alerts';
import {API_URL} from '../config/config';

const ForgotScreen = (props) => {
    
    const [email, setEmail] = useState('');

    const [showAlert , setShowAlert] = useState(false); //success alert
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('');
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold
      });
    //on reset password
    const onSubmitHandler = () => {
        
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

        setShowAlert(true);
        setMessage('');
        const payload = {
            email
        };
        fetch(`${API_URL}/reset_password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    setIsError(true);
                    setMessage(jsonRes.message);
                } else {
                    
                    setIsError(false);
                    setMessage('Your password is "123456" now');
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

    // status message
    const getMessage = () => {
        const status = isError ? `Error: ` : `Success: `;
        return status + message;
    }

    return (
            <View style={styles.card}>
                <Text style={styles.heading}>Mirrer</Text>
                {fontsLoaded &&<View style={styles.form}>
                    <View style={styles.inputs}>
                        <Text style={[styles.message, {color: isError ? 'red' : 'green'}]}>{message ? getMessage() : null}</Text>
                        
                        <TextInput style={styles.input} placeholder='EMAIL' autoCapitalize="none" onChangeText={setEmail}></TextInput>
                       
                        <TouchableOpacity style={styles.submit_sign_up} onPress={onSubmitHandler}>
                            <Text style={styles.buttonText}>RESET PASSWORD</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.forgotPassword} onPress={() => props.navigation.navigate('Auth')}>
                            <Text style={styles.forgotText}>GO TO SIGN IN</Text>
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
        alignItems:'center'
    },
    heading: {
        fontSize: 18,
        lineHeight:22,
        fontWeight: '700',
        color: 'black'
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
        fontWeight: 'bold',
        fontSize: 12,
        fontFamily:'Montserrat_600SemiBold'
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '400',
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

export default ForgotScreen;
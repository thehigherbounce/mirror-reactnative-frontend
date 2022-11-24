import React, { useRef} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationActions, StackActions ,} from 'react-navigation';
import Toast from './MyToast';

import { useSelector } from 'react-redux';

import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';

import { ScrollView } from 'react-native-gesture-handler';

import {API_URL ,STORAGE_KEY, windowWidth,windowHeight} from '../config/config';
const GeneralScreen = (props) => {
    const user = useSelector((state) => state.user.user); //current user
    let [fontsLoaded] = useFonts({ 
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });
    const defaultToast = useRef(null);
    const onLogout = async () => {
        try {
          await AsyncStorage.removeItem(
            STORAGE_KEY
          );

            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Auth' })],
            });

            props.navigation.dispatch(resetAction); 

        } catch (error) {
            console.log(error)
          // Error saving data
        }
    };
    const onDelete = () => {
        fetch(`${API_URL}/delUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email
            })
        })
        .then(async res => { 
            try {
                // const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    defaultToast.current.showToast("Your profile has deleted.");
                    
                    setTimeout(() => {
                        onLogout();
                    }, 3000);  
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    const goChangePassword = () => {
        props.navigation.navigate('ChangePassword');
    }
    const goBlockList = () => {
        props.navigation.navigate('BlockList');
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.mainContainer}>
                <TouchableOpacity style={styles.accountItem} onPress={()=>goChangePassword()}>
                    <Text style={styles.menu_text}>CHANGE PASSWORD</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.accountItem} onPress={()=>goBlockList()}>
                    <Text style={styles.menu_text}>BLOCKED USERS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutContainer} onPress={()=>onDelete()}>
                    <Text style={styles.logoutText}>DELETE YOUR ACCOUNT</Text>
                </TouchableOpacity>
            </View>
            
            <Toast ref = {defaultToast} backgroundColor = "#57D172" style={styles.myToast}/>
       </ScrollView>
    );
};

const styles = StyleSheet.create({
    privateDesc:{
        fontSize:12,
        fontFamily:'Montserrat_400Regular',
        color:'rgba(0, 0, 0, 0.6)',
        lineHeight:15
    },
    privateTitle:{
        fontSize:16,
        fontFamily:'Montserrat_400Regular'
    },
    menu_input:{
        fontFamily:'Montserrat_600SemiBold',
        width:180,
        fontSize:14,
        paddingBottom:0,
        borderBottomWidth:0.5,
        height:40,
        borderColor:'rgba(0, 0, 0, 0.1)'
    },
    toggleDesc:{
        width:'50%'
    },
    menu_img:{
        width:24,
        height:24,
    },
    menu_text:{
        fontSize:16,
        fontFamily:'Montserrat_400Regular'
    },
    accountItem:{
        height:50,
        width:windowWidth - 72
    },
    toggleContainer:{
        width:windowWidth - 72,
        marginTop:30,
        flexDirection:'row',
        alignItems:'flex-start',
        justifyContent:'space-between'
    },
    mainContainer:{
        // justifyContent:'center',
        alignItems:'center',
        width:windowWidth,
        height:windowHeight - 100
    },
    logoutContainer:{
        position:'absolute',
        bottom: 15,
        // marginHorizontal:75,
        width:windowWidth - 60,
        height:54,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:3
    },
    logoutText:{
       fontSize:13,
       color:'rgba(221, 46, 68, 1)',
       letterSpacing:1,
        fontFamily:'Montserrat_400Regular'
    },
    container: {
        paddingTop:25,
        width: '100%',
        height:'100%',
        display: "flex", 
        flexDirection: "row", 
        flexWrap: "wrap",
        backgroundColor:'white'
    }
});

export default GeneralScreen; 
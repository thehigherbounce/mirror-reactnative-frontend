import React, { useState,useRef} from 'react';
import { View,  Switch, Text, StyleSheet, TouchableOpacity, TextInput} from 'react-native';

import Toast from './MyToast';

import { useSelector , useDispatch } from 'react-redux';
import { setUser } from '../store/actions/index'
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';

import { ScrollView } from 'react-native-gesture-handler';

import {API_URL ,STORAGE_KEY, windowWidth,windowHeight} from '../config/config';
const UserProfileScreen = (props) => {
    const user = useSelector((state) => state.user.user); //current user
    const dispatch = useDispatch();

    let [fontsLoaded] = useFonts({ 
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });
    const defaultToast = useRef(null);

    const [userName,setUserName] = useState(user.name);
    const [userType,setUserType] = useState(!user.is_public);

    const onSave = () => {
        fetch(`${API_URL}/saveUserProfile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                userName:userName.toUpperCase(),
                userType:!userType
            })
        })
        .then(async res => { 
            try {
                // const jsonRes = await res.json();
                user.name = userName.toUpperCase();
                user.is_public = !userType;
                dispatch(setUser(user));
                if (res.status !== 200) {
                } else {
                    defaultToast.current.showToast("Your profile has saved.");
                }
                
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.accountItem}>
                    <Text style={styles.menu_text}>CHANGE NAME</Text>
                    {fontsLoaded && <TextInput style={styles.menu_input} onChangeText={(text)=>setUserName(text)} value={userName}></TextInput>}
                </View>
                <View style={styles.toggleContainer}>
                    <View style={styles.toggleDesc}>
                        <Text style={styles.privateTitle}>PRIVATE PROFILE</Text>
                        <Text style={[styles.privateDesc,{marginTop:4}]}>Setting the profile PRIVATE</Text>
                        <Text style={styles.privateDesc}>people needs to follow you for accesing your picture</Text>
                    </View>
                    <Switch
                        style={styles.typeSwitch}
                        trackColor={{ false: "#767577", true: "#767577" }}
                        thumbColor={userType ? "green" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={()=>setUserType(!userType)}
                        value={userType}
                    />
                </View>
                <TouchableOpacity style={styles.logoutContainer} onPress={()=>onSave()}>
                    <Text style={styles.logoutText}>SAVE</Text>
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
        borderRadius:3,
        backgroundColor:'rgba(242, 20, 73, 1)'
    },
    logoutText:{
       fontSize:16,
       color:'white',
       letterSpacing:1,
        fontFamily:'Montserrat_700Bold'
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

export default UserProfileScreen; 
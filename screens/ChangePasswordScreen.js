import React, { useState,useRef} from 'react';
import { View,  Switch, Text, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
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
const ChangePasswordScreen = (props) => {
    const user = useSelector((state) => state.user.user); //current user
    
    let [fontsLoaded] = useFonts({ 
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });

    const [message,setMessage] = useState('');
    const [oldPass,setOldPass] = useState('');
    const [newPass1,setNewPass1] = useState('');
    const [newPass2,setNewPass2] = useState('');

    const defaultToast = useRef(null);

    const onSave = () => {
        if(oldPass == '' || newPass1 == '' || newPass2 == ''){
            setMessage("ERROR : You must fill the fields");
            return;
        }
        
        if(newPass1 != newPass2)
        {
            setMessage("ERROR : New passwords are different");
            return;
        }

        fetch(`${API_URL}/changePasswordUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                password:oldPass,
                new_password:newPass1
            })
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    setMessage(jsonRes.message);
                } else {
                    defaultToast.current.showToast("Password has deleted.");
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });

        setMessage('');
    }

    return (
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <Text style={[styles.message, {color: 'red'}]}>{message!='' ? message : null}</Text>
                        
                <View style={styles.accountItem}>
                    <TextInput secureTextEntry={true} style={styles.menu_input} value={oldPass} onChangeText={(text)=>setOldPass(text)} placeholder="INSERT OLD PASSWORD"/>
                </View>
                <View style={styles.accountItem}>
                    <TextInput secureTextEntry={true} style={styles.menu_input} value={newPass1} onChangeText={(text)=>setNewPass1(text)} placeholder="ADD NEW PASSWORD"/>
                </View>
                <View style={styles.accountItem}>
                    <TextInput secureTextEntry={true} style={styles.menu_input} value={newPass2} onChangeText={(text)=>setNewPass2(text)} placeholder="REPEAT NEW PASSWORD"/>
                </View>
                <TouchableOpacity style={styles.logoutContainer} onPress={()=>onSave()}>
                    <Text style={styles.logoutText}>SAVE</Text>
                </TouchableOpacity>
            </View>
            
            <Toast ref = {defaultToast} backgroundColor = "#57D172" style={styles.myToast}/>
       </View>
    );
};

const styles = StyleSheet.create({
    message: {
        fontSize: 16,
        height:20,
        marginBottom:10
    },
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
        marginTop:10,
        alignItems:'center',
        width:windowWidth,
        height:windowHeight - 125
    },
    logoutContainer:{
        position:'absolute',
        bottom: 15,
        // marginHorizontal:75,
        width:windowWidth - 60,
        height:54,
        backgroundColor:'rgba(242, 20, 73, 1)',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:3
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

export default ChangePasswordScreen; 
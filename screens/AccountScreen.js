import React, {useState, useEffect} from 'react';
import { View,   Text, StyleSheet, TouchableOpacity} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationActions, StackActions ,} from 'react-navigation';
import SvgUri from 'react-native-svg-uri';
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
const AccountScreen = (props) => {
    const user = useSelector((state) => state.user.user);
    const [userName,setUserName] = useState(user.name);
    
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });
    //get Profile Data
    useEffect(() => {
        props.navigation.setParams({title:userName})
    }, [userName]);

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

    const goUserProfile = () => {
        props.navigation.navigate('UserProfile');
    };
    const goUserGeneral = () => {
        props.navigation.navigate('General');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.mainContainer}>
                <TouchableOpacity style={styles.accountItem} onPress={()=>goUserProfile()}>
                    <SvgUri
                        style={styles.menu_img}
                        source={require('../assets/account_profile.svg')}
                    />
                    <Text style={styles.menu_text}>PROFILE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.accountItem} onPress={()=>goUserGeneral()}>
                    <SvgUri
                        style={styles.menu_img}
                        source={require('../assets/account_general.svg')}
                    />
                    <Text style={styles.menu_text}>GENERAL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutContainer} onPress={()=>onLogout()}>
                    <Text style={styles.logoutText}>LOGOUT</Text>
                </TouchableOpacity>
            </View>
       </ScrollView>
    );
};

const styles = StyleSheet.create({
    menu_img:{
        width:24,
        height:24,
    },
    menu_text:{
        marginLeft:13,
        fontSize:16,
        fontFamily:'Montserrat_400Regular'
    },
    accountItem:{
        height:50,
        width:windowWidth - 72,
        flexDirection:'row'
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
        width:225,
        height:54,
        backgroundColor:'white',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:3,
        borderWidth:1,
        borderColor:'rgba(196, 196, 196, 1)'
    },
    logoutText:{
       fontSize:16,
       color:'rgba(0, 0, 0, 0.6)',
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

export default AccountScreen;

AccountScreen['navigationOptions'] = props => ({
    title:props.navigation.state.params.title
})
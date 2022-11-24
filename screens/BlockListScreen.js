import React, { useState ,useRef, useEffect} from 'react';
import { View,FlatList, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import Toast from './MyToast';
import { useSelector , useDispatch } from 'react-redux';
import { setUser } from '../store/actions/index'
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_400Regular,
    Montserrat_500Medium
  } from '@expo-google-fonts/montserrat';

import {API_URL, default_photo, windowHeight, windowWidth} from '../config/config';

const BlockListScreen = (props) => {
    const user = useSelector((state) => state.user.user); //current user
    const dispatch = useDispatch();
    const [blockList,setBlockList] = useState([]);

    const [loadingAlert,setLoadingAlert] = useState(false);

    const defaultToast = useRef(null);
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular,
        Montserrat_500Medium
    });

    //load whole user list at first
    useEffect(() => {
        setLoadingAlert(true);
        getBlockList();
        
    }, []);  
    
    //load block list
    const getBlockList = () =>{
        fetch(`${API_URL}/getBlockList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:user.email})
        })
        .then(async res => { 
            try {

                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    setBlockList(jsonRes.data[0].user);
                    setLoadingAlert(false);
                }
                
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    //render full name to first & last
    const renderName = (name) => {
        const fl_name = name.split(' ');
        const first_name = fl_name[0];
        const last_name = fl_name.length > 1 ? fl_name[1]:'';
        return (
            <View style={styles.nameContainer}>
                <Text style={styles.first_name}>{first_name} </Text>
                <Text style={styles.last_name}>{last_name}</Text>
            </View>
        )
    };

    const unblockUser = (email) => {
        fetch(`${API_URL}/unBlockUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                blocked_email:email
            })
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    const index = user.block_list.indexOf(email);
                    if(index > -1)
                    {
                        user.block_list.splice(index,1);
                        dispatch(setUser(user));
                    }
                    defaultToast.current.showToast("Unblocked Success.");
                    getBlockList();
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
        <View style={styles.container}>

            <FlatList
                style={styles.searchUserListContainer}
                data={blockList}
                renderItem={({ item }) => {
                        return (
                            <TouchableOpacity style={styles.historyItemContainer}>
                                <View style={{flexDirection:'row'}}>
                                    <Image style={styles.photo} 
                                        source={{
                                            uri: item.photo==''?default_photo:item.photo
                                        }}>
                                    </Image>
                                    {renderName(item.name)}
                                </View>
                                <TouchableOpacity style={styles.unblockContainer} onPress={()=>unblockUser(item.email)}>
                                    <Text style={styles.unblockButton}>UNBLOCK</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )                    
                }}
                keyExtractor={(item) => "" + item.email}
            />
            <AwesomeAlert
                show={loadingAlert}
                showProgress={true}
                title="Processing"
                message="Wait a moment..."
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
            />
            <Toast ref = {defaultToast} backgroundColor = "#57D172" style={styles.myToast}/>
       </View>
    );
};

const styles = StyleSheet.create({
    unblockContainer:{
        borderWidth:1,
        borderColor:'rgba(0, 0, 0, 0.3)',
        width:87,
        height:33,
        alignItems:'center',
        justifyContent:'center'
    },
    unblockButton:{
        fontSize:12,
        fontFamily:'Montserrat_500Medium'
    },
    container: {
        paddingTop:25,
        width: '100%',
        height:'100%',
        display: "flex", 
        flexDirection: "row", 
        flexWrap: "wrap",
        backgroundColor:'white',
        marginBottom:50,
        alignItems:'center'
    },
    searchUserListContainer:{
        marginLeft:21,
        height:windowHeight - 180
    },
    nameContainer:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:14
    },
    historyItemContainer:{
        marginTop:12,
        width:windowWidth - 40,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    first_name:{
        fontFamily:'Montserrat_800ExtraBold',
        fontSize:16
    },
    last_name:{
        fontFamily:'Montserrat_500Medium',
        fontSize:16
    },
    photo:{
        width:35 * windowWidth / 375,
        height:35 * windowWidth / 375,
        borderRadius:50
    },
    searchContainer:{
        width:windowWidth,
        alignItems:'center',
        height:44
    },
    searchInput:{
        fontSize:14,
        paddingLeft:20,
        width:windowWidth - 40,
        justifyContent:'center',
        borderWidth:1,
        height:'100%',
        borderRadius:4,
        borderColor:'#E5E5E5',
        fontFamily:'Montserrat_400Regular'
    },
    headerLeftContainer:{
        marginLeft:25
    },
    headerRightContainer:{
        marginRight:25
    }
});

export default BlockListScreen;
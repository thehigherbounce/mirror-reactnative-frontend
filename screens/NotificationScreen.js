import React, { useState , useRef ,useEffect} from 'react';
import { View, Image, Text, RefreshControl, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import SvgUri from 'react-native-svg-uri';

import { useSelector , useDispatch } from 'react-redux';
import io from "socket.io-client";

import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_500Medium,
    Montserrat_800ExtraBold, 
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';

import {API_URL, SOCKET_URL, default_photo, windowWidth} from '../config/config';

const NotificationScreen = (props) => {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    
    const [loadingAlert,setLoadingAlert] = useState(false);
    
    let socket = null;

    const [notiList,setNotiList] = useState([]);

    const [refreshing, setRefreshing] = useState(true);
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_500Medium,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });

    useEffect(() => {
        getData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        getData();
    }

    const getData = () => {
        fetch(`${API_URL}/get_notification_list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    setNotiList(jsonRes.noti_data);
                    setRefreshing(false);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    const goFeed = () => {
        props.navigation.navigate('Feed');
    };
    
    const goProfile = () => {
        props.navigation.navigate('Account',{title:user.name});
    }
    
    const goSearch = () => {
        props.navigation.navigate('Search');
    }

    const acceptUser = (follower_email,noti_id) => {
        fetch(`${API_URL}/accept_follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                follower_email:follower_email,
                noti_id:noti_id
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    socket = io(SOCKET_URL);
                    socket.emit('socket_follow_user',follower_email);
                    onRefresh();
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    const declineUser = (follower_email,noti_id) => {
        fetch(`${API_URL}/decline_follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                follower_email:follower_email,
                noti_id:noti_id
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    onRefresh();
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    const goToProfile = (item) => {
        props.navigation.navigate('Profile', {
            owner: {
                email:item.follower_email,
                name:item.user[0].name,
                photo:item.user[0].photo,
                is_public:item.user[0].is_public
            },
            profile_type : item.user[0].is_public? 1: 0
        });
    }

    const renderItem = (item,key) => {
        
        var timeDiff = item.timeDiff / 1000;
        
        var time_str = "";
        if(timeDiff < 60)
            time_str = " just now";
        
        if(timeDiff > (3600 * 24))
        {
            time_str = " " + parseInt(timeDiff / 3600 / 24) + " days";
            timeDiff = timeDiff % (3600 * 24);
        }
            
        if(timeDiff > 3600)
        {
            time_str += " " + parseInt(timeDiff / 3600) + " hours";
            timeDiff = timeDiff % 3600;
        }
            
        if(timeDiff > 60)
            time_str += " " + parseInt(timeDiff / 60) + " mins";
        
        return (
            <View key={key} style={{
                marginHorizontal:30,
                marginTop:24,
                width:windowWidth - 60}}
            >
                <TouchableOpacity style={styles.notiItem} onPress={()=>goToProfile(item)}>
                    <Image source={{uri: item.user[0].photo==''?default_photo:item.user[0].photo}} style={styles.notiImg} />
                    <View style={styles.notiContent}>
                        {item.type == 1 && <Text><Text style={styles.notiFollowName}>{item.user[0].name}</Text><Text style={styles.notiDescription}> has followed you!</Text></Text>}
                        {item.type == 0 && <Text><Text style={styles.notiFollowName}>{item.user[0].name}</Text><Text style={styles.notiDescription}> wants to follow you</Text></Text>}
                        {item.type == 2 && <Text><Text style={styles.notiDescription}>You followed </Text><Text style={styles.notiFollowName}>{item.user[0].name}</Text></Text>}
                        <Text style={styles.notiTime}>{time_str}</Text>
                    </View>
                </TouchableOpacity>
                {item.type == 0 && <View style={styles.notiButtons}>
                    <TouchableOpacity style={styles.acceptButton} onPress={()=>acceptUser(item.follower_email,item._id)}>
                        <Text style={styles.acceptButtonText}>ACCEPT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.declineButton} onPress={()=>declineUser(item.follower_email,item._id)}>
                        <Text style={styles.declineButtonText}>DECLINE</Text>
                    </TouchableOpacity>
                </View>
                }
            </View>
        )
    }

    return (
        <View style={styles.feedContainer}>
            <View style={styles.header}>
                {fontsLoaded &&  <TouchableOpacity style={styles.menu_left} onPress={()=>goFeed()}>
                        <SvgUri
                            style={styles.menu_img}
                            source={require('../assets/feed.svg')}
                        />
                    </TouchableOpacity>}
                <View style={styles.hrContainer}>
                    
                    <TouchableOpacity style={styles.menu} onPress={()=>goSearch()}>
                        <SvgUri
                            style={styles.menu_img}
                            source={require('../assets/search.svg')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menu} onPress={()=>goProfile()}>
                        <SvgUri
                            style={styles.menu_img}
                            source={require('../assets/profile.svg')}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {fontsLoaded && <Text style={styles.notiTitle}>NOTIFICATIONS</Text>}
            <ScrollView style={styles.scrollContainer}  refreshControl = {<RefreshControl refreshing={refreshing} onRefresh={()=>onRefresh()}/>}  contentContainerStyle={{
                alignItems:'center'
            }}>
                {
                    notiList.map((item,key)=>
                        renderItem(item,key)
                    )
                }
            </ScrollView>
            <AwesomeAlert
                show={loadingAlert}
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
    notiFollowName:{
        fontFamily:'Montserrat_600SemiBold',
        fontSize:14,
        lineHeight:17
    },
    acceptButton:{
        backgroundColor:'rgba(242, 20, 73, 1)',
        width:windowWidth - 96 - 30,
        height:35,
        borderRadius:2,
        alignItems:'center',
        justifyContent:'center'
    },
    acceptButtonText:{
        color:'white',
        fontSize:14,
        fontFamily:'Montserrat_700Bold',
        lineHeight:17
    },
    declineButton:{
        marginTop:4,
        backgroundColor:'white',
        borderWidth:1,
        borderColor:'rgba(229, 229, 229, 1)',
        width:windowWidth - 96 - 30,
        height:35,
        borderRadius:2,
        alignItems:'center',
        justifyContent:'center'
    },
    declineButtonText:{
        color:'rgba(0, 0, 0, 0.8)',
        fontSize:14,
        fontFamily:'Montserrat_700Bold',
        lineHeight:17
    },
    notiButtons:{
        marginLeft:64,
        marginTop:18
    },
    notiDescription:{
        fontFamily:'Montserrat_500Medium',
        fontSize:14,
        lineHeight:17
    },
    notiTime:{
        fontFamily:'Montserrat_500Medium',
        fontSize:13,
        color:'rgba(0, 0, 0, 0.5)'
    },
    notiContent:{
        marginLeft:14,
        justifyContent:'center'
    },
    notiTitle:{
        fontSize:16,
        lineHeight:20,
        fontFamily:'Montserrat_700Bold',
        marginLeft:25,
        marginTop:10
    },
    notiItem:{
        flex:1,
        flexDirection:'row'
    },
    notiImg:{
        width:50,
        height:50,
        borderRadius:50,
        borderWidth:3,
        borderColor:'rgba(229, 229, 229, 1)'
    },
    feedContainer:{
        flex:1,
        paddingTop:25,
        justifyContent:'space-between',
        backgroundColor:'white'
    }, 
    menu_img:{
        width:24,
        height:24,
        justifyContent:'center',
        alignItems:'center'
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width:windowWidth-48,
        marginRight:24,
        height:50,
        marginLeft:24,
    },
    hrContainer:{
        flexDirection:'row',
        alignItems:'center'
    },
    headerTitle:{
        fontFamily:'Montserrat_800ExtraBold',
        fontSize:20,
        lineHeight:24,
        color:'black'
    },
    scrollContainer:{
        marginTop:10,
        marginLeft:1,
        flex:1
    },
    menu:{
        height:50,
        marginLeft:24,
        justifyContent:'center',
        alignItems:'center'
    },
    menu_left:{
        height:50,
        justifyContent:'center',
        alignItems:'center'
    },

});

export default NotificationScreen;
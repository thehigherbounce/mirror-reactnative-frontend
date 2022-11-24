import React, { useState ,useRef, useEffect} from 'react';
import { View, RefreshControl, ScrollView,  Image, Text, StyleSheet, TouchableOpacity, ImageBackground} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import SvgUri from 'react-native-svg-uri';
import Toast from './MyToast';
import { useSelector , useDispatch } from 'react-redux';
import { setUser } from '../store/actions/index'
import { LinearGradient } from 'expo-linear-gradient';
import io from "socket.io-client";
import SwipeDownModal from 'react-native-swipe-down';
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';
  
import {API_URL,SOCKET_URL , default_photo, upload_url, upload_preset, windowWidth,windowHeight} from '../config/config';

let user = null;

const FeedScreen = (props) => {
    user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    const [feed_pinned , setFeedPinned] = useState([]); //followed user list
    const [feed_other, setFeedOther] = useState([]);
    const [loadingAlert,setLoadingAlert] = useState(false);
    const defaultToast = useRef(null);
    const updateToast = useRef(null);
    const [refreshing, setRefreshing] = useState(true);
    const [showModal,setShowModal] = useState(false);
    let socket = null;

    const [newMsg , setNewMsg] = useState(user.noti_status);
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_900Black,
        Montserrat_400Regular
    });

    const onRefresh = () => {
        setRefreshing(true);
        loadFollowList();
    }

    const loadFollowList = async () => {
        fetch(`${API_URL}/getUserFollowList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:user.email}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    console.log(res);
                } else {
                    user.follow_list = jsonRes.data[0].follow_list;
                    dispatch(setUser(user));
                    loadFeedList();
                }
            }
            catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    const loadFeedList = async () => {
        let loadList = [];
        user.follow_list.map((item)=>{
                loadList.push(item.name);
        })

        fetch(`${API_URL}/get_users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({follow_list:loadList}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    console.log(res);
                } else {
                    const retData = jsonRes.data;
                    console.log("feedlist")
                    let pinned_list = [],other_list=[];
                    user.follow_list.map((elem)=>{
                        if(elem.type == 0) return;
                        const tmp_item = retData.find(element => element.email == elem.name);
                        let tmp_react_count = [0,0,0,0,0,0,0];
                        tmp_item.reaction.map((item)=>{
                            tmp_react_count[item.type] ++;
                        });
                        let max_react_count = 0;
                        let max_type = 0;
                        tmp_react_count.map((item,key)=>{
                            if(max_react_count < item)
                            {
                                max_react_count = item;
                                max_type = key;
                            }
                        })
                        let feed_item={
                            name:tmp_item.name,
                            email:tmp_item.email,
                            photo:tmp_item.photo,
                            is_public:tmp_item.is_public,
                            follow_list:tmp_item.follow_list,
                            block_list:tmp_item.block_list,
                            new:elem.new,
                            reactType:max_type
                        }
                        if(elem.pinned == true)
                            pinned_list.push(feed_item);
                        else
                            other_list.push(feed_item);
                    })
                
                    setFeedPinned(pinned_list);
                    setFeedOther(other_list);
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

    //get followed user list
    useEffect(() => {
        socket = io(SOCKET_URL);
        socket.on("socket_follow_user", msg => {
            console.log("socket on");
            if(msg == user.email){
                user.noti_status ++;
                dispatch(setUser(user));
                setNewMsg(newMsg+1);
            }
       });
        
       loadFeedList();;

        const unsubscribe = props.navigation.addListener('didFocus', () => {
            setRefreshing(true);
            loadFollowList();
        });
        return () => {
            unsubscribe;
        }
    }, []);

    // on update my photo
    const updateMyPhoto = (secure_url) => {
        const payload = {
            name:user.email,
            url:secure_url
        }
        fetch(`${API_URL}/update_photo`, {
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
                } else {
                    //reload feed lit
                    user.photo = secure_url;
                    dispatch(setUser(user));
                    loadFollowList();
                    updateToast.current.hideToast(10);
                    defaultToast.current.showToast('Your picture has been updated with success');
                    
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }
    const onPineSomeone = () =>{

    }
    //open image file
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 5], 
          quality: 1,
          base64:true,
        });
    
        if (!result.cancelled) {
            let base64Img = `data:image/jpg;base64,${result.base64}`
            let data = {
                "file": base64Img,
                "upload_preset": upload_preset,
            }
            
            updateToast.current.showToast("wait...","UPDATING",1000000);
            fetch(upload_url, {
                body: JSON.stringify(data),
                headers: {
                  'content-type': 'application/json'
                },
                method: 'POST',
              }).then(async r => {
                  let data = await r.json();
                  updateMyPhoto(data.secure_url);
            }).catch(err=>console.log(err))
        }
      };

    //render full name to first & last
    const renderName = (name) => {
        const fl_name = name.split(' ');
        const first_name = fl_name[0];
        const last_name = fl_name.length > 1 ? fl_name[1]:'';
        return (
            <View marginTop={-162} marginLeft={3}>
                <Text style={styles.first_name}>{first_name}</Text>
            </View>
        )
    }

    //go to profile page
    const selectPerson = (item) => {
        if(item.is_public)
        {
            props.navigation.navigate('Profile', {
                owner: item,
                profile_type : 1
            });
        }
        else{
            // check accepted
            user.follow_list.map((fitem) => {
                if(fitem.name == item.email)
                {
                    props.navigation.navigate('Profile', {
                        owner: item,
                        profile_type : fitem.type
                    });
                }           
            });
        }
    }

    //render each profile
    const renderProfile = (item,key,pinned) => {
        let curImgUrl = '';
        switch(item.reactType){
            case 1:
                curImgUrl = require('../assets/reactions/1.png');
                break;
            case 2:
                curImgUrl = require('../assets/reactions/2.png');
                break;
            case 3:
                curImgUrl = require('../assets/reactions/3.png');
                break;
            case 4:
                curImgUrl = require('../assets/reactions/4.png');
                break;
            case 5:
                curImgUrl = require('../assets/reactions/5.png');
                break;
            case 6:
                curImgUrl = require('../assets/reactions/6.png');
                break;
        }
        let sty = styles.gallery_item_pinned;
        if(pinned == false){
            sty=key%3==1?styles.gallery_item_middle:styles.gallery_item;
        }
        return(
            <TouchableOpacity key={key} style={sty} onPress={()=>selectPerson(item)}>
                {item.new&&
                    <View style={styles.photoBlackOverlay}>
                        <ImageBackground style={styles.photo} 
                            source={{
                            uri: item.photo==''?default_photo:item.photo
                            }}>
                            <LinearGradient
                                start={[0,1]}
                                start={[0,0]}
                                colors={['rgba(0,0,0,0.18))', 'rgba(0, 0, 0, 1)']}
                                width={'100%'}
                                height={'100%'}
                                style={styles.newPhotoContainer}>
                                    {item.reactType > 0 && <Image style={styles.emojiImg} source={curImgUrl}></Image>}
                            </LinearGradient>
                        </ImageBackground>
                    </View> 
                }
                {!item.new && <Image style={styles.photo} 
                    source={{
                    uri: item.photo==''?default_photo:item.photo
                    }}>
                </Image>}
                {item.new && <View style={styles.indicator_new}>
                    <Text style={styles.indicator_new_text}>NEW</Text>
                </View>}
                {renderName(item.name)}
            </TouchableOpacity>
            
        )
    };

    const goProfile = () => {
        props.navigation.navigate('Account',{title:user.name});
    }
    
    const goSearch = () => {
        props.navigation.navigate('Search');
    }

    const goNotification = () => {
        setNewMsg(0);
        user.noti_status = 0;
        dispatch(setUser(user));
        props.navigation.navigate('Notification');
    }
    const createNew =() =>{
        const [value, setValue] = useState(0);
        return () => setValue(value => value + 1);
    }

    return (
        <View style={styles.feedContainer}>
            <View style={styles.header}>
                {fontsLoaded &&  <View style={styles.hrContainer}>
                    <Text style={styles.headerTitle}>MIRRER</Text>
                </View>}
                <View style={styles.hrContainer}>
                    
                    <TouchableOpacity style={styles.menu} onPress={()=>goSearch()}>
                        <View style={styles.menu_icon}>
                            <SvgUri
                                style={styles.menu_img}
                                source={require('../assets/search.svg')}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menu} onPress={()=>goNotification()}>
                        <View style={styles.menu_icon}>
                            <SvgUri
                                style={styles.menu_img}
                                source={require('../assets/notification.svg')}
                            />
                        </View>
                        {newMsg > 0&& <View style={styles.newMsgCircle}>
                            <Text style={styles.newMsgNumber}>{newMsg}</Text>
                        </View>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menu} onPress={()=>goProfile()}>
                        <View style={styles.menu_icon}>
                            <SvgUri
                                style={styles.menu_img}
                                source={require('../assets/profile.svg')}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.topTitle}>
                <Text style={styles.topLabel}>PINNED</Text>
                <SvgUri style={[styles.menu_img,{opacity:0.4}]}source={require('../assets/pin.svg')}/>
            </View>
            <ScrollView showsHorizontalScrollIndicator={false} style={styles.horizonScrollContainer} horizontal>
                {fontsLoaded &&
                    <View style={styles.container}>
                        {
                            feed_pinned.map((item,key) => 
                                renderProfile(item,key,true)
                            )
                        }         
                    </View>
                }
                {
                    feed_pinned.length<2&&
                    <View style={{marginTop:30,marginLeft:70}}>
                        <Text style={styles.describeText}>Your pinned users here</Text>
                        <TouchableOpacity style={styles.pinSomeone} onPress={onPineSomeone}>
                            <Text style={styles.buttonText}>PIN SOMEONE</Text>
                        </TouchableOpacity>
                    </View>
                }
            </ScrollView>
            <View style={{marginTop:19,marginLeft:6,marginBottom:8}}>
                <Text style={styles.topLabel}>OTHERS</Text>
            </View>
            <ScrollView style={styles.scrollContainer} refreshControl = {<RefreshControl refreshing={refreshing} onRefresh={()=>onRefresh()}/>}>
                {fontsLoaded && 
                    <View style={styles.container}>
                        {
                            feed_other.map((item,key) => 
                                renderProfile(item,key,false)
                            )
                        }         
                    </View> 
                }
            </ScrollView>
            {
                feed_other.length<1&&<View style={styles.originBack}>
                    <View style={styles.dancingRec}></View>
                    <View style={styles.levitateRec}></View>
                    <View style={styles.jumpingRec}></View>
                    <SvgUri style={styles.dancing}source={require('../assets/dancing.svg')}/>
                    <SvgUri style={styles.levitate}source={require('../assets/levitate.svg')}/>
                    <SvgUri style={styles.jumping}source={require('../assets/jumping.svg')}/>
                    <Text style={styles.describeUpText}>Mirrer is nicer with your friends</Text>
                    <Text style={styles.describeDownText}>start adding your friends</Text>
                </View>
            }
            <AwesomeAlert
                show={loadingAlert}
                showProgress={true}
                title="Processing"
                message="Wait a moment..."
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
            />
            <SwipeDownModal
                modalVisible={showModal}
                //if you don't pass HeaderContent you should pass marginTop in view of ContentModel to Make modal swipeable
                ContentModal={
                    <View style={styles.new_picture}>
                        <TouchableOpacity style={styles.new_button} onPress={pickImage}>
                            <View style={styles.thinBox}></View>
                            <Text style={styles.newButtonText}>NEW PICTURE</Text>
                        </TouchableOpacity>
                    </View>
               }
               ContentModalStyle={styles.Modal}
               onRequestClose={() => {setShowModal(false)}}
               onClose={() => {
                   setShowModal(false);
               }}
            />
            <Toast ref = {defaultToast} backgroundColor = "#57D172" style={styles.myToast}/>
            <Toast ref = {updateToast} textColor="#000000" backgroundColor = "#E5E5E5" style={styles.myToast}/>
        </View>
    );
};

const styles = StyleSheet.create({
    feedContainer:{
        flex:1,
        paddingTop:25,
     //   justifyContent:'space-between',
        backgroundColor:'white'
    },
    Modal: {
        backgroundColor: 'rgba(0,0,0,0)',
        marginTop:windowHeight-72
    },
    emojiImg:{
        width:30,
        height:30,
      //  marginTop:-90
    },
    originBack:{
        width:'100%',
        height:'100%',
        position:'absolute',
        alignItems:'center'
    },
    dancingRec:{
        position:'absolute',
        top:315,
        right:103,
        backgroundColor:'#E088FF',
        height:160,
        width:100,
        transform: [{ rotate: '-24.51deg'}]
    },
    levitateRec:{
        position:'absolute',
        top:510,
        left:65,
        backgroundColor:'#57D172',
        height:160,
        width:100,
        transform: [{ rotate: '-24.51deg'}]
    },
    jumpingRec:{
        position:'absolute',
        top:525,
        right:35,
        backgroundColor:'rgba(221,46,68,0.7)',
        height:160,
        width:100,
        transform: [{ rotate: '7.25deg'}]
    },
    dancing:{
        position:'absolute',
        top:365,
        right:100,
    },
    levitate:{
        position:'absolute',
        top:545,
        left:82,
    },
    jumping:{
        position:'absolute',
        top:575,
        right:57
    },
    newMsgCircle:{
        position: 'absolute',
        width: 20,
        height: 20,
        left: 22,
        bottom: 32,
        backgroundColor: '#F21449',
        borderWidth: 2,
        borderRadius: 50,
        borderColor:'#FFFFFF',
        justifyContent:'center',
        alignItems:'center'
    },
    newMsgNumber:{
        fontFamily:'Montserrat_900Black',
        fontSize:12,
        lineHeight:15,
        color:'white',
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
        width:windowWidth,
        paddingRight:24,
        height:60,
        paddingLeft:15,
    },
    myToast:{
        width:'100%',
        position:'absolute',
        bottom:0,
        backgroundColor:'#57D172'
    },
    pinSomeone: {
        width: 141,
        marginTop:16,
        justifyContent: 'center',
        height:31,
        alignItems:'center',
        backgroundColor:'rgba(221, 46, 68, 0.85)'
    },
    buttonText:{
        fontFamily:'Montserrat_600SemiBold',
        fontSize:12,
        lineHeight:15,
        color:'white'
    },
    describeUpText:{
        fontFamily:'Montserrat_800ExtraBold',
        fontSize:16,
        lineHeight:20,
        color:'black',
        marginTop:455,
        marginBottom:9
    },
    describeDownText:{
        fontFamily:'Montserrat_600SemiBold',
        fontSize:12,
        lineHeight:15,
        color:'rgba(0,0,0,0.6)',
        marginBottom:180
    },
    container: {
    //    paddingTop:10,
        paddingLeft:6,
    //    paddingRight:17,
        backgroundColor:'white',
     //   marginBottom:50,
        flexDirection:'row',
        flexWrap:'wrap'
    },
    horizonScrollContainer:{
        marginLeft:1,
        flex:1,
        maxHeight:164,
    },
    scrollContainer:{
        marginLeft:1,
        flex:1,
        overflow: 'hidden'
    },
    menu:{
        height:50,
        marginLeft:15,
        justifyContent:'center',
        alignItems:'center'
    },
    menu_icon:{
        width:36,
        height:36,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:50,
        backgroundColor:'#D7D7D7'
    },
    rightMenu:{
        height:50,
        marginRight:24,
        paddingTop:12,
        justifyContent:'center',
        alignItems:'center'
    },
    first_name:{
        textAlign:'left',
        fontFamily:'Montserrat_700Bold',
        fontSize:13,
        lineHeight:16,
        color:'rgba(255,255,255,0.6)'
    },
    last_name:{
        textAlign:'center',
        fontSize:10,
        lineHeight:12,
        fontFamily:'Montserrat_400Regular'
    },
    indicator_update:{
        width:"100%",
        height:40,
        marginTop:-40,
        backgroundColor:'rgba(255, 255, 255, 0.5)',
        justifyContent:'center',
        alignItems:'center'
    },
    indicator_new:{
        // width:"100%",
        height:40,
        marginTop:-45,
        backgroundColor:'rgba(0,0,0,0)',
        justifyContent:'center',
        alignItems:'center'
    },
    indicator_update_text:{
        color:'black',
        fontFamily:'Montserrat_700Bold',
    },
    indicator_new_text:{
        color:'#FFCC4D',
        fontFamily:'Montserrat_900Black',
        fontSize:24
    },
    describeText:{
        fontFamily:'Montserrat_400Regular',
        fontSize:12,
        lineHeight:15,
        color:'black'
    },
    photo:{
        height:'100%',
        width:'100%',
        marginBottom:3,
        backgroundColor:'#FFFFFF'
        // resizeMode:'stretch'
    },
    photoBlackOverlay:{
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0, 0, 0, 0)',
        alignItems:'center'
    },
    newPhotoContainer:{
        width:'100%',
        padding:3,
        alignItems:'center',
        justifyContent:'center'
    },
    gallery_item_pinned:{
        width:windowWidth*31/100,
        height:164,
        marginRight:5
    },
    gallery_item:{
        width:"31%",
        height:164,
        marginBottom:9
    },
    gallery_item_middle:{
        width:"31%",
        marginLeft:'2.5%',
        marginRight:'2.5%',
        height:164,
        marginBottom:9
    },
    topTitle:{
        flexDirection:'row',
        alignItems:'center',
        marginTop:5,
        marginBottom:8,
        marginLeft:6
    },
    hrContainer:{
        flexDirection:'row',
        alignItems:'center'
    },
    headerTitle:{
        fontFamily:'Montserrat_900Black',
        fontSize:24,
        lineHeight:29,
        color:'rgba(221, 46, 68, 0.85)'
    },
    underLabel:{
        fontFamily:'Montserrat_400Regular',
        fontSize:10,
        lineHeight:12,
        color:'black'
    },
    topLabel:{
        fontFamily:'Montserrat_800ExtraBold',
        fontSize:16,
        lineHeight:20,
        color:'rgba(119,119,119,0.4)',
        marginRight:5
    },
    new_picture:{
        width: windowWidth,
        height: 48,
        alignItems:'center',
    },
    new_button:{
        width: 282,
        height: 48,
        alignItems:'center',
        backgroundColor: '#FFCC4D',
        borderTopLeftRadius:35,
        borderTopRightRadius:35
    },
    newButtonText:{
        fontFamily:'Montserrat_800ExtraBold',
        fontSize: 16,
        marginTop:8,
        lineHeight: 20,
        color:'black'
    },
    thinBox:{
        width: 58,
        height: 0,
        marginTop:9,
        borderWidth: 2,
        borderStyle:'solid',
        borderColor: 'black',  
        borderRadius:50
    }
});

export default FeedScreen;

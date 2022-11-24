import React, { useState , useRef,useEffect} from 'react';
import { View, Image, Text, RefreshControl, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {SingleImage} from "rn-instagram-image";
import * as ImagePicker from 'expo-image-picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import SvgUri from 'react-native-svg-uri';
import SwipeDownModal from 'react-native-swipe-down';
import Toast from './MyToast';
import ImageOverlay from "react-native-image-overlay";

import { useSelector , useDispatch } from 'react-redux';
import { setUser } from '../store/actions/index';
import io from "socket.io-client";
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black, 
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';

import {API_URL, SOCKET_URL,default_photo, windowHeight, windowWidth} from '../config/config';

const ProfileScreen = (props) => {
    let user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    
    let owner = props.navigation.state.params.owner; //profile owner

    const defaultToast = useRef(null);
    const updateToast = useRef(null);
    const [showModal,setShowModal] = useState(false);
    const [showConfirmModal,setShowConfirmModal] = useState(false);
    const [refreshing, setRefreshing] = useState(true);

    const [loadingAlert,setLoadingAlert] = useState(false);

    const [fStatus,setFStatus] = useState(false);

    const [pStatus,setPStatus] = useState(false);

    const [ptype,setPtype] = useState(props.navigation.state.params.profile_type);

    const [acceptStatus,setAcceptStatus] = useState(false);

    let socket = null;

    const [flagStatus,setFlagStatus] = useState({
        fUser:0,
        fCont:0,
        fBlock:0
    })

    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_900Black,
        Montserrat_400Regular
    });

    const [rCnt,setRCnt] = useState([0,0,0,0,0,0,0]);
    const [value,setValue] = useState(0);

    //get Reaction Data
    useEffect(() => {
        getReaction();
        setFollowFlow(user.follow_list);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadFollowList();
    }

    const setFollowFlow = (f_list) => {
        setFStatus(false);
        setPtype(owner.is_public);
        f_list.map((item) => {
            if(item.name == owner.email)
            {
                setFStatus(true);
                setPStatus(item.pinned);
                setPtype(item.type);
                
                if(item.new)
                {
                    item.new = false;
                    removeNewStatus()
                }
                return;
            }           
        });
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
                    setFollowFlow(jsonRes.data[0].follow_list);
                    getReaction();
                }
            }
            catch (err) {
                console.log(err);
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    // set new status false
    const removeNewStatus = () => {
        fetch(`${API_URL}/removeNewStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:user.email,follower:owner.email}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                }
                
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }
    
    const getReaction = () => {
        
        fetch(`${API_URL}/getReaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:owner.email,action_email:user.email}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    const reactionList = jsonRes.data;
                    flagStatus.fUser = jsonRes.fUser;
                    flagStatus.fCont = jsonRes.fCont;
                    for (let index = 1; index < 7; index++) {
                        rCnt[index] = 0;
                    }
                    reactionList.map((item)=>{
                        rCnt[item.type] = rCnt[item.type] + 1;
                    });
                    setValue(value + 1);
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
    const updateMyPhoto = (secure_url) => {
        setShowConfirmModal(false);
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
                    owner.photo = user.photo;
                    dispatch(setUser(user));
                    updateToast.current.hideToast(10);
                    defaultToast.current.showToast('Your picture has been '+(secure_url==''?'removed':'updated')+' with success');
                    loadFollowList();           
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
                {fontsLoaded && <Text><Text style={styles.first_name}>{first_name} </Text><Text style={styles.last_name}>{last_name}</Text></Text>}
                <View style={styles.star_icon}>
                    <SvgUri
                        source={require('../assets/Star5.svg')}
                    />
                </View>
            </View>
        )
    };

    //render full name to first & last in swipe modal
    const renderName_modal = (name) => {
        const fl_name = name.split(' ');
        const first_name = fl_name[0];
        const last_name = fl_name.length > 1 ? fl_name[1]:'';
        return (
            <TouchableOpacity activeOpacity={1} style={{marginTop:27}}>
                {fontsLoaded && <Text><Text style={styles.name_modal}>{first_name} </Text><Text style={styles.name_modal}>{last_name}</Text></Text>}
            </TouchableOpacity>
        )
    };

    // tap to view reaction history
    const goReactionHistory = (type) => {
        props.navigation.navigate('ReactionHistory', {
            user:user,
            type:type,
            rCnt:rCnt
        });
    };

    // tap to add reaction
    const addReaction = async (type) => {
        if(owner.email == user.email)
        {
            if(rCnt[type] == 0) return;
            
            goReactionHistory(type);
            return;
        }

        const payload ={
            type:type,
            email:owner.email,
            react_email:user.email
        }

        fetch(`${API_URL}/addReaction`, {
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
                    //add reaction success
                    rCnt[type] = rCnt[type] + 1;
                    setValue(value + 1);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    const goBack = () => {
        props.navigation.navigate('Feed');
    };
    
    const goUserProfile = () => {
        props.navigation.navigate('Account', {
            title: user.name
        });
    };

    const addFollow = () => {
        setShowModal(false);
        fetch(`${API_URL}/addFollowUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                add_email:owner.email,
                name:user.name,
                add_type:owner.is_public
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    user.follow_list.push({name:owner.email,new:false,fdate:new Date(),type:owner.is_public?1:0});

                    dispatch(setUser(user));
                    setFStatus(true);

                    //send notification socket
                    socket = io(SOCKET_URL);
                    socket.emit('socket_follow_user',owner.email);
                    
                    if(owner.is_public)
                        defaultToast.current.showToast('You have followed '+owner.name);
                    else 
                        defaultToast.current.showToast('You have sent request to '+owner.name);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }
    
    const removeFollow = () => {
        setShowModal(false);
        fetch(`${API_URL}/removeFollowUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                remove_email:owner.email
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    defaultToast.current.showToast('You have unfollowed '+owner.name);
                    const tIndex = user.follow_list.findIndex(element => element.name == owner.email);
                    user.follow_list.splice(tIndex,1);
                    dispatch(setUser(user));
                    setFStatus(false);

                    setTimeout(() => {
                        goBack();
                    }, 1500);  
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    const setPin = (val) => {
        setShowModal(false);
        fetch(`${API_URL}/setPinUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                pin_email:owner.email,
                content:val
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    defaultToast.current.showToast(val?'You have pinned ':'You have unpinned '+owner.name);
                    const tIndex = user.follow_list.findIndex(element => element.name == owner.email);
                    user.follow_list[tIndex].pinned = val;
                    dispatch(setUser(user));
                    setPStatus(val);
                    setTimeout(() => {
                        goBack();
                    }, 1500);  
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    const blockUser = () => {
        setShowModal(false);
        fetch(`${API_URL}/blockUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                blocked_email:owner.email,
                fStatus:fStatus
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    user.block_list.push(owner.email);
                    dispatch(setUser(user));
                    flagStatus.fBlock = 1;
                    defaultToast.current.showToast('You have Blocked '+owner.name);
                    setFStatus(false);
                    setTimeout(() => {
                        goBack();
                    }, 1500);  
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };
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

    const flagUser = () => {
        setShowModal(false);
        fetch(`${API_URL}/flagUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:owner.email,
                action_email:user.email,
                flag_type:1
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    flagStatus.flagUser = 1;
                    defaultToast.current.showToast('You have Flagged '+owner.name);
                    setTimeout(() => {
                        goBack();
                    }, 1500);  
                    // setFStatus(false);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    const flagContent = () => {
        setShowModal(false);
        fetch(`${API_URL}/flagUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:owner.email,
                action_email:user.email,
                flag_type:2
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    flagStatus.flagContent = 1;
                    defaultToast.current.showToast('You have Flagged '+owner.name+'\'s content');
                    setTimeout(() => {
                        goBack();
                    }, 1500);  
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
        <ScrollView style={styles.container} refreshControl = {<RefreshControl refreshing={refreshing} onRefresh={()=>onRefresh()}/>}>
            <View style={styles.header}>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity style={styles.menu} onPress={() => goBack()}>
                        <View style={styles.menu_icon}>
                            <SvgUri
                                style={styles.menu_img}
                                source={require('../assets/feed.svg')}
                            />
                        </View>
                    </TouchableOpacity>
                    {fontsLoaded &&  <View style={styles.hrContainer}>
                        <Text style={styles.headerTitle}>MIRRER</Text>
                    </View>}
                </View>
                {(user.email == owner.email &&owner.photo!='')?<View style={{flexDirection:'row'}}>
                    <TouchableOpacity style={styles.menu} onPress={() => {setShowConfirmModal(true)}}>
                        <View style={styles.menu_icon}>
                            <SvgUri
                                style={styles.menu_img}
                                source={require('../assets/Close.svg')}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menu} onPress={() => goBack()}>
                        <View style={styles.menu_icon}>
                            <SvgUri
                                style={styles.menu_img}
                                source={require('../assets/user_comment.svg')}
                            />
                        </View>
                    </TouchableOpacity>
                </View>:
                <TouchableOpacity style={styles.menu} onPress={() => {user.email == owner.email?goUserProfile():setShowModal(true)}}>
                    <View style={styles.menu_icon}>
                        <SvgUri
                            style={styles.menu_img}
                            source={require('../assets/threeDots.svg')}
                        />
                    </View>
                </TouchableOpacity>}
            </View>
            {renderName(owner.name)}
            <View style={styles.photoContainer}>
                    {ptype == 1 && <Image style={styles.photo}source={{uri: owner.photo==''?default_photo:owner.photo}}></Image>}
                    {ptype == 0 && <ImageOverlay 
                        width={'100%'}
                        height={windowHeight-300} 
                        source ={{uri: owner.photo==''?default_photo:owner.photo}}
                    >
                        <View style={[styles.photo,{backgroundColor:'rgba(0,0,0,0.92)'}]}>
                        </View>
                    </ImageOverlay>}
                     {/* <ImageViewer style={styles.photo} imageUrls={[{url:owner.photo==''?default_photo:owner.photo}]}/> */}
                    {ptype == 0 && <View position={'absolute'}>
                        <Text style={styles.blockedText}>THIS PROFILE IS PRIVATE</Text>
                        <Text style={styles.blockedText_sc}>Follow to see the picture status</Text>
                    </View>}
            </View>
            {ptype == 1 &&
                <View>{(user.email == owner.email&&owner.photo=='')?
                    <View style={styles.reactContainer}>
                        <TouchableOpacity style={styles.uploadButton} onPress={()=>pickImage()}>
                            <Text style={styles.uploadButtonText}>UPLOAD NEW PICTURE</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <View style={styles.reactContainer}>    
                        <View style={styles.emojiLineContainer}>
                            <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(1)}>
                                {rCnt[1] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/1.png')} />}
                                {rCnt[1] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/1_0.png')} />}
                                <Text style={styles.emojiCount}>{rCnt[1] > 0?rCnt[1]:''}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(2)}>
                                {rCnt[2] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/2.png')} />}
                                {rCnt[2] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/2_0.png')} />}
                                <Text style={styles.emojiCount}>{rCnt[2] > 0?rCnt[2]:''}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(3)}>
                                {rCnt[3] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/3.png')} />}
                                {rCnt[3] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/3_0.png')} />}
                                <Text style={styles.emojiCount}>{rCnt[3] > 0?rCnt[3]:''}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.emojiLineContainer,{marginTop:26}]}>
                            <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(4)}>
                                {rCnt[4] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/4.png')} />}
                                {rCnt[4] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/4_0.png')} />}
                                <Text style={styles.emojiCount}>{rCnt[4] > 0?rCnt[4]:''}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(5)}>
                                {rCnt[5] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/5.png')} />}
                                {rCnt[5] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/5_0.png')} />}
                                <Text style={styles.emojiCount}>{rCnt[5] > 0?rCnt[5]:''}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(6)}>
                                {rCnt[6] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/6.png')} />}
                                {rCnt[6] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/6_0.png')} />}
                                <Text style={styles.emojiCount}>{rCnt[6] > 0?rCnt[6]:''}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>}
                </View>
            }
            {ptype == 0 && <View style={styles.reactContainer}>
                {fStatus && <View style={styles.followButton_sr}>
                    <Text style={styles.followButtonText_sr}>SENT REQUEST...</Text>
                </View>}
                {!fStatus && <TouchableOpacity style={styles.followButton} onPress={()=>fStatus?removeFollow():addFollow()}>
                    <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>}
            </View>}
            <SwipeDownModal
                modalVisible={showModal}
                //if you don't pass HeaderContent you should pass marginTop in view of ContentModel to Make modal swipeable
                ContentModal={
                    <View style={styles.containerContent}>
                        {renderName_modal(owner.name)}
                        <View style={styles.swipeModalList}>
                            {ptype==1&&fStatus&&pStatus && <TouchableOpacity style={styles.swipeModalItem} onPress={()=>setPin(false)}>
                                <Text style={styles.ModalItemText}>UNPIN USER</Text>
                            </TouchableOpacity>}
                            {ptype==1&&fStatus&&!pStatus && <TouchableOpacity style={styles.swipeModalItem} onPress={()=>setPin(true)}>
                                <Text style={styles.ModalItemText}>PIN USER</Text>
                            </TouchableOpacity>}
                            {ptype==1&&flagStatus.fCont == 0 && <TouchableOpacity style={styles.swipeModalItem} onPress={flagContent}>
                                <Text style={styles.ModalItemText}>FLAG PICTURE</Text>
                            </TouchableOpacity>}
                            {flagStatus.fBlock == 0 && <TouchableOpacity style={styles.swipeModalItem} onPress={blockUser}>
                                <Text style={styles.ModalItemText}>BLOCK USER</Text>
                            </TouchableOpacity>}
                            {flagStatus.fUser == 0 && <TouchableOpacity style={styles.swipeModalItem} onPress={flagUser}>
                                <Text style={styles.ModalItemText}>FLAG USER</Text>
                            </TouchableOpacity>}
                            {fStatus && <TouchableOpacity style={styles.swipeModalItem} onPress={removeFollow}>
                                <Text style={styles.ModalItemText}>UNFOLLOW</Text>
                            </TouchableOpacity>}
                            {!fStatus && <TouchableOpacity style={styles.swipeModalItem} onPress={addFollow}>
                                <Text style={styles.ModalItemText}>FOLLOW</Text>
                            </TouchableOpacity>}
                        </View>
                        
                    </View>
                }
                ContentModalStyle={styles.Modal}
                onRequestClose={() => {setShowModal(false)}}
                onClose={() => {
                    setShowModal(false);
                }}
            />
            <SwipeDownModal
                modalVisible={showConfirmModal}
                //if you don't pass HeaderContent you should pass marginTop in view of ContentModel to Make modal swipeable
                ContentModal={
                    <View style={styles.containerContent}>
                        <TouchableOpacity activeOpacity={1} style={{marginTop:27}}>
                            {fontsLoaded && <Text style={styles.name_modal}>REMOVE THIS PICTURE</Text>}
                        </TouchableOpacity>
                        <View style={styles.swipeModalList}>
                            <TouchableOpacity style={styles.swipeModalItem} onPress={()=>updateMyPhoto('')}>
                                <Text style={styles.ModalItemText}>YES</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.swipeModalItem} onPress={()=>{setShowConfirmModal(false)}}>
                                <Text style={styles.ModalItemText}>NO</Text>
                            </TouchableOpacity>
                        </View>
                        
                    </View>
                }
                ContentModalStyle={styles.Modal}
                onRequestClose={() => {setShowConfirmModal(false)}}
                onClose={() => {
                    setShowConfirmModal(false);
                }}
            />
            <Toast ref = {defaultToast} backgroundColor = "#57D172" style={styles.myToast}/>
            <Toast ref = {updateToast} textColor="#000000" backgroundColor = "#E5E5E5" style={styles.myToast}/>
            <AwesomeAlert
                show={loadingAlert}
                showProgress={true}
                title="Processing"
                message="Wait a moment..."
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
            />
       </ScrollView>
    );
};

const styles = StyleSheet.create({
    blockedText:{
        fontSize:16,
        lineHeight:20,
        fontFamily:'Montserrat_400Regular',
        textAlign:'center',
        color:'rgba(255,255,255,0.8)'
    },
    blockedText_sc:{
        marginTop:15,
        fontSize:13,
        lineHeight:16,
        fontFamily:'Montserrat_700Bold',
        textAlign:'center',
        color:'rgba(255,255,255,0.8)'
    },
    buttonContainer:{
        width:windowWidth,
        alignItems:'center',
        justifyContent:'center',
        flex:1
    },
    followButtonText:{
        color:'white',
        fontSize:18,
        fontFamily:'Montserrat_700Bold'
    },
    followButton:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(221, 46, 68, 1)',
        width:213,
        height:45
    },
    uploadButtonText:{
        color:'black',
        fontSize:18,
        fontFamily:'Montserrat_700Bold'
    },
    uploadButton:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#FFCC4D',
        width:299,
        height:45
    },
    followButtonText_sr:{
        color:'black',
        fontSize:18,
        fontFamily:'Montserrat_700Bold'
    },
    followButton_sr:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'white',
        borderWidth:1,
        borderColor:'rgba(196, 196, 196, 1)',
        width:213,
        height:45
    },
    ModalItemText:{
        color:'rgba(0, 0, 0, 0.8)',
        fontFamily:'Montserrat_600SemiBold',
        fontSize:14,
        lineHeight:17
    },
    swipeModalItem:{
        marginBottom:18
    },
    myToast:{
        width:'100%',
        position:'absolute',
        bottom:0,
        backgroundColor:'#57D172'
    },
    swipeModalList:{
        marginTop:28
    },
    swipeHandler:{
        height:0,
        width:66,
        alignSelf:'center',
        borderRadius:24,
        borderBottomColor:'#C4C4C4',
        borderBottomWidth:5
    },
    containerContent: {
        position:'absolute',
        bottom:0,
        width:'100%',
        paddingHorizontal: 17,
        backgroundColor: 'white',
        borderWidth:1,
        borderColor:'rgba(0,0,0,0.2)',
     //   marginTop:windowHeight - 330,
     //   marginBottom:30,
        borderTopLeftRadius:20,
        borderTopRightRadius:20
    },
    containerHeader: {
      flex: 1,
      marginTop:windowHeight - 350,
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
    //   width:66
    },
    headerContent:{
      marginTop: 0,
    },
    Modal: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      marginTop:-10
    },
    reactContainer:{
        width:'100%',
        height:windowHeight-606,
        alignItems:'center',
        justifyContent:'center',
        //marginTop:39,
        //flex:1,
        paddingHorizontal:'10%',
        backgroundColor:'white'
    },
    emojiLineContainer:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    emojiContainer: {
        justifyContent:'center',
        alignItems:'center',
        width:'33%'
    },
    emojiImg: {
        width: 36,
        height: 36
    },
    emojiCount:{
        marginTop:9,
        fontSize:13,
        height:16,
        color:'rgba(0, 0, 0, 0.8)',
        fontFamily:'Montserrat_700Bold'
    },
    nameContainer:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:21,
        marginTop:10,
    },
    first_name:{
        textAlign:'center',
        fontSize:14,
        lineHeight:17,
        fontFamily:'Montserrat_700Bold',
        color:'rgba(0,0,0,0.65)'
    },
    last_name:{
        textAlign:'center',
        fontSize:14,
        lineHeight:17,
        fontFamily:'Montserrat_700Bold',
        color:'rgba(0,0,0,0.65)'
    },
    name_modal:{
        fontSize:18,
        lineHeight: 22,
        color:'rgba(0, 0, 0, 0.5)',
        fontFamily:'Montserrat_800ExtraBold',
    },
    container: {
        paddingTop:10,
     //   display: "flex", 
     //   flexDirection: "row", 
     //   flexWrap: "wrap",
     //   flex:1,
        backgroundColor:'white'
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        width:windowWidth,
        paddingRight:7,
        marginTop:12,
        paddingLeft:21,
        alignItems:'center'
    },
    menu:{
        height:70,
        justifyContent:'center',
        alignItems:'flex-end',
        marginRight:11
    },
    menu_img:{
      //  width:24,
      //  height:24,
        justifyContent:'center',
        alignItems:'center'
    },
    menu_icon:{
        width:32,
        height:32,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:50,
        backgroundColor:'#D7D7D7'
    },
    star_icon:{
        width:20,
        height:20,
        marginLeft:8,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:50,
        backgroundColor:'#C4C4C4'
    },
    newMsgCircle:{
        position: 'absolute',
        width: 20,
        height: 20,
        left: 20,
        bottom: 40,
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
    photo:{
        width:'100%',
        height:462
    },
    photoContainer:{
        width:'100%',
        //height:windowHeight - 230,
        marginTop:25,
        alignItems:'center',
        justifyContent:'center',
        borderTopWidth:1,
        borderBottomWidth:1,
        borderTopColor:'rgba(0,0,0,0.1)',
        borderBottomColor:'rgba(0,0,0,0.1)',
    }
});

export default ProfileScreen;
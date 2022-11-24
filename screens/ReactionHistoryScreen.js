import React, { useState , useEffect} from 'react';
import { View,  Image, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';

import {API_URL, windowHeight,windowWidth,default_photo} from '../config/config';
import { ScrollView } from 'react-native-gesture-handler';

const ReactionHistoryScreen = (props) => {
    const user = props.navigation.state.params.user; //current user
    
    const initData = {
        type : props.navigation.state.params.type,
        rCnt : props.navigation.state.params.rCnt,
        historyList:[]
    }
    const [data,setData] = useState(initData);
    const [value,setValue] = useState(0);

    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });

    useEffect(() => {
        
        loadHistory();
    }, []);

    // load Reaction history
    const loadHistory = () => {
        fetch(`${API_URL}/getReactionHistory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    email:user.email
                }
            ),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    data.historyList = jsonRes.data;
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

    //set Active type and call loadHistory
    const loadReactionHistory = (rType)  => {
        data.type = rType; //set Active type
        setValue(value + 1);
        // loadHistory();
    };
    
    //render full name to first & last
    const renderName = (name) => {
        const fl_name = name.split(' ');
        const first_name = fl_name[0];
        const last_name = fl_name.length > 1 ? fl_name[1]:'';
        return (
            <View style={styles.nameContainer}>
                <Text style={styles.first_name}>{first_name} </Text>
                {/* <Text style={styles.last_name}>{last_name}</Text> */}
            </View>
        )
    };

    const renderCount = (count) => {
        let imgCnt = count>5?5:count;
        let txtCnt = count>5?(count - 5):0;
        let curImgUrl;
        
        switch(data.type){
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

        var tmp = [];
        for(let i=0;i<imgCnt;i++)
            tmp.push(<Image key={i} style={styles.countEmojiImg} source = {curImgUrl}/>)
        return (
            <View style={styles.cImgContainer}>
                {tmp}
                <Text style={styles.countEmojiTxt}>{txtCnt > 0 ? ('+ '+txtCnt):''}</Text>
            </View>
        )
    };

    const renderItem = (item,key) => {
        if(item._id.type != data.type) return;
        return (
            <View key={key} style={styles.historyItemContainer}>
                <Image style={styles.photo} 
                    source={{
                        uri: item.user[0].photo==''?default_photo:item.user[0].photo
                    }}>
                </Image>
                {renderName(item.user[0].name)}
                {renderCount(item.count)}
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView showsHorizontalScrollIndicator={false} horizontal style={styles.reactBarContainer}>
                {data.rCnt[1] > 0 && <TouchableOpacity activeOpacity={0.6} style={styles.emojiContainer} onPress={()=>loadReactionHistory(1)}>
                        <Image style={styles.emojiImg} source={data.type==1?require('../assets/reactions/1.png'):require('../assets/reactions/1_0.png')} />
                        <Text style={data.type==1?styles.emojiCount:styles.emojiCount_disable}>{data.rCnt[1] > 0?data.rCnt[1]:''}</Text>
                </TouchableOpacity>}
                {data.rCnt[2] > 0 && <TouchableOpacity activeOpacity={0.6} style={styles.emojiContainer} onPress={()=>loadReactionHistory(2)}>
                        <Image style={styles.emojiImg} source={data.type==2?require('../assets/reactions/2.png'):require('../assets/reactions/2_0.png')} />
                        <Text style={data.type==2?styles.emojiCount:styles.emojiCount_disable}>{data.rCnt[2] > 0?data.rCnt[2]:''}</Text>
                </TouchableOpacity>}
                {data.rCnt[3] > 0 && <TouchableOpacity activeOpacity={0.6} style={styles.emojiContainer} onPress={()=>loadReactionHistory(3)}>
                        <Image style={styles.emojiImg} source={data.type==3?require('../assets/reactions/3.png'):require('../assets/reactions/3_0.png')} />
                        <Text style={data.type==3?styles.emojiCount:styles.emojiCount_disable}>{data.rCnt[3] > 0?data.rCnt[3]:''}</Text>
                </TouchableOpacity>}
                {data.rCnt[4] > 0 && <TouchableOpacity activeOpacity={0.6} style={styles.emojiContainer} onPress={()=>loadReactionHistory(4)}>
                        <Image style={styles.emojiImg} source={data.type==4?require('../assets/reactions/4.png'):require('../assets/reactions/4_0.png')} />
                        <Text style={data.type==4?styles.emojiCount:styles.emojiCount_disable}>{data.rCnt[4] > 0?data.rCnt[4]:''}</Text>
                </TouchableOpacity>}
                {data.rCnt[5] > 0 && <TouchableOpacity activeOpacity={0.6} style={styles.emojiContainer} onPress={()=>loadReactionHistory(5)}>
                        <Image style={styles.emojiImg} source={data.type==5?require('../assets/reactions/5.png'):require('../assets/reactions/5_0.png')} />
                        <Text style={data.type==5?styles.emojiCount:styles.emojiCount_disable}>{data.rCnt[5] > 0?data.rCnt[5]:''}</Text>
                </TouchableOpacity>}
                {data.rCnt[6] > 0 && <TouchableOpacity activeOpacity={0.6} style={styles.emojiContainer} onPress={()=>loadReactionHistory(6)}>
                        <Image style={styles.emojiImg} source={data.type==6?require('../assets/reactions/6.png'):require('../assets/reactions/6_0.png')} />
                        <Text style={data.type==6?styles.emojiCount:styles.emojiCount_disable}>{data.rCnt[6] > 0?data.rCnt[6]:''}</Text>
                </TouchableOpacity>}
            </ScrollView>
            <ScrollView style={styles.historyListContainer}>
                {data.historyList.map((item,key) => renderItem(item,key))}
            </ScrollView>
       </View>
    );
};

const styles = StyleSheet.create({
    countEmojiTxt:{
        alignItems:'center',
        marginLeft:11,
        fontFamily:'Montserrat_700Bold',
        fontSize:16
    },
    countEmojiImg:{
        width:22,
        height:22,
        resizeMode:'stretch',
        marginLeft:5
    },
    cImgContainer:{
        marginLeft:20,
        flexDirection:'row'
    },
    historyListContainer:{
        marginHorizontal:15,
        marginTop:10,
        width:windowWidth
    },
    nameContainer:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:19,
        width:windowWidth * 0.2
    },
    historyItemContainer:{
        marginTop:10,
        width:windowWidth,
        flexDirection:'row',
        alignItems:'center'
    },
    first_name:{
        fontFamily:'Montserrat_800ExtraBold',
        fontSize:16
    },
    last_name:{
        fontFamily:'Montserrat_400Regular'
    },
    photo:{
        width:40 * windowWidth / 375,
        height:40 * windowWidth / 375,
        borderRadius:50,
        borderWidth:2,
        borderColor:'#EEEEEE',
        // resizeMode:'contain'
        
    },
    reactBarContainer:{
        height:90,
        marginLeft:15,
        marginRight:15,
        paddingBottom:17,
        borderBottomColor:'#E5E5E5',
        borderBottomWidth:1
    },
    emojiContainer: {
        width: windowWidth * 0.33,
        alignItems:'center',
        justifyContent:'center'
    },
    emojiImg: {
        width: 36,
        height: 36
    },
    emojiCount:{
        marginTop:9,
        fontSize:14,
        height:16,
        color:'rgba(221, 46, 68, 1)',
        fontFamily:'Montserrat_700Bold'
    },
    emojiCount_disable:{
        marginTop:9,
        fontSize:14,
        height:16,
        color:'rgba(82, 82, 82, 1)',
        fontFamily:'Montserrat_700Bold'
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
    }
});

export default ReactionHistoryScreen;
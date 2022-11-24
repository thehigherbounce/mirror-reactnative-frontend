import React, { useState , useEffect} from 'react';
import { View, ScrollView, TextInput,FlatList, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import SvgUri from 'react-native-svg-uri';
import ImageOverlay from "react-native-image-overlay";
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_400Regular,
    Montserrat_500Medium
  } from '@expo-google-fonts/montserrat';

import { useSelector  } from 'react-redux';
import {API_URL, default_photo, windowHeight, windowWidth} from '../config/config';

let user = null;

const SearchScreen = (props) => {
    user = useSelector((state)=>state.user.user);
    const [data,setData] = useState({
        search:'',
        userList:[]
    });

    const [blockList,setBlockList] = useState(user.block_list);

    const [loadingAlert,setLoadingAlert] = useState(false);

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
        getUserList();
        
    }, []);  
    
    //load block list
    const getUserList = () =>{
        fetch(`${API_URL}/getUserList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    data.userList = jsonRes.data;
                    //console.log(jsonRes.data);
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

    // on tap on list
    const onTapUser = (item) => {
        props.navigation.navigate('Profile', {
            owner: item,
            profile_type : item.is_public? 1: 0
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput style={styles.searchInput} onChangeText={text=>{setData({...data,search:text})}} placeholder="Search a user" value={data.search}/>
            </View>

            <FlatList
                style={styles.searchUserListContainer}
                data={data.userList}
                renderItem={({ item }) => {
                    if(data.search != '' && item.name && item.name.toLowerCase().includes(data.search.toLowerCase()) && item.email != user.email && (!blockList || (!blockList.includes(item.email))))
                    {
                        return (
                            <TouchableOpacity style={styles.historyItemContainer} onPress={()=>onTapUser(item)}>
                                {item.is_public ?
                                    <Image style={styles.photo} 
                                        source={{
                                            uri: item.photo==''?default_photo:item.photo
                                        }}>
                                    </Image>
                                    :<ImageOverlay 
                                        width={35 * windowWidth / 375}
                                        height={35 * windowWidth / 375}
                                        rounded={50} 
                                        source={{uri: item.photo==''?default_photo:item.photo}}
                                    >
                                        <View style={[styles.photo,{backgroundColor:'rgba(0,0,0,0.6)'}]}>
                                        </View>
                                    </ImageOverlay> 
                                }
                                {renderName(item.name)}
                            </TouchableOpacity>
                        )
                    }
                    
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
       </View>
    );
};

const styles = StyleSheet.create({
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
        marginTop:30,
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
        width:windowWidth,
        flexDirection:'row',
        alignItems:'center'
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
        borderRadius:50,
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

export default SearchScreen;

const goFeed = (screenProps) => {
    screenProps.navigation.navigate('Feed');
}

const goUserProfile = (screenProps) => {
    screenProps.navigation.navigate('Account', {
        title: user.name
    });
}

SearchScreen['navigationOptions'] = props => ({
    headerLeft: () => <View style={styles.headerLeftContainer}>
                            <TouchableOpacity style={styles.menu} onPress={() => goFeed(props)}>
                                <SvgUri
                                    style={styles.menu_img}
                                    source={require('../assets/feed.svg')}
                                />
                            </TouchableOpacity>
                        </View>,
    headerRight: () => <View style={styles.headerRightContainer}>
                            <TouchableOpacity onPress={()=>goUserProfile(props)}>
                                <SvgUri
                                    style={styles.menu_img}
                                    source={require('../assets/profile.svg')}
                                />
                            </TouchableOpacity>
                        </View>
})

import React from 'react';
import { registerRootComponent } from 'expo';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from "react-navigation-stack";
import {createAppContainer} from 'react-navigation'

import AuthScreen from './screens/AuthScreen';
import FeedScreen from './screens/FeedScreen';
import ForgotScreen from './screens/ForgotScreen';
import ProfileScreen from './screens/ProfileScreen';
import AccountScreen from './screens/AccountScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import GeneralScreen from './screens/GeneralScreen';
import BlockListScreen from './screens/BlockListScreen';
import ReactionHistoryScreen from './screens/ReactionHistoryScreen';
import SearchScreen from './screens/SearchScreen';
import NotificationScreen from './screens/NotificationScreen';
import { Provider } from 'react-redux';

import configureStore from './store/configureStore';

const store = configureStore()

export default class App extends React.Component {
  render() {
    return (
      <Provider store = { store }>
          <AppContainer />
      </Provider>
    )
  }
}

const AppNavigator = createStackNavigator({
  Auth: {
    screen: AuthScreen,
    navigationOptions: {
      headerShown:false,
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  Feed: {
    screen: FeedScreen,
    navigationOptions: {
      headerShown:false,
      title:'Mirrer',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  Forgot:{
    screen: ForgotScreen,
    navigationOptions: {
      headerShown:false,
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  Profile:{
    screen: ProfileScreen,
    navigationOptions: {
      headerShown:false
    }
  },
  Notification:{
    screen: NotificationScreen,
    navigationOptions: {
      headerShown:false
    }
  },
  Search:{
    screen: SearchScreen,
    navigationOptions: {
      headerShown:true,
      title:'',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  Account:{
    screen: AccountScreen,
    navigationOptions: {
      headerShown:true,
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  UserProfile:{
    screen: UserProfileScreen,
    navigationOptions: {
      headerShown:true,
      title:'PROFILE',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  General:{
    screen: GeneralScreen,
    navigationOptions: {
      headerShown:true,
      title:'GENERAL',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  BlockList:{
    screen: BlockListScreen,
    navigationOptions: {
      headerShown:true,
      title:'BLOCKED USERS',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  ChangePassword:{
    screen: ChangePasswordScreen,
    navigationOptions: {
      headerShown:true,
      title:'CHANGE PASSWORD',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  },
  ReactionHistory:{
    screen: ReactionHistoryScreen,
    navigationOptions: {
      headerShown:true,
      title:'REACTIONS',
      headerStyle:{
        elevation: 0, // remove shadow on Android
        shadowOpacity: 0, // remove shadow on iOS
      }
    }
  }
});

const AppContainer = createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

registerRootComponent(App);
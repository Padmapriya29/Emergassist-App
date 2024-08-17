import * as React from "react";
import {Icon} from "react-native-elements";
import { createDrawerNavigator } from "react-navigation-drawer";
import { AppTabNavigator } from "./AppTabNavigator";
import { CustomSideBarMenu } from "./CustomSideBarMenu";
import SettingScreen from "../screens/SettingScreen";
import NotificationScreen from "../screens/NotificationScreen";
import History from "../screens/History";

export const AppDrawerNavigator = createDrawerNavigator(
  {
    Home: { 
      screen: AppTabNavigator,
      navigationOptions:{
        drawerIcon:<Icon name="home" type="fontawesome5"/>
      }
     },
    History: { screen: History,
      navigationOptions:{
        drawerIcon:<Icon name="gift" type="font-awesome"/>,
        drawerLabel:"My Donations"
      } },
    Notifications: { screen: NotificationScreen,
      navigationOptions:{
        drawerIcon:<Icon name="bell" type="font-awesome"/>,
        drawerLabel:"Notifications"
      } },
    Settings: { screen: SettingScreen,
      navigationOptions:{
        drawerIcon:<Icon name="settings" type="fontawesome5"/>,
        drawerLabel:"Settings"
      } },
  },
  { contentComponent: CustomSideBarMenu },
  { initialRouteName: "Home" }
);

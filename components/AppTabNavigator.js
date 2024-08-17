import * as React from "react";
import { Image } from "react-native";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { AppStackNavigator } from "./AppStackNavigator";

export const AppTabNavigator = createBottomTabNavigator({
  DonateBooks: {
    screen: AppStackNavigator,
    navigationOptions: {
      tabBarIcon: (
        <Image
          source={require("../assets/request-list.png")}
          style={{ width: 20, height: 20 }}
        />
      ),
      tabBarLabel: "Donate Books",
    },
  },
  SERS: {
    screen: SERS,
    navigationOptions: {
      tabBarIcon: (
        <Image
          source={require("../assets/request-book.png")}
          style={{ width: 20, height: 20 }}
        />
      ),
      tabBarLabel: "SERS Request",
    },
  },
});
// console.log(app.debug@id:user_name&Course_name)

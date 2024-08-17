import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { ListItem } from "react-native-elements";
import MyHeader from "../components/MyHeader";
import db from "../config";
import firebase, { firestore } from "firebase";
import { RFValue } from "react-native-responsive-fontsize";

export default class MyReceivedBooksScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      receivedBooksList: [],
    };
    this.requestRef = null;
  }

  getReceivedBooksList = () => {
    this.requestRef = db
      .collection("requested_books")
      .where("user_id", "==", this.state.userId)
      .where("book_status", "==", "received")
      .onSnapshot((snapshot) => {
        var receivedBooksList = snapshot.docs.map((doc) => doc.data());
        this.setState({
          receivedBooksList: receivedBooksList,
        });
      });
  };

  componentDidMount() {
    this.getReceivedBooksList();
  }

  componentWillUnmount() {
    this.requestRef();
  }
  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item, i }) => {
    return (
      <ListItem
        key={i}
        title={item.book_name}
        subtitle={item.book_status}
        leftElement={
          <Image
            style={styles.LiImage}
            source={{
              uri: item.image_link,
            }}
          />
        }
        titleStyle={styles.titleStyle}
        bottomDivider
      />
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <MyHeader title="Received Books" navigation={this.props.navigation} />
        <View style={styles.container}>
          {this.state.receivedBooksList.length === 0 ? (
            <View style={styles.subContainer}>
              <Text style={{ fontSize: 20 }}>List of All Received Books</Text>
            </View>
          ) : (
            <FlatList
              keyExtractor={this.keyExtractor}
              data={this.state.receivedBooksList}
              renderItem={this.renderItem}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subContainer: {
    flex: 1,
    fontSize: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 100,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff5722",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },
  titleStyle: {
    color: "black",
    fontWeight: "bold",
  },
  LiImage: {
    height: RFValue(50),
    width: RFValue(50),
  },
});

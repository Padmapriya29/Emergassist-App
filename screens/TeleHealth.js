import * as React from "react";
import {
  Text,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableHighlight,
  FlatList,
  Image,
  Alert,
} from "react-native";
import db from "../config";
import firebase from "firebase";
import MyHeader from "../components/MyHeader";
import { SearchBar, ListItem, Input } from "react-native-elements";
import { SERSSearch } from "react-native-google-SERSs";
import { RFValue } from "react-native-responsive-fontsize";

export default class TeleHealth extends React.Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      docId: "",
      userDocId: "",
      datasource: "",
      showFlatlist: false,
      imageLink: "#",
      requestedImageLink: "",
    };
  }

  createUniqueId = () => {
    return Math.random().toString(36).substring(7);
  };

  addRequest = async (SERSName, reasonToRequest) => {
    var userId = this.state.userId;
    var randomRequestId = this.createUniqueId();
    var SERS = await SERSSearch.searchSERS(
      SERSName,
      "AIzaSyD794MXiXb-AGowFmT_1JZwo8BPJxVTt9s"
    );
    db.collection("requested_SERSs").add({
      user_id: userId,
      SERS_name: SERSName,
      reason_to_request: reasonToRequest,
      request_id: randomRequestId,
      SERS_status: "requested",
      date: firebase.firestore.FieldValue.serverTimestamp(),
      image_link: SERSs.data[0].volumeInfo.imageLinks.smallThumbnail,
    });

    await this.getSERSRequest();
    db.collection("users")
      .where("username", "==", userId)
      .get()
      .then()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            isSERSRequestActive: true,
          });
        });
      });

    this.setState({
      SERSName: "",
      reasonToRequest: "",
      requestId: randomRequestId,
    });

    return Alert.alert("SERS Requested Successfully!");
  };

  getSERSRequest = () => {
    var SERSRequest = db
      .collection("requested_SERSs")
      .where("user_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().SERS_status !== "received") {
            this.setState({
              requestId: doc.data().request_id,
              requestedSERSName: doc.data().SERS_name,
              SERSStatus: doc.data().SERS_status,
              requestedImageLink: doc.data().image_link,
              docId: doc.id,
            });
          }
        });
      });
  };
//console.log(SERS_name)
//console.log(user_id)
//console.log(SERS_name)
  getIsSERSRequestActive = () => {
    db.collection("users")
      .where("username", "==", this.state.userId)
      .onSnapshot((querSnapshot) => {
        querSnapshot.forEach((doc) => {
          this.setState({
            isSERSRequestActive: doc.data().isSERSRequestActive,
            userDocId: doc.id,
          });
        });
      });
  };

  updateSERSRequestStatus = () => {
    db.collection("requested_SERSs").doc(this.state.docId).update({
      SERS_status: "received",
    });

    db.collection("users")
      .where("username", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            isSERSRequestActive: false,
          });
        });
      });
  };

  sendNotification = () => {
    db.collection("users")
      .where("username", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var name = doc.data().first_name;
          var lastname = doc.data().last_name;

          db.collection("all_notifications")
            .where("request_id", "==", this.state.requestId)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                var donorId = doc.data().donor_id;
                var SERSName = doc.data().SERS_name;

                db.collection("all_notifications").add({
                  targeted_user_id: donorId,
                  message:
                    name + " " + lastname + " received the SERS " + SERSName,
                  notification_status: "unread",
                  SERS_name: SERSName,
                });
              });
            });
        });
      });
  };

  receivedSERSs = (SERSName) => {
    var userId = this.state.userId;
    var requestId = this.state.requestId;
    db.collection("received_SERSs").add({
      user_id: userId,
      SERS_name: SERSName,
      request_id: requestId,
      SERS_status: "received",
    });
  };

  componentDidMount() {
    this.getSERSRequest();
    this.getIsSERSRequestActive();
  }

  async getSERSsFromApi(SERSName) {
    this.setState({ SERSName: SERSName });
    if (SERSName.length > 2) {
      var SERSs = await SERSSearch.searchSERS(
        SERSName,
        "AIzaSyD794MXiXb-AGowFmT_1JZwo8BPJxVTt9s"
      );
      this.setState({
        datasource: SERSs.data,
        showFlatlist: true,
      });
    }
  }

  renderItem = ({ item, i }) => {
    let obj = {
      title: item.volumeInfo.title,
      selfLink: item.selfLink,
      buyLink: item.saleInfo.buyLink,
      imageLink: item.volumeInfo.imageLinks,
    };
    return (
      <TouchableHighlight
        style={styles.touchableOpacity}
        activeOpacity={0.6}
        underlayColor="#dddddd"
        onPress={() => {
          this.setState({
            showFlatlist: false,
            SERSName: item.volumeInfo.title,
          });
        }}
        bottomDivider
      >
        <Text>{item.volumeInfo.title}</Text>
      </TouchableHighlight>
    );
  };

  render() {
    if (this.state.isSERSRequestActive === true) {
      return (
        //Status screen
        <View style={{ flex: 1 }}>
          <View style={{ flex: 0.1 }}>
            <MyHeader title="SERS Status" navigation={this.props.navigation} />
          </View>
          <View style={styles.imageView}>
            <Image
              source={{ uri: this.state.requestedImageLink }}
              style={styles.imageStyle}
            />
          </View>
          <View style={styles.SERSstatus}>
            <Text style={{ fontSize: RFValue(20) }}>Name of the SERS</Text>
            <Text style={styles.requestedSERSName}>
              {this.state.requestedSERSName}
            </Text>
            <Text style={styles.status}>Status</Text>
            <Text style={styles.SERSStatus}>{this.state.SERSStatus}</Text>
          </View>
          <View style={styles.buttonView}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.sendNotification();
                this.updateSERSRequestStatus();
                this.receivedSERSs(this.state.requestedSERSName);
              }}
            >
              <Text style={styles.buttontxt}>SERS Received</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 0.1 }}>
            <MyHeader title="Request SERS" navigation={this.props.navigation} />
          </View>
          <View style={{ flex: 0.9 }}>
            <Input
              style={styles.formInputText}
              label={"SERS Name"}
              placeholder="SERS name"
              containerStyle={{ marginTop: RFValue(60) }}
              onChangeText={(text) => {
                this.getSERSsFromApi(text);
              }}
              onClear={(text) => {
                this.getSERSsFromApi("");
              }}
              value={this.state.SERSName}
            />
            {this.state.showFlatlist ? (
              <FlatList
                data={this.state.datasource}
                renderItem={this.renderItem}
                enableEmptySections={true}
                style={{ marginTop: RFValue(10) }}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Input
                  style={styles.formInputText}
                  containerStyle={{ marginTop: RFValue(30) }}
                  multiline={true}
                  numberOfLines={8}
                  placeholder="Why do you need the SERS?"
                  onChangeText={(text) => {
                    this.setState({ reasonToRequest: text });
                  }}
                  value={this.state.reasonToRequest}
                />
                <TouchableOpacity
                  style={[styles.button, { marginTop: RFValue(30) }]}
                  onPress={() => {
                    this.addRequest(
                      this.state.SERSName,
                      this.state.reasonToRequest
                    );
                  }}
                >
                  <Text style={styles.requestbuttontxt}>Request</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  keyBoardStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formInputText: {
    width: "75%",
    height: RFValue(35),
    borderWidth: 1,
    padding: RFValue(10),
  },
  imageView: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
    marginTop: RFValue(20),
  },
  imageStyle: {
    height: RFValue(150),
    width: RFValue(150),
    alignSelf: "center",
    borderWidth: 5,
    borderRadius: RFValue(10),
  },
  SERSstatus: {
    flex: 0.4,
    alignItems: "center",
  },
  requestedSERSName: {
    fontSize: RFValue(30),
    fontWeight: "500",
    padding: RFValue(10),
    fontWeight: "bold",
    alignItems: "center",
    marginLeft: RFValue(60),
  },
  status: {
    fontSize: RFValue(20),
    marginTop: RFValue(30),
  },
  SERSStatus: {
    fontSize: RFValue(30),
    fontWeight: "bold",
    marginTop: RFValue(10),
  },
  buttonView: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttontxt: {
    fontSize: RFValue(18),
    fontWeight: "bold",
    color: "#fff",
  },
  touchableOpacity: {
    alignItems: "center",
    backgroundColor: "#dddddd",
    padding: 10,
    width: "90%",
  },
  requestbuttontxt: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    width: "75%",
    height: RFValue(60),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(50),
    backgroundColor: "#32867d",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
});

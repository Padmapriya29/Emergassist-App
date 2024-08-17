import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Card, Header, Icon } from "react-native-elements";
import firebase from "firebase";
import db from "../config";
import { RFValue } from "react-native-responsive-fontsize";
export default class ChokeResponse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: firebase.auth().currentUser.email,
      userName: "",
      receiverId: this.props.navigation.getParam("details")["user_id"],
      requestId: this.props.navigation.getParam("details")["request_id"],
      tut1Name: this.props.navigation.getParam("details")["tut1_name"],
      tut1Image: "#",
      reasonForRequesting: this.props.navigation.getParam("details")[
        "reason_to_request"
      ],
      receiverName: "",
      receiverContact: "",
      receiverAddress: "",
      receiverRequestDocId: "",
    };
  }

  getUserDetails = (userId) => {
    db.collection("users")
      .where("username", "==", userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            userName: doc.data().first_name + " " + doc.data().last_name,
          });
        });
      });
  };

  getReceiverDetails = () => {
    db.collection("users")
      .where("username", "==", this.state.receiverId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            receiverName: doc.data().first_name,
            receiverContact: doc.data().mobile_number,
            receiverAddress: doc.data().address,
          });
        });
      });

    db.collection("requested_tut1s")
      .where("request_id", "==", this.state.requestId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            receiverRequestDocId: doc.id,
            tut1Image: doc.data().image_link,
          });
        });
      });
  };

  componentDidMount() {
    this.getReceiverDetails();
    this.getUserDetails(this.state.userId);
  }

  updatetut1Status = () => {
    db.collection("all_donations").add({
      tut1_name: this.state.tut1Name,
      request_id: this.state.requestId,
      requested_by: this.state.receiverName,
      donor_id: this.state.userId,
      request_status: "Donor Interested",
    });
  };

  addNotification = () => {
    var message =
      this.state.userName + " has shown interest in donating the tut1";
    db.collection("all_notifications").add({
      targeted_user_id: this.state.receiverId,
      donor_id: this.state.userId,
      request_id: this.state.requestId,
      tut1_name: this.state.tut1Name,
      date: firebase.firestore.FieldValue.serverTimestamp(),
      notification_status: "unread",
      message: message,
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.1 }}>
          <Header
            leftComponent={
              <Icon
                name="arrow-left"
                type="feather"
                color="#ffffff"
                onPress={() => this.props.navigation.goBack()}
              />
            }
            centerComponent={{
              text: "Donate tut1s",
              style: {
                color: "#ffffff",
                fontSize: RFValue(20),
                fontWeight: "bold",
              },
            }}
            backgroundColor="#32867d"
          />
        </View>
        <View style={{ flex: 0.9 }}>
          <View
            style={{
              flex: 0.3,
              flexDirection: "row",
              paddingTop: RFValue(30),
              paddingLeft: RFValue(10),
            }}
          >
            <View style={{ flex: 0.4 }}>
              <Image
                source={{ uri: this.state.tut1Image }}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "contain",
                }}
              />
            </View>
            <View
              style={{
                flex: 0.6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: RFValue(25),
                  textAlign: "center",
                }}
              >
                {this.state.tut1Name}
              </Text>
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: RFValue(15),
                  textAlign: "center",
                  marginTop: RFValue(15),
                }}
              >
                {this.state.reason_for_requesting}
              </Text>
            </View>
          </View>
          <View
            style={{
              flex: 0.7,
              padding: RFValue(20),
            }}
          >
            <View
              style={{
                flex: 0.7,
                justifyContent: "center",
                alignItems: "center",
                marginTop: RFValue(50),
                borderWidth: 1,
                borderColor: "#deeedd",
                padding: RFValue(10),
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: RFValue(30),
                }}
              >
                Reciever Information
              </Text>
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: RFValue(20),
                  marginTop: RFValue(30),
                }}
              >
                Name : {this.state.receiverName}
              </Text>
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: RFValue(20),
                  marginTop: RFValue(30),
                }}
              >
                Contact: {this.state.receiverContact}
              </Text>
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: RFValue(20),
                  marginTop: RFValue(30),
                }}
              >
                Address: {this.state.receiverAddress}
              </Text>
            </View>
            <View
              style={{
                flex: 0.3,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {this.state.receiverId !== this.state.userId ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    this.updatetut1Status();
                    this.addNotification();
                    this.props.navigation.navigate("MyDonations");
                  }}
                >
                  <Text>I want to Donate</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "75%",
    height: RFValue(60),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(60),
    backgroundColor: "#ff5722",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 16,
    marginTop:RFValue(50)
  },
});

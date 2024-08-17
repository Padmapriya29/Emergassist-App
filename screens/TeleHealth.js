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
import { BookSearch } from "react-native-google-books";
import { RFValue } from "react-native-responsive-fontsize";

export default class BookRequestScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      bookName: "",
      reasonToRequest: "",
      requestId: "",
      requestedBookName: "",
      bookStatus: "",
      docId: "",
      userDocId: "",
      datasource: "",
      showFlatlist: false,
      imageLink: "#",
      requestedImageLink: "",
      isBookRequestActive: false,
    };
  }

  createUniqueId = () => {
    return Math.random().toString(36).substring(7);
  };

  addRequest = async (bookName, reasonToRequest) => {
    var userId = this.state.userId;
    var randomRequestId = this.createUniqueId();
    var books = await BookSearch.searchbook(
      bookName,
      "AIzaSyD794MXiXb-AGowFmT_1JZwo8BPJxVTt9s"
    );
    db.collection("requested_books").add({
      user_id: userId,
      book_name: bookName,
      reason_to_request: reasonToRequest,
      request_id: randomRequestId,
      book_status: "requested",
      date: firebase.firestore.FieldValue.serverTimestamp(),
      image_link: books.data[0].volumeInfo.imageLinks.smallThumbnail,
    });

    await this.getBookRequest();
    db.collection("users")
      .where("username", "==", userId)
      .get()
      .then()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            isBookRequestActive: true,
          });
        });
      });

    this.setState({
      bookName: "",
      reasonToRequest: "",
      requestId: randomRequestId,
    });

    return Alert.alert("Book Requested Successfully!");
  };

  getBookRequest = () => {
    var bookRequest = db
      .collection("requested_books")
      .where("user_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().book_status !== "received") {
            this.setState({
              requestId: doc.data().request_id,
              requestedBookName: doc.data().book_name,
              bookStatus: doc.data().book_status,
              requestedImageLink: doc.data().image_link,
              docId: doc.id,
            });
          }
        });
      });
  };
//console.log(book_name)
//console.log(user_id)
//console.log(book_name)
  getIsBookRequestActive = () => {
    db.collection("users")
      .where("username", "==", this.state.userId)
      .onSnapshot((querSnapshot) => {
        querSnapshot.forEach((doc) => {
          this.setState({
            isBookRequestActive: doc.data().isBookRequestActive,
            userDocId: doc.id,
          });
        });
      });
  };

  updateBookRequestStatus = () => {
    db.collection("requested_books").doc(this.state.docId).update({
      book_status: "received",
    });

    db.collection("users")
      .where("username", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            isBookRequestActive: false,
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
                var bookName = doc.data().book_name;

                db.collection("all_notifications").add({
                  targeted_user_id: donorId,
                  message:
                    name + " " + lastname + " received the book " + bookName,
                  notification_status: "unread",
                  book_name: bookName,
                });
              });
            });
        });
      });
  };

  receivedBooks = (bookName) => {
    var userId = this.state.userId;
    var requestId = this.state.requestId;
    db.collection("received_books").add({
      user_id: userId,
      book_name: bookName,
      request_id: requestId,
      book_status: "received",
    });
  };

  componentDidMount() {
    this.getBookRequest();
    this.getIsBookRequestActive();
  }

  async getBooksFromApi(bookName) {
    this.setState({ bookName: bookName });
    if (bookName.length > 2) {
      var books = await BookSearch.searchbook(
        bookName,
        "AIzaSyD794MXiXb-AGowFmT_1JZwo8BPJxVTt9s"
      );
      this.setState({
        datasource: books.data,
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
            bookName: item.volumeInfo.title,
          });
        }}
        bottomDivider
      >
        <Text>{item.volumeInfo.title}</Text>
      </TouchableHighlight>
    );
  };

  render() {
    if (this.state.isBookRequestActive === true) {
      return (
        //Status screen
        <View style={{ flex: 1 }}>
          <View style={{ flex: 0.1 }}>
            <MyHeader title="Book Status" navigation={this.props.navigation} />
          </View>
          <View style={styles.imageView}>
            <Image
              source={{ uri: this.state.requestedImageLink }}
              style={styles.imageStyle}
            />
          </View>
          <View style={styles.bookstatus}>
            <Text style={{ fontSize: RFValue(20) }}>Name of the book</Text>
            <Text style={styles.requestedBookName}>
              {this.state.requestedBookName}
            </Text>
            <Text style={styles.status}>Status</Text>
            <Text style={styles.bookStatus}>{this.state.bookStatus}</Text>
          </View>
          <View style={styles.buttonView}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.sendNotification();
                this.updateBookRequestStatus();
                this.receivedBooks(this.state.requestedBookName);
              }}
            >
              <Text style={styles.buttontxt}>Book Received</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 0.1 }}>
            <MyHeader title="Request Book" navigation={this.props.navigation} />
          </View>
          <View style={{ flex: 0.9 }}>
            <Input
              style={styles.formInputText}
              label={"Book Name"}
              placeholder="Book name"
              containerStyle={{ marginTop: RFValue(60) }}
              onChangeText={(text) => {
                this.getBooksFromApi(text);
              }}
              onClear={(text) => {
                this.getBooksFromApi("");
              }}
              value={this.state.bookName}
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
                  placeholder="Why do you need the book?"
                  onChangeText={(text) => {
                    this.setState({ reasonToRequest: text });
                  }}
                  value={this.state.reasonToRequest}
                />
                <TouchableOpacity
                  style={[styles.button, { marginTop: RFValue(30) }]}
                  onPress={() => {
                    this.addRequest(
                      this.state.bookName,
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
  bookstatus: {
    flex: 0.4,
    alignItems: "center",
  },
  requestedBookName: {
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
  bookStatus: {
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

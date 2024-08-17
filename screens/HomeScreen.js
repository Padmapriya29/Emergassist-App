import * as React from "react";
import {
  Image,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import firebase from "firebase";
import db from "../config";
import { RFValue } from "react-native-responsive-fontsize";S

export default class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      isModalVisible: false,
      address: "",
      firstName: "",
      lastName: "",
      contact: "",
      confirmPassword: "",
    };
  }

  showModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.isModalVisible}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.signupView}>
            <Text style={styles.modalTitle}>SIGN UP</Text>
          </View>
          <View style={{ flex: 0.95 }}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.formTextInput}
              placeholder={"First Name"}
              maxLength={8}
              onChangeText={(text) => {
                this.setState({ firstName: text });
              }}
            />
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.formTextInput}
              placeholder={"Last Name"}
              maxLength={8}
              onChangeText={(text) => {
                this.setState({ lastName: text });
              }}
            />
            <Text style={styles.label}>Contact</Text>
            <TextInput
              style={styles.formTextInput}
              placeholder={"Contact"}
              maxLength={10}
              keyboardType={"numeric"}
              onChangeText={(text) => {
                this.setState({ contact: text });
              }}
            />
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.formTextInput}
              placeholder={"Address"}
              multiline={true}
              onChangeText={(text) => {
                this.setState({ address: text });
              }}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.formTextInput}
              placeholder={"Email"}
              keyboardType={"email-address"}
              onChangeText={(text) => {
                this.setState({ email: text });
              }}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.formTextInput}
              placeholder={"Password"}
              secureTextEntry={true}
              onChangeText={(text) => {
                this.setState({ password: text });
              }}
            />
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.formTextInput}
              placeholder={"Confirm Password"}
              secureTextEntry={true}
              onChangeText={(text) => {
                this.setState({ confirmPassword: text });
              }}
            />
            <View style={styles.modalBackButton}>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => {
                  this.userSignUp(
                    this.state.email,
                    this.state.password,
                    this.state.confirmPassword
                  );
                }}
              >
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>

              <Text
                style={styles.cancelButtonText}
                onPress={() => {
                  this.setState({ isModalVisible: false });
                }}
              >
                Cancel
              </Text>
            </View>
          </View>
        </ScrollView>
      </Modal>
    );
  };

  userLogin = async (email, password) => {
    if (email && password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          this.props.navigation.navigate("DonateBooks");
        })
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          return Alert.alert(errorCode + " - " + errorMessage);
        });
    } else {
      Alert.alert("Enter email and password");
    }
  };

  userSignUp = async (email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      return Alert.alert("Password doesn't match\nCheck your password.");
    } else {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
          db.collection("users").add({
            first_name: this.state.firstName,
            last_name: this.state.lastName,
            mobile_number: this.state.contact,
            username: this.state.email,
            address: this.state.address,
            isBookRequestActive: false,
          });
          return Alert.alert("User added successfully!", "", [
            {
              text: "OK",
              onPress: () => {
                this.setState({ isModalVisible: false });
              },
            },
          ]);
        })
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          return Alert.alert(errorCode + " - " + errorMessage);
        });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {this.showModal()}
        <View style={{ flex: 0.25 }}>
          <View style={{ flex: 0.15 }} />
          <View style={styles.santaView}>
            <Image
              source={require("../assets/santa.png")}
              style={styles.santaImage}
            />
          </View>
        </View>
        <View style={{ flex: 0.45 }}>
          <View style={styles.textInput}>
            <TextInput
              style={styles.loginBox}
              keyboardType="email-address"
              placeholder="abc@example.com"
              placeholderTextColor="gray"
              onChangeText={(text) => {
                this.setState({ email: text });
              }}
            />
            <TextInput
              style={[styles.loginBox, { marginTop: RFValue(15) }]}
              secureTextEntry={true}
              placeholder="enter password"
              placeholderTextColor="gray"
              onChangeText={(text) => {
                this.setState({ password: text });
              }}
            />
          </View>
          <View style={{ flex: 0.5, alignItems: "center" }}>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => {
                this.userLogin(this.state.email, this.state.password);
              }}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => {
                this.setState({ isModalVisible: true });
              }}
            >
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 0.3 }}>
          <Image
            source={require("../assets/book.png")}
            style={styles.bookImage}
            resizeMode={"stretch"}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6fc0b8",
  },
  loginBox: {
    width: "80%",
    height: RFValue(50),
    borderWidth: 1.5,
    borderColor: "#ffffff",
    fontSize: RFValue(20),
    paddingLeft: RFValue(10),
  },
  buttonContainer: {
    width: "80%",
    height: RFValue(50),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(25),
    backgroundColor: "#ffff",
    shadowColor: "#000",
    marginBottom: RFValue(10),
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10.32,
    elevation: 16,
  },
  buttonText: {
    color: "#32867d",
    fontSize: RFValue(20),
    fontWeight: "200",
  },
  label: {
    fontSize: RFValue(13),
    color: "#717d7e",
    fontWeight: "bold",
    paddingLeft: RFValue(10),
    marginLeft: RFValue(20),
  },

  modalTitle: {
    fontSize: RFValue(20),
    color: "#32867d",
    fontWeight: "bold",
  },

  formTextInput: {
    width: "90%",
    height: RFValue(45),
    padding: RFValue(10),
    borderColor: "grey",
    borderRadius: 2,
    borderWidth: 1,
    marginTop: 20,
    paddingBottom: RFValue(10),
    marginLeft: RFValue(20),
    marginBottom: RFValue(14),
  },
  registerButton: {
    width: "75%",
    height: RFValue(50),
    marginTop: RFValue(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#32867d",
    borderRadius: RFValue(3),
    marginTop: RFValue(10),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: RFValue(20),
    fontWeight: "bold",
    marginTop: RFValue(10),
  },
  cancelButtonText: {
    color: "#32867d",
    fontSize: RFValue(20),
    fontWeight: "bold",
    marginTop: RFValue(10),
  },
  modalBackButton: {
    flex: 0.2,
    alignItems: "center",
  },
  signupView: {
    flex: 0.05,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  Text: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    color: "#32867d",
  },
  View: {
    flex: 0.85,
    justifyContent: "center",
    alignItems: "center",
    padding: RFValue(10),
  },
  santaImage: {
    width: "70%",
    height: "100%",
    resizeMode: "stretch",
  },
  textInput: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  Image: {
    width: "100%",
    height: RFValue(220),
  },
});

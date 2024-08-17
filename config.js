import firebase from "firebase";
require("@firebase/firestore");
var firebaseConfig = {
  apiKey: "AIzaSyD794MXiXb-AGowFmT_1JZwo8BPJxVTt9s",
  authDomain: "book-santa-app-2-2f412.firebaseapp.com",
  projectId: "book-santa-app-2-2f412",
  storageBucket: "book-santa-app-2-2f412.appspot.com",
  messagingSenderId: "219654783439",
  appId: "1:219654783439:web:920bb8da60aa5f073b92ba",
};
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase.firestore();

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGr3sYqqU2OK7g3r5wVvBpt38CJlQgae4",
  authDomain: "transport-hub-a77ee.firebaseapp.com",
  projectId: "transport-hub-a77ee",
  storageBucket: "transport-hub-a77ee.appspot.com",
  messagingSenderId: "1097600057992",
  appId: "1:1097600057992:web:8e9afd51115b45d813953d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
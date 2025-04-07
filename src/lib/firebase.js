import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDY6JpGcG1VqCWi5LfPnyl4kOMVcdm7RmM",
    authDomain: "kawhe-alves-dos-santos-db4be.firebaseapp.com",
    databaseURL: "https://kawhe-alves-dos-santos-db4be-default-rtdb.firebaseio.com",
    projectId: "kawhe-alves-dos-santos-db4be",
    storageBucket: "kawhe-alves-dos-santos-db4be.appspot.com",
    messagingSenderId: "1074140345530",
    appId: "1:1074140345530:web:926dc6276af8fc9dfa7e83",
    measurementId: "G-9JNBLHFMRR"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, push } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyCoujUrDwMw0CgBvLi4Y5MT5SQYuggMUmg",
  authDomain: "gizpoddatabase.firebaseapp.com",
  databaseURL: "https://gizpoddatabase-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gizpoddatabase",
  storageBucket: "gizpoddatabase.appspot.com",
  messagingSenderId: "4043380969",
  appId: "1:4043380969:web:00d83f798ecbd76ebcf878",
  measurementId: "G-87GX194NVW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, ref, database, onValue, push};

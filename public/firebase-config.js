// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAGZ2tMj3AKjiLtOvaDHPW4XMYpdTR2VQ",
  authDomain: "mi-casita-7ca95.firebaseapp.com",
  projectId: "mi-casita-7ca95",
  storageBucket: "mi-casita-7ca95.appspot.com",
  messagingSenderId: "770244630610",
  appId: "1:770244630610:web:66122916ee6de23efa278b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

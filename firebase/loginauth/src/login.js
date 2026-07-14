import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, GithubAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  // your config here
  apiKey: "AIzaSyA6WwloRdoJ4zVRkpz-3D7z6pUm4bkLzQk",
  authDomain: "test-f3b25.firebaseapp.com",
  projectId: "test-f3b25",
  storageBucket: "test-f3b25.firebasestorage.app",
  messagingSenderId: "630333775917",
  appId: "1:630333775917:web:0859a937ff3b3b497618a4",
  measurementId: "G-NEHHKKPHLX"
};

initializeApp(firebaseConfig);
const auth = getAuth();

export default function FirebaseLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const provider = new GithubAuthProvider();

  const signIn = async () => {
   //  await signInWithEmailAndPassword(auth, email, password);
   let user_credential =await createUserWithEmailAndPassword(auth,email,password);
   let user_email = user_credential.user;
   console.log("user_credential",user_credential);
   
   console.log("hello",user_email);
   let send_email = await sendEmailVerification(user_email);
   console.log("SEND EMIAL",send_email);
  };

  const GithubLogin = async () => {
    alert("clicked githun")
    let user_credential = await signInWithPopup(auth, provider);
    const credential = GithubAuthProvider.credentialFromResult(user_credential);
    const token = credential.accessToken;
    const user = user_credential.user;
    console.log("log",user);
    
  }
   
  return (
    <div className="login">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button className="btn btn-pink" onClick={signIn}>
        new sigin
      </button>
      <button className="btn btn-pink" onClick={GithubLogin}>
        Github sigin
      </button>
    </div>
  );
}

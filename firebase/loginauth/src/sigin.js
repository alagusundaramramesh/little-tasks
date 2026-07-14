import React from "react";
import { useState } from "react";
export default function FirebaseSignup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const signIn = ()=>{

    }
    return (
        <>

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
                    login
                </button>
            </div>
        </>
    );
}
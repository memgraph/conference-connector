import { Grid } from "@mui/material";
import { useState } from "react";
import styles from '../styles/Home.module.css'
import * as EmailValidator from 'email-validator';


export default function ClaimForm() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const [isNameValid, setIsNameValid] = useState(false);
    const [invitationText, setInvitationText] = useState("Join the graph!");
    const [usernameLabel, setUsernameLabel] = useState("Twitter username");


    const resetForm = () => {
        setUsername("");
        setName("");
        setEmail("");
        setIsEmailValid(false);
        setIsUsernameValid(false);
        setIsNameValid(false);
        setUsernameLabel("Twitter username");
        (document.getElementById("name") as HTMLInputElement).value = "";
        (document.getElementById("email") as HTMLInputElement).value = "";
        (document.getElementById("username") as HTMLInputElement).value = "";
    }


    const handleUsernameChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        let username = String(e.target.value);
        let usernameInput = document.getElementById("username")!;

        if (username !== "") {
            setIsUsernameValid(true);
            usernameInput.style.borderColor = "green";
        }
        else {
            setIsUsernameValid(false);
            usernameInput.style.borderColor = "red";
        }
        setUsername(username);
    };

    const handleEmailChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        const val = e.target.value;
        let emailInput = document.getElementById("email")!;

        if (EmailValidator.validate(String(val))) {
            setIsEmailValid(true);
            emailInput.style.borderColor = "green";
        } else {
            setIsEmailValid(false);
            emailInput.style.borderColor = "red";
        }

        setEmail(val);
    };

    const handleNameChange = (e: { target: { value: string; }; }) => {
        const reg = new RegExp(/^[a-zA-Z]+( [a-zA-Z]+)+$/);
        const val = e.target.value;
        let nameInput = document.getElementById("name")!;

        if (reg.test(val)) {
            setIsNameValid(true);
            nameInput.style.borderColor = "green";
        } else {
            setIsNameValid(false);
            nameInput.style.borderColor = "red";
        }

        setName(val);
    };

    const sendSignupData = async (userData: any) => {
        const response = await fetch("http://localhost:8000/signup", {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(userData)
        })

        console.log(response.ok);
        if (!response.ok) {
            if (response.status === 404) {
                setIsUsernameValid(false);
                setUsernameLabel("Please enter a valid Twitter handle");
            }
            else {
                //currently this happens only with ', quotes should be escaped in username
                console.log("Something went wrong. Please try again.");
            }
        }
        else {
            //setIsConnected(true);
            setInvitationText("Visit Memgraph booth number 230 and find yourself on the graph!");
            resetForm();
        }
    }

    const handleJoin = () => {
        // strip string if it begins with @
        let newUsername = username.charAt(0) === "@" ? username.substring(1) : username;

        let userData = {
            "name": name,
            "username": newUsername,
            "email": email

        }

        sendSignupData(userData).then((data: any) => {
        }).catch((e) => {
            console.log(e.message)
        });

    };

    return (
        <div>
            <div className={styles.formLogoImage}>
                <a href="https://www.memgraph.com/" target="_blank" rel="noopener noreferrer">
                    <img src='/home/memgraph-logo.png'></img>
                </a>
            </div>
            <div className={styles.claimForm}>
                <Grid container spacing={3}>
                    <Grid item sm={12} xs={12}>
                        <h3>{invitationText}</h3>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <Grid container spacing={1}>
                            <Grid item sm={12} xs={12}>
                                <label className={styles.claimLabel}>{usernameLabel}</label>
                            </Grid>
                            <Grid item sm={12} xs={12}>
                                <div className={styles.claimInput}>
                                    <input id="username" type="text" placeholder="@username" onChange={handleUsernameChange} required></input>
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <Grid container spacing={1}>
                            <Grid item sm={12} xs={12}>
                                <label className={styles.claimLabel}>Email</label>
                            </Grid>
                            <Grid item sm={12} xs={12}>
                                <div className={styles.claimInput}>
                                    <input id="email" type="text" placeholder="username@gmail.com" onChange={handleEmailChange} required></input>
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <Grid container spacing={1}>
                            <Grid item sm={12} xs={12}>
                                <label className={styles.claimLabel}>Full name</label>
                            </Grid>
                            <Grid item sm={12} xs={12}>
                                <div className={styles.claimInput}>
                                    <input id="name" type="text" placeholder="John Smith" onChange={handleNameChange} required></input>
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sm={12}>
                        <button id="" className={styles.joinButton} onClick={handleJoin} disabled={!isUsernameValid || !isEmailValid || !isNameValid}>JOIN</button>
                    </Grid>
                </Grid>
            </div>

        </div>
    )
}

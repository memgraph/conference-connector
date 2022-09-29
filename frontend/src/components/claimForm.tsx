import { Grid } from "@mui/material";
import { useState } from "react";
import styles from '../styles/Home.module.css'
import * as EmailValidator from 'email-validator';



const ClaimForm = () => {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const [isNameValid, setIsNameValid] = useState(false);
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

    const closeForm = () => {
        resetForm();
        let blur = document.getElementById("pop-up-background")!;
        let popUp = document.getElementById("pop-up")!;
        blur.style.display = "none";
        popUp.style.display = "none";
    }



    const handleUsernameChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        let username = String(e.target.value);
        let usernameInput = document.getElementById("username")!;
        const reg = new RegExp(/^[A-Za-z0-9\_]+$/);

        if (!reg.test(username) || username.length > 15) {
            setIsUsernameValid(false);
            usernameInput.style.borderColor = "red";
        }
        else {
            setIsUsernameValid(true);
            usernameInput.style.borderColor = "green";
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
        const response = await fetch("https://conconnector.memgraph.com/api/signup", {
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
                console.log("Something went wrong. Please try again.");
            }
        }
        else {
            closeForm();
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
            //setIsConnected(true);
        }).catch((e) => console.log(e.message))

    };

    return (
        <div>
            <div className={styles.formLogoImage}>
                <a href="https://www.memgraph.com/" target="_blank" rel="noopener noreferrer">
                    <img src='/home/memgraph-logo.png'></img>
                </a>
            </div>

            <button className={styles.buttonClose} onClick={closeForm}>
                <img src='/home/close-icon.svg'></img>
            </button>


            <div className={styles.claimForm}>

                <Grid container spacing={3}>
                    <Grid item sm={12} xs={12}>
                        <h3>Join the graph!</h3>
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
                        <button className={styles.joinButton} onClick={handleJoin} disabled={!isUsernameValid || !isEmailValid || !isNameValid}>Join</button>
                    </Grid>
                </Grid>
            </div>
        </div>

    )
}

export default ClaimForm;

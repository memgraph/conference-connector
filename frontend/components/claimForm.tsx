import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MyButton from './mybutton';
import * as EmailValidator from 'email-validator'

export default function ClaimForm() {
    const [open, setOpen] = React.useState(false);
    const [username, setUsername] = React.useState("");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [isEmailValid, setIsEmailValid] = React.useState(false)
    const [isUsernameValid, setIsUsernameValid] = React.useState(true)
    const [isNameValid, setIsNameValid] = React.useState(false)
    const [isConnected, setIsConnected] = React.useState(false)
    const [usernameLabel, setUsernameLabel] = React.useState("Twitter handle")
    const [description, setDescription] = React.useState("")

    var validator = require('email-validator')

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
                setDescription("Something went wrong. Please try again.");
            }
        }
        else {
            setOpen(false);
        }
    }

    const handleClickOpen = () => {
        console.log("open")
        setOpen(true);
    };

    const handleClose = () => {
        console.log("close")
        setOpen(false);
    };

    const handleConnect = () => {
        // strip string if it begins with @
        let userData = {
            "name": name,
            "username": username,
            "email": email

        }

        console.log("connect")
        console.log(username)
        console.log(name)
        console.log(email)

        sendSignupData(userData).then((data: any) => {
            //setIsConnected(true);
        }).catch((e) => console.log(e.message))

        // fetch("http://localhost:8000/signup", {
        //     method: 'POST',
        //     mode: 'no-cors',
        //     body: JSON.stringify(jsonData)
        // }).then(response => {
        //     // check how to correctly read the response and status codes
        //     //console.log(response.json())
        //     //if the request is okay - user is in the database or is added now
        //     setIsConnected(true)
        //     //if the request is not okay - user gave the wrong handle, warn him!
        // })
        //     .then((responseJson) => {
        //         console.log(responseJson)
        //     })
        //     .catch((error) => {
        //         console.log(error)
        //     });


    };

    const handleNameChange = (e: { target: { value: string; }; }) => {
        const reg = new RegExp(/^[a-zA-Z]+( [a-zA-Z]+)+$/)
        const val = e.target.value

        if (reg.test(val)) {
            setIsNameValid(true);
        } else {
            setIsNameValid(false);
        }

        setName(val);
    };

    const handleUsernameChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setUsername(e.target.value);
    };

    const handleEmailChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        const val = e.target.value

        if (validator.validate(val)) {
            setIsEmailValid(true);
        } else {
            setIsEmailValid(false);
        }

        setEmail(val);
    };


    return (

        <div>
            <MyButton variant="outlined" onClick={handleClickOpen} disabled={isConnected}>
                Connect with the graph
            </MyButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Come to the graph side</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {description}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Full name"
                        type="text"
                        error={!isNameValid}
                        fullWidth
                        variant="standard"
                        onChange={handleNameChange}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label={usernameLabel}
                        type="text"
                        error={!isUsernameValid}
                        fullWidth
                        variant="standard"
                        onChange={handleUsernameChange}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Email"
                        type="email"
                        error={!isEmailValid}
                        fullWidth
                        variant="standard"
                        onChange={handleEmailChange}
                    />
                </DialogContent>
                <DialogActions>
                    <MyButton variant="text" onClick={handleClose}>Close</MyButton>
                    <MyButton disabled={!isUsernameValid || !isEmailValid || !isNameValid} variant="text" onClick={handleConnect}>Connect</MyButton>
                </DialogActions>
            </Dialog>

        </div>

    );
}

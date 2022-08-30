import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MyButton from './mybutton';
import Graph from './graph';

export default function PopUp() {
    const [open, setOpen] = React.useState(false);
    const [username, setUsername] = React.useState("");
    const [nodes, setNodes] = React.useState([]);
    const [edges, setEdges] = React.useState([]);
    const [isFound, setIsFound] = React.useState(false);

    const fetchParticipant = async (username: string) => {
        const response = await fetch('http://localhost:8000/user/' + username)
        if (!response.ok) {
            console.log("error happened")
            throw new Error('Data could not be fetched!')
        } else {
            return response.json()
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
        console.log("connect")
        console.log(username)

        fetchParticipant(username)
            .then((res) => {
                //console.log(res);
                console.log(res.nodes)
                console.log(res.relationships)
                setNodes(res.nodes);
                setEdges(res.relationships);
                setIsFound(true);
            })
            .catch((e) => console.log(e.message));


        // send username for participant component to fetch

        setOpen(false);
    };

    const handleUsernameChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setUsername(e.target.value);
    };


    return (

        <div>
            <MyButton variant="outlined" onClick={handleClickOpen} disabled={false}>
                Find me
            </MyButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Find your connections</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label="Twitter handle"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleUsernameChange}
                    />
                </DialogContent>
                <DialogActions>
                    <MyButton variant="text" onClick={handleClose}>Close</MyButton>
                    <MyButton variant="text" onClick={handleConnect}>Find me</MyButton>
                </DialogActions>
            </Dialog>
            {isFound && <Graph nodes={nodes} edges={edges}></Graph>}
        </div>

    );
}

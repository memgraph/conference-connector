import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MyButton from './mybutton';

export default function PopUp() {
    const textFieldSx = {
        color: "#fb6d00"
    }

    const [open, setOpen] = React.useState(true);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <MyButton variant="outlined" onClick={handleClickOpen}>
                Connect with the graph
            </MyButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Conference Connector</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Get started by entering your Twitter handle <i className="fa-brands fa-twitter"></i>
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Twitter username"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <MyButton variant="text" onClick={handleClose}>Close</MyButton>
                    <MyButton variant="text" onClick={handleClose}>Connect</MyButton>
                </DialogActions>
            </Dialog>
        </div>
    );
}

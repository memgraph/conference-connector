import { Grid } from "@mui/material";
import { useState } from "react";
import styles from '../styles/Home.module.css'
import Graph from "./graph";

interface Props {
    position: string,
    fullName: string,
    username: string,
    handleGraphUpdate: any
}

const LeaderboardCard: React.FC<Props> = ({ position, fullName, username, handleGraphUpdate }) => {
    const fetchParticipant = async (username: string) => {
        console.log("USERNAME: %s", username);
        const response = await fetch('http://localhost:8000/api/user/' + username)
        if (!response.ok) {
            console.log("error happened")
            throw new Error('Data could not be fetched!')
        } else {
            return response.json()
        }
    }

    function stripMonkey(username: string) {
        if (username.charAt(0) === "@") {
            return username.substring(1);
        }
        else {
            return username;
        }
    }

    function cleanTweet() {
        let tweetText = document.getElementById("tweet-text")!;
        //fade out
        tweetText.style.opacity = "0";
        //wait for the transition
        setTimeout(function () {
            tweetText.innerHTML = "";
            //fade in
            tweetText.style.opacity = "1";
        }, 500);
    }

    function handleClick() {
        fetchParticipant(stripMonkey(username))
            .then((res) => {
                cleanTweet();
                // send data to parent component
                handleGraphUpdate(res.nodes, res.relationships, username);
            })
            .catch((e) => console.log(e.message));
    }
    return (
        <Grid item sm={12} xs={12}>
            <div className={styles.leaderboardCard}>
                <div className={styles.rankingNumber}>
                    {position}
                </div>
                <Grid container>
                    <Grid item sm={12} xs={12}>
                        <div className={styles.fullName}>
                            {fullName}
                        </div>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <div className={styles.username}>
                            {username}
                        </div>
                    </Grid>
                </Grid>
                <div className={styles.cardArrow}>
                    <button className={styles.buttonArrow} onClick={handleClick}>
                        <img src="/home/arrow-right.svg" alt='Arrow right'></img>
                    </button>
                </div>
            </div>
        </Grid>
    );
}

export default LeaderboardCard

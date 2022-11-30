import { Grid } from "@mui/material";
import { useState } from "react";
import styles from '../styles/Home.module.css'
import Graph from "./graph";

interface Props {
    position: number,
    routeKey: string,
    name: string,
    handleGraphUpdate: any
}

const ChooseGraphCard: React.FC<Props> = ({ position, routeKey, name, handleGraphUpdate }) => {

    const fetchGraph = async (graphTag: string) => {
        const response = await fetch('https://tweetfluencer.memgraph.com/api/graph/' + graphTag);
        // const response = await fetch('http://localhost:8000/api/graph/' + graphTag);
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
        fetchGraph(stripMonkey(routeKey))
            .then((res) => {
                cleanTweet();
                // send data to parent component
                handleGraphUpdate(res.nodes, res.relationships, routeKey, name);
            })
            .catch((e) => console.log(e.message));
    }
    return (
        <Grid item sm={12} xs={12}>
            <div className={styles.leaderboardCard}>
                <div className={styles.rankingNumber}>
                    {position + 1}
                </div>
                <Grid container>
                    <Grid item sm={12} xs={12}>
                        <div className={styles.fullName}>
                            {routeKey}
                        </div>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <div className={styles.username}>
                            {name}
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

export default ChooseGraphCard;

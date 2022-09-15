import { Grid } from "@mui/material";
import styles from '../styles/Home.module.css';
import React from 'react';

interface Props {
    position: string,
    fullName: string,
    username: string,
}

const LeaderboardCardMobile: React.FC<Props> = ({ position, fullName, username }) => {

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
            </div>
        </Grid>
    );
}

export default LeaderboardCardMobile;

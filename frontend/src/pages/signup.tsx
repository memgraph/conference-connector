import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import ClaimFormMobile from "../components/claimFormMobile"
import Footer from "../components/footer";
import FooterMobile from "../components/footerMobile";
import LeaderboardContainerMobile from "../components/leaderboardContainerMobile";
import LeaderboardMobile from "../components/leaderboardMobile";
import styles from '../styles/Home.module.css'


const Signup = () => {

    return (
        <div>
            <div className={styles.mobileTable}>
                <div className={styles.mobileHeader}>
                    <h2>Tweet and use #KafkaSummit or #Current22, join the graph and win the prize!</h2>
                </div>
            </div>
            <ClaimFormMobile></ClaimFormMobile>
            <LeaderboardContainerMobile></LeaderboardContainerMobile>
            <FooterMobile></FooterMobile>
        </div>
    )
}

export default Signup;

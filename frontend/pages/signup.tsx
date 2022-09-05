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
            <ClaimFormMobile></ClaimFormMobile>
            <LeaderboardContainerMobile></LeaderboardContainerMobile>
            <FooterMobile></FooterMobile>
        </div>
    )
}

export default Signup;

import { Grid } from '@mui/material';
import styles from '../styles/Footer.module.css'
import React from 'react'


function Footer() {
    return (
        <footer className={styles.footer}>
            <Grid container height="100%">
                <Grid item xs={12} sm={4}>
                    <div className={styles.logo}>
                        <a href="https://www.memgraph.com/" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Memgraph-logo-gradient-rgb.svg' alt='memgraph' />
                        </a>
                    </div>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <div className={styles.description}>
                        Tweet @BigData_LDN or use #BigDataLDN
                    </div>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <div className={styles.socials}>
                        <a href="https://discord.gg/memgraph" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Discord.svg' alt='discord' />
                        </a>
                        <a href="https://github.com/memgraph" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Github.svg' alt='github' />
                        </a>
                        <a href="https://twitter.com/memgraphdb" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Twitter.svg' alt='twitter' />
                        </a>
                        <a href="https://www.facebook.com/memgraph/" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Facebook.svg' alt='facebook' />
                        </a>
                        <a href="https://www.linkedin.com/company/memgraph" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Linkedin.svg' alt='linkedin' />
                        </a>
                    </div>
                </Grid>
            </Grid>
        </footer>
    );
}

export default Footer;

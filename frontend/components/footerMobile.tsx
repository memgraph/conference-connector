import { Grid } from "@mui/material";
import styles from '../styles/Home.module.css';

const FooterMobile = () => {

    return (
        <div className={styles.footerMobile}>
            <Grid container>
                <Grid item sm={12} xs={12}>
                    <div className={styles.logoMobile}>
                        <a href="https://www.memgraph.com/" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Memgraph-logo-gradient-rgb.svg' alt='memgraph' />
                        </a>
                    </div>
                </Grid>
                <Grid item sm={3} xs={3}>
                    <div className={styles.discordMobile}>
                        <a href="https://discord.gg/memgraph" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Discord.svg' alt='discord' />
                        </a>
                    </div>
                </Grid>
                <Grid item sm={3} xs={3}>
                    <div className={styles.githubMobile}>
                        <a href="https://github.com/memgraph" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Github.svg' alt='github' />
                        </a>
                    </div>
                </Grid>
                <Grid item sm={3} xs={3}>
                    <div className={styles.twitterMobile}>
                        <a href="https://twitter.com/memgraphdb" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Twitter.svg' alt='twitter' />
                        </a>
                    </div>
                </Grid>
                <Grid item sm={3} xs={3}>
                    <div className={styles.linkedinMobile}>
                        <a href="https://www.linkedin.com/company/memgraph" target="_blank" rel="noopener noreferrer">
                            <img src='/footer/Linkedin.svg' alt='linkedin' />
                        </a>
                    </div>
                </Grid>

            </Grid>
        </div>
    );
}

export default FooterMobile;

import { Box, Button, TextField } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import IconButton from '@mui/material/IconButton';

const buttonSx = {
  color: "#fb6d00",
  borderColor: "#fb6d00",
  textAlign: "center",
  "&:hover": {
    borderColor: "#fb6d00",
    color: "#F9F9F9",
    backgroundColor: "#fb6d00"
  },
};


const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      <Head>
        <title>Conference Connector</title>
        <meta name="description" content="Connect to Big Data London 2022 conference graph!" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Conference Connector
        </h1>
        <h2>
          Big Data London 2022
        </h2>
        <h2>
          Get started by entering your Twitter handle <i className="fa-brands fa-twitter"></i>
        </h2>

        <Grid container>
          <Grid xs={12}>
            <Box m={1}
              display="flex"
              justifyContent="center"
              alignItems="center">
              <TextField id="outlined-basic" label="Enter username" variant="outlined" />
            </Box>
          </Grid>
          <Grid xs={12}>
            <Box
              m={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Link href="/stats">
                <Button sx={buttonSx} variant="outlined" size="large">Connect</Button>
              </Link>
            </Box>
            <Box
              m={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Link href="/stats">
                <IconButton sx={{ color: "#fb6d00" }}>
                  <ArrowForwardIosIcon fontSize='large'></ArrowForwardIosIcon>
                </IconButton>
              </Link>
            </Box>
          </Grid>
        </Grid>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://memgraph.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/memgraph-logo.png" alt="Memgraph Logo" width={25} height={19} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home

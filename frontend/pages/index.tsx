import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import PopUp from '../components/popup'
import Footer from '../components/footer'
import AlignItemsList from '../components/alignItemsList'
import Graph from '../components/graph'
import { Grid } from '@mui/material'

const Home: NextPage = () => {
  return (
    <div className={styles.page}>

      <div className={styles.container}>
        <Head>
          <title>Conference Connector</title>
          <meta name="description" content="Connect to Big Data London 2022 conference graph!" />
        </Head>
        <h1 className={styles.title}>
          Conference Connector
        </h1>
        <div className={styles.description}>
          <PopUp></PopUp>
        </div>
      </div>
      <Grid container spacing={4}>
        <Grid item xs={2}>
          <AlignItemsList></AlignItemsList>
        </Grid>
      </Grid>
      <div className={styles.graphStyle}>
        <Graph></Graph>
      </div>
      <Footer></Footer>
    </div>
  )
}

export default Home

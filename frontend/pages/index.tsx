import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import PopUp from '../components/popup'
import Footer from '../components/footer'
import AlignItemsList from '../components/alignItemsList'
import Graph from '../components/graph'
import { Grid } from '@mui/material'
import io, { Socket } from 'socket.io-client'
import { useEffect } from 'react'
import { DefaultEventsMap } from '@socket.io/component-emitter'

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Home: NextPage = () => {

  // useEffect(() => {
  //   socketInitializer();
  // }, []);

  // const socketInitializer = async () => {
  //   // We just call it because we don't need anything else out of it
  //   await fetch("http://localhost:8000/");

  //   socket = io();

  //   socket.on("newIncomingMessage", (msg) => {
  //     // setMessages((currentMsg) => [
  //     //   ...currentMsg,
  //     //   { author: msg.author, message: msg.message },
  //     // ]);
  //     console.log(msg);
  //   });
  // };
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
      {/* <Grid container spacing={4}>
        <Grid item xs={2}>
          <AlignItemsList></AlignItemsList>
        </Grid>
      </Grid> */}
      <div className={styles.graphStyle}>
        <Graph socket={socket}></Graph>
      </div>
      {/* <Footer></Footer> */}
    </div>
  )
}

export default Home

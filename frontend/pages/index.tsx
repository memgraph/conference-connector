import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Footer from '../components/footer'
import AlignItemsList from '../components/alignItemsList'
import { Button, Grid } from '@mui/material'
import io, { Socket } from 'socket.io-client'
import { SetStateAction, useEffect, useState } from 'react'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import User from '../components/graph'
import Participant from '../components/graph'
import Search from '../components/search'
import MainGraph from '../components/mainGraph'
import ClaimForm from '../components/claimForm'
import LeaderboardCard from '../components/leaderboardCard'
import Graph from '../components/graph'

//let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Home: NextPage = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [key, setKey] = useState("");
  const [isParticipant, setIsParticipant] = useState(false);

  function goToGraphView() {
    setIsParticipant(false);
  }

  function handleGraphUpdate(updatedNodes: any, updatedEdges: any, updatedUsername: string) {
    console.log("HERE I AM");
    console.log(updatedNodes);
    console.log(updatedEdges);
    let newNodes: any = [...updatedNodes];
    let newEdges: any = [...updatedEdges];

    setNodes(newNodes);
    setEdges(newEdges);
    setKey(updatedUsername);
    setIsParticipant(true);
  }

  // useEffect(() => {
  //   console.log(nodes)
  // }, [nodes]);

  useEffect(() => {

  }, [])

  return (
    <div className={styles.page}>

      <Head>
        <title>Conference Connector</title>
        <meta name="description" content="Connect to Big Data London 2022 conference graph!" />
      </Head>
      <div className={styles.bodyGrid}>
        <div className={styles.buttonBack} hidden={!isParticipant}>
          <button onClick={goToGraphView}>
            Back to main graph
          </button>
        </div>
        <Grid container spacing={2}>
          <Grid item sm={9} xs={12}>
            {isParticipant
              ? <Graph key={key} nodes={nodes} edges={edges}></Graph>
              : <MainGraph></MainGraph>
            }
          </Grid>
          <Grid item sm={3} xs={12}>
            <Grid container spacing={3}>
              <Grid item sm={12} xs={12}>
                <div style={{ height: "464px" }}>
                  <div className={styles.joinGraph}>
                    <button className={styles.joinGraphButton}>
                      Join the graph
                    </button>
                  </div>
                  <div className={styles.leaderboard}>
                    <h2>Leaderboard</h2>
                    <div className={styles.searchLeaderboard}>
                      <input type="text" placeholder="Enter a Twitter handle" />
                    </div>
                    <div className={styles.rankings}>
                      <Grid container spacing={1}>
                        <LeaderboardCard rank="1" fullName="Memgraph" username="@memgraphdb" handleGraphUpdate={handleGraphUpdate}></LeaderboardCard>
                        <LeaderboardCard rank="2" fullName="Ante Javor" username="@AnteJavor" handleGraphUpdate={handleGraphUpdate}></LeaderboardCard>
                        <LeaderboardCard rank="3" fullName="Kruno Golubic" username="@kgolubic" handleGraphUpdate={handleGraphUpdate}></LeaderboardCard>
                        <LeaderboardCard rank="4" fullName="Vlasta Pavicic" username="@vpavicic" handleGraphUpdate={handleGraphUpdate}></LeaderboardCard>
                        <LeaderboardCard rank="4" fullName="Katarina Supe" username="@supe_katarina" handleGraphUpdate={handleGraphUpdate}></LeaderboardCard>
                      </Grid>
                    </div>
                  </div>
                </div>
              </Grid>
              {/* <Grid item sm={12} xs={12}>
                <div style={{ backgroundColor: "#E6E6E6", height: "219px" }}>
                </div>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Footer></Footer>

    </div >
  )
}

export default Home

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
import JoinGraph from '../components/joinGraph'
import ClaimFormNew from '../components/claimFormNew'

//let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Home: NextPage = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [key, setKey] = useState("");
  const [isParticipant, setIsParticipant] = useState(false);
  // get all claimed usernames
  const [allData, setAllData] = useState([{ rank: "1", username: "memgraphdb", fullName: "Memgraph" }, { rank: "2", username: "AnteJavor", fullName: "Ante Javor" }, { rank: "3", username: "supe_katarina", fullName: "Katarina Supe" }, { rank: "4", username: "kgolubic", fullName: "Kruno Golubic" }, { rank: "5", username: "vpavicic", fullName: "Vlasta Pavicic" }]);
  const [filteredData, setFilteredData] = useState(allData);


  function handleUsernameChange(e: { target: { value: React.SetStateAction<string>; }; }) {
    let value = String(e.target.value).toLowerCase();
    let result = allData.filter((data) => {
      let dataUsername = data.username.toLowerCase();
      return dataUsername.search(value) != -1;
    });
    setFilteredData(result);
  }

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
    // fetch leaderboard and create allData array
    //setAllData
    //setFilteredData
  }, [])

  return (
    <div className={styles.page}>

      <Head>
        <title>Conference Connector</title>
        <meta name="description" content="Connect to Big Data London 2022 conference graph!" />
      </Head>
      <div id="pop-up-background" className={styles.popUpBackground}>
      </div>
      <div id="pop-up" className={styles.popUp}>
        <ClaimFormNew></ClaimFormNew>
      </div>
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
                  <JoinGraph></JoinGraph>
                  <div className={styles.leaderboard}>
                    <h2>Leaderboard</h2>
                    <div className={styles.searchLeaderboard}>
                      <input type="text" placeholder="Enter a Twitter handle" onChange={handleUsernameChange} />
                    </div>
                    <div className={styles.rankings}>
                      <Grid container spacing={1}>
                        {filteredData.map((value, index) => {
                          return (
                            <LeaderboardCard key={value.rank} rank={value.rank} fullName={value.fullName} username={value.username} handleGraphUpdate={handleGraphUpdate}></LeaderboardCard>
                          );
                        })}
                      </Grid>
                    </div>
                  </div>
                </div>
              </Grid>
              {/* <Grid item sm={12} xs={12}>
                <div style={{ backgroundColor: "#E6E6E6", height: "219px" }}>
                </div>
              </Grid>  */}
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Footer></Footer>

    </div >
  )
}

export default Home

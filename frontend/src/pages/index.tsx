import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Footer from '../components/footer'
import { Grid } from '@mui/material'
import { useEffect, useState } from 'react'
import MainGraph from '../components/mainGraph'
import Graph from '../components/graph'
import JoinGraph from '../components/joinGraph'
import ClaimForm from '../components/claimForm'
import LeaderboardContainer from '../components/leaderboardContainer'

//let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Home: NextPage = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [key, setKey] = useState("");
  const [isParticipant, setIsParticipant] = useState(false);
  const [claimedUsername, setClaimedUsername] = useState("");

  function cleanTweet() {
    let tweetText = document.getElementById("tweet-text")!;
    //fade out
    tweetText.style.opacity = "0";
    //wait for the transition
    setTimeout(function () {
      tweetText.innerHTML = "";
      //fade in
      tweetText.style.opacity = "1";
    }, 500);
  }

  function goToGraphView() {
    cleanTweet();
    setIsParticipant(false);
  }

  function handleGraphUpdate(updatedNodes: any, updatedEdges: any, updatedUsername: string) {
    console.log(updatedNodes);
    console.log(updatedEdges);
    let newNodes: any = [...updatedNodes];
    let newEdges: any = [...updatedEdges];

    setNodes(newNodes);
    setEdges(newEdges);
    setKey(updatedUsername);
    setIsParticipant(true);
  }

  function handleClaim(username: string) {
    setClaimedUsername(username);
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
        <meta name="description" content="Connect to Current 2022 conference graph!" />
      </Head>
      <div id="pop-up-background" className={styles.popUpBackground}>
      </div>
      <div id="pop-up" className={styles.popUp}>
        <ClaimForm></ClaimForm>
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
              ? <Graph key={key} nodes={nodes} edges={edges} isUserView={true}></Graph>
              : <MainGraph></MainGraph>
            }
          </Grid>
          <Grid item sm={3} xs={12}>
            <Grid container spacing={3}>
              <Grid item sm={12} xs={12}>
                <div style={{ height: "464px" }}>
                  <JoinGraph></JoinGraph>
                  <LeaderboardContainer handleGraphUpdate={handleGraphUpdate}></LeaderboardContainer>
                </div>
              </Grid>
              <Grid item sm={12} xs={12}>
                <div className={styles.tweets}>
                  <h2>Tweet</h2>
                  <p className={styles.tweetDescription}>Click on tweet and check its content</p>
                  <div id="current-tweet" className={styles.tweetContent}>
                    <div id="tweet-text" className={styles.tweetText}></div>
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Footer></Footer>

    </div >
  )
}

export default Home

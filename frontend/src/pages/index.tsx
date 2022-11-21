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
import ChooseGraphContainer from '../components/chooseGraphContainer'

//let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Home: NextPage = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [graphKey, setGraphKey] = useState("");
  const [graphName, setGraphName] = useState("");
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

  function handleGraphUpdate(updatedNodes: any, updatedEdges: any, updatedGraphKey: string, updatedGraphName: string) {
    let newNodes: any = [...updatedNodes];
    let newEdges: any = [...updatedEdges];

    setNodes(newNodes);
    setEdges(newEdges);
    setGraphKey(updatedGraphKey);
    setGraphName(updatedGraphName);
    setIsParticipant(true);
    console.log("updated local: " + updatedGraphName);
    console.log("variable: " + graphKey);
  }

  function handleGraphName(graphKey: string, graphName: string) {
    setGraphKey(graphKey);
    setGraphName(graphName);
  }

  function handleClaim(username: string) {
    setClaimedUsername(username);
  }

  return (
    <div className={styles.page}>

      <Head>
        <title>Memgraph's Tweetfluencer</title>
        <meta name="description" content="Discovering most influential people on Twitter!" />
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
              ? <Graph key={graphKey} nodes={nodes} edges={edges} isUserView={true}></Graph>
              : <MainGraph handleGraphName={handleGraphName}></MainGraph>
            }
          </Grid>
          <Grid item sm={3} xs={12}>
            <Grid container spacing={1}>
              <Grid item sm={12} xs={12}>
                <div className={styles.tweets}>
                  <h2>Tweet</h2>
                  <p className={styles.tweetDescription}>Click on tweet and check its content</p>
                  <a id="link-to-tweet" target="_blank" className={styles.tweetLink}></a>
                  <div id="current-tweet" className={styles.tweetContent}>
                  <div id="tweet-text" className={styles.tweetText}></div>
                  </div>
                </div>
              </Grid>
              <Grid item sm={12} xs={12}>
                <div>
                  <ChooseGraphContainer handleGraphUpdate={handleGraphUpdate}></ChooseGraphContainer>
                </div>
              </Grid>
              <Grid item sm={12} xs={12}>
                <div style={{ height: "464px" }}>
                  <LeaderboardContainer key={graphKey} graphKey={graphKey} handleGraphUpdate={handleGraphUpdate}></LeaderboardContainer>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Footer graphName={graphName}></Footer>

    </div >
  )
}

export default Home

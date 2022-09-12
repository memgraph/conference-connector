import styles from '../styles/Home.module.css'

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

function onClick() {
    let blur = document.getElementById("pop-up-background")!;
    let popUp = document.getElementById("pop-up")!;
    blur.style.display = "block";
    popUp.style.display = "table";
    cleanTweet();
}

const JoinGraph = () => {
    return (
        <div className={styles.joinGraph}>
            <button className={styles.joinGraphButton} onClick={onClick}>
                JOIN THE GRAPH
            </button>
        </div>
    );
}

export default JoinGraph

import styles from '../styles/Home.module.css'


function onClick() {
    let blur = document.getElementById("pop-up-background")!;
    let popUp = document.getElementById("pop-up")!;
    blur.style.display = "block";
    popUp.style.display = "table";

}

const JoinGraph = () => {
    return (
        <div className={styles.joinGraph}>
            <button className={styles.joinGraphButton} onClick={onClick}>
                Join the graph
            </button>
        </div>
    );
}

export default JoinGraph

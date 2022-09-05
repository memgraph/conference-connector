import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'
import Leaderboard from './leaderboard';


interface Props {
    handleGraphUpdate: any,
}

const LeaderboardContainer: React.FC<Props> = ({ handleGraphUpdate }) => {
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


    useEffect(() => {
        // fetch leaderboard and create allData array
        //setAllData
        //setFilteredData
    }, []);


    return (
        <div className={styles.leaderboard}>
            <h2>Leaderboard</h2>
            <div className={styles.searchLeaderboard}>
                <input type="text" placeholder="Enter a Twitter username" onChange={handleUsernameChange} />
            </div>
            <div className={styles.rankings}>
                <Grid container spacing={1}>
                    <Leaderboard data={filteredData} handleGraphUpdate={handleGraphUpdate}></Leaderboard>
                </Grid>
            </div>
        </div>
    );
}

export default LeaderboardContainer;

import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'
import Leaderboard from './leaderboard';


interface GraphData {
    position: string;
    fullName: string;
    username: string;
}

interface Props {
    handleGraphUpdate: any,
}

const LeaderboardContainer: React.FC<Props> = ({ handleGraphUpdate }) => {
    const [allData, setAllData] = useState<Array<GraphData>>([]);
    const [filteredData, setFilteredData] = useState(allData);
    const [result, setResult] = useState<Array<GraphData>>([]);


    function handleUsernameChange(e: { target: { value: React.SetStateAction<string>; }; }) {
        let value = String(e.target.value).toLowerCase();
        let result = allData.filter((data) => {
            let dataUsername = data.username.toLowerCase();
            return dataUsername.search(value) != -1;
        });
        setFilteredData(result);
    }

    useEffect(() => {
        const fetchLeaderboard = async () => {
            console.log("fetching leaderboard");
            try {
                const response = await fetch('https://conconnector.memgraph.com/api/ranked')
                if (!response.ok) {
                    console.log("error happened")
                    throw new Error('Data could not be fetched!')
                } else {
                    const res = await response.json();
                    setResult(res.page_rank);
                }
            } catch (error) {
                console.log(error);
            }
        }

        const id = setInterval(() => {
            fetchLeaderboard();
        }, 10000);

        fetchLeaderboard();

        return () => clearInterval(id);

    }, []);


    if (result !== undefined) {
        if (result.length != allData.length) {
            setAllData(result);
            setFilteredData(result);
        }
    }

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

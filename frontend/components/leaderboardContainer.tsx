import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'
import Leaderboard from './leaderboard';


interface GraphData {
    fullName: string;
    username: string;
}

interface Props {
    handleGraphUpdate: any,
}

const LeaderboardContainer: React.FC<Props> = ({ handleGraphUpdate }) => {
    const [allData, setAllData] = useState<Array<GraphData>>([]);
    const [filteredData, setFilteredData] = useState(allData);


    function handleUsernameChange(e: { target: { value: React.SetStateAction<string>; }; }) {
        let value = String(e.target.value).toLowerCase();
        let result = allData.filter((data) => {
            let dataUsername = data.username.toLowerCase();
            return dataUsername.search(value) != -1;
        });
        setFilteredData(result);
    }

    const fetchLeaderboard = async () => {
        console.log("fetching leaderboard");
        const response = await fetch('http://localhost:8000/ranked')
        if (!response.ok) {
            console.log("error happened")
            throw new Error('Data could not be fetched!')
        } else {
            return response.json()
        }

    }

    // renders twice - can be changed in next.js config with reactStrictMode: false
    useEffect(() => {
        fetchLeaderboard()
            .then((res) => {
                setAllData(res.page_rank);
                setFilteredData(res.page_rank);
            })
            .catch((e) => console.log(e.message));

        // fetch every 30 seconds
        setInterval(fetchLeaderboard, 30000);
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

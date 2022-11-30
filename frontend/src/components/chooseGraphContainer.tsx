import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'
import ChooseGraph from './chooseGraph';


interface GraphData {
    key: string;
    name: string;
}

interface Props {
    handleGraphUpdate: any,
}

const ChooseGraphContainer: React.FC<Props> = ({ handleGraphUpdate }) => {
    const [allData, setAllData] = useState<Array<GraphData>>([]);
    const [filteredData, setFilteredData] = useState(allData);
    const [result, setResult] = useState<Array<GraphData>>([]);

    useEffect(() => {
        const fetchAvailableGraphs = async () => {
            try {
                const response = await fetch('https://tweetfluencer.memgraph.com/api/available-graphs/');
                // const response = await fetch('http://localhost:8000/api/available-graphs/');
                if (!response.ok) {
                    console.log("error happened")
                    throw new Error('Data could not be fetched!')
                } else {
                    const res = await response.json();
                    setResult(res.graphs);
                    setAllData(res.graphs);
                }
            } catch (error) {
                console.log(error);
            }
        }

        const id = setInterval(() => {
            fetchAvailableGraphs();
        }, 10000);

        fetchAvailableGraphs();

        return () => clearInterval(id);

    }, []);


    if (result !== undefined) {
        if (result.length != allData.length) {
            setAllData(result);
            setFilteredData(result);
        }
    }

    return (
        <div className={styles.chooseGraphContainer}>
            <h3>Choose a graph based on recent events!</h3>
            <div className={styles.rankings}>
                <Grid container spacing={1}>
                    <ChooseGraph data={result} handleGraphUpdate={handleGraphUpdate}></ChooseGraph>
                </Grid>
            </div>
        </div>
    );
}

export default ChooseGraphContainer;

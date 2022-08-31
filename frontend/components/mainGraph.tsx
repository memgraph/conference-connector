import { useEffect, useState } from "react"
import Graph from "./graph";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';


const MainGraph = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchData = async () => {
        const response = await fetch('http://localhost:8000/graph')
        if (!response.ok) {
            throw new Error('Data could not be fetched!')
        } else {
            return response.json()
        }
    }

    useEffect(() => {
        fetchData()
            .then((res) => {
                setNodes(res.nodes)
                setEdges(res.relationships)
                setIsLoaded(true)
            })
            .catch((e) => console.log(e.message))

    }, []);

    if (isLoaded) {
        return (
            <Graph nodes={nodes} edges={edges}></Graph>
        );
    }
    // center circular loader
    else {
        return (
            <Box sx={{ display: 'flex' }}>
                <CircularProgress />
            </Box>
        );
    }
}

export default MainGraph;

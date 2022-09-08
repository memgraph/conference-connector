import { useEffect, useState } from "react"
import Graph from "./graph";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';


const MainGraph = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchData = async () => {
        console.log("fetching main graph");
        const response = await fetch('http://localhost:8000/graph');
        if (!response.ok) {
            throw new Error('Data could not be fetched!');
        } else {
            return response.json();
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

        setInterval(fetchData, 10000);
    }, []);

    if (isLoaded) {
        return (
            <Graph nodes={nodes} edges={edges}></Graph>
        );
    }
    // center circular loader
    else {
        return (
            <Box sx={{ height: "100%" }} display="flex"
                alignItems="center"
                justifyContent="center">
                <CircularProgress sx={{ color: 'gray' }} />
            </Box>
        );
    }
}

export default MainGraph;

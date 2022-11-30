import { useEffect, useState } from "react"
import Graph from "./graph";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';


interface MyNode {
    id: string;
    label: string;
    p_id?: string;
    t_id?: string;
    name: string;
    username: string;
    claimed: boolean;
    image: string;
    rank: number;
    text?: string;
    hashtag: string;
    url: string;
}

interface MyEdge {
    id: string;
    start: string;
    end: string;
}

interface Result {
    nodes: MyNode[];
    relationships: MyEdge[];
}

interface Props {
    handleGraphName: any,
}

const MainGraph: React.FC<Props> = ({ handleGraphName }) => {
    const [nodes, setNodes] = useState<MyNode[]>([]);
    const [edges, setEdges] = useState<MyEdge[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [result, setResult] = useState<Result>();


    useEffect(() => {
        const fetchData = async () => {
            console.log("initial main graph");
            try {
                const availableGraphsResponse = await fetch('https://tweetfluencer.memgraph.com/api/available-graphs/');
                // const availableGraphsResponse = await fetch('http://localhost:8000/api/available-graphs/');
                if (!availableGraphsResponse.ok) {
                    throw Error("Error while fetching available graphs in the beginning!");
                } else {
                    const res = await availableGraphsResponse.json();
                    const availableGraph = res["graphs"][0]
                    handleGraphName(availableGraph["key"], availableGraph["name"]);
                }

                const response = await fetch('http://tweetfluencer.memgraph.com/api/graph/WC2022');
                // const response = await fetch('http://localhost:8000/api/graph/WC2022');
                if (!response.ok) {
                    throw new Error('Data could not be fetched!');
                } else {
                    const res = await response.json();
                    setResult(res);
                }
            } catch (error) {
                console.log(error);
            }
        }

        const id = setInterval(() => {
            fetchData();
        }, 60000);

        fetchData().then(() => setIsLoaded(true));

        return () => clearInterval(id);
    }, []);


    if (!isLoaded || result === undefined) {
        return (
            <Box sx={{ height: "100%" }} display="flex"
                alignItems="center"
                justifyContent="center">
                <CircularProgress sx={{ color: 'gray' }} />
            </Box>
        );
    }
    else {

        // set nodes when there is a new claim
        if (result.nodes.length != nodes.length) {
            setNodes(result.nodes);
        }
        if (result.relationships.length != edges.length) {
            setEdges(result.relationships)
        }
        // what if the claim has been changed?
        return (
            <Graph nodes={nodes} edges={edges} isUserView={false}></Graph>
        );
    }
}

export default MainGraph;

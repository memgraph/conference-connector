import { useEffect } from 'react';
import { Orb } from '../public/libs/orb/orb'

interface Props {
    nodes: any,
    edges: any
}

const Graph: React.FC<Props> = ({
    nodes,
    edges
}) => {

    useEffect(() => {
        console.log("participant is here");
        console.log(nodes);
        console.log(edges);
        const container: HTMLElement = document.getElementById("participant")!;
        const orb = new Orb(container);


        // Initialize nodes and edges
        orb.data.setup({ nodes, edges });
        console.log(orb.data.getNodes())
        console.log(orb.data.getEdges())

        orb.data
            .getNodes()
            .filter((node) => node.getLabel() === "Tweet")
            .forEach((node) => {
                node.properties.color = '#ff8000';
            });
        orb.data
            .getNodes()
            .filter((node) => node.getLabel() === "Participant")
            .forEach((node) => {
                node.properties.label = node.data.username;
                node.properties.color = node.data.claimed ? '#ffe100' : '#D1D1D1';
            });

        orb.view.render(() => {

            orb.view.recenter();

        });
    }, []);


    return (
        <div style={{ height: "800px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                <div id="participant" style={{ flex: "1", width: "100%" }}>Hi graph!</div>
            </div>
        </div>
    )
}

export default Graph;

import { useEffect } from 'react';
import { Orb } from '../public/libs/orb/orb';

interface Props {
    nodes: any,
    edges: any
}

const Graph: React.FC<Props> = ({
    nodes,
    edges
}) => {

    useEffect(() => {

        const container: HTMLElement = document.getElementById("graph")!;
        const orb = new Orb(container);

        // Initialize nodes and edges
        orb.data.setup({ nodes, edges });

        orb.data
            .getNodes()
            .filter((node) => node.getLabel() === "Tweet")
            .forEach((node) => {
                node.properties.color = '#8C0082';
                node.properties.size = 3;
                node.properties.fontSize = 3;
            });
        orb.data
            .getEdges()
            .filter((edge) => edge.getLabel() === "TWEETED_BY")
            .forEach((edge) => {
                edge.properties.fontSize = 2;
            })
        orb.data
            .getNodes()
            .filter((node) => node.getLabel() === "Participant")
            .forEach((node) => {
                node.properties.label = node.data.username;
                node.properties.color = node.data.claimed ? '#FB6E00' : '#BAB8BB';
                node.properties.size = 7;
                node.properties.fontSize = 3;
            });

        orb.view.render(() => {
            orb.view.recenter();
        });
    }, []);


    return (
        // <div style={{ height: "730px" }}>
        <div style={{ height: "80vh" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                <div id="graph" style={{ flex: "1", width: "100%", zIndex: "1" }}>Hi graph!</div>
            </div>
        </div>
    )
}

export default Graph;

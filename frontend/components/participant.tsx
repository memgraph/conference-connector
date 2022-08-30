import { useEffect, useState } from "react"
import { Orb } from '../public/libs/orb/orb'


const Participant: any = () => {

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
                const container: HTMLElement = document.getElementById("graph")!;
                const orb = new Orb(container);
                let nodes = res.nodes;
                let edges = res.relationships;

                // Initialize nodes and edges
                orb.data.setup({ nodes, edges });

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
                    orb.view.recenter()
                });
            })
            .catch((e) => console.log(e.message))

    }, []);


    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
            <div id="graph" style={{ flex: "1", width: "100%" }}>Hi graph!</div>
        </div>
    )

}

export default Participant;

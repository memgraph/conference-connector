import { useEffect, useState } from "react"
import { Socket } from "socket.io-client";
import { Orb } from '../public/libs/orb/orb'
import { DefaultEventsMap } from '@socket.io/component-emitter'

interface Props {
    socket: Socket<DefaultEventsMap, DefaultEventsMap>
}


const Graph: React.FC<Props> = ({
    socket
}) => {

    const fetchData = async () => {
        const response = await fetch('http://localhost:8000/graph')
        if (!response.ok) {
            throw new Error('Data coud not be fetched!')
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



        // socket.on("connect", () => {
        //     console.log("Connected to socket ", socket.id)
        // });
        // socket.on("connect_error", (err) => { console.log(err) });
        // socket.on("disconnect", () => {
        //     console.log("Disconnected from socket.")
        // });

        // socket.on("consumer", (msg) => {
        //     console.log('Received a message from the WebSocket service: ', msg.data);
        //     // merge nodes and edges
        // });

    }, []);


    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
            <div id="graph" style={{ flex: "1", width: "100%" }}>Hi graph!</div>
        </div>
    )

}

export default Graph;

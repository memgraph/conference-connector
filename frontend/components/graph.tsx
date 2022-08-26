import { useEffect } from "react"
import { Orb } from '../public/libs/orb/orb'

export default function Graph() {



    useEffect(() => {
        // fetch('http://localhost:8000/graph')
        //     .then((response) => response.json())
        //     .then((data) => console.log(data));
        const nodes = [
            { id: 0, label: 'Node A' },
            { id: 1, label: 'Node B' },
            { id: 2, label: 'Node C' },
        ];
        const edges = [
            { id: 0, start: 0, end: 0, label: 'Edge Q' },
            { id: 1, start: 0, end: 1, label: 'Edge W' },
            { id: 2, start: 0, end: 2, label: 'Edge E' },
            { id: 3, start: 1, end: 2, label: 'Edge T' },
            { id: 4, start: 2, end: 2, label: 'Edge Y' },
            { id: 5, start: 0, end: 1, label: 'Edge V' },
        ]

        const container: HTMLElement = document.getElementById("graph")!;
        const orb = new Orb(container);

        // Initialize nodes and edges
        orb.data.setup({ nodes, edges });

        orb.view.render(() => {
            orb.view.recenter()
        });
    }, []);


    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
            <h1>Example 1</h1>
            <p>Rendering a simple simulated graph on the default canvas (basic)</p>
            <div id="graph" style={{ flex: "1", width: "100%" }}>Hi graph!</div>
        </div>
    )

}

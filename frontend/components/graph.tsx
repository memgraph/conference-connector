import { useEffect } from 'react';
import { OrbEventType } from '../public/libs/orb';
import { Orb } from '../public/libs/orb/orb';

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
}

interface MyEdge {
    id: string;
    start: string;
    end: string;
}

interface Props {
    nodes: MyNode[],
    edges: MyEdge[]
}

const Graph: React.FC<Props> = ({
    nodes,
    edges
}) => {

    useEffect(() => {

        const container: HTMLElement = document.getElementById("graph")!;
        const orb = new Orb<MyNode, MyEdge>(container);

        let participants = nodes.filter((node) => node.label === "Participant");
        let participantsLength = participants.length;
        let isUserView = false;

        if (participantsLength !== 1) {
            participants.sort(function (a, b) {
                return b.rank - a.rank
            });

            var minRank = participants[participantsLength - 1].rank;
            var maxRank = participants[0].rank;
        }
        else {
            isUserView = true;
        }

        // Initialize nodes and edges
        orb.data.merge({ nodes, edges });

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

                node.properties.size = isUserView ? 7 : Math.sqrt(((node.data.rank - minRank) / (maxRank - minRank)) * 1000) + 2;

                node.properties.fontSize = 3;
            });

        orb.events.on(OrbEventType.NODE_CLICK, (event) => {
            if (event?.node.data.label === "Tweet") {
                let tweetText = document.getElementById("tweet-text")!;
                //fade out
                tweetText.style.opacity = "0";
                console.log(event?.node.data)
                //wait for the transition
                setTimeout(function () {
                    tweetText.innerHTML = event?.node.data.text!;
                    //fade in
                    tweetText.style.opacity = "1";
                }, 500);
            }
        });

        orb.view.setSettings({
            simulation: {
                collision: {
                    strength: 1,
                    radius: 20,
                },
            },
        });


        orb.view.setSettings({ simulation: { isPhysicsEnabled: true } });
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

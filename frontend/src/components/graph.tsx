import { useEffect, useRef, useState } from 'react';
import { DefaultView, IEdgeBase, INodeBase, OrbEventType } from '../../public/libs/orb';
import { IOrbViewContext, Orb } from '../../public/libs/orb/orb';

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
    edges: MyEdge[],
    isUserView: boolean,
}

const Graph: React.FC<Props> = ({
    nodes,
    edges,
    isUserView,
}) => {

    const container = useRef<HTMLElement>();
    const orb = useRef<Orb<MyNode, MyEdge>>();

    useEffect(() => {
        container.current = document.getElementById("graph")!;
        orb.current = new Orb<MyNode, MyEdge>(container.current);
    }, []);

    useEffect(() => {
        if (orb.current != null) {
            let participants = nodes.filter((node) => node.label === "Participant");
            let participantsLength = participants.length;

            if (!isUserView) {
                participants.sort(function (a, b) {
                    return b.rank - a.rank
                });

                var minRank = participants[participantsLength - 1].rank;
                var maxRank = participants[0].rank;
            }

            // if zoomed in, merging is not smooth
            // Initialize nodes and edges
            orb.current.data.merge({ nodes, edges });

            orb.current.data
                .getNodes()
                .filter((node) => node.getLabel() === "Tweet")
                .forEach((node) => {
                    node.properties.color = '#8C0082';
                    node.properties.size = 3;
                    node.properties.fontSize = 0;
                });
            // orb.current.data
            //     .getEdges()
            //     .filter((edge) => ["TWEETED_BY", "FOLLOWING", "RETWEETED", "LIKES"].includes(edge.getLabel()!))
            //     .forEach((edge) => {
            //         edge.properties.fontSize = 0;
            //     })

            orb.current.data
                .getEdges()
                .filter((edge) => edge.getLabel() === "TWEETED_BY")
                .forEach((edge) => {
                    edge.properties.color = "#FB6E00A6";
                    edge.properties.colorHover = "#FB6E00";
                    edge.properties.fontSize = 0;
                })
            orb.current.data
                .getEdges()
                .filter((edge) => edge.getLabel() === "FOLLOWING")
                .forEach((edge) => {
                    edge.properties.color = "#857F87A6";
                    edge.properties.colorHover = "#857F87";
                    edge.properties.fontSize = 0;
                })

            orb.current.data
                .getEdges()
                .filter((edge) => edge.getLabel() === "RETWEETED")
                .forEach((edge) => {
                    edge.properties.color = "#DD2222A6";
                    edge.properties.colorHover = "#DD2222";
                    edge.properties.fontSize = 0;
                })
            orb.current.data
                .getEdges()
                .filter((edge) => edge.getLabel() === "LIKES")
                .forEach((edge) => {
                    edge.properties.color = "#FFC500A6";
                    edge.properties.colorHover = "#FFC500";
                    edge.properties.fontSize = 0;
                })
            orb.current.data
                .getNodes()
                .filter((node) => node.getLabel() === "Participant")
                .forEach((node) => {
                    node.properties.label = node.data.username;
                    node.properties.color = node.data.claimed ? '#FB6E00' : '#BAB8BB';

                    node.properties.size = isUserView ? 7 : Math.sqrt(((node.data.rank - minRank) / (maxRank - minRank)) * 500) + 2;

                    node.properties.fontSize = 3;
                });

            orb.current.events.on(OrbEventType.NODE_CLICK, (event) => {
                if (event?.node.data.label === "Tweet") {
                    let tweetText = document.getElementById("tweet-text")!;
                    //fade out
                    tweetText.style.opacity = "0";
                    //wait for the transition
                    setTimeout(function () {
                        tweetText.innerHTML = event?.node.data.text!;
                        //fade in
                        tweetText.style.opacity = "1";
                    }, 500);
                }
            });


            orb.current.view.setSettings({
                simulation: {
                    collision: {
                        strength: 1,
                        radius: 20,
                    },
                },
            });

            // when enabled, merging is not smooth
            //orb.current.view.setSettings({ simulation: { isPhysicsEnabled: true } });
            orb.current.view.render(() => {
                orb.current?.view.recenter();
            });
        }
    }, [nodes, edges]);


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

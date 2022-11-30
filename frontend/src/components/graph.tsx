import { useEffect, useRef } from 'react';

import { OrbEventType } from '../../public/libs/orb';
import { Orb } from '../../public/libs/orb/orb';

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
    url?: string;
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
        let graph = document.getElementById("graph")!;
        graph.innerHTML = "";

        container.current = graph;
        orb.current = new Orb<MyNode, MyEdge>(container.current);
        return;
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
                    node.style.imageUrl = "https://cdn-icons-png.flaticon.com/512/3670/3670151.png"
                    node.style.size = 10;
                    node.style.fontSize = 0;
                });

            orb.current.data
                .getEdges()
                .filter((edge) => edge.getLabel() === "TWEETED_BY")
                .forEach((edge) => {
                    edge.style.color = "#FB6E00A6";
                    edge.style.colorHover = "#FB6E00";
                    edge.style.fontSize = 0;
                })
            orb.current.data
                .getEdges()
                .filter((edge) => edge.getLabel() === "FOLLOWING")
                .forEach((edge) => {
                    edge.style.color = "#857F87A6";
                    edge.style.colorHover = "#857F87";
                    edge.style.fontSize = 0;
                })

            orb.current.data
                .getEdges()
                .filter((edge) => edge.getLabel() === "RETWEETED")
                .forEach((edge) => {
                    edge.style.color = "#DD2222A6";
                    edge.style.colorHover = "#DD2222";
                    edge.style.fontSize = 0;
                })
            orb.current.data
                .getEdges()
                .filter((edge) => edge.getLabel() === "LIKES")
                .forEach((edge) => {
                    edge.style.color = "#FFC500A6";
                    edge.style.colorHover = "#FFC500";
                    edge.style.fontSize = 0;
                })
            orb.current.data
                .getNodes()
                .filter((node) => node.getLabel() === "Participant")
                .forEach((node) => {
                    node.style.label = node.data.username;
                    node.style.size = isUserView ? 10 : Math.sqrt(((node.data.rank - minRank) / (maxRank - minRank)) * 500) + 10;
                    node.style.imageUrl = node.data.image;
                    node.style.fontSize = 3;
                });

            orb.current.events.on(OrbEventType.NODE_CLICK, (event) => {
                if (event?.node.data.label === "Tweet") {
                    let tweetText = document.getElementById("tweet-text")!;
                    let linkToTweet = document.getElementById("link-to-tweet")! as HTMLAnchorElement;
                    //fade out
                    tweetText.style.opacity = "0";
                    linkToTweet.style.opacity = "0";
                    //wait for the transition
                    setTimeout(function () {
                        tweetText.innerHTML = event?.node.data.text!;
                        linkToTweet.innerHTML = "Go to tweet";
                        linkToTweet.href = event?.node.data.url!
                        //fade in
                        tweetText.style.opacity = "1";
                        linkToTweet.style.opacity = "1";
                    }, 200);
                }
            });


            orb.current.view.setSettings({
                simulation: {
                    collision: {
                        strength: 1,
                        radius: 100,
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
        <div style={{ height: "80vh" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                <div id="graph" style={{ flex: "1", width: "100%", zIndex: "1" }}>Hi graph!</div>
            </div>
        </div>

    )
}

export default Graph;

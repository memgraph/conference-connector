import { GraphObjectState } from './state';
export const getDefaultEventStrategy = () => {
    return {
        onMouseClick: (graph, point) => {
            const node = graph.getNearestNode(point);
            if (node) {
                selectNode(graph, node);
                return {
                    isStateChanged: true,
                    changedSubject: node,
                };
            }
            const edge = graph.getNearestEdge(point);
            if (edge) {
                selectEdge(graph, edge);
                return {
                    isStateChanged: true,
                    changedSubject: edge,
                };
            }
            const { changedCount } = unselectAll(graph);
            return {
                isStateChanged: changedCount > 0,
            };
        },
        onMouseMove: (graph, point) => {
            // From map view
            const node = graph.getNearestNode(point);
            if (node && !node.isSelected()) {
                hoverNode(graph, node);
                return {
                    isStateChanged: true,
                    changedSubject: node,
                };
            }
            if (!node) {
                const { changedCount } = unhoverAll(graph);
                return {
                    isStateChanged: changedCount > 0,
                };
            }
            return { isStateChanged: false };
        },
    };
};
const selectNode = (graph, node) => {
    unselectAll(graph);
    setNodeState(node, GraphObjectState.SELECTED, { isStateOverride: true });
};
const selectEdge = (graph, edge) => {
    unselectAll(graph);
    setEdgeState(edge, GraphObjectState.SELECTED, { isStateOverride: true });
};
const unselectAll = (graph) => {
    const selectedNodes = graph.getNodes((node) => node.isSelected());
    for (let i = 0; i < selectedNodes.length; i++) {
        selectedNodes[i].clearState();
    }
    const selectedEdges = graph.getEdges((edge) => edge.isSelected());
    for (let i = 0; i < selectedEdges.length; i++) {
        selectedEdges[i].clearState();
    }
    return { changedCount: selectedNodes.length + selectedEdges.length };
};
const hoverNode = (graph, node) => {
    unhoverAll(graph);
    setNodeState(node, GraphObjectState.HOVERED);
};
// const hoverEdge = <N extends INodeBase, E extends IEdgeBase>(graph: Graph<N, E>, edge: Edge<N, E>) => {
//   unhoverAll(graph);
//   setEdgeState(edge, GraphObjectState.HOVERED);
// };
const unhoverAll = (graph) => {
    const hoveredNodes = graph.getNodes((node) => node.isHovered());
    for (let i = 0; i < hoveredNodes.length; i++) {
        hoveredNodes[i].clearState();
    }
    const hoveredEdges = graph.getEdges((edge) => edge.isHovered());
    for (let i = 0; i < hoveredEdges.length; i++) {
        hoveredEdges[i].clearState();
    }
    return { changedCount: hoveredNodes.length + hoveredEdges.length };
};
const setNodeState = (node, state, options) => {
    if (isStateChangeable(node, options)) {
        node.state = state;
    }
    node.getInEdges().forEach((edge) => {
        if (edge && isStateChangeable(edge, options)) {
            edge.state = state;
        }
        if (edge.startNode && isStateChangeable(edge.startNode, options)) {
            edge.startNode.state = state;
        }
    });
    node.getOutEdges().forEach((edge) => {
        if (edge && isStateChangeable(edge, options)) {
            edge.state = state;
        }
        if (edge.endNode && isStateChangeable(edge.endNode, options)) {
            edge.endNode.state = state;
        }
    });
};
const setEdgeState = (edge, state, options) => {
    if (isStateChangeable(edge, options)) {
        edge.state = state;
    }
    if (edge.startNode && isStateChangeable(edge.startNode, options)) {
        edge.startNode.state = state;
    }
    if (edge.endNode && isStateChangeable(edge.endNode, options)) {
        edge.endNode.state = state;
    }
};
const isStateChangeable = (graphObject, options) => {
    const isOverride = options === null || options === void 0 ? void 0 : options.isStateOverride;
    return isOverride || (!isOverride && !graphObject.state);
};
//# sourceMappingURL=strategy.js.map
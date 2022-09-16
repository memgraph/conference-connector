import { Emitter } from './utils/emitter.utils';
export var OrbEventType;
(function (OrbEventType) {
    // Renderer events for drawing on canvas
    OrbEventType["RENDER_START"] = "render-start";
    OrbEventType["RENDER_END"] = "render-end";
    // Simulation (D3) events for setting up node positions
    OrbEventType["SIMULATION_START"] = "simulation-start";
    OrbEventType["SIMULATION_STEP"] = "simulation-step";
    OrbEventType["SIMULATION_END"] = "simulation-end";
    // Mouse events: click, hover, move
    OrbEventType["NODE_CLICK"] = "node-click";
    OrbEventType["NODE_HOVER"] = "node-hover";
    OrbEventType["EDGE_CLICK"] = "edge-click";
    OrbEventType["EDGE_HOVER"] = "edge-hover";
    OrbEventType["MOUSE_CLICK"] = "mouse-click";
    OrbEventType["MOUSE_MOVE"] = "mouse-move";
    // Zoom or pan (translate) change
    OrbEventType["TRANSFORM"] = "transform";
    // Mouse node drag events
    OrbEventType["NODE_DRAG_START"] = "node-drag-start";
    OrbEventType["NODE_DRAG"] = "node-drag";
    OrbEventType["NODE_DRAG_END"] = "node-drag-end";
})(OrbEventType || (OrbEventType = {}));
export class OrbEmitter extends Emitter {
}
//# sourceMappingURL=events.js.map
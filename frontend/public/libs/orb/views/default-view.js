import { drag } from 'd3-drag';
import { easeLinear } from 'd3-ease';
import { zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { isEqualPosition } from '../common/position';
import { Renderer, RenderEventType } from '../renderer/canvas/renderer';
import { SimulatorFactory } from '../simulator/index';
import { isNode } from '../models/node';
import { isEdge } from '../models/edge';
import { copyObject } from '../utils/object.utils';
import { OrbEventType } from '../events';
// TODO: Move to settings all these five
const DISABLE_OUT_OF_BOUNDS_DRAG = true;
const ROUND_COORDINATES = true;
const ZOOM_FIT_TRANSITION_MS = 200;
export class DefaultView {
    constructor(context, settings) {
        this._isSimulating = false;
        this._simulationStartedAt = Date.now();
        this.dragSubject = (event) => {
            var _a;
            const mousePoint = this.getCanvasMousePosition(event.sourceEvent);
            const simulationPoint = (_a = this._renderer) === null || _a === void 0 ? void 0 : _a.getSimulationPosition(mousePoint);
            return this._graph.getNearestNode(simulationPoint);
        };
        this.dragStarted = (event) => {
            const mousePoint = this.getCanvasMousePosition(event.sourceEvent);
            const simulationPoint = this._renderer.getSimulationPosition(mousePoint);
            this._events.emit(OrbEventType.NODE_DRAG_START, {
                node: event.subject,
                event: event.sourceEvent,
                localPoint: simulationPoint,
                globalPoint: mousePoint,
            });
            // Used to detect a click event in favor of a drag event.
            // A click is when the drag start and end coordinates are identical.
            this._dragStartPosition = mousePoint;
        };
        this.dragged = (event) => {
            const mousePoint = this.getCanvasMousePosition(event.sourceEvent);
            const simulationPoint = this._renderer.getSimulationPosition(mousePoint);
            // A drag event de-selects the node, while a click event selects it.
            if (!isEqualPosition(this._dragStartPosition, mousePoint)) {
                // this.selectedShape_.next(null);
                // this.selectedShapePosition_.next(null);
                this._dragStartPosition = undefined;
            }
            this._simulator.dragNode(event.subject.id, simulationPoint);
            this._events.emit(OrbEventType.NODE_DRAG, {
                node: event.subject,
                event: event.sourceEvent,
                localPoint: simulationPoint,
                globalPoint: mousePoint,
            });
        };
        this.dragEnded = (event) => {
            const mousePoint = this.getCanvasMousePosition(event.sourceEvent);
            const simulationPoint = this._renderer.getSimulationPosition(mousePoint);
            if (!isEqualPosition(this._dragStartPosition, mousePoint)) {
                this._simulator.endDragNode(event.subject.id);
            }
            this._events.emit(OrbEventType.NODE_DRAG_END, {
                node: event.subject,
                event: event.sourceEvent,
                localPoint: simulationPoint,
                globalPoint: mousePoint,
            });
        };
        this.zoomed = (event) => {
            this._renderer.transform = event.transform;
            setTimeout(() => {
                this._renderer.render(this._graph);
                this._events.emit(OrbEventType.TRANSFORM, { transform: event.transform });
            }, 1);
        };
        this.mouseMoved = (event) => {
            const mousePoint = this.getCanvasMousePosition(event);
            const simulationPoint = this._renderer.getSimulationPosition(mousePoint);
            if (this._strategy.onMouseMove) {
                const response = this._strategy.onMouseMove(this._graph, simulationPoint);
                const subject = response.changedSubject;
                if (subject) {
                    if (isNode(subject)) {
                        this._events.emit(OrbEventType.NODE_HOVER, {
                            node: subject,
                            event,
                            localPoint: simulationPoint,
                            globalPoint: mousePoint,
                        });
                    }
                    if (isEdge(subject)) {
                        this._events.emit(OrbEventType.EDGE_HOVER, {
                            edge: subject,
                            event,
                            localPoint: simulationPoint,
                            globalPoint: mousePoint,
                        });
                    }
                }
                this._events.emit(OrbEventType.MOUSE_MOVE, {
                    subject,
                    event,
                    localPoint: simulationPoint,
                    globalPoint: mousePoint,
                });
                if (response.isStateChanged || response.changedSubject) {
                    // TODO: Add throttle render
                    this._renderer.render(this._graph);
                }
            }
        };
        this.mouseClicked = (event) => {
            const mousePoint = this.getCanvasMousePosition(event);
            const simulationPoint = this._renderer.getSimulationPosition(mousePoint);
            if (this._strategy.onMouseClick) {
                const response = this._strategy.onMouseClick(this._graph, simulationPoint);
                const subject = response.changedSubject;
                if (subject) {
                    if (isNode(subject)) {
                        this._events.emit(OrbEventType.NODE_CLICK, {
                            node: subject,
                            event,
                            localPoint: simulationPoint,
                            globalPoint: mousePoint,
                        });
                    }
                    if (isEdge(subject)) {
                        this._events.emit(OrbEventType.EDGE_CLICK, {
                            edge: subject,
                            event,
                            localPoint: simulationPoint,
                            globalPoint: mousePoint,
                        });
                    }
                }
                this._events.emit(OrbEventType.MOUSE_CLICK, {
                    subject,
                    event,
                    localPoint: simulationPoint,
                    globalPoint: mousePoint,
                });
                if (response.isStateChanged || response.changedSubject) {
                    this._renderer.render(this._graph);
                }
            }
        };
        this._container = context.container;
        this._graph = context.graph;
        this._events = context.events;
        this._strategy = context.strategy;
        this._settings = {
            getPosition: settings === null || settings === void 0 ? void 0 : settings.getPosition,
            simulation: Object.assign({ isPhysicsEnabled: false }, settings === null || settings === void 0 ? void 0 : settings.simulation),
            render: Object.assign({}, settings === null || settings === void 0 ? void 0 : settings.render),
        };
        this._container.textContent = '';
        this._canvas = document.createElement('canvas');
        this._canvas.style.position = 'absolute';
        this._container.appendChild(this._canvas);
        // Get the 2d rendering context which is used by D3 in the Renderer.
        this._context = this._canvas.getContext('2d') || new CanvasRenderingContext2D(); // TODO: how to handle functions that return null?
        // Resize the canvas based on the dimensions of it's parent container <div>.
        const resizeObs = new ResizeObserver(() => this._handleResize());
        resizeObs.observe(this._container);
        this._renderer = new Renderer(this._context, this._settings.render);
        this._renderer.on(RenderEventType.RENDER_START, () => {
            this._events.emit(OrbEventType.RENDER_START, undefined);
        });
        this._renderer.on(RenderEventType.RENDER_END, (data) => {
            this._events.emit(OrbEventType.RENDER_END, data);
        });
        this._renderer.translateOriginToCenter();
        this._settings.render = this._renderer.settings;
        this._d3Zoom = zoom()
            .scaleExtent([this._renderer.settings.minZoom, this._renderer.settings.maxZoom])
            .on('zoom', this.zoomed);
        select(this._canvas)
            .call(drag()
            .container(this._canvas)
            .subject(this.dragSubject)
            .on('start', this.dragStarted)
            .on('drag', this.dragged)
            .on('end', this.dragEnded))
            .call(this._d3Zoom)
            .on('click', this.mouseClicked)
            .on('mousemove', this.mouseMoved);
        this._simulator = SimulatorFactory.getSimulator({
            onStabilizationStart: () => {
                this._isSimulating = true;
                this._simulationStartedAt = Date.now();
                this._events.emit(OrbEventType.SIMULATION_START, undefined);
            },
            onStabilizationProgress: (data) => {
                this._graph.setNodePositions(data.nodes);
                this._events.emit(OrbEventType.SIMULATION_STEP, { progress: data.progress });
            },
            onStabilizationEnd: (data) => {
                var _a;
                this._graph.setNodePositions(data.nodes);
                this._renderer.render(this._graph);
                this._isSimulating = false;
                (_a = this._onSimulationEnd) === null || _a === void 0 ? void 0 : _a.call(this);
                this._events.emit(OrbEventType.SIMULATION_END, { durationMs: Date.now() - this._simulationStartedAt });
            },
            onNodeDrag: (data) => {
                // TODO: Add throttle render (for larger graphs)
                this._graph.setNodePositions(data.nodes);
                this._renderer.render(this._graph);
            },
            onSettingsUpdate: (data) => {
                this._settings.simulation = data.settings;
            },
        });
        this._simulator.setSettings(this._settings.simulation);
    }
    isInitiallyRendered() {
        return this._renderer.isInitiallyRendered;
    }
    getSettings() {
        return copyObject(this._settings);
    }
    setSettings(settings) {
        if (settings.getPosition) {
            this._settings.getPosition = settings.getPosition;
        }
        if (settings.simulation) {
            this._settings.simulation = Object.assign(Object.assign({}, this._settings.simulation), settings.simulation);
            this._simulator.setSettings(this._settings.simulation);
        }
        if (settings.render) {
            this._renderer.settings = Object.assign(Object.assign({}, this._renderer.settings), settings.render);
            this._settings.render = this._renderer.settings;
        }
    }
    render(onRendered) {
        if (this._isSimulating) {
            this._renderer.render(this._graph);
            onRendered === null || onRendered === void 0 ? void 0 : onRendered();
            return;
        }
        if (this._settings.getPosition) {
            const nodes = this._graph.getNodes();
            for (let i = 0; i < nodes.length; i++) {
                const position = this._settings.getPosition(nodes[i]);
                if (position) {
                    nodes[i].position = Object.assign({ id: nodes[i].id }, position);
                }
            }
        }
        this._isSimulating = true;
        this._onSimulationEnd = onRendered;
        this._startSimulation();
    }
    recenter(onRendered) {
        const fitZoomTransform = this._renderer.getFitZoomTransform(this._graph);
        select(this._canvas)
            .transition()
            .duration(ZOOM_FIT_TRANSITION_MS)
            .ease(easeLinear)
            .call(this._d3Zoom.transform, fitZoomTransform)
            .call(() => {
            this._renderer.render(this._graph);
            onRendered === null || onRendered === void 0 ? void 0 : onRendered();
        });
    }
    destroy() {
        this._renderer.removeAllListeners();
        this._container.textContent = '';
    }
    getCanvasMousePosition(event) {
        var _a, _b, _c, _d;
        const rect = this._canvas.getBoundingClientRect();
        let x = (_b = (_a = event.clientX) !== null && _a !== void 0 ? _a : event.pageX) !== null && _b !== void 0 ? _b : event.x;
        let y = (_d = (_c = event.clientY) !== null && _c !== void 0 ? _c : event.pageY) !== null && _d !== void 0 ? _d : event.y;
        // Cursor x and y positions relative to the top left corner of the canvas element.
        x = x - rect.left;
        y = y - rect.top;
        // Improve performance by rounding the canvas coordinates to avoid aliasing.
        if (ROUND_COORDINATES) {
            x = Math.floor(x);
            y = Math.floor(y);
        }
        // Disable dragging nodes outside of the canvas borders.
        if (DISABLE_OUT_OF_BOUNDS_DRAG) {
            x = Math.max(0, Math.min(this._renderer.width, x));
            y = Math.max(0, Math.min(this._renderer.height, y));
        }
        return { x, y };
    }
    _handleResize() {
        const containerSize = this._container.getBoundingClientRect();
        this._canvas.width = containerSize.width;
        this._canvas.height = containerSize.height;
        this._renderer.width = containerSize.width;
        this._renderer.height = containerSize.height;
        this._renderer.render(this._graph);
    }
    _startSimulation() {
        const nodePositions = this._graph.getNodePositions();
        const edgePositions = this._graph.getEdgePositions();
        this._simulator.updateData(nodePositions, edgePositions);
        this._simulator.simulate();
    }
    // TODO: Do we keep these
    fixNodes() {
        this._simulator.fixNodes();
    }
    // TODO: Do we keep these
    releaseNodes() {
        this._simulator.releaseNodes();
    }
}
//# sourceMappingURL=default-view.js.map
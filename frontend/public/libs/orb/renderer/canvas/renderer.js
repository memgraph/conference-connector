import { zoomIdentity } from 'd3-zoom';
import { isNode } from '../../models/node';
import { drawEdge } from './edge/index';
import { drawNode } from './node';
import { Emitter } from '../../utils/emitter.utils';
const DEBUG = false;
const DEBUG_RED = '#FF5733';
const DEBUG_GREEN = '#3CFF33';
const DEBUG_BLUE = '#3383FF';
const DEBUG_PINK = '#F333FF';
const DEFAULT_RENDERER_WIDTH = 640;
const DEFAULT_RENDERER_HEIGHT = 480;
const DEFAULT_RENDERER_FIT_ZOOM_MARGIN = 0.2;
const DEFAULT_RENDERER_MAX_ZOOM = 8;
const DEFAULT_RENDERER_MIN_ZOOM = 0.25;
export var RenderEventType;
(function (RenderEventType) {
    RenderEventType["RENDER_START"] = "render-start";
    RenderEventType["RENDER_END"] = "render-end";
})(RenderEventType || (RenderEventType = {}));
const DEFAULT_RENDERER_SETTINGS = {
    minZoom: DEFAULT_RENDERER_MIN_ZOOM,
    maxZoom: DEFAULT_RENDERER_MAX_ZOOM,
    fitZoomMargin: DEFAULT_RENDERER_FIT_ZOOM_MARGIN,
    labelsIsEnabled: true,
    labelsOnEventIsEnabled: true,
    shadowIsEnabled: true,
    shadowOnEventIsEnabled: true,
    contextAlphaOnEvent: 0.3,
    contextAlphaOnEventIsEnabled: true,
};
export class Renderer extends Emitter {
    constructor(context, settings) {
        super();
        // Translates (0, 0) coordinates to (width/2, height/2).
        this._isOriginCentered = false;
        // False if renderer never rendered on canvas, otherwise true
        this._isInitiallyRendered = false;
        this._context = context;
        this.width = DEFAULT_RENDERER_WIDTH;
        this.height = DEFAULT_RENDERER_HEIGHT;
        this.transform = zoomIdentity;
        this.settings = Object.assign(Object.assign({}, DEFAULT_RENDERER_SETTINGS), settings);
    }
    get isInitiallyRendered() {
        return this._isInitiallyRendered;
    }
    render(graph) {
        if (!graph.getNodeCount()) {
            return;
        }
        this.emit(RenderEventType.RENDER_START, undefined);
        const renderStartedAt = Date.now();
        // Clear drawing.
        this._context.clearRect(0, 0, this.width, this.height);
        this._context.save();
        if (DEBUG) {
            this._context.lineWidth = 3;
            this._context.fillStyle = DEBUG_RED;
            this._context.fillRect(0, 0, this.width, this.height);
        }
        // Apply any scaling (zoom) or translation (pan) transformations.
        this._context.translate(this.transform.x, this.transform.y);
        if (DEBUG) {
            this._context.fillStyle = DEBUG_BLUE;
            this._context.fillRect(0, 0, this.width, this.height);
        }
        this._context.scale(this.transform.k, this.transform.k);
        if (DEBUG) {
            this._context.fillStyle = DEBUG_GREEN;
            this._context.fillRect(0, 0, this.width, this.height);
        }
        // Move coordinates (0, 0) to canvas center.
        // Used in D3 graph, Map graph doesn't need centering.
        // This is only for display purposes, the simulation coordinates are still
        // relative to (0, 0), so any source mouse event position needs to take this
        // offset into account. (Handled in getMousePos())
        if (this._isOriginCentered) {
            this._context.translate(this.width / 2, this.height / 2);
        }
        if (DEBUG) {
            this._context.fillStyle = DEBUG_PINK;
            this._context.fillRect(0, 0, this.width, this.height);
        }
        this.drawObjects(graph.getEdges());
        this.drawObjects(graph.getNodes());
        this._context.restore();
        this.emit(RenderEventType.RENDER_END, { durationMs: Date.now() - renderStartedAt });
        this._isInitiallyRendered = true;
    }
    drawObjects(objects) {
        if (objects.length === 0) {
            return;
        }
        const selectedObjects = [];
        const hoveredObjects = [];
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            if (obj.isSelected()) {
                selectedObjects.push(obj);
            }
            if (obj.isHovered()) {
                hoveredObjects.push(obj);
            }
        }
        const hasStateChangedShapes = selectedObjects.length || hoveredObjects.length;
        if (this.settings.contextAlphaOnEventIsEnabled && hasStateChangedShapes) {
            this._context.globalAlpha = this.settings.contextAlphaOnEvent;
        }
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            if (!obj.isSelected() && !obj.isHovered()) {
                this.drawObject(obj, {
                    isLabelEnabled: this.settings.labelsIsEnabled,
                    isShadowEnabled: this.settings.shadowIsEnabled,
                });
            }
        }
        if (this.settings.contextAlphaOnEventIsEnabled && hasStateChangedShapes) {
            this._context.globalAlpha = 1;
        }
        for (let i = 0; i < selectedObjects.length; i++) {
            this.drawObject(selectedObjects[i], {
                isLabelEnabled: this.settings.labelsOnEventIsEnabled,
                isShadowEnabled: this.settings.shadowOnEventIsEnabled,
            });
        }
        for (let i = 0; i < hoveredObjects.length; i++) {
            this.drawObject(hoveredObjects[i], {
                isLabelEnabled: this.settings.labelsOnEventIsEnabled,
                isShadowEnabled: this.settings.shadowOnEventIsEnabled,
            });
        }
    }
    drawObject(obj, options) {
        if (isNode(obj)) {
            drawNode(this._context, obj, options);
        }
        else {
            drawEdge(this._context, obj, options);
        }
    }
    reset() {
        this.transform = zoomIdentity;
        // Clear drawing.
        this._context.clearRect(0, 0, this.width, this.height);
        this._context.save();
    }
    getFitZoomTransform(graph) {
        // Graph view is a bounding box of the graph nodes that takes into
        // account node positions (x, y) and node sizes (style: size + border width)
        const graphView = graph.getBoundingBox();
        const graphMiddleX = graphView.x + graphView.width / 2;
        const graphMiddleY = graphView.y + graphView.height / 2;
        // Simulation view is actually a renderer view (canvas) but in the coordinate system of
        // the simulator: node position (x, y). We want to fit a graph view into a simulation view.
        const simulationView = this.getSimulationViewRectangle();
        const heightScale = simulationView.height / (graphView.height * (1 + this.settings.fitZoomMargin));
        const widthScale = simulationView.width / (graphView.width * (1 + this.settings.fitZoomMargin));
        // The scale of the translation and the zoom needed to fit a graph view
        // into a simulation view (renderer canvas)
        const scale = Math.min(heightScale, widthScale);
        const previousZoom = this.transform.k;
        const newZoom = Math.max(Math.min(scale * previousZoom, this.settings.maxZoom), this.settings.minZoom);
        // Translation is done in the following way for both coordinates:
        // - M = expected movement to the middle of the view (simulation width or height / 2)
        // - Z(-1) = previous zoom level
        // - S = scale to fit the graph view into simulation view
        // - Z(0) = new zoom level / Z(0) := S * Z(-1)
        // - GM = current middle coordinate of the graph view
        // Formula:
        // X/Y := M * Z(-1) - M * Z(-1) * Z(0) - GM * Z(0)
        // X/Y := M * Z(-1) * (1 - Z(0)) - GM * Z(0)
        const newX = (simulationView.width / 2) * previousZoom * (1 - newZoom) - graphMiddleX * newZoom;
        const newY = (simulationView.height / 2) * previousZoom * (1 - newZoom) - graphMiddleY * newZoom;
        return zoomIdentity.translate(newX, newY).scale(newZoom);
    }
    getSimulationPosition(canvasPoint) {
        // By default, the canvas is translated by (width/2, height/2) to center the graph.
        // The simulation is not, it's starting coordinates are at (0, 0).
        // So any mouse click (C) needs to subtract that translation to match the
        // simulation coordinates (O) when dragging and hovering nodes.
        const [x, y] = this.transform.invert([canvasPoint.x, canvasPoint.y]);
        return {
            x: x - this.width / 2,
            y: y - this.height / 2,
        };
    }
    /**
     * Returns the visible rectangle view in the simulation coordinates.
     *
     * @return {IRectangle} Visible view in teh simulation coordinates
     */
    getSimulationViewRectangle() {
        const topLeftPosition = this.getSimulationPosition({ x: 0, y: 0 });
        const bottomRightPosition = this.getSimulationPosition({ x: this.width, y: this.height });
        return {
            x: topLeftPosition.x,
            y: topLeftPosition.y,
            width: bottomRightPosition.x - topLeftPosition.x,
            height: bottomRightPosition.y - topLeftPosition.y,
        };
    }
    translateOriginToCenter() {
        this._isOriginCentered = true;
    }
}
//# sourceMappingURL=renderer.js.map
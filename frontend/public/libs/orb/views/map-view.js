import * as L from 'leaflet';
import { isEdge } from '../models/edge';
import { isNode } from '../models/node';
import { Renderer, RenderEventType } from '../renderer/canvas/renderer';
import { copyObject } from '../utils/object.utils';
import { OrbEventType } from '../events';
const osmAttribution = '<a href="https://leafletjs.com/" target="_blank" >Leaflet</a> | ' +
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';
const DEFAULT_MAP_TILE = {
    instance: new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
    attribution: osmAttribution,
};
const DEFAULT_ZOOM_LEVEL = 2;
export class MapView {
    constructor(context, settings) {
        var _a, _b, _c, _d;
        this._container = context.container;
        this._graph = context.graph;
        this._events = context.events;
        this._strategy = context.strategy;
        this._settings = Object.assign(Object.assign({}, settings), { map: {
                zoomLevel: (_b = (_a = settings.map) === null || _a === void 0 ? void 0 : _a.zoomLevel) !== null && _b !== void 0 ? _b : DEFAULT_ZOOM_LEVEL,
                tile: (_d = (_c = settings.map) === null || _c === void 0 ? void 0 : _c.tile) !== null && _d !== void 0 ? _d : DEFAULT_MAP_TILE,
            }, render: Object.assign({}, settings.render) });
        // Check for more details here: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
        this._container.textContent = '';
        this._canvas = this._initCanvas();
        this._map = this._initMap();
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
        this._settings.render = this._renderer.settings;
        this._leaflet = this._initLeaflet();
        // Setting up leaflet map tile
        this._handleTileChange();
    }
    get leaflet() {
        return this._leaflet;
    }
    isInitiallyRendered() {
        return this._renderer.isInitiallyRendered;
    }
    getSettings() {
        return copyObject(this._settings);
    }
    setSettings(settings) {
        if (settings.getGeoPosition) {
            this._settings.getGeoPosition = settings.getGeoPosition;
            this._updateGraphPositions();
        }
        if (settings.map) {
            if (typeof settings.map.zoomLevel === 'number') {
                this._settings.map.zoomLevel = settings.map.zoomLevel;
                this._leaflet.setZoom(settings.map.zoomLevel);
            }
            if (settings.map.tile) {
                this._settings.map.tile = settings.map.tile;
                this._handleTileChange();
            }
        }
        if (settings.render) {
            this._renderer.settings = Object.assign(Object.assign({}, this._renderer.settings), settings.render);
            this._settings.render = this._renderer.settings;
        }
    }
    render(onRendered) {
        this._updateGraphPositions();
        this._renderer.render(this._graph);
        onRendered === null || onRendered === void 0 ? void 0 : onRendered();
    }
    recenter(onRendered) {
        const view = this._graph.getBoundingBox();
        const topRightCoordinate = this._leaflet.layerPointToLatLng([view.x, view.y]);
        const bottomLeftCoordinate = this._leaflet.layerPointToLatLng([view.x + view.width, view.y + view.height]);
        this._leaflet.fitBounds(L.latLngBounds(topRightCoordinate, bottomLeftCoordinate));
        onRendered === null || onRendered === void 0 ? void 0 : onRendered();
    }
    destroy() {
        this._renderer.removeAllListeners();
        this._leaflet.off();
        this._leaflet.remove();
        this._container.textContent = '';
    }
    _initCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.width = '100%';
        canvas.style.zIndex = '2';
        canvas.style.pointerEvents = 'none';
        this._container.appendChild(canvas);
        return canvas;
    }
    _initMap() {
        const map = document.createElement('div');
        map.style.position = 'absolute';
        map.style.width = '100%';
        map.style.height = '100%';
        map.style.zIndex = '1';
        map.style.cursor = 'default';
        this._container.appendChild(map);
        return map;
    }
    _initLeaflet() {
        const leaflet = L.map(this._map).setView([0, 0], this._settings.map.zoomLevel);
        leaflet.on('zoomstart', () => {
            this._renderer.reset();
        });
        leaflet.on('zoom', (event) => {
            this._updateGraphPositions();
            this._renderer.render(this._graph);
            const transform = Object.assign(Object.assign({}, event.target._mapPane._leaflet_pos), { k: event.target._zoom });
            this._events.emit(OrbEventType.TRANSFORM, { transform });
        });
        leaflet.on('mousemove', (event) => {
            const point = { x: event.layerPoint.x, y: event.layerPoint.y };
            const containerPoint = { x: event.containerPoint.x, y: event.containerPoint.y };
            // TODO: Add throttle
            if (this._strategy.onMouseMove) {
                const response = this._strategy.onMouseMove(this._graph, point);
                const subject = response.changedSubject;
                if (subject) {
                    if (isNode(subject)) {
                        this._events.emit(OrbEventType.NODE_HOVER, {
                            node: subject,
                            event: event.originalEvent,
                            localPoint: point,
                            globalPoint: containerPoint,
                        });
                    }
                    if (isEdge(subject)) {
                        this._events.emit(OrbEventType.EDGE_HOVER, {
                            edge: subject,
                            event: event.originalEvent,
                            localPoint: point,
                            globalPoint: containerPoint,
                        });
                    }
                }
                this._events.emit(OrbEventType.MOUSE_MOVE, {
                    subject,
                    event: event.originalEvent,
                    localPoint: point,
                    globalPoint: containerPoint,
                });
                if (response.isStateChanged || response.changedSubject) {
                    this._renderer.render(this._graph);
                }
            }
        });
        // Leaflet doesn't have a valid type definition for click event
        // @ts-ignore
        leaflet.on('click', (event) => {
            const point = { x: event.layerPoint.x, y: event.layerPoint.y };
            const containerPoint = { x: event.containerPoint.x, y: event.containerPoint.y };
            if (this._strategy.onMouseClick) {
                const response = this._strategy.onMouseClick(this._graph, point);
                const subject = response.changedSubject;
                if (subject) {
                    if (isNode(subject)) {
                        this._events.emit(OrbEventType.NODE_CLICK, {
                            node: subject,
                            event: event.originalEvent,
                            localPoint: point,
                            globalPoint: containerPoint,
                        });
                    }
                    if (isEdge(subject)) {
                        this._events.emit(OrbEventType.EDGE_CLICK, {
                            edge: subject,
                            event: event.originalEvent,
                            localPoint: point,
                            globalPoint: containerPoint,
                        });
                    }
                }
                this._events.emit(OrbEventType.MOUSE_CLICK, {
                    subject,
                    event: event.originalEvent,
                    localPoint: point,
                    globalPoint: containerPoint,
                });
                if (response.isStateChanged || response.changedSubject) {
                    this._renderer.render(this._graph);
                }
            }
        });
        leaflet.on('moveend', (event) => {
            const leafletPos = event.target._mapPane._leaflet_pos;
            this._renderer.transform = Object.assign(Object.assign({}, leafletPos), { k: 1 });
            this._renderer.render(this._graph);
        });
        leaflet.on('drag', (event) => {
            const leafletPos = event.target._mapPane._leaflet_pos;
            this._renderer.transform = Object.assign(Object.assign({}, leafletPos), { k: 1 });
            this._renderer.render(this._graph);
            const transform = Object.assign(Object.assign({}, leafletPos), { k: event.target._zoom });
            this._events.emit(OrbEventType.TRANSFORM, { transform });
        });
        return leaflet;
    }
    _updateGraphPositions() {
        const nodes = this._graph.getNodes();
        for (let i = 0; i < nodes.length; i++) {
            const coordinates = this._settings.getGeoPosition(nodes[i]);
            if (!coordinates) {
                continue;
            }
            if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
                continue;
            }
            const layerPoint = this._leaflet.latLngToLayerPoint([coordinates.lat, coordinates.lng]);
            nodes[i].position.x = layerPoint.x;
            nodes[i].position.y = layerPoint.y;
        }
    }
    _handleResize() {
        const containerSize = this._container.getBoundingClientRect();
        this._canvas.width = containerSize.width;
        this._canvas.height = containerSize.height;
        this._renderer.width = containerSize.width;
        this._renderer.height = containerSize.height;
        this._leaflet.invalidateSize(false);
        this._renderer.render(this._graph);
    }
    _handleTileChange() {
        const newTile = this._settings.map.tile;
        this._leaflet.whenReady(() => {
            this._leaflet.attributionControl.setPrefix(newTile.attribution);
            this._leaflet.eachLayer((layer) => this._leaflet.removeLayer(layer));
            newTile.instance.addTo(this._leaflet);
        });
    }
}
//# sourceMappingURL=map-view.js.map
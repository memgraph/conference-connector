import * as L from 'leaflet';
import { IEdgeBase } from '../models/edge';
import { INode, INodeBase } from '../models/node';
import { IOrbView, IOrbViewContext } from '../orb';
import { IRendererSettings } from '../renderer/canvas/renderer';
export interface ILeafletMapTile {
    instance: L.TileLayer;
    attribution: string;
}
export interface IMapSettings {
    zoomLevel: number;
    tile: ILeafletMapTile;
}
export interface IMapViewSettings<N extends INodeBase, E extends IEdgeBase> {
    getGeoPosition(node: INode<N, E>): {
        lat: number;
        lng: number;
    } | undefined;
    map: IMapSettings;
    render: Partial<IRendererSettings>;
}
export interface IMapViewSettingsInit<N extends INodeBase, E extends IEdgeBase> {
    getGeoPosition(node: INode<N, E>): {
        lat: number;
        lng: number;
    } | undefined;
    map?: Partial<IMapSettings>;
    render?: Partial<IRendererSettings>;
}
export declare type IMapViewSettingsUpdate<N extends INodeBase, E extends IEdgeBase> = Partial<IMapViewSettingsInit<N, E>>;
export declare class MapView<N extends INodeBase, E extends IEdgeBase> implements IOrbView<IMapViewSettings<N, E>> {
    private _container;
    private _graph;
    private _events;
    private _strategy;
    private _settings;
    private _canvas;
    private _map;
    private _context;
    private readonly _renderer;
    private readonly _leaflet;
    constructor(context: IOrbViewContext<N, E>, settings: IMapViewSettingsInit<N, E>);
    get leaflet(): L.Map;
    isInitiallyRendered(): boolean;
    getSettings(): IMapViewSettings<N, E>;
    setSettings(settings: IMapViewSettingsUpdate<N, E>): void;
    render(onRendered?: () => void): void;
    recenter(onRendered?: () => void): void;
    destroy(): void;
    private _initCanvas;
    private _initMap;
    private _initLeaflet;
    private _updateGraphPositions;
    private _handleResize;
    private _handleTileChange;
}

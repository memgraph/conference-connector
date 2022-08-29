import { ZoomTransform } from 'd3-zoom';
import { IPosition } from '../../common/position';
import { IRectangle } from '../../common/rectangle';
import { INodeBase } from '../../models/node';
import { IEdgeBase } from '../../models/edge';
import { IGraph } from '../../models/graph';
import { Emitter } from '../../utils/emitter.utils';
export declare enum RenderEventType {
    RENDER_START = "render-start",
    RENDER_END = "render-end"
}
export interface IRendererSettings {
    minZoom: number;
    maxZoom: number;
    fitZoomMargin: number;
    labelsIsEnabled: boolean;
    labelsOnEventIsEnabled: boolean;
    shadowIsEnabled: boolean;
    shadowOnEventIsEnabled: boolean;
    contextAlphaOnEvent: number;
    contextAlphaOnEventIsEnabled: boolean;
}
export declare class Renderer extends Emitter<{
    [RenderEventType.RENDER_START]: undefined;
    [RenderEventType.RENDER_END]: {
        durationMs: number;
    };
}> {
    private readonly _context;
    width: number;
    height: number;
    settings: IRendererSettings;
    transform: ZoomTransform;
    private _isOriginCentered;
    private _isInitiallyRendered;
    constructor(context: CanvasRenderingContext2D, settings?: Partial<IRendererSettings>);
    get isInitiallyRendered(): boolean;
    render<N extends INodeBase, E extends IEdgeBase>(graph: IGraph<N, E>): void;
    private drawObjects;
    private drawObject;
    reset(): void;
    getFitZoomTransform<N extends INodeBase, E extends IEdgeBase>(graph: IGraph<N, E>): ZoomTransform;
    getSimulationPosition(canvasPoint: IPosition): IPosition;
    /**
     * Returns the visible rectangle view in the simulation coordinates.
     *
     * @return {IRectangle} Visible view in teh simulation coordinates
     */
    getSimulationViewRectangle(): IRectangle;
    translateOriginToCenter(): void;
}

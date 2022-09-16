import { IPosition } from '../../common/position';
import { Color } from '../../models/color';
export declare enum LabelTextBaseline {
    TOP = "top",
    MIDDLE = "middle"
}
export interface ILabelProperties {
    fontBackgroundColor: Color | string;
    fontColor: Color | string;
    fontFamily: string;
    fontSize: number;
}
export interface ILabelData {
    textBaseline: LabelTextBaseline;
    position: IPosition;
    properties: Partial<ILabelProperties>;
}
export declare class Label {
    readonly text: string;
    readonly textLines: string[];
    readonly position: IPosition;
    readonly properties: Partial<ILabelProperties>;
    readonly fontSize: number;
    readonly fontFamily: string;
    readonly textBaseline: LabelTextBaseline;
    constructor(text: string, data: ILabelData);
    private _fixPosition;
}
export declare const drawLabel: (context: CanvasRenderingContext2D, label: Label) => void;

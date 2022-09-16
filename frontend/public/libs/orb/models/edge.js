import { GraphObjectState } from './state';
import { getDistanceToLine } from './distance';
const CURVED_CONTROL_POINT_OFFSET_MIN_SIZE = 4;
const CURVED_CONTROL_POINT_OFFSET_MULTIPLIER = 4;
export var EdgeType;
(function (EdgeType) {
    EdgeType["STRAIGHT"] = "straight";
    EdgeType["LOOPBACK"] = "loopback";
    EdgeType["CURVED"] = "curved";
})(EdgeType || (EdgeType = {}));
export class EdgeFactory {
    static create(data) {
        const type = getEdgeType(data);
        switch (type) {
            case EdgeType.STRAIGHT:
                return new EdgeStraight(data);
            case EdgeType.LOOPBACK:
                return new EdgeLoopback(data);
            case EdgeType.CURVED:
                return new EdgeCurved(data);
            default:
                return new EdgeStraight(data);
        }
    }
    static copy(edge, data) {
        const newEdge = EdgeFactory.create({
            data: edge.data,
            offset: (data === null || data === void 0 ? void 0 : data.offset) !== undefined ? data.offset : edge.offset,
            startNode: edge.startNode,
            endNode: edge.endNode,
        });
        newEdge.state = edge.state;
        newEdge.properties = edge.properties;
        return newEdge;
    }
}
export const isEdge = (obj) => {
    return obj instanceof EdgeStraight || obj instanceof EdgeCurved || obj instanceof EdgeLoopback;
};
class Edge {
    constructor(data) {
        var _a;
        this.properties = {};
        this.state = GraphObjectState.NONE;
        this._type = EdgeType.STRAIGHT;
        this.id = data.data.id;
        this.data = data.data;
        this.offset = (_a = data.offset) !== null && _a !== void 0 ? _a : 0;
        this.startNode = data.startNode;
        this.endNode = data.endNode;
        this._type = getEdgeType(data);
        this.position = { id: this.id, source: this.startNode.id, target: this.endNode.id };
        this.startNode.addEdge(this);
        this.endNode.addEdge(this);
    }
    get type() {
        return this._type;
    }
    get start() {
        return this.data.start;
    }
    get end() {
        return this.data.end;
    }
    hasProperties() {
        return this.properties && Object.keys(this.properties).length > 0;
    }
    isSelected() {
        return this.state === GraphObjectState.SELECTED;
    }
    isHovered() {
        return this.state === GraphObjectState.HOVERED;
    }
    clearState() {
        this.state = GraphObjectState.NONE;
    }
    isLoopback() {
        return this._type === EdgeType.LOOPBACK;
    }
    isStraight() {
        return this._type === EdgeType.STRAIGHT;
    }
    isCurved() {
        return this._type === EdgeType.CURVED;
    }
    getCenter() {
        var _a, _b;
        const startPoint = (_a = this.startNode) === null || _a === void 0 ? void 0 : _a.getCenter();
        const endPoint = (_b = this.endNode) === null || _b === void 0 ? void 0 : _b.getCenter();
        if (!startPoint || !endPoint) {
            return { x: 0, y: 0 };
        }
        return {
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
        };
    }
    getDistance(point) {
        const startPoint = this.startNode.getCenter();
        const endPoint = this.endNode.getCenter();
        if (!startPoint || !endPoint) {
            return 0;
        }
        return getDistanceToLine(startPoint, endPoint, point);
    }
    getLabel() {
        return this.properties.label;
    }
    hasShadow() {
        var _a, _b, _c;
        return (((_a = this.properties.shadowSize) !== null && _a !== void 0 ? _a : 0) > 0 ||
            ((_b = this.properties.shadowOffsetX) !== null && _b !== void 0 ? _b : 0) > 0 ||
            ((_c = this.properties.shadowOffsetY) !== null && _c !== void 0 ? _c : 0) > 0);
    }
    getWidth() {
        let width = 0;
        if (this.properties.width !== undefined) {
            width = this.properties.width;
        }
        if (this.isHovered() && this.properties.widthHover !== undefined) {
            width = this.properties.widthHover;
        }
        if (this.isSelected() && this.properties.widthSelected !== undefined) {
            width = this.properties.widthSelected;
        }
        return width;
    }
    getColor() {
        let color = undefined;
        if (this.properties.color) {
            color = this.properties.color;
        }
        if (this.isHovered() && this.properties.colorHover) {
            color = this.properties.colorHover;
        }
        if (this.isSelected() && this.properties.colorSelected) {
            color = this.properties.colorSelected;
        }
        return color;
    }
}
const getEdgeType = (data) => {
    var _a;
    if (data.startNode.id === data.endNode.id) {
        return EdgeType.LOOPBACK;
    }
    return ((_a = data.offset) !== null && _a !== void 0 ? _a : 0) === 0 ? EdgeType.STRAIGHT : EdgeType.CURVED;
};
export class EdgeStraight extends Edge {
    getCenter() {
        var _a, _b;
        const startPoint = (_a = this.startNode) === null || _a === void 0 ? void 0 : _a.getCenter();
        const endPoint = (_b = this.endNode) === null || _b === void 0 ? void 0 : _b.getCenter();
        if (!startPoint || !endPoint) {
            return { x: 0, y: 0 };
        }
        return {
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
        };
    }
    getDistance(point) {
        var _a, _b;
        const startPoint = (_a = this.startNode) === null || _a === void 0 ? void 0 : _a.getCenter();
        const endPoint = (_b = this.endNode) === null || _b === void 0 ? void 0 : _b.getCenter();
        if (!startPoint || !endPoint) {
            return 0;
        }
        return getDistanceToLine(startPoint, endPoint, point);
    }
}
export class EdgeCurved extends Edge {
    getCenter() {
        return this.getCurvedControlPoint(CURVED_CONTROL_POINT_OFFSET_MULTIPLIER / 2);
    }
    /**
     * @see {@link https://github.com/visjs/vis-network/blob/master/lib/network/modules/components/edges/util/bezier-edge-base.ts}
     *
     * @param {IPosition} point Point
     * @return {number} Distance to the point
     */
    getDistance(point) {
        var _a, _b;
        const sourcePoint = (_a = this.startNode) === null || _a === void 0 ? void 0 : _a.getCenter();
        const targetPoint = (_b = this.endNode) === null || _b === void 0 ? void 0 : _b.getCenter();
        if (!sourcePoint || !targetPoint) {
            return 0;
        }
        const controlPoint = this.getCurvedControlPoint();
        let minDistance = 1e9;
        let distance;
        let i;
        let t;
        let x;
        let y;
        let lastX = sourcePoint.x;
        let lastY = sourcePoint.y;
        for (i = 1; i < 10; i++) {
            t = 0.1 * i;
            x = Math.pow(1 - t, 2) * sourcePoint.x + 2 * t * (1 - t) * controlPoint.x + Math.pow(t, 2) * targetPoint.x;
            y = Math.pow(1 - t, 2) * sourcePoint.y + 2 * t * (1 - t) * controlPoint.y + Math.pow(t, 2) * targetPoint.y;
            if (i > 0) {
                distance = getDistanceToLine({ x: lastX, y: lastY }, { x, y }, point);
                minDistance = distance < minDistance ? distance : minDistance;
            }
            lastX = x;
            lastY = y;
        }
        return minDistance;
    }
    getCurvedControlPoint(offsetMultiplier = CURVED_CONTROL_POINT_OFFSET_MULTIPLIER) {
        var _a;
        if (!this.startNode || !this.endNode) {
            return { x: 0, y: 0 };
        }
        const sourcePoint = this.startNode.getCenter();
        const targetPoint = this.endNode.getCenter();
        const sourceSize = this.startNode.getRadius();
        const targetSize = this.endNode.getRadius();
        const middleX = (sourcePoint.x + targetPoint.x) / 2;
        const middleY = (sourcePoint.y + targetPoint.y) / 2;
        const dx = targetPoint.x - sourcePoint.x;
        const dy = targetPoint.y - sourcePoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const offsetSize = Math.max(sourceSize, targetSize, CURVED_CONTROL_POINT_OFFSET_MIN_SIZE);
        const offset = ((_a = this.offset) !== null && _a !== void 0 ? _a : 1) * offsetSize * offsetMultiplier;
        // TODO: Check for faster smooth quadratic curve
        // https://docs.microsoft.com/en-us/xamarin/xamarin-forms/user-interface/graphics/skiasharp/curves/path-data
        return {
            x: middleX + offset * (dy / length),
            y: middleY - offset * (dx / length),
        };
    }
}
export class EdgeLoopback extends Edge {
    getCenter() {
        var _a;
        const offset = Math.abs((_a = this.offset) !== null && _a !== void 0 ? _a : 1);
        const circle = this.getCircularData();
        return {
            x: circle.x + circle.radius,
            y: circle.y - offset * 5,
        };
    }
    getDistance(point) {
        const circle = this.getCircularData();
        const dx = circle.x - point.x;
        const dy = circle.y - point.y;
        return Math.abs(Math.sqrt(dx * dx + dy * dy) - circle.radius);
    }
    getCircularData() {
        var _a;
        if (!this.startNode) {
            return { x: 0, y: 0, radius: 0 };
        }
        const nodeCenter = this.startNode.getCenter();
        const nodeRadius = this.startNode.getBorderedRadius();
        const offset = Math.abs((_a = this.offset) !== null && _a !== void 0 ? _a : 1);
        const radius = nodeRadius * 1.5 * offset;
        const nodeSize = nodeRadius;
        const x = nodeCenter.x + radius;
        const y = nodeCenter.y - nodeSize * 0.5;
        return { x, y, radius };
    }
}
//# sourceMappingURL=edge.js.map
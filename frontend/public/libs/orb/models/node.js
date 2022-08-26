import { isPointInRectangle } from '../common/rectangle';
import { ImageHandler } from '../services/images';
import { GraphObjectState } from './state';
export var NodeShapeType;
(function (NodeShapeType) {
    NodeShapeType["CIRCLE"] = "circle";
    NodeShapeType["DOT"] = "dot";
    NodeShapeType["SQUARE"] = "square";
    NodeShapeType["DIAMOND"] = "diamond";
    NodeShapeType["TRIANGLE"] = "triangle";
    NodeShapeType["TRIANGLE_DOWN"] = "triangleDown";
    NodeShapeType["STAR"] = "star";
    NodeShapeType["HEXAGON"] = "hexagon";
})(NodeShapeType || (NodeShapeType = {}));
export class NodeFactory {
    static create(data) {
        return new Node(data);
    }
}
export const isNode = (obj) => {
    return obj instanceof Node;
};
export class Node {
    constructor(data) {
        this.properties = {};
        this.state = GraphObjectState.NONE;
        this._inEdgesById = {};
        this._outEdgesById = {};
        this.id = data.data.id;
        this.data = data.data;
        this.position = { id: this.id };
    }
    clearPosition() {
        this.position.x = undefined;
        this.position.y = undefined;
    }
    getCenter() {
        // This should not be called in the render because nodes without position will be
        // filtered out
        if (this.position.x === undefined || this.position.y === undefined) {
            return { x: 0, y: 0 };
        }
        return { x: this.position.x, y: this.position.y };
    }
    getRadius() {
        var _a;
        return (_a = this.properties.size) !== null && _a !== void 0 ? _a : 0;
    }
    getBorderedRadius() {
        return this.getRadius() + this.getBorderWidth() / 2;
    }
    getBoundingBox() {
        const center = this.getCenter();
        const radius = this.getBorderedRadius();
        return {
            x: center.x - radius,
            y: center.y - radius,
            width: radius * 2,
            height: radius * 2,
        };
    }
    getInEdges() {
        return Object.values(this._inEdgesById);
    }
    getOutEdges() {
        return Object.values(this._outEdgesById);
    }
    getEdges() {
        const edgeById = {};
        const outEdges = this.getOutEdges();
        for (let i = 0; i < outEdges.length; i++) {
            const outEdge = outEdges[i];
            edgeById[outEdge.id] = outEdge;
        }
        const inEdges = this.getInEdges();
        for (let i = 0; i < inEdges.length; i++) {
            const inEdge = inEdges[i];
            edgeById[inEdge.id] = inEdge;
        }
        return Object.values(edgeById);
    }
    getAdjacentNodes() {
        const adjacentNodeById = {};
        const outEdges = this.getOutEdges();
        for (let i = 0; i < outEdges.length; i++) {
            const adjacentNode = outEdges[i].endNode;
            if (adjacentNode) {
                adjacentNodeById[adjacentNode.id] = adjacentNode;
            }
        }
        const inEdges = this.getInEdges();
        for (let i = 0; i < inEdges.length; i++) {
            const adjacentNode = inEdges[i].startNode;
            if (adjacentNode) {
                adjacentNodeById[adjacentNode.id] = adjacentNode;
            }
        }
        return Object.values(adjacentNodeById);
    }
    hasProperties() {
        return this.properties && Object.keys(this.properties).length > 0;
    }
    addEdge(edge) {
        if (edge.start === this.id) {
            this._outEdgesById[edge.id] = edge;
        }
        if (edge.end === this.id) {
            this._inEdgesById[edge.id] = edge;
        }
    }
    removeEdge(edge) {
        delete this._outEdgesById[edge.id];
        delete this._inEdgesById[edge.id];
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
    getDistanceToBorder() {
        // TODO: Add "getDistanceToBorder(angle: number)" for each node shape type because this covers only circles
        return this.getBorderedRadius();
    }
    includesPoint(point) {
        const isInBoundingBox = this._isPointInBoundingBox(point);
        if (!isInBoundingBox) {
            return false;
        }
        // For square type, we don't need to check the circle
        if (this.properties.shape === NodeShapeType.SQUARE) {
            return isInBoundingBox;
        }
        // TODO: Add better "includePoint" checks for stars, triangles, hexagons, etc.
        const center = this.getCenter();
        const borderedRadius = this.getBorderedRadius();
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        return Math.sqrt(dx * dx + dy * dy) <= borderedRadius;
    }
    hasShadow() {
        var _a, _b, _c;
        return (((_a = this.properties.shadowSize) !== null && _a !== void 0 ? _a : 0) > 0 ||
            ((_b = this.properties.shadowOffsetX) !== null && _b !== void 0 ? _b : 0) > 0 ||
            ((_c = this.properties.shadowOffsetY) !== null && _c !== void 0 ? _c : 0) > 0);
    }
    hasBorder() {
        var _a, _b;
        const hasBorderWidth = ((_a = this.properties.borderWidth) !== null && _a !== void 0 ? _a : 0) > 0;
        const hasBorderWidthSelected = ((_b = this.properties.borderWidthSelected) !== null && _b !== void 0 ? _b : 0) > 0;
        return hasBorderWidth || (this.isSelected() && hasBorderWidthSelected);
    }
    getLabel() {
        return this.properties.label;
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
    getBorderWidth() {
        let borderWidth = 0;
        if (this.properties.borderWidth && this.properties.borderWidth > 0) {
            borderWidth = this.properties.borderWidth;
        }
        if (this.isSelected() && this.properties.borderWidthSelected && this.properties.borderWidthSelected > 0) {
            borderWidth = this.properties.borderWidthSelected;
        }
        return borderWidth;
    }
    getBorderColor() {
        if (!this.hasBorder()) {
            return undefined;
        }
        let borderColor = undefined;
        if (this.properties.borderColor) {
            borderColor = this.properties.borderColor;
        }
        if (this.isHovered() && this.properties.borderColorHover) {
            borderColor = this.properties.borderColorHover;
        }
        if (this.isSelected() && this.properties.borderColorSelected) {
            borderColor = this.properties.borderColorSelected.toString();
        }
        return borderColor;
    }
    getBackgroundImage() {
        var _a;
        if (((_a = this.properties.size) !== null && _a !== void 0 ? _a : 0) <= 0) {
            return;
        }
        let imageUrl;
        if (this.properties.imageUrl) {
            imageUrl = this.properties.imageUrl;
        }
        if (this.isSelected() && this.properties.imageUrlSelected) {
            imageUrl = this.properties.imageUrlSelected;
        }
        if (!imageUrl) {
            return;
        }
        return ImageHandler.getInstance().getImage(imageUrl);
    }
    _isPointInBoundingBox(point) {
        return isPointInRectangle(this.getBoundingBox(), point);
    }
}
//# sourceMappingURL=node.js.map
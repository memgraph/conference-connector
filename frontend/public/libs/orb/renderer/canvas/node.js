import { NodeShapeType } from '../../models/node';
import { drawDiamond, drawHexagon, drawSquare, drawStar, drawTriangleDown, drawTriangleUp, drawCircle } from './shapes';
import { drawLabel, Label, LabelTextBaseline } from './label';
// The label will be `X` of the size below the Node
const DEFAULT_LABEL_DISTANCE_SIZE_FROM_NODE = 0.2;
const DEFAULT_IS_SHADOW_DRAW_ENABLED = true;
const DEFAULT_IS_LABEL_DRAW_ENABLED = true;
export const drawNode = (context, node, options) => {
    var _a, _b;
    const isShadowEnabled = (_a = options === null || options === void 0 ? void 0 : options.isShadowEnabled) !== null && _a !== void 0 ? _a : DEFAULT_IS_SHADOW_DRAW_ENABLED;
    const isLabelEnabled = (_b = options === null || options === void 0 ? void 0 : options.isLabelEnabled) !== null && _b !== void 0 ? _b : DEFAULT_IS_LABEL_DRAW_ENABLED;
    const hasShadow = node.hasShadow();
    setupCanvas(context, node);
    if (isShadowEnabled && hasShadow) {
        setupShadow(context, node);
    }
    drawShape(context, node);
    context.fill();
    const image = node.getBackgroundImage();
    if (image) {
        drawImage(context, node, image);
    }
    if (isShadowEnabled && hasShadow) {
        clearShadow(context, node);
    }
    if (node.hasBorder()) {
        context.stroke();
    }
    if (isLabelEnabled) {
        drawNodeLabel(context, node);
    }
};
const drawShape = (context, node) => {
    // Default shape is the circle
    const center = node.getCenter();
    const radius = node.getRadius();
    switch (node.properties.shape) {
        case NodeShapeType.SQUARE: {
            drawSquare(context, center.x, center.y, radius);
            break;
        }
        case NodeShapeType.DIAMOND: {
            drawDiamond(context, center.x, center.y, radius);
            break;
        }
        case NodeShapeType.TRIANGLE: {
            drawTriangleUp(context, center.x, center.y, radius);
            break;
        }
        case NodeShapeType.TRIANGLE_DOWN: {
            drawTriangleDown(context, center.x, center.y, radius);
            break;
        }
        case NodeShapeType.STAR: {
            drawStar(context, center.x, center.y, radius);
            break;
        }
        case NodeShapeType.HEXAGON: {
            drawHexagon(context, center.x, center.y, radius);
            break;
        }
        default: {
            drawCircle(context, center.x, center.y, radius);
            break;
        }
    }
};
const drawNodeLabel = (context, node) => {
    const nodeLabel = node.getLabel();
    if (!nodeLabel) {
        return;
    }
    const center = node.getCenter();
    const distance = node.getBorderedRadius() * (1 + DEFAULT_LABEL_DISTANCE_SIZE_FROM_NODE);
    const label = new Label(nodeLabel, {
        position: { x: center.x, y: center.y + distance },
        textBaseline: LabelTextBaseline.TOP,
        properties: {
            fontBackgroundColor: node.properties.fontBackgroundColor,
            fontColor: node.properties.fontColor,
            fontFamily: node.properties.fontFamily,
            fontSize: node.properties.fontSize,
        },
    });
    drawLabel(context, label);
};
const drawImage = (context, node, image) => {
    if (!image.width || !image.height) {
        return;
    }
    const center = node.getCenter();
    const radius = node.getRadius();
    const scale = Math.max((radius * 2) / image.width, (radius * 2) / image.height);
    const height = image.height * scale;
    const width = image.width * scale;
    context.save();
    context.clip();
    context.drawImage(image, center.x - width / 2, center.y - height / 2, width, height);
    context.restore();
};
const setupCanvas = (context, node) => {
    const hasBorder = node.hasBorder();
    if (hasBorder) {
        context.lineWidth = node.getBorderWidth();
        const borderColor = node.getBorderColor();
        if (borderColor) {
            context.strokeStyle = borderColor.toString();
        }
    }
    const color = node.getColor();
    if (color) {
        context.fillStyle = color.toString();
    }
};
const setupShadow = (context, node) => {
    if (node.properties.shadowColor) {
        context.shadowColor = node.properties.shadowColor.toString();
    }
    if (node.properties.shadowSize) {
        context.shadowBlur = node.properties.shadowSize;
    }
    if (node.properties.shadowOffsetX) {
        context.shadowOffsetX = node.properties.shadowOffsetX;
    }
    if (node.properties.shadowOffsetY) {
        context.shadowOffsetY = node.properties.shadowOffsetY;
    }
};
const clearShadow = (context, node) => {
    if (node.properties.shadowColor) {
        context.shadowColor = 'rgba(0,0,0,0)';
    }
    if (node.properties.shadowSize) {
        context.shadowBlur = 0;
    }
    if (node.properties.shadowOffsetX) {
        context.shadowOffsetX = 0;
    }
    if (node.properties.shadowOffsetY) {
        context.shadowOffsetY = 0;
    }
};
//# sourceMappingURL=node.js.map
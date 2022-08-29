import { Color } from './color';
const LABEL_PROPERTY_NAMES = ['label', 'name'];
export const DEFAULT_NODE_PROPERTIES = {
    size: 5,
    color: new Color('#1d87c9'),
};
export const DEFAULT_EDGE_PROPERTIES = {
    color: new Color('#ababab'),
    width: 0.3,
};
export const getDefaultGraphStyle = () => {
    return {
        getNodeStyle(node) {
            return Object.assign(Object.assign({}, DEFAULT_NODE_PROPERTIES), { label: getPredefinedLabel(node) });
        },
        getEdgeStyle(edge) {
            return Object.assign(Object.assign({}, DEFAULT_EDGE_PROPERTIES), { label: getPredefinedLabel(edge) });
        },
    };
};
const getPredefinedLabel = (obj) => {
    for (let i = 0; i < LABEL_PROPERTY_NAMES.length; i++) {
        const value = obj.data[LABEL_PROPERTY_NAMES[i]];
        if (value !== undefined && value !== null) {
            return `${value}`;
        }
    }
};
//# sourceMappingURL=style.js.map
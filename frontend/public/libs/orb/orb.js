import { Graph } from './models/graph';
import { DefaultView } from './views/default-view';
import { getDefaultEventStrategy } from './models/strategy';
import { OrbEmitter } from './events';
import { getDefaultGraphStyle } from './models/style';
export class Orb {
    constructor(container, settings) {
        var _a;
        this.container = container;
        this._events = new OrbEmitter();
        this._graph = new Graph(undefined, {
            onLoadedImages: () => {
                // Not to call render() before user's .render()
                if (this._view.isInitiallyRendered()) {
                    this._view.render();
                }
            },
        });
        this._graph.setDefaultStyle(getDefaultGraphStyle());
        this._context = {
            container: this.container,
            graph: this._graph,
            events: this._events,
            strategy: (_a = settings === null || settings === void 0 ? void 0 : settings.strategy) !== null && _a !== void 0 ? _a : getDefaultEventStrategy(),
        };
        if (settings === null || settings === void 0 ? void 0 : settings.view) {
            this._view = settings.view(this._context);
        }
        else {
            this._view = new DefaultView(this._context);
        }
    }
    get data() {
        return this._graph;
    }
    get view() {
        return this._view;
    }
    get events() {
        return this._events;
    }
    setView(factory) {
        if (this._view) {
            this._view.destroy();
        }
        this._view = factory(this._context);
        // Reset the existing graph in case of switching between different view types.
        if (this._graph.getNodeCount() > 0) {
            this._graph.clearPositions();
        }
    }
}
//# sourceMappingURL=orb.js.map
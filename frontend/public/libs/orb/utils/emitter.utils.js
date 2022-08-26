export class Emitter {
    constructor() {
        this._listeners = new Map();
    }
    /**
     * Adds a one-time listener function for the event named eventName. The next time eventName is
     * triggered, this listener is removed and then invoked.
     *
     * @see {@link https://nodejs.org/api/events.html#emitteronceeventname-listener}
     * @param {IEventKey} eventName Event name
     * @param {IEventReceiver} func Event function
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    once(eventName, func) {
        const newListener = {
            callable: func,
            isOnce: true,
        };
        const listeners = this._listeners.get(eventName);
        if (listeners) {
            listeners.push(newListener);
        }
        else {
            this._listeners.set(eventName, [newListener]);
        }
        return this;
    }
    /**
     * Adds the listener function to the end of the listeners array for the event named eventName.
     * No checks are made to see if the listener has already been added. Multiple calls passing
     * the same combination of eventName and listener will result in the listener being added,
     * and called, multiple times.
     *
     * @see {@link https://nodejs.org/api/events.html#emitteroneventname-listener}
     * @param {IEventKey} eventName Event name
     * @param {IEventReceiver} func Event function
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    on(eventName, func) {
        const newListener = {
            callable: func,
        };
        const listeners = this._listeners.get(eventName);
        if (listeners) {
            listeners.push(newListener);
        }
        else {
            this._listeners.set(eventName, [newListener]);
        }
        return this;
    }
    /**
     * Removes the specified listener from the listener array for the event named eventName.
     *
     * @see {@link https://nodejs.org/api/events.html#emitterremovelistenereventname-listener}
     * @param {IEventKey} eventName Event name
     * @param {IEventReceiver} func Event function
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    off(eventName, func) {
        const listeners = this._listeners.get(eventName);
        if (listeners) {
            const filteredListeners = listeners.filter((listener) => listener.callable !== func);
            this._listeners.set(eventName, filteredListeners);
        }
        return this;
    }
    /**
     * Synchronously calls each of the listeners registered for the event named eventName,
     * in the order they were registered, passing the supplied arguments to each.
     * Returns true if the event had listeners, false otherwise.
     *
     * @param {IEventKey} eventName Event name
     * @param {any} params Event parameters
     *
     * @return {boolean} True if the event had listeners, false otherwise
     */
    emit(eventName, params) {
        const listeners = this._listeners.get(eventName);
        if (!listeners || listeners.length === 0) {
            return false;
        }
        let hasOnceListener = false;
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i].isOnce) {
                hasOnceListener = true;
            }
            listeners[i].callable(params);
        }
        if (hasOnceListener) {
            const filteredListeners = listeners.filter((listener) => !listener.isOnce);
            this._listeners.set(eventName, filteredListeners);
        }
        return true;
    }
    /**
     * Returns an array listing the events for which the emitter has registered listeners.
     *
     * @see {@link https://nodejs.org/api/events.html#emittereventnames}
     * @return {IEventKey[]} Event names with registered listeners
     */
    eventNames() {
        return [...this._listeners.keys()];
    }
    /**
     * Returns the number of listeners listening to the event named eventName.
     *
     * @see {@link https://nodejs.org/api/events.html#emitterlistenercounteventname}
     * @param {IEventKey} eventName Event name
     * @return {number} Number of listeners listening to the event name
     */
    listenerCount(eventName) {
        const listeners = this._listeners.get(eventName);
        return listeners ? listeners.length : 0;
    }
    /**
     * Returns a copy of the array of listeners for the event named eventName.
     *
     * @see {@link https://nodejs.org/api/events.html#emitterlistenerseventname}
     * @param {IEventKey} eventName Event name
     * @return {IEventReceiver[]} Array of listeners for the event name
     */
    listeners(eventName) {
        const listeners = this._listeners.get(eventName);
        if (!listeners) {
            return [];
        }
        return listeners.map((listener) => listener.callable);
    }
    /**
     * Alias for emitter.on(eventName, listener).
     *
     * @see {@link https://nodejs.org/api/events.html#emitteraddlistenereventname-listener}
     * @param {IEventKey} eventName Event name
     * @param {IEventReceiver} func Event function
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    addListener(eventName, func) {
        return this.on(eventName, func);
    }
    /**
     * Alias for emitter.off(eventName, listener).
     *
     * @see {@link https://nodejs.org/api/events.html#emitterremovelistenereventname-listener}
     * @param {IEventKey} eventName Event name
     * @param {IEventReceiver} func Event function
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    removeListener(eventName, func) {
        return this.off(eventName, func);
    }
    /**
     * Removes all listeners, or those of the specified eventName.
     *
     * @see {@link https://nodejs.org/api/events.html#emitterremovealllistenerseventname}
     * @param {IEventKey} eventName Event name
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this._listeners.delete(eventName);
        }
        else {
            this._listeners.clear();
        }
        return this;
    }
}
//# sourceMappingURL=emitter.utils.js.map
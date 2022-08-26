declare type IEventMap = Record<string, any>;
declare type IEventKey<T extends IEventMap> = string & keyof T;
declare type IEventReceiver<T> = (params: T) => void;
export interface IEmitter<T extends IEventMap> {
    once<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
    on<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
    off<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
    emit<K extends IEventKey<T>>(eventName: K, params: T[K]): boolean;
    eventNames<K extends IEventKey<T>>(): K[];
    listenerCount<K extends IEventKey<T>>(eventName: K): number;
    listeners<K extends IEventKey<T>>(eventName: K): IEventReceiver<T[K]>[];
    addListener<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
    removeListener<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
    removeAllListeners<K extends IEventKey<T>>(eventName?: K): IEmitter<T>;
}
export declare class Emitter<T extends IEventMap> implements IEmitter<T> {
    private readonly _listeners;
    /**
     * Adds a one-time listener function for the event named eventName. The next time eventName is
     * triggered, this listener is removed and then invoked.
     *
     * @see {@link https://nodejs.org/api/events.html#emitteronceeventname-listener}
     * @param {IEventKey} eventName Event name
     * @param {IEventReceiver} func Event function
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    once<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
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
    on<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
    /**
     * Removes the specified listener from the listener array for the event named eventName.
     *
     * @see {@link https://nodejs.org/api/events.html#emitterremovelistenereventname-listener}
     * @param {IEventKey} eventName Event name
     * @param {IEventReceiver} func Event function
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    off<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
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
    emit<K extends IEventKey<T>>(eventName: K, params: T[K]): boolean;
    /**
     * Returns an array listing the events for which the emitter has registered listeners.
     *
     * @see {@link https://nodejs.org/api/events.html#emittereventnames}
     * @return {IEventKey[]} Event names with registered listeners
     */
    eventNames<K extends IEventKey<T>>(): K[];
    /**
     * Returns the number of listeners listening to the event named eventName.
     *
     * @see {@link https://nodejs.org/api/events.html#emitterlistenercounteventname}
     * @param {IEventKey} eventName Event name
     * @return {number} Number of listeners listening to the event name
     */
    listenerCount<K extends IEventKey<T>>(eventName: K): number;
    /**
     * Returns a copy of the array of listeners for the event named eventName.
     *
     * @see {@link https://nodejs.org/api/events.html#emitterlistenerseventname}
     * @param {IEventKey} eventName Event name
     * @return {IEventReceiver[]} Array of listeners for the event name
     */
    listeners<K extends IEventKey<T>>(eventName: K): IEventReceiver<T[K]>[];
    /**
     * Alias for emitter.on(eventName, listener).
     *
     * @see {@link https://nodejs.org/api/events.html#emitteraddlistenereventname-listener}
     * @param {IEventKey} eventName Event name
     * @param {IEventReceiver} func Event function
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    addListener<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
    /**
     * Alias for emitter.off(eventName, listener).
     *
     * @see {@link https://nodejs.org/api/events.html#emitterremovelistenereventname-listener}
     * @param {IEventKey} eventName Event name
     * @param {IEventReceiver} func Event function
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    removeListener<K extends IEventKey<T>>(eventName: K, func: IEventReceiver<T[K]>): IEmitter<T>;
    /**
     * Removes all listeners, or those of the specified eventName.
     *
     * @see {@link https://nodejs.org/api/events.html#emitterremovealllistenerseventname}
     * @param {IEventKey} eventName Event name
     * @return {IEmitter} Reference to the EventEmitter, so that calls can be chained
     */
    removeAllListeners<K extends IEventKey<T>>(eventName?: K): IEmitter<T>;
}
export {};

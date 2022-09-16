import { ISimulator, ISimulatorEvents } from './interface';
export declare class SimulatorFactory {
    static getSimulator(events: Partial<ISimulatorEvents>): ISimulator;
}

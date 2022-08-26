// Messages are objects going into the simulation worker.
// They can be thought of similar to requests.
// (not quite as there is no immediate response to a request)
export var WorkerInputType;
(function (WorkerInputType) {
    // Set node and edge data without simulating
    WorkerInputType["SetData"] = "Set Data";
    WorkerInputType["AddData"] = "Add Data";
    WorkerInputType["UpdateData"] = "Update Data";
    WorkerInputType["ClearData"] = "Clear Data";
    // Simulation message types
    WorkerInputType["Simulate"] = "Simulate";
    WorkerInputType["ActivateSimulation"] = "Activate Simulation";
    WorkerInputType["StartSimulation"] = "Start Simulation";
    WorkerInputType["UpdateSimulation"] = "Update Simulation";
    WorkerInputType["StopSimulation"] = "Stop Simulation";
    // Node dragging message types
    WorkerInputType["StartDragNode"] = "Start Drag Node";
    WorkerInputType["DragNode"] = "Drag Node";
    WorkerInputType["EndDragNode"] = "End Drag Node";
    WorkerInputType["FixNodes"] = "Fix Nodes";
    WorkerInputType["ReleaseNodes"] = "Release Nodes";
    // Settings and special params
    WorkerInputType["SetSettings"] = "Set Settings";
})(WorkerInputType || (WorkerInputType = {}));
//# sourceMappingURL=worker-input.js.map
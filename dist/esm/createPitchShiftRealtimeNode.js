import { __awaiter } from "tslib";
function createWorkletAsRealtimeNode(context, options) {
    const node = new AudioWorkletNode(context, "realtime-pitch-shift-processor", options);
    node.setPitch = (pitch) => {
        node.port.postMessage(JSON.stringify(["pitch", pitch]));
    };
    node.setTempo = (pitch) => {
        node.port.postMessage(JSON.stringify(["tempo", pitch]));
    };
    node.setHighQuality = (pitch) => {
        node.port.postMessage(JSON.stringify(["quality", pitch]));
    };
    node.close = () => {
        node.port.postMessage(JSON.stringify(["close"]));
    };
    return node;
}
function createPitchShiftRealtimeNode(context, url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return createWorkletAsRealtimeNode(context, options);
        }
        catch (err) {
            yield context.audioWorklet.addModule(url);
            return createWorkletAsRealtimeNode(context, options);
        }
    });
}
export { createPitchShiftRealtimeNode };
//# sourceMappingURL=createPitchShiftRealtimeNode.js.map
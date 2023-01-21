import { __awaiter } from "tslib";
function cloneArrayBuffer(src) {
    const dst = new ArrayBuffer(src.byteLength);
    new Uint8Array(dst).set(new Uint8Array(src));
    return dst;
}
function createWorkletAsSourceNode(context, options) {
    const node = new AudioWorkletNode(context, 'offline-pitch-shift-processor', options);
    node.setBuffer = (buffer) => {
        const transfer = [];
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const source = cloneArrayBuffer(buffer.getChannelData(channel).buffer);
            transfer.push(source);
        }
        node.port.postMessage({
            event: 'buffer',
            buffer: transfer
        }, transfer);
    };
    node.setPitch = (pitch) => {
        node.port.postMessage({
            event: 'pitch',
            pitch: pitch
        });
    };
    node.setTempo = (tempo) => {
        node.port.postMessage({
            event: 'tempo',
            tempo: tempo
        });
    };
    let startTimeout;
    node.start = (when) => {
        if (startTimeout) {
            clearTimeout(startTimeout);
        }
        if (!when || when <= context.currentTime) {
            console.info('Start directly');
            node.port.postMessage({
                event: 'start'
            });
        }
        else {
            startTimeout = setTimeout(() => {
                console.info('Start in ' + (context.currentTime - when) * 1000 + 'ms');
                node.port.postMessage({
                    event: 'start'
                });
            }, (context.currentTime - when) * 1000);
        }
    };
    let stopTimeout;
    node.stop = (when) => {
        if (stopTimeout) {
            clearTimeout(stopTimeout);
        }
        if (!when || when <= context.currentTime) {
            node.port.postMessage({
                event: 'stop'
            });
        }
        else {
            stopTimeout = setTimeout(() => {
                node.port.postMessage({
                    event: 'stop'
                });
            }, (context.currentTime - when) * 1000);
        }
    };
    node.setPitch = (pitch) => {
        node.port.postMessage({
            event: 'pitch',
            pitch: pitch
        });
    };
    node.close = () => {
        node.port.postMessage({
            event: 'close'
        });
    };
    console.info('Created a new RubberBandSourceNode');
    return node;
}
function createPitchShiftSourceNode(context, url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return createWorkletAsSourceNode(context, options);
        }
        catch (err) {
            yield context.audioWorklet.addModule(url);
            return createWorkletAsSourceNode(context, options);
        }
    });
}
export { createPitchShiftSourceNode };
//# sourceMappingURL=createPitchShiftSourceNode.js.map
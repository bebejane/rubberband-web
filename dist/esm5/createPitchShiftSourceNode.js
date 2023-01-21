import { __awaiter, __generator } from "tslib";
function cloneArrayBuffer(src) {
    var dst = new ArrayBuffer(src.byteLength);
    new Uint8Array(dst).set(new Uint8Array(src));
    return dst;
}
function createWorkletAsSourceNode(context, options) {
    var node = new AudioWorkletNode(context, 'offline-pitch-shift-processor', options);
    node.setBuffer = function (buffer) {
        var transfer = [];
        for (var channel = 0; channel < buffer.numberOfChannels; channel++) {
            var source = cloneArrayBuffer(buffer.getChannelData(channel).buffer);
            transfer.push(source);
        }
        node.port.postMessage({
            event: 'buffer',
            buffer: transfer
        }, transfer);
    };
    node.setPitch = function (pitch) {
        node.port.postMessage({
            event: 'pitch',
            pitch: pitch
        });
    };
    node.setTempo = function (tempo) {
        node.port.postMessage({
            event: 'tempo',
            tempo: tempo
        });
    };
    var startTimeout;
    node.start = function (when) {
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
            startTimeout = setTimeout(function () {
                console.info('Start in ' + (context.currentTime - when) * 1000 + 'ms');
                node.port.postMessage({
                    event: 'start'
                });
            }, (context.currentTime - when) * 1000);
        }
    };
    var stopTimeout;
    node.stop = function (when) {
        if (stopTimeout) {
            clearTimeout(stopTimeout);
        }
        if (!when || when <= context.currentTime) {
            node.port.postMessage({
                event: 'stop'
            });
        }
        else {
            stopTimeout = setTimeout(function () {
                node.port.postMessage({
                    event: 'stop'
                });
            }, (context.currentTime - when) * 1000);
        }
    };
    node.setPitch = function (pitch) {
        node.port.postMessage({
            event: 'pitch',
            pitch: pitch
        });
    };
    node.close = function () {
        node.port.postMessage({
            event: 'close'
        });
    };
    console.info('Created a new RubberBandSourceNode');
    return node;
}
function createPitchShiftSourceNode(context, url, options) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 1, , 3]);
                    return [2, createWorkletAsSourceNode(context, options)];
                case 1:
                    err_1 = _a.sent();
                    return [4, context.audioWorklet.addModule(url)];
                case 2:
                    _a.sent();
                    return [2, createWorkletAsSourceNode(context, options)];
                case 3: return [2];
            }
        });
    });
}
export { createPitchShiftSourceNode };
//# sourceMappingURL=createPitchShiftSourceNode.js.map
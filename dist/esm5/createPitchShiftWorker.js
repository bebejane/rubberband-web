var cloneArrayBuffer = function (source) {
    var dest = new ArrayBuffer(source.byteLength);
    new Uint8Array(dest).set(new Uint8Array(source));
    return dest;
};
var createPitchShiftWorker = function (url) {
    var worker = new Worker(url);
    worker.process = function (audioBuffer, tempo, pitch) {
        if (pitch === void 0) { pitch = 1; }
        return new Promise(function (resolve, reject) {
            var onMessage = function (_a) {
                var data = _a.data;
                worker.removeEventListener('message', onMessage);
                var event = data.event;
                if (event === 'process') {
                    var channels = data.channels;
                    if (channels) {
                        var length_1 = channels[0].byteLength / Float32Array.BYTES_PER_ELEMENT;
                        var processedAudioBuffer = new AudioBuffer({
                            length: length_1,
                            numberOfChannels: audioBuffer.numberOfChannels,
                            sampleRate: audioBuffer.sampleRate
                        });
                        for (var i = 0; i < channels.length; i++) {
                            processedAudioBuffer.copyToChannel(new Float32Array(channels[i]), i);
                        }
                        resolve(processedAudioBuffer);
                    }
                }
                else if (event === 'error') {
                    var error = data.error;
                    reject(new Error(error));
                }
                else {
                    reject(new Error("Unexpected event ".concat(event)));
                }
            };
            worker.addEventListener('message', onMessage);
            var transfer = [];
            for (var channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                var source = audioBuffer.getChannelData(channel).buffer;
                transfer.push(cloneArrayBuffer(source));
            }
            console.log("BEFORE");
            for (var channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                console.log("Length of source channel buffer: ".concat(audioBuffer.getChannelData(channel).byteLength));
            }
            for (var channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                console.log("Length of transfer channel buffer: ".concat(transfer[channel].byteLength));
            }
            worker.postMessage({
                event: 'process',
                pitch: pitch,
                tempo: tempo,
                sampleRate: audioBuffer.sampleRate,
                channels: transfer
            }, transfer);
            console.log("AFTER");
            for (var channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                console.log("Length of source channel buffer: ".concat(audioBuffer.getChannelData(channel).byteLength));
            }
            for (var channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                console.log("Length of transfer channel buffer: ".concat(transfer[channel].byteLength));
            }
        });
    };
    return worker;
};
export { createPitchShiftWorker };
//# sourceMappingURL=createPitchShiftWorker.js.map
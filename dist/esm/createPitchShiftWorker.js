const cloneArrayBuffer = (source) => {
    const dest = new ArrayBuffer(source.byteLength);
    new Uint8Array(dest).set(new Uint8Array(source));
    return dest;
};
const createPitchShiftWorker = (url) => {
    const worker = new Worker(url);
    worker.process = (audioBuffer, tempo, pitch = 1) => {
        return new Promise((resolve, reject) => {
            const onMessage = ({ data }) => {
                worker.removeEventListener('message', onMessage);
                const { event } = data;
                if (event === 'process') {
                    const { channels } = data;
                    if (channels) {
                        const length = channels[0].byteLength / Float32Array.BYTES_PER_ELEMENT;
                        const processedAudioBuffer = new AudioBuffer({
                            length: length,
                            numberOfChannels: audioBuffer.numberOfChannels,
                            sampleRate: audioBuffer.sampleRate
                        });
                        for (let i = 0; i < channels.length; i++) {
                            processedAudioBuffer.copyToChannel(new Float32Array(channels[i]), i);
                        }
                        resolve(processedAudioBuffer);
                    }
                }
                else if (event === 'error') {
                    const { error } = data;
                    reject(new Error(error));
                }
                else {
                    reject(new Error(`Unexpected event ${event}`));
                }
            };
            worker.addEventListener('message', onMessage);
            const transfer = [];
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                const source = audioBuffer.getChannelData(channel).buffer;
                transfer.push(cloneArrayBuffer(source));
            }
            console.log("BEFORE");
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                console.log(`Length of source channel buffer: ${audioBuffer.getChannelData(channel).byteLength}`);
            }
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                console.log(`Length of transfer channel buffer: ${transfer[channel].byteLength}`);
            }
            worker.postMessage({
                event: 'process',
                pitch: pitch,
                tempo: tempo,
                sampleRate: audioBuffer.sampleRate,
                channels: transfer
            }, transfer);
            console.log("AFTER");
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                console.log(`Length of source channel buffer: ${audioBuffer.getChannelData(channel).byteLength}`);
            }
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                console.log(`Length of transfer channel buffer: ${transfer[channel].byteLength}`);
            }
        });
    };
    return worker;
};
export { createPitchShiftWorker };
//# sourceMappingURL=createPitchShiftWorker.js.map
// Byte per audio sample. (32 bit float)
const BYTES_PER_SAMPLE = Float32Array.BYTES_PER_ELEMENT

// Basic byte unit of WASM heap. (16 bit = 2 bytes)
const BYTES_PER_UNIT = Uint16Array.BYTES_PER_ELEMENT

class HeapArray {
  private ready: boolean = false
  private readonly module: EmscriptenModule
  private readonly length: number
  private readonly channelCount: number
  private readonly dataPtr: number
  private channelData: Float32Array[] = []

  constructor(module: EmscriptenModule, length: number, channelCount: number = 1) {
    if (length >= 1434883) {
      throw new Error('Length grater as 1434883 is not supported')
    }
    this.module = module
    this.channelCount = channelCount
    this.length = length

    // Allocate heap
    const channelByteSize = this.length// * BYTES_PER_SAMPLE
    const dataByteSize = this.channelCount * channelByteSize
    console.log('allocate heap', this.length, channelByteSize);

    this.dataPtr = this.module._malloc(dataByteSize)
    for (let channel = 0; channel < this.channelCount; ++channel) {
      const startByteOffset = this.dataPtr + channel * channelByteSize
      const endByteOffset = startByteOffset + channelByteSize
      this.channelData[channel] =
        this.module.HEAPF32.subarray(
          startByteOffset >> BYTES_PER_UNIT,
          endByteOffset >> BYTES_PER_UNIT)
    }
    console.log(`[HeapArray] Created buffer at ${this.dataPtr} of size ${dataByteSize}, ending at ${this.dataPtr + dataByteSize}`)
    this.ready = true
  }

  public getLength(): number {
    return this.length
  }

  public close() {
    this.ready = false
    this.module._free(this.dataPtr)
  }

  public getHeapAddress(): number {
    return this.dataPtr
  }

  public getChannelCount(): number {
    return this.channelCount
  }

  public getChannelArray(channel: number): Float32Array {
    if (channel < 0 || channel >= this.channelCount) {
      throw new Error(`Invalid channel index ${channel}, please choose an index from 0 to ${this.channelCount}`)
    }
    return this.channelData[channel]
  }

  public getArray(): Float32Array[] {
    return this.channelData
  }
}

export default HeapArray
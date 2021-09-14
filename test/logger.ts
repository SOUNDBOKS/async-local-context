// example usage of an async context as a context-aware-logger

import { PassThrough, Transform, Writable } from "stream"
import { pipeline } from "stream/promises"
import { create } from "../src"


const transform = (stream: Writable, transformer: AugmentFn): Writable => {
    const transformStream = new Transform({
        transform: (chunk, encoding, callback) => {
            callback(null, transformer(chunk))
        }
    })

    transformStream.pipe(stream)
    return transformStream
}

const stdout = transform(process.stdout, m => m + "\n")
const logger = create<Writable>(() => stdout)


type AugmentFn = (a: string) => string

export default new (class {
    public log (message: string) { 
        logger.use().write(message)
    }

    public async augment<T>(a: AugmentFn, inner: () => Promise<T>): Promise<T> {
        return this.collect(transform(logger.use(), a), inner)
    }

    public collect<T>(stream: Writable, inner: () => Promise<T>): Promise<T> {
        return logger.run(stream, inner)
    }
})()
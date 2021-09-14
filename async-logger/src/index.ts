
import { PassThrough, Transform, Writable } from "stream"
import { pipeline } from "stream/promises"
import { create } from "@soundboks/async-local-context"


const transform = (stream: Writable, transformer: AugmentFn): Writable => {
    const transformStream = new Transform({
        transform: (chunk, encoding, callback) => {
            callback(null, transformer(chunk))
        }
    })

    transformStream.pipe(stream)
    return transformStream
}

const logger = create<Writable>(() => process.stdout)

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

    public tap<T>(stream: Writable, inner: () => Promise<T>): Promise<T> {
        const splitStream = new PassThrough()
        splitStream.pipe(stream)
        splitStream.pipe(logger.use())
        return logger.run(splitStream, inner)
    }
})()
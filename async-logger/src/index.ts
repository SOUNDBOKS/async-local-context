
import { PassThrough, Transform, Writable } from "stream"
import { pipeline } from "stream/promises"
import { create } from "@soundboks/async-local-context"

type AugmentFn = (a: string) => string


// Create a Writable stream that pipes data into 'stream' after passing it through 'transformer'
const transform = (stream: Writable, transformer: AugmentFn): Writable => {
    const transformStream = new Transform({
        transform: (chunk, encoding, callback) => {
            callback(null, transformer(chunk))
        }
    })

    transformStream.pipe(stream)
    return transformStream
}

// AsyncContext for containing the logging context
const logger = create<Writable>(() => process.stdout)


export default new (class {
    // Pipe a string into the containing logging context
    public log (message: string) { 
        logger.use().write(message)
    }


    // Executes inner, piping logs, mapped over 'a', into the parent context
    public async augment<T>(a: AugmentFn, inner: () => Promise<T>): Promise<T> {
        return this.collect(transform(logger.use(), a), inner)
    }


    // Executes 'inner', piping logs into stream
    // This will override the containing logging context
    public collect<T>(stream: Writable, inner: () => Promise<T>): Promise<T> {
        return logger.run(stream, inner)
    }


    // Executes 'inner', piping logs both into 'stream', aswell as the parent context
    public tap<T>(stream: Writable, inner: () => Promise<T>): Promise<T> {
        const splitStream = new PassThrough()
        splitStream.pipe(stream)
        splitStream.pipe(logger.use())
        return logger.run(splitStream, inner)
    }
})()
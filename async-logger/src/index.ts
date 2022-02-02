
import { AsyncContextProvider, create } from "@soundboks/async-local-context"


export type LogHandler<LogT> = (_: LogT) => void
export type AugmentFn<T> = (a: T) => T
export class AsyncLogger<LogT> {
    private logProvider: AsyncContextProvider<LogHandler<LogT>>

    constructor(baseHandler: LogHandler<LogT>) {
        this.logProvider = create(() => baseHandler)
    }

    // Pipe a string into the containing logging context
    // Appends a newline
    public log(message: LogT) { 
        this.logProvider.use()(message)
    }

    // Retrieve the underlying write stream
    public use (): LogHandler<LogT> {
        return this.logProvider.use()
    }


    // Executes inner, piping logs, mapped over 'a', into the parent context
    public async augment<T>(a: AugmentFn<LogT>, inner: () => Promise<T>): Promise<T> {
        const handler = this.logProvider.use()
        return this.collect(m => handler(a(m)), inner)
    }


    // Executes 'inner', piping logs into stream
    // This will override the containing logging context
    public collect<T>(handler: LogHandler<LogT>, inner: () => Promise<T>): Promise<T> {
        return this.logProvider.run(handler, inner)
    }


    // Executes 'inner', piping logs both into 'stream', aswell as the parent context
    public tap<T>(tapper: LogHandler<LogT>, inner: () => Promise<T>): Promise<T> {
        const handler = this.logProvider.use()
        return this.logProvider.run(m => {
            tapper(m)
            handler(m)
        }, inner)
    }
}


export default new AsyncLogger<string>(m => process.stdout.write(m + "\n"))

import { AsyncLocalStorage } from "async_hooks"


export class AsyncContextProvider<T> {
    defaultProvider?: () => T
    asyncStorage: AsyncLocalStorage<T>

    constructor(defaultProvider?: () => T) {
        this.defaultProvider = defaultProvider
        this.asyncStorage = new AsyncLocalStorage()
    }

    // Runs inner in context of 'value'
    public async run<U>(value: T, inner: () => Promise<U>): Promise<U> {
        return this.asyncStorage.run(value, inner)
    }

    // Retrieve the current context
    public use(): T {
        let val = this.asyncStorage.getStore()
        if (!val && !this.defaultProvider) throw new Error("[AsyncContextProvider::use] Store not found in context and no defaultProvider was given")
        return val || this.defaultProvider()
    }
}


export function create<T>(defaultProvider?: () => T): AsyncContextProvider<T> {
    return new AsyncContextProvider<T>(defaultProvider)
}
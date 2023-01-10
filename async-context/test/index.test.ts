import { AsyncContextProvider } from "../src"


describe("async-local-context", () =>{

    it("should correctly handle nested runs", async () => {
        const Store = new AsyncContextProvider(() => "Goldfish")

        await Store.run("Pufflefish", async () => {
            await Store.run("Carp", async () => {
                await Store.run("Catfish", async () => {
                    expect(Store.use()).toEqual("Catfish")
                })

                expect(Store.use()).toEqual("Carp")
            })

            expect(Store.use()).toEqual("Pufflefish")
        })

        expect(Store.use()).toEqual("Goldfish")
    })
})
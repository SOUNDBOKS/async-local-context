import { AsyncLogger } from "../src"

const mockOutput = jest.fn()
const Logger = new AsyncLogger(mockOutput)

describe("async-logger", () => {
    afterEach(() => {
        mockOutput.mockReset()
    })

    it("should do a simple augment", async () => {
        await Logger.augment(m => "[A] " + m, async () => Logger.log("b"))
        expect(mockOutput).toHaveBeenCalledWith("[A] b")
    })

    it("should correctly stop augmenting, even if the augmented function rejects", async () => {
        await Logger.augment(m => "[A] " + m, () => Promise.reject()).catch(async () => { })
        await Logger.log("c")
        expect(mockOutput).toHaveBeenCalledWith("c")
    })

    it("should do a simple tap", async () => {
        const mockTap = jest.fn()
        await Logger.tap(mockTap, async () => Logger.log("b"))

        expect(mockOutput).toHaveBeenCalledWith("b")
        expect(mockTap).toHaveBeenCalledWith("b")
    })

    it("should do an augmented tap", async () => {
        const mockTap = jest.fn()
        await Logger.augment(
            m => `[A] ${m}`,
            () => Logger.tap(
                mockTap,
                async () => Logger.log("b")
            )
        )

        expect(mockOutput).toHaveBeenCalledWith("[A] b")
        expect(mockTap).toHaveBeenCalledWith("b")
    })

    it("should do multiple taps at once", async () => {
        await Promise.all(Array.from(Array(50).keys()).map(async i => {
            await Logger.augment(
                m => `[${i}] ${m}`,
                async () => {
                    Logger.log("b" + i)
                    expect(mockOutput).toHaveBeenCalledWith(`[${i}] b${i}`)
                }
            )
        }))
    })

    function waitRandomAmount(max: number = 1000) {
        return new Promise(resolve => setTimeout(resolve, Math.random() * max))
    }

    it("should not break even in absolute chaos", async () => {
        await Logger.augment(m => "[A] " + m, async () => {
            await Promise.all(Array.from(Array(50).keys()).map(async i => {
                await waitRandomAmount()
                await Logger.augment(m => `[${i}] ${m}`, async () => {
                    await waitRandomAmount()
                    await Logger.log("b")
                    await waitRandomAmount()
                    await Logger.log("c")

                    expect(mockOutput).toHaveBeenCalledWith(`[A] [${i}] b`)
                    expect(mockOutput).toHaveBeenCalledWith(`[A] [${i}] c`)
                })
            }))
        })
    })
})
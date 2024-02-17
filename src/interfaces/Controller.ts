export default interface Controller {
    handle(): Promise<void>
}
module.exports = class Wait {
    /**
     * Wait a specified amount of time in milliseconds.
     * 
     * @param {Integer} ms how many milliseconds to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
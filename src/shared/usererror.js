class UserError extends Error {
    constructor(message, type) {
        super(message)
        this.name = "UserError"
        this.type = type
    }
}
module.exports = UserError
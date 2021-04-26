const UserError = require("./usererror")
const Reset = {}
Reset.checkInput = function(params) {
    try {
        if (!params.hash || params.hash === "")
            throw new UserError("Missing hsah", "MISSINGHASH")
        if (!params.user || params.user === "")
            throw new UserError("Missing user", "MISSINGUSER")
        if (!params.pass || params.pass === "")
            throw new UserError("Missing password", "MISSINGPASS")
    } catch (e) {
        throw e
    }
}
module.exports = Reset
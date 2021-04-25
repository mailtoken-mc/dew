const UserError = require("./usererror")
const Recover = {}
Recover.checkInput = function(params) {
    try {
        if (!params.mail || params.mail === "")
            throw new UserError("Missing token", "MISSINGMAIL")
        if (!params.user || params.user === "")
            throw new UserError("Missing user", "MISSINGUSER")
    } catch (e) {
        throw e
    }
}
module.exports = Recover
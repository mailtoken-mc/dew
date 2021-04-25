const UserError = require("./usererror")
const Register = {}
Register.checkInput = function(params) {
    try {
        if (!params.token || params.token === "")
            throw new UserError("Missing token", "MISSINGTOKEN")
        if (!params.user || params.user === "")
            throw new UserError("Missing user", "MISSINGUSER")
        if (!params.pass || params.pass === "")
            throw new UserError("Missing password", "MISSINGPASS")
        if (!params.org || isNaN(Number(params.org)))
            throw new UserError("Missing organization", "MISSINGORG")
        if (!params.year || isNaN(Number(params.year)))
            throw new UserError("Missing year", "MISSINGYEAR")
    } catch (e) {
        throw e
    }
}
module.exports = Register
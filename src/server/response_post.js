Response = {}
Response.error = function(res, error) {
    let response = {}
    response.success = 0
    response.exception = error
    res.send(JSON.stringify(response))
}
Response.success = function(res) {
    let response = {}
    response.success = 1
    res.send(JSON.stringify(response))
}
module.exports = Response
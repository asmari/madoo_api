exports.Success = function (data = null, message = null, code = 200) {    
    return { 'status': true, 'code': code, 'message': message, 'data': data };
}

exports.Fail = function (err, code = 200) {
    if (err.statusCode) {
        return { 'status': false, 'code': err.statusCode, 'message': err.message };
    } else {
        return { 'status': false, 'code': 500, 'message': err.message };
    }
}
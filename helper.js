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

exports.Paginate = function(paginate = {}, data = null, message = null, code = 200){

    return {
        status:code,
        message,
        data:{
            data: (data != null ? data:paginate.docs) || {},
            per_page: paginate.item || 0,
            total_items:paginate.total || 0,
            current_page: paginate.pages || 1
        }
    }

}
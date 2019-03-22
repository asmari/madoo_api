exports.authLoginSchema = {
    schema:{
        body:{
            //Required body paramter for login
            required:[ "mobile_phone", "country_code", "pin" ],
            properties:{
                mobile_phone:{ type:"string" },
                country_code:{ type:"string" },
                pin:{ type:"string" }
            }
        }
    }
}

exports.authCheckSchema = {
    schema:{
        body:{
            required: [ "mobile_phone", "country_code" ],
            properties:{
                mobile_phone:{ type:"string" },
                country_code:{ type:"string" }
            }
        }
    }
}
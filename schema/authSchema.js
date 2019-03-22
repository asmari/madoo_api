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

exports.authForgotPinOtp = {
    schema:{
        body:{
            required:[ "mobile_phone"],
            properties:{
                mobile_phone:{
                    type:"string"
                }
            }
        }
    }
}

exports.authForgotPinOtpCheck = {
    schema:{
        body:{
            required:[ "mobile_phone", "otp"],
            properties:{
                mobile_phone:{
                    type:"string"
                },
                otp:{
                    type:"string"
                }
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
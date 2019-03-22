exports.authLoginSchema = {
    schema:{
        body:{
            //Required body paramter for login
            required:[ "mobile_phone", "pin" ],
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

exports.authChangePin = {
    schema:{
        body:{
            required:["mobile_phone", "pin", "confirm_pin"],
            properties:{
                mobile_phone:{
                    type:"string",
                    minLength:11,
                    maxLength:15
                },
                pin:{
                    type:"integer",
                    min:6,
                    max:6
                },
                confirm_pin:{
                    type:"integer",
                    min:6,
                    max:6
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
exports.googleLoginSchema = {
    schema:{
        body:{
            //Required body paramter for login
            required:[ "email", "g_id", "g_token" ],
            properties:{
                email:{ type:"string" },
                g_id:{ type:"integer" },
                g_token:{ type:"integer" }
            }
        }
    }
}

exports.googleRegisterSchema = {
    schema:{
        consumes:["multipart/form-data"],
        body:{
            required:["full_name", "email", "g_id", "g_token", "mobile_phone", "pin"],
            properties:{
                full_name:{type:"string"},
                email:{type:"string"},
                image:{
                    type:"string",
                    // isFileType:true,
                    // type:"object"
                },
                g_id:{
                    type:"integer"},
                g_token:{type:"integer"},
                mobile_phone:{type:"integer"},
                pin:{type:"integer"},
                fingerprint:{type:"integer"}
            }
        }
    }
}

exports.googleSaveMemberSchema = {
    schema:{
        body:{
            required:[ "full_name", "email","mobile_phone" ,"pin"],
            properties:{
                full_name:{ 
                    type:"string",
                    maxLength: 50 ,
                    minLength:3 
                },
                email:{ 
                    type:"string", 
                    maxLength:50 ,
                    minLength:3
                },
                mobile_phone:{ 
                    type:"integer",
                    maxLength:12,
                    minLength:11 
                },
                pin:{ 
                    type:"integer",
                    maxLength:6,
                    minLength:6 
                },
                image:{
                    type:"string",
                    // isFileType:true,
                    // type:"object"
                },
                fingerprint:{
                    type:"integer"
                }
            }
        }
    }
}

exports.googleOtpSchema = {
    schema:{
        body:{
            type:"object",
            required:["otp", "mobile_phone", "g_id", "g_token", "email"],
            properties:{
                email:{
                    type:"string"
                },
                g_id:{
                    type:"string"
                },
                g_token:{
                    type:"string"
                },
                otp:{
                    type:"integer"
                },
                mobile_phone:{
                    type:"string"
                }
            }
        }
    }
}

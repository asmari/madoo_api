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
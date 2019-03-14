exports.facebookLoginSchema = {
    schema:{
        body:{
            //Required body paramter for login
            required:[ "email", "fb_id", "fb_token" ],
            properties:{
                email:{ type:"string" },
                fb_id:{ type:"integer" },
                fb_token:{ type:"integer" }
            }
        }
    }
}

exports.facebookRegisterSchema = {
    schema:{
        consumes:["multipart/form-data"],
        body:{
            required:["full_name", "email", "fb_id", "fb_token", "mobile_phone","country_code", "pin"],
            properties:{
                full_name:{type:"string"},
                email:{type:"string"},
                image:{
                    type:"string",
                    // isFileType:true,
                    // type:"object"
                },
                fb_id:{
                    type:"integer"},
                fb_token:{type:"integer"},
                country_code:{type:"string"},
                mobile_phone:{type:"integer"},
                pin:{type:"integer"},
                fingerprint:{type:"integer"}
            }
        }
    }
}
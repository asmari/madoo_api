exports.registerSchema = {
    schema: {
        body: {
            //Required body paramter for register
            required:[ "full_name", "email", "country_code","mobile_phone" ],
            properties:{
                full_name:{ type:"string",maxLength: 50 ,minLength:3 },
                email:{ type:"string" , maxLength: 50 ,minLength:3},
                country_code:{ type:"string",maxLength: 4 ,minLength:2 },
                mobile_phone:{ type:"string",maxLength: 12 ,minLength:11 },
                image:{ type:"string" },

            }
        }
    }
}

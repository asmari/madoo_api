exports.promoListSchema = {
    schema:{
        querystring:{
            type:"object",
            properties:{
                filter:{
                    type:["array", "integer"],
                    items:{
                        type:"integer"
                    }
                }
            }
        }
    }
}
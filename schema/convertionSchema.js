exports.checkConvertion = {
    schema:{
        security:[
            {
                "BearerAuth":[]
            }
        ],
        querystring:{
            type:"object",
            required:["loyalty_id_source", "loyalty_id_target", "point_to_convert"],
            properties:{
                loyalty_id_source:{
                    type:"integer"
                },
                loyalty_id_target:{
                    type:"integer"
                },
                point_to_convert:{
                    type:"integer"
                }
            }
        }
    }
}
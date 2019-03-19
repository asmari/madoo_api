exports.loyaltyMemberListSchema = {
    schema:{
        properties:{
            page:{
                type:"integer"
            },
            item:{
                type:"integer"
            },
            search:{
                type:"string"
            },
            sort:{
                type:"string"
            },
            filter:{
                type:"array"
            }
        }
    }
}


exports.loyaltyMemberDetailSchema = {
    schema:{
        querystring:{
            loyalty_id:{
                type:"integer"
            }
        }
        
    }
}
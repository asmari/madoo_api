exports.loyaltyMemberListSchema = {
    schema:{
        security: [
            {
              "BearerAuth": []
            }
        ],
        querystring:{
            type:"object",
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
        },
        
    }
    
}


exports.loyaltyMemberDetailSchema = {
    schema:{
        security: [
            {
              "BearerAuth": []
            }
        ],
        querystring:{
            type:"object",
            properties:{
                loyalty_id:{
                    type:"integer"
                }
            },
            required:["loyalty_id"]
        }
        
    }
}

exports.loyaltyListSchema = {
    schema:{
        security: [
            {
              "BearerAuth": []
            }
        ]    
    }
}

exports.loyaltyDetailSchema = {
    schema:{
        security: [
            {
              "BearerAuth": []
            }
        ],
        querystring:{
            type:"object",
            properties:{
                loyalty_id:{
                    type:"integer"
                }
            },
            required:["loyalty_id"]    
        }
    }
}

exports.loyaltyDeleteMembercard = {
    schema:{
        security: [
            {
              "BearerAuth": []
            }
        ],
        body:{
            properties:{
                member_cards_id:{
                    type:"string"
                }
            },
            required:["member_cards_id"]
        }
    }
}
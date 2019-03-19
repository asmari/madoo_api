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

exports.loyaltyListSchema = {
    schema:{
        
    }
}

exports.loyaltyDetailSchema = {
    schema:{
        querystring:{
            loyalty_id:{
                type:"integer"
            }
        }
    }
}

exports.loyaltyDeleteMembercard = {
    schema:{
        required:["member_card_id"],
        body:{
            properties:{
                member_card_id:{
                    type:"string"
                }
            }
        }
    }
}
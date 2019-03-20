const model = require('../../models');
const helper = require('../../helper');
const bcrypt = require('bcrypt');

const conn = require('../../models/conn/sequelize');
const sequelize = conn.sequelize;
const resolve = require("path").resolve

const Members = model.Members.Get;
const Pins = model.Pins.Get;

//register google oauth
exports.doRegisterGoogle = (request, reply) => {

    try{

        let params = request.raw.body || request.body

        params = params || {}

        // let raws = request.raw.files || {}
        

        if(!params.hasOwnProperty("full_name")){
            return reply.send(helper.Fail({
                message:"Field full_name is required"
            }))
        }

        if(!params.hasOwnProperty("email")){
            return reply.send(helper.Fail({
                message:"Field email is required"
            }))
        }

        if(!params.hasOwnProperty("mobile_phone")){
            return reply.send(helper.Fail({
                message:"Field mobile_phone is required"
            }))
        }

        if(!params.hasOwnProperty("g_id")){
            return reply.send(helper.Fail({
                message:"Field g_id is required"
            }))
        }

        if(!params.hasOwnProperty("g_token")){
            return reply.send(helper.Fail({
                message:"Field g_token is required"
            }))
        }

        if(!params.hasOwnProperty("pin")){
            return reply.send(helper.Fail({
                message:"Field pin is required"
            }))
        }


        let fingerprint = params.hasOwnProperty("fingerprint") ? params.fingerprint:0
        let image = params.hasOwnProperty("image") ? params.image: null

        const hash = bcrypt.hashSync(params.pin.toString(), 10);

        // start transaction
        sequelize.transaction((t) => {
            
            //find email unique
            return Members.findOne({
                where:{
                    email:params.email
                }
            }).then((member) => {
                if(member != null){
                    return Promise.reject({
                        message:"Email already registered"
                    })
                }

                //find phone unique
                return Members.findOne({
                    where:{
                        mobile_phone:params.mobile_phone
                    }
                })
            }).then((member) => {


                if(member != null){
                    return Promise.reject({
                        message:"Phone number already registered"
                    })
                }

                //create member
                return Members.create({
                    full_name:params.full_name,
                    email: params.email,
                    g_id: params.g_id,
                    g_token : params.g_token,
                    mobile_phone:params.mobile_phone,
                    pin:params.pin,
                    finggerprint:fingerprint,
                    image:image
                })
            }).then((members) => {

                //create pin for member
                return Pins.create({
                    members_id: members.id,
                    token:0,
                    expired:new Date(),
                    wrong:0,
                    pin: hash}, { transaction: t }).then(pins => {
                        return Members.findByPk(pins.member_id);
                    })
            })

            
        }).then(async (member) =>{

            let payload = params
            payload.image = image
            payload.fingerprint = fingerprint

            //if image exist, upload to file
            /* upload system disabled until further notice */
            // if(raws.hasOwnProperty("image")){

            //     let _imageTemp = raws.image

            //     const ext = _imageTemp.name.split('.').pop()
            //     const imageName = Math.random().toString(13).replace('0.', '') + "." + ext

            //     _imageTemp.mv(resolve("upload/" + imageName), (err) => {
                    
            //         if(err){
            //             reply.send(helper.Fail({
            //                 message:"Image upload failed"
            //             }))
            //         }else{

            //             member.update({
            //                 image: imageName
            //             })

            //             payload.image = imageName
            //             reply.send(helper.Success(payload))
            //         }

            //     })

            //     return
            // }
            
            reply.send(helper.Success(payload))

        }).catch((err) => {
            reply.code(500).send(helper.Fail(err))
        })
        

        

    }catch(err){
        reply.code(500).send(helper.Fail(err))
    }


}

// login check against google oauth
exports.doLoginGoogle = (request, reply) => {

    try{

        let params = request.body

        if(!params.hasOwnProperty("email")){
            throw {
                message: "Field email is required",
                statusCode:400
            }
        }

        if(!params.hasOwnProperty("g_id")){
            throw{
                message: "Field g_id is required",
                statusCode:400
            }
        }

        if(!params.hasOwnProperty("g_token")){
            throw{
                message: "Field g_token is required",
                statusCode:400
            }
        }

        Members.findOne({
            where:{
                email:params.email,
                g_id:params.g_id
            }
        }).then((member) => {

            if(member == null){
                return reply.code(200).send(helper.Fail({
                    message:"Member is not found",
                    statusCode:404
                }))
            }

            //update g_token using latest token received
            member.update({
                g_token:params.g_token
            }).then(() => {

                let payload = {
                    id: member.id,
                    oauth:true
                };
    
                reply.jwtSign(payload, (err, token) => {
                    if(err){
                        return reply.send(helper.Fail(err))
                    }else{
                        let res = {
                            token_type:"Bearer",
                            access_token:token,
                            fingerprint:member.finggerprint
                        }
    
                        return reply.send(helper.Success(res))
                    }
                })
            })
        })


    }catch(err){
        return reply.code(500).send(helper.Fail(err))
    }

}
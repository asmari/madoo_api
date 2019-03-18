const model = require('../../models');
const helper = require('../../helper');
const bcrypt = require('bcrypt');

const conn = require('../../models/conn/sequelize');
const sequelize = conn.sequelize;

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;
const Otp = model.Otp.Get;

//Index Auth member
exports.memberIndex = async (request, reply) => {
    MembersRegister.all({include: [Otp]}).then(memberRegister=>{
        return reply.code(200).send(helper.Success(memberRegister))
    });

}

//process to memberRegister with phone
exports.doRegisterPhone = (request, reply) => {
    try {
        const params = request.body;

        const date =new Date();
        date.setHours(date.getHours()+24);
        MembersRegister.findOne({ where: {mobile_phone: params.mobile_phone, country_code: params.country_code}},{}).then(memberRegister => {
            if (!memberRegister) {
                return sequelize.transaction().then(t => {
                    let payload = {
                        full_name: params.full_name,
                        email: params.email,
                        country_code: params.country_code,
                        mobile_phone: params.mobile_phone,
                        status: "pending",
                    };
                    return MembersRegister.create(payload, {transaction: t}).then(registered => {
                        return createOrUpdateOtp({
                            otp: Math.floor(100000 + Math.random() * 900000),
                            expired:date.getTime()},{members_register_id:registered.id})
                            .then(reply.code(200).send(helper.Success(registered)));
                    }).then(() => {
                        return t.commit();
                    }).catch((err) => {
                        t.rollback();
                        reply.code(500).send(helper.Fail(err))
                    });
                });
            }else{
                if (memberRegister.status!="regitered"){
                    createOrUpdateOtp({members_register_id:memberRegister.id,otp: Math.floor(100000 + Math.random() * 900000),expired:date.getTime()},{members_register_id:memberRegister.id})
                        .then(reply.code(200).send(helper.Success(memberRegister)))
                        .catch(err=>{
                            return reply.code(500).send(helper.Fail(err));
                        });
                }else {
                    return reply.code(500).send(helper.Fail({
                        message: "Member already registered! Please login"
                    }, 500))
                }
            }
        });
    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }

};

exports.doOtpValidation= (request, reply) => {
    try{
        const params = request.body;
        const date =new Date();
        MembersRegister.findOne({include: [Otp] ,where: {mobile_phone: params.mobile_phone, status: "pending"}})
            .then(memberRegister=>{
                if(memberRegister == null){
                    return reply.code(200).send(helper.Fail({
                        message: "Member not found",
                    }))
                }

                if (date.getTime()>=memberRegister.otp_member.expired){
                    return reply.code(200).send(helper.Fail({message:"OTP has been expired!"}))
                }
                if (params.otp == memberRegister.otp_member.otp) {
                    return reply.code(200).send(helper.Success(memberRegister))
                }else {
                    return reply.code(200).send(helper.Fail({message:"OTP not match!"}))
                }

            })

    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }
};
exports.doSaveMember= (request, reply) => {
    try{
        const params = request.body;

        const date =new Date();
        date.setHours(date.getHours()+24);
        params.pin = bcrypt.hashSync(params.pin.toString(), 10);
        // return reply.code(200).send(helper.Success(params))

        MembersRegister.findOne({where:{mobile_phone: params.mobile_phone, status: "pending"}}).then(
            (memberRegister)=>{

                if (memberRegister) {
                    return sequelize.transaction().then(t => {
                        return Members.create(params, {transaction: t})
                            .then((member)=> {
                                return Pins.create({pin:params.pin,members_id:member.id,expired:date.getTime()}, {transaction: t})
                                    .then((pin)=>{
                                        return memberRegister.update({status: "registered"}, {transaction: t})
                                            .then((registered)=> {
                                                let payload = {
                                                    id: member.id,
                                                    oatuth:false
                                                };
                                                Members.findOne({where:{id:member.id}}).then((registeredMember)=>{
                                                    reply.jwtSign(payload, function (err, token) {
                                                        if (err) {
                                                            return reply.code(200).send(helper.Fail(err))
                                                        } else {
                                                            let res = {
                                                                token_type: 'Bearer',
                                                                access_token: token,
                                                                fingerprint: registeredMember.finggerprint
                                                            };
                                                            return reply.code(200).send(helper.Success(res))
                                                        }
                                                    })
                                                })
                                            })
                                    })
                            }).then(() => {
                                return t.commit();
                            }).catch((err) => {
                                t.rollback();
                                reply.code(500).send(helper.Fail(err))
                            });

                    })
                }else {
                    return reply.code(200).send(helper.Fail({message:"Member Not Found"}))
                }

            }
        )

    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }
};
// Create Or Update Otp
createOrUpdateOtp = (values, condition)=> {
    return Otp
        .findOne({ where: condition })
        .then(function(obj) {
            if(obj) { // update
                return obj.update(values);
            }
            else { // insert
                return Otp.create(values);
            }
        })
}

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
                let payload = {
                    full_name: params.full_name,
                    email: params.email,
                    country_code: params.country_code,
                    mobile_phone: params.mobile_phone,
                    status: "pending",
                };

                // insert into temporary member_register table
                MembersRegister.create(payload).then(registered=>{
                    createOrUpdateOtp({members_register_id:registered.id,otp: Math.floor(100000 + Math.random() * 900000),expired:date.getTime()},{members_register_id:registered.id})
                        .then(reply.code(200).send(helper.Success(registered)))
                        .catch(err=>{
                            return reply.code(500).send(helper.Fail(err));
                        });
                }).catch(err=>{
                    return reply.code(500).send(helper.Fail(err));
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

        Members.create(params).then((member)=>{
            MembersRegister.findOne({where:{mobile_phone: params.mobile_phone, status: "pending"}}).then(
                (memberRegister)=>{
                    if (memberRegister) {
                        memberRegister.update({status: "registered"})
                        let payload = {
                            id: member.id,
                            oauth: false
                        };

                        reply.jwtSign(payload, function (err, token) {
                            if (err) {
                                return reply.code(200).send(helper.Fail(err))
                            } else {

                                Pins.create({pin:params.pin,members_id:member.id,token:token,expired:date.getTime()})
                                let res = {
                                    token_type: 'Bearer',
                                    access_token: token,
                                    fingerprint: member.finggerprint
                                };
                                return reply.code(200).send(helper.Success(res))
                            }
                        })
                    }else {
                        return reply.code(200).send(helper.Fail({message:"Member Not Found"}))
                    }

                }
            )
        })

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

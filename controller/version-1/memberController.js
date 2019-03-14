
//process to member_register with phone
exports.doRegisterPhone = (request, reply) => {
    try {
        const params = request.body;

        const date =new Date();
        date.setHours(date.getHours()+24);
        MembersRegister.findOne({ where: {mobile_phone: params.mobile_phone, country_code: params.country_code}}).then(members_register => {
            if (!members_register) {
                let payload = {
                    full_name: params.full_name,
                    email: params.email,
                    country_code: params.country_code,
                    mobile_phone: params.mobile_phone,
                    status: "pending",
                };
                MembersRegister.create(payload).then(registered=>{
                    createOrUpdateOtp({members_register_id:registered.id,otp: Math.floor(100000 + Math.random() * 900000),expired:date.getTime()},{members_register_id:registered.id}).
                    then(reply.code(200).send(helper.Success(registered))).
                    catch(err=>{
                        reply.code(500).send(helper.Fail(err));
                    });
                }).catch(err=>{
                    reply.code(500).send(helper.Fail(err));
                });
            }else{
                if (members_register.status=="pending"){
                    createOrUpdateOtp({members_register_id:members_register.id,otp: Math.floor(100000 + Math.random() * 900000),expired:date.getTime()},{members_register_id:members_register.id}).
                    then(reply.code(200).send(helper.Success(members_register))).
                    catch(err=>{
                        reply.code(500).send(helper.Fail(err));
                    });
                }else {
                    reply.code(500).send(helper.Fail({
                        message: "Member already registered! Please login"
                    }, 500))
                }
            }
        });
    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }

}

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

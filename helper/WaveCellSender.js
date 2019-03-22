'use strict'

const config = require("../config").get
const https = require("https")

module.exports = class WaveCellSender{

    constructor(){
        this.subAccount = config.sms.subAccount
        this.token = config.sms.token

        this.url = {
            POST_SEND_OTP : () => {
                return "https://api.wavecell.com/verify/v1/" + this.subAccount
            },
            GET_VALIDATION_OTP : (uid) => {
                return "https://api.wavecell.com/verify/v1/" + this.subAccount + "/" + uid
            }
        }
        
    }

    getUrl(type = "single"){
        return "https://api.wavecell.com/sms/v1/" + this.subAccount + "/" + type
    }

    parsePhoneNumber(phone){
        // if(phone.charAt(0) != "+"){
        //     return "+" + phone
        // }

        return "+" + phone
    }

    checkOtp(otp, uid){
        const token = this.token
        
        return new Promise((resolve, reject) => {

            try{

                const url = this.url.GET_VALIDATION_OTP(uid) + "?code=" + otp

                const req = https.request(url, {
                    headers:{
                        "Authorization":"Bearer " + token,
                    },
                    method:"GET"
                }, (res) => {
                    let chunk = []

                    res.on('error', reject)
                    res.on('data', (buffer) => {
                        chunk += buffer
                    })

                    res.on("end", () => {
                        res.statusCode == 200 ? resolve(JSON.parse(chunk)) : reject(JSON.parse(chunk))
                    })
                })

                req.end()

            }catch(err){
                reject(err)
            }

        })
    }

    sendOtp(phone){
        const token = this.token
        
        return new Promise((resolve, reject) => {

            try{
                phone = this.parsePhoneNumber(phone)


                const data = JSON.stringify({
                    destination:phone,
                    productName:"Husky",
                    codeLength:6,
                    codeValidity:120,
                    codeType:"NUMERIC",
                    template:{
                        source:"Husky",
                        text : "Kode otp anda untuk {productName} adalah {code}. expire kode otp anda 2 menit "
                    }
                })

                const url = this.url.POST_SEND_OTP()

                const req = https.request(url, {
                    headers:{
                        "Authorization":"Bearer " + token,
                        "Content-Type":"application/json",
                        "Content-Length" : Buffer.byteLength(data)
                    },
                    method:"POST"
                }, (res) => {
                    let chunk = []

                    res.on('error', reject)
                    res.on('data', (buffer) => {
                        chunk += buffer
                    })

                    res.on("end", () => {
                        res.statusCode == 200 ? resolve(JSON.parse(chunk)) : reject(JSON.parse(chunk))
                    })
                })

                req.write(data)
                req.end()

            }catch(err){
                reject(err)
            }

        })
    }

    send(phone, message, clientId = 0, type = "single"){

        const token = this.token

        return new Promise((resolve, reject) => {

            try{

                phone = this.parsePhoneNumber(phone)

                const data = JSON.stringify({
                    source:"Husky",
                    destination:phone,
                    text:message,
                    clientMessageId: clientId,
                    enconding:"AUTO",
                    /* PRODUCTION */
                    // dlrCallbackUrl:config.url + ":" + config.serverPort + "/hook/forgot/pin",

                    /* TESTING, for inspect https://requestbin.fullcontact.com/1i7xgaj1?inspect */
                    dlrCallbackUrl:"http://requestbin.fullcontact.com/1i7xgaj1"
                })

                const url = this.getUrl(type)

                console.log(url)

                const req = https.request(url, {
                    headers:{
                        "Content-Length":Buffer.byteLength(data),
                        "Content-Type":"application/json",
                        "Authorization":"Bearer " + token
                    },
                    method:"POST"
                }, (res) => {
                    let chunk = []

                    res.on('error', reject)
                    res.on('data', (buffer) => {
                        chunk += buffer
                    })

                    res.on("end", () => {
                        res.statusCode == 200 ? resolve(JSON.parse(chunk)) : reject(JSON.parse(chunk))
                    })
                })

                req.write(data)
                req.end()

            }catch(err){
                reject(err)
            }

        })

    }


}
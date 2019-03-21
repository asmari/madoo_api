'use strict'

const config = require("../config").get
const https = require("https")

module.exports = class WaveCellSender{

    constructor(){
        this.subAccount = config.sms.subAccount
        this.token = config.sms.token
        
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


    send(phone, message, type = "single"){

        const token = this.token

        return new Promise((resolve, reject) => {

            try{

                phone = this.parsePhoneNumber(phone)

                const data = JSON.stringify({
                    source:"Husky",
                    destination:phone,
                    text:message
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
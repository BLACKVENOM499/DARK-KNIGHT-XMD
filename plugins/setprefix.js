const { cmd } = require('../command')
const config = require('../config')

cmd({
    pattern: "setprefix",
    alias: ["prefix"],
    desc: "Bot එකේ prefix එක එසැණින් වෙනස් කිරීමට",
    category: "owner",
    filename: __filename
},
async(conn, mek, m, { from, q, isOwner, reply }) => {
    try {
        if (!isOwner) return reply("මෙම command එක භාවිතා කළ හැක්කේ owner ට පමණි. ❌")
        if (!q) return reply("කරුණාකර අලුත් prefix එක ලබා දෙන්න. උදා: `.setprefix !`")

        // config එක update කිරීම
        config.PREFIX = q
        
        await reply(`ප්‍රධාන Prefix එක සාර්ථකව [ ${q} ] ලෙස වෙනස් කළා. ✅`)

    } catch (e) {
        console.log(e)
        reply(`Error: ${e.message}`)
    }
})

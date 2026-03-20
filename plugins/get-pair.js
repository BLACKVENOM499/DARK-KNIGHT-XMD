const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pair",
    alias: ["getpair", "code"],
    react: "✅",
    desc: "Get pairing code for 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳 bot",
    category: "download",
    use: ".pair 94771825xxx",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // 1. පරිශීලකයා අංකයක් ලබා දී නොමැති නම් ඔහුගේ අංකය ලබා ගැනීම (Sender number extraction)
        // @s.whatsapp.net කොටස ඉවත් කර ඉලක්කම් පමණක් ලබා ගනී.
        let targetNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.split('@')[0].replace(/[^0-9]/g, '');

        // 2. අංකයේ දිග පරීක්ෂා කිරීම (Validation)
        if (!targetNumber || targetNumber.length < 10 || targetNumber.length > 15) {
            return await reply("❌ *වැරදි අංකයක්!* \n\nකරුණාකර නිවැරදි දුරකථන අංකය ලබා දෙන්න.\nඋදාහරණ: `.pair 94771825xxx` ");
        }

        // 3. API එකට Request එක යැවීම
        const apiUrl = `https://dark-knight-xmd-pair-production.up.railway.app/pair/code?number=${targetNumber}`;
        
        // පරිශීලකයාට සුළු වෙලාවක් රැඳී සිටින ලෙස පණිවිඩයක් යැවීම (Optional)
        // await reply("⏳ *කේතය ලබා ගනිමින් පවතී...*");

        const response = await axios.get(apiUrl);

        // 4. API එකෙන් දත්ත ලැබී ඇත්දැයි පරීක්ෂා කිරීම
        if (!response.data || !response.data.code) {
            return await reply("❌ *සමාවන්න!* \nPairing code එක ලබා ගැනීමට නොහැකි විය. පසුව නැවත උත්සාහ කරන්න.");
        }

        const pairingCode = response.data.code;
        const doneMessage = "🚀 *𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳 PAIRING SUCCESS*";

        // 5. අවසන් පණිවිඩ යැවීම
        // මුලින්ම විස්තර සහිත පණිවිඩය
        await conn.sendMessage(from, { 
            text: `${doneMessage}\n\n*Your pairing code is:* \n\n#️⃣  *${pairingCode}*` 
        }, { quoted: mek });

        // තත්පර 1ක ප්‍රමෝදයකින් පසු, පහසුවෙන් Copy කරගත හැකි ලෙස Code එක පමණක් යැවීම
        await new Promise(resolve => setTimeout(resolve, 1500));
        await reply(`${pairingCode}`);

    } catch (error) {
        console.error("Pair command error:", error);
        
        // Error එක API එකේ ප්‍රශ්නයක්ද කියා පරීක්ෂා කිරීම
        if (error.response) {
            await reply("❌ *Server Error:* API එක දැනට අක්‍රියයි. පසුව උත්සාහ කරන්න.");
        } else {
            await reply("❌ *Error:* සම්බන්ධතාවයේ දෝෂයක් පවතී.");
        }
    }
});

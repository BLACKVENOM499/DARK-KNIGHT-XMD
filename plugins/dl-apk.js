const axios = require("axios");
const { cmd } = require("../command");

// --- HELPER FUNCTION FOR DECORATION ---
const decorateCaption = (name, size, pack, update, dev = "N/A") => `
╭───〔 𝙰𝙿𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 〕───┈
│
│ 📦 *𝗡𝗮𝗺𝗲:* ${name}
│ ⚖️ *𝗦𝗶𝘇𝗲:* ${size}
│ 🆔 *𝗣𝗮𝗰𝗸𝗮𝗴𝗲:* ${pack}
│ 📅 *𝗨𝗽𝗱𝗮𝘁𝗲𝗱:* ${update}
│ 👨‍💻 *𝗗𝗲𝘃:* ${dev}
│
├──────────────────┈
│ 📥 *𝗦𝘁𝗮𝘁𝘂𝘀:* 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚒𝚗𝚐...
╰──────────────────┈ 
  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ-ᴋɴɪɢʜᴛ-xᴍᴅ*`;

cmd({
    pattern: "apk",
    alias: ["getapk", "playstore"],
    react: '📦',
    desc: "Download APK files (Auto-Fallback)",
    category: "download",
    use: ".apk <app name>",
    filename: __filename
}, async (conn, m, store, { from, reply, args, q }) => {
    try {
        const appName = q || args.join(" ");
        if (!appName) return reply('❌ *Please provide an app name.* \nExample: `.apk whatsapp`');

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        let apkData = null;

        // --- TRY API 1 (NexOracle) ---
        try {
            const res1 = await axios.get(`https://api.nexoracle.com/downloader/apk`, {
                params: { apikey: 'free_key@maher_apis', q: appName }
            });
            if (res1.data?.status === 200 && res1.data.result) {
                const res = res1.data.result;
                apkData = {
                    name: res.name,
                    size: res.size,
                    pack: res.package,
                    update: res.lastup,
                    link: res.dllink,
                    icon: res.icon
                };
            }
        } catch (e) { console.log("NexOracle failed, trying Aptoide..."); }

        // --- TRY API 2 (Aptoide Fallback) ---
        if (!apkData) {
            try {
                const res2 = await axios.get(`http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(appName)}/limit=1`);
                if (res2.data?.datalist?.list?.length > 0) {
                    const app = res2.data.datalist.list[0];
                    apkData = {
                        name: app.name,
                        size: (app.size / 1048576).toFixed(2) + " MB",
                        pack: app.package,
                        update: app.updated,
                        link: app.file.path_alt,
                        icon: app.icon,
                        dev: app.developer.name
                    };
                }
            } catch (e) {
                return reply("❌ *Error:* App not found or servers are down.");
            }
        }

        if (!apkData) return reply("⚠️ *No results found.*");

        // Send Preview / Thumbnail
        const previewText = decorateCaption(apkData.name, apkData.size, apkData.pack, apkData.update, apkData.dev);
        
        await conn.sendMessage(from, {
            image: { url: apkData.icon },
            caption: previewText
        }, { quoted: m });

        // Send the actual APK File
        await conn.sendMessage(from, {
            document: { url: apkData.link },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${apkData.name}.apk`,
            caption: `✅ *${apkData.name} Successfully Downloaded*`
        }, { quoted: m });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error);
        reply('❌ *Critical Error:* Failed to process APK request.');
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

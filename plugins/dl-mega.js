const { cmd } = require('../command');
const { File } = require('megajs');
const fs = require('fs');
const path = require('path');
const os = require('os');

cmd({
    pattern: "mega",
    alias: ["meganz"],
    react: "📦",
    desc: "Download ZIP or any file from Mega.nz",
    category: "downloader",
    use: '.megadl <mega file link>',
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("📦 Please provide a Mega.nz file link.\n\nExample: `.megadl https://mega.nz/file/xxxx#key`");

        // React: Processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Initialize MEGA File from link
        const file = File.fromURL(q);

        // Download into buffer
        const data = await new Promise((resolve, reject) => {
            file.download((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        // Create temp file path
        const savePath = path.join(os.tmpdir(), file.name || "mega_file.octet-stream");

        // Save file locally
        fs.writeFileSync(savePath, data);

        // Send file
        await conn.sendMessage(from, {
            document: fs.readFileSync(savePath),
            fileName: file.name || "DARK-KNIGHT-XMD",
            mimetype: "application/octet-stream",
            caption: "📦 Downloaded from Mega NZ\n\n> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳"
        }, { quoted: mek });

        // Delete temp file
        fs.unlinkSync(savePath);

        // React: Done
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("❌ MEGA Downloader Error:", error);
        reply("❌ Failed to download file from Mega.nz. Make sure the link is valid and file is accessible.");
    }
});


 cmd({
    pattern: "mega2",
    react: "🍟",
    alias: ["megadl","meganz2"],
    desc: "Mega.nz fils download",
    category: "download",
    use: '.mega url',
    filename: __filename
}, 
    async (conn, mek, m, { from, q, reply }) => {
    if (!q) {
        return await reply(mega);
    }

    try {
        const file = File.fromURL(q)
        await file.loadAttributes()
        //if (file.size >= 2048 * 1024 * 1024) return reply(`File size exeeded...\nMaximum Upload Size Is ${config.MAX_SIZ} MB`)
        const data = await file.downloadBuffer();
        
        if (/mp4/.test(file.name)) {
            await conn.sendMessage(from, { document: data, mimetype: "video/mp4", filename: `${file.name || "DARK-KNIGHT-XMD"}` }, { quoted: mek });
        } else if (/pdf/.test(file.name)) {
            await conn.sendMessage(from, { document: data, mimetype: "application/pdf", filename: `${file.name || "DARK-KNIGHT-XMD"}` }, { quoted: mek });
        } else if (/zip/.test(file.name)) {
            await conn.sendMessage(from, { document: data, mimetype: "application/zip", filename: `${file.name || "DARK-KNIGHT-XMD"}` }, { quoted: mek });
        } else if (/rar/.test(file.name)) {
            await conn.sendMessage(from, { document: data, mimetype: "application/x-rar-compressed", filename: `${file.name || "DARK-KNIGHT-XMD"}` }, { quoted: mek });
        } else if (/7z/.test(file.name)) {
            await conn.sendMessage(from, { document: data, mimetype: "application/x-7z-compressed", filename: `${file.name || "DARK-KNIGHT-XMD"}` }, { quoted: mek });
        } else if (/jpg|jpeg/.test(file.name)) {
            await conn.sendMessage(from, { document: data, mimetype: "image/jpeg", filename: `${file.name || "DARK-KNIGHT-XMD"}` }, { quoted: mek });
        } else if (/png/.test(file.name)) {
            await conn.sendMessage(from, { document: data, mimetype: "image/png", filename: `${file.name || "DARK-KNIGHT-XMD"}` }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { document: data, mimetype: "application/octet-stream", filename: `${file.name || "DARK-KNIGHT-XMD"}` }, { quoted: mek })
        }
        
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
});

const { cmd } = require('../command');
const { File } = require('megajs');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const os = require('os');


cmd({
  pattern: "mega",
  alias: ["meganz"],
  desc: "Download Mega.nz files",
  react: "🌐",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a Mega.nz link.");

    // ✅ Auto encode Mega URL
    const encodedUrl = encodeURIComponent(q);

    // React: downloading
    await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });

    // API call
    const apiUrl = `https://api-dark-shan-yt.koyeb.app/download/meganz?url=${encodedUrl}&apikey=1234567890qazwsx`;
    const { data } = await axios.get(apiUrl);

    // Validate API response
    if (!data.status || !data.data?.result?.length) {
      return reply("⚠️ Invalid Mega link or API error.");
    }

    const file = data.data.result[0];

    // React: uploading
    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    // Send document
    await conn.sendMessage(from, {
      document: { url: file.download },
      fileName: file.name,
      mimetype: "application/octet-stream",
      caption:
        `📁 *File:* ${file.name}\n` +
        `📦 *Size:* ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n` +
        `*© Powered By 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`
    }, { quoted: m });

    // React: done
    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("Mega Plugin Error:", err);
    reply("❌ Failed to download Mega file.");
  }
});


cmd({
    pattern: "mega2",
    alias: ["meganz2"],
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

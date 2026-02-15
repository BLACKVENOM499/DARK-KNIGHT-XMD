const { cmd, commands } = require('../command');
const axios = require("axios");
const path = require("path");

cmd({
    pattern: "download",
    alias: ["downurl2"],
    use: ".download <link>",
    react: "📁",
    desc: "Download file from direct link",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // Check link
        if (!q) return reply("❗ කරුණාකර download link එකක් ලබා දෙන්න.");

        const link = q.trim();
        const urlPattern = /^(https?:\/\/[^\s]+)/i;
        if (!urlPattern.test(link)) return reply("❗ දීලා තියෙන URL එක වැරදි.\nකරුණාකර හරි link එකක් දෙන්න.");

        // Check link availability & get headers
        const head = await axios.head(link).catch(() => {
            throw "❌ Link එක open කරන්න බැහැ.";
        });

        // Get MIME type from headers
        const mimeType = head.headers['content-type'] || "application/octet-stream";

        // Get file name from headers or URL
        let fileName = "file";
        if (head.headers['content-disposition']) {
            const match = head.headers['content-disposition'].match(/filename="?([^"]+)"?/);
            if (match && match[1]) fileName = match[1];
        } else {
            fileName = path.basename(new URL(link).pathname) || "file";
        }

        const caption = `*Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`;

        // Send file
        await conn.sendMessage(from, {
            document: { url: link },
            mimetype: mimeType,
            fileName: fileName,
            caption: caption
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Download failed!\n\n" + err);
    }
});


cmd({
    pattern: "download",
    alias: ["downurl"],
    use: ".download <link>",
    react: "📁",
    desc: "Download file from direct link",
    category: "search",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {
    try {
        // Check link
        if (!q) {
            return reply("❗ කරුණාකර download link එකක් ලබා දෙන්න.");
        }

        const link = q.trim();

        const urlPattern = /^(https?:\/\/[^\s]+)/i;
        if (!urlPattern.test(link)) {
            return reply("❗ දීලා තියෙන URL එක වැරදි.\nකරුණාකර හරි link එකක් දෙන්න.");
        }

        // Optional: Check link availability
        await axios.head(link).catch(() => {
            throw "❌ Link එක open කරන්න බැහැ.";
        });

        const caption = `*Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳*`;

        // Send file as document
        await conn.sendMessage(from, {
            document: { url: link },
            mimetype: "video/mp4",
            fileName: `DARK-KNIGHT-XMD`,
            caption: caption
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Download failed!\n\n" + err);
    }
});

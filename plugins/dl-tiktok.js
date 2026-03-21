const axios = require("axios");
const { cmd } = require('../command');

cmd({
  pattern: "tiktok",
  alias: ["tt", "ttdl"],
  desc: "Download TikTok videos via Tharusha API",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ *Please provide a valid TikTok URL!*" }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // ✅ Using the new API Endpoint
    const apiUrl = `https://tharusha-sandipa.vercel.app/api/download/tiktok?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const res = response.data;

    if (!res || !res.status || !res.result) {
      return reply("⚠️ *Failed to fetch data from the server. Try again later!*");
    }

    const { title, author, statistics, download } = res.result;

    // ✨ ULTRA STYLED MENU
    const caption = `🌟 *ᴀᴋɪɴᴅᴜ ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* 🌟
━━━━━━━━━━━━━━━━━━━━━━━━
📝 *ᴛɪᴛʟᴇ:* ${title || "No Title"}
👤 *ᴀᴜᴛʜᴏʀ:* ${author?.nickname || "Unknown"}
📊 *ꜱᴛᴀᴛꜱ:* ❤️ ${statistics?.likeCount || "0"} | 🔁 ${statistics?.shareCount || "0"}
━━━━━━━━━━━━━━━━━━━━━━━━

🔢 *ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ:*

1️⃣  *ᴠɪᴅᴇᴏ (ꜱᴅ Qᴜᴀʟɪᴛʏ)* 📺
2️⃣  *ᴠɪᴅᴇᴏ (ʜᴅ ɴᴏ-ᴡᴍ)* 🎬
3️⃣  *ᴀᴜᴅɪᴏ (ᴍᴘ3 ꜰɪʟᴇ)* 🎶

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴋɪɴᴅᴜ ᴄᴏᴅᴇʀ ⚡`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: download.cover || "https://i.imgur.com/8N8yQ8G.png" }, // Using video cover
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Reply Selector Logic
    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const receivedText = (receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text || "").trim();
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(from, { react: { text: '📥', key: receivedMsg.key } });

        switch (receivedText) {
          case "1": // SD Quality (Watermarked)
            await conn.sendMessage(from, {
              video: { url: download.wmv || download.nowmv }, 
              caption: "✅ *TikTok SD Video Downloaded*"
            }, { quoted: receivedMsg });
            break;

          case "2": // HD Quality (No Watermark)
            await conn.sendMessage(from, {
              video: { url: download.nowmv },
              caption: "🔥 *TikTok HD Video Downloaded*"
            }, { quoted: receivedMsg });
            break;

          case "3": // Audio Only
            await conn.sendMessage(from, {
              audio: { url: download.music },
              mimetype: "audio/mp3",
              fileName: `Akindu_TikTok_${title}.mp3`
            }, { quoted: receivedMsg });
            break;
        }
      }
    });

  } catch (error) {
    console.error("TikTok API Error:", error);
    reply("❌ *Error:* API is currently unreachable. Please check the URL.");
  }
});

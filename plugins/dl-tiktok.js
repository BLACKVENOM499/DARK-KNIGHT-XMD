const axios = require("axios");
const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "tiktok",
  alias: ["tt"],
  desc: "Download TikTok videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply, sender }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return reply("⚠️ *ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴛɪᴋᴛᴏᴋ ᴜʀʟ.*\n\n*ᴀᴋɪɴᴅᴜ-ᴍᴅ*");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // ✅ Fetching data
    const response = await axios.get(`https://tharusha-sandipa.vercel.app/api/download/tiktok?url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.data) {
      return reply("❌ *ꜰᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴛʀɪᴇᴠᴇ ᴍᴇᴅɪᴀ ꜰʀᴏᴍ ᴛʜɪs ʟɪɴᴋ.*\n\n*ᴀᴋɪɴᴅᴜ-ᴍᴅ*");
    }
    
    const dat = data.data;
    
    // --- CYBER GRID SELECTION PANEL ---
    const caption = `
*「 ᴀᴋɪɴᴅᴜ-ᴍᴅ : ᴛᴛ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ 」*

┌───────────────────┐
  📑 *ᴛɪᴛʟᴇ:* ${dat.title || "No title"}
  ⏱️ *ᴅᴜʀ:* ${dat.duration || "N/A"}
  📊 *sᴛᴀᴛs:* ❤️ ${dat.view || "0"} | 💬 ${dat.comment || "0"}
└───────────────────┘

*sᴇʟᴇᴄᴛ ᴘʀᴏᴛᴏᴄᴏʟ:*

┏━━━━━━━━━━━━━━━━━━━┓
┃ 01 ‣ *ᴠɪᴅᴇᴏ (sᴅ ǫᴜᴀʟɪᴛʏ)* 🎥
┃ 02 ‣ *ᴠɪᴅᴇᴏ (ʜᴅ ǫᴜᴀʟɪᴛʏ)* 🎥
┃ 03 ‣ *ᴀᴜᴅɪᴏ (ᴍᴘ3 ꜰɪʟᴇ)* 🎶
┗━━━━━━━━━━━━━━━━━━━┛
> *ᴀᴋɪɴᴅᴜ-ᴍᴅ*`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: dat.thumbnail },
      caption,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 0,
        isForwarded: false,
        externalAdReply: {
          title: "ᴀᴋɪɴᴅᴜ-ᴍᴅ : ᴍᴇᴅɪᴀ ᴄᴏʀᴇ",
          body: "ᴛɪᴋᴛᴏᴋ ᴄᴏɴᴛᴇɴᴛ ᴅᴇʟɪᴠᴇʀʏ",
          thumbnail: { url: dat.thumbnail },
          sourceUrl: `https://wa.me/${config.OWNER_NUMBER}`,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // --- INTERACTIVE LISTENER ---
    const handler = async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
      if (!isReplyToBot) return; 

      const receivedText = (receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text || "").trim();

      if ["1", "2", "3"].includes(receivedText)) {
        // Clean up listener immediately
        conn.ev.off("messages.upsert", handler);
        clearTimeout(timeoutId);

        if (receivedText === "1") {
          // SD Video (Standard)
          await conn.sendMessage(from, { react: { text: '🎥', key: receivedMsg.key } });
          await conn.sendMessage(from, {
            video: { url: dat.video_sd || dat.video || dat.wmplay }, 
            caption: "*ᴀᴋɪɴᴅᴜ-ᴍᴅ*",
            contextInfo: { forwardingScore: 0, isForwarded: false } 
          }, { quoted: receivedMsg });
        } 
        else if (receivedText === "2") {
          // HD Video
          await conn.sendMessage(from, { react: { text: '🎥', key: receivedMsg.key } });
          await conn.sendMessage(from, {
            video: { url: dat.video_hd || dat.hdplay || dat.video }, 
            caption: "*ᴀᴋɪɴᴅᴜ-ᴍᴅ*",
            contextInfo: { forwardingScore: 0, isForwarded: false } 
          }, { quoted: receivedMsg });
        }
        else if (receivedText === "3") {
          // Audio
          await conn.sendMessage(from, { react: { text: '🎶', key: receivedMsg.key } });
          await conn.sendMessage(from, {
            audio: { url: dat.audio || dat.music },
            mimetype: "audio/mp4",
            ptt: false,
            contextInfo: { forwardingScore: 0, isForwarded: false } 
          }, { quoted: receivedMsg });
        }
      }
    };

    conn.ev.on("messages.upsert", handler);
    
    const timeoutId = setTimeout(() => {
        conn.ev.off("messages.upsert", handler);
    }, 300000);

  } catch (error) {
    console.error(error);
    reply("❌ *sʏsᴛᴇᴍ ᴇʀʀᴏʀ.*\n\n*ᴀᴋɪɴᴅᴜ-ᴍᴅ*");
  }
});          case "1":
            await conn.sendMessage(senderID, {
              video: { url: dat.video },
              caption: "📥 *Downloaded Original Quality*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              audio: { url: dat.audio },
              mimetype: "audio/mp3",
              ptt: false
            }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1 or 2.");
        }
      }
    });

  } catch (error) {
    console.error("TikTok Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});


cmd({
  pattern: "tiktok2",
  alias: ["tt2"],
  desc: "Download TikTok videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid TikTok URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // ✅ Using NexOracle TikTok API
    const response = await axios.get(`https://api.nexoracle.com/downloader/tiktok-nowm?apikey=free_key@maher_apis&url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.result) {
      return reply("⚠️ Failed to retrieve TikTok media. Please check the link and try again.");
    }

    const result = data.result;
    const { title, url, thumbnail, duration, metrics } = result;

    const caption = `
📺 Tiktok Downloader. 📥

📑 *Title:* ${title || "No title"}
⏱️ *Duration:* ${duration || "N/A"}s
👍 *Likes:* ${metrics?.digg_count?.toLocaleString() || "0"}
💬 *Comments:* ${metrics?.comment_count?.toLocaleString() || "0"}
🔁 *Shares:* ${metrics?.share_count?.toLocaleString() || "0"}
📥 *Downloads:* ${metrics?.download_count?.toLocaleString() || "0"}

🔢 *Reply Below Number*

1️⃣  *HD Quality*🔋
2️⃣  *Audio (MP3)*🎶

> Powered by 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Handle reply selector
    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, { react: { text: '⏳', key: receivedMsg.key } });

        switch (receivedText.trim()) {
          case "1":
            await conn.sendMessage(senderID, {
              video: { url },
              caption: "📥 *Downloaded Original Quality*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              audio: { url },
              mimetype: "audio/mp4",
              ptt: false
            }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1 or 2.");
        }
      }
    });

  } catch (error) {
    console.error("TikTok Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});

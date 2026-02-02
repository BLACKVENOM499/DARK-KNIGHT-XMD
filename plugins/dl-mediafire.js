const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "mediafire",
  alias: ["mfire"],
  react: '📂',
  desc: "Download files from MediaFire using Sadiya-Tech API.",
  category: "download",
  use: ".mediafire <MediaFire URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args, q }) => {
  try {
    if (!q) {
      return reply('⚠️ Please provide a MediaFire URL.\n\nExample:\n`.mediafire https://www.mediafire.com/file/...`');
    }

    // Add a reaction while processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Build the API URL
    const apiUrl = `https://ominisave.vercel.app/api/mfire?url=${encodeURIComponent(q)}`;

    // Fetch from API
    const { data } = await axios.get(apiUrl);

    // Validate response
    if (!data.status || !data.result || !data.result.download) {
      return reply('❌ Unable to fetch the file. Please try again later or check the URL.');
    }

    // Extract details
    const { fileName, uploaded, fileType, size, download } = data.result;

    // Inform user
    await reply(`📥 *Downloading:* ${fileName}\n*Size:* ${size}\nPlease wait...`);

    // Download file
    const fileResponse = await axios.get(download, { responseType: 'arraybuffer' });

    // Send file
    await conn.sendMessage(from, {
      document: fileResponse.data,
      mimetype: fileType || 'application/octet-stream',
      fileName: fileName,
      caption: `📂 *File Name:* ${fileName}\n📦 *Size:* ${size}\n📅 *Uploaded:* ${uploaded}\n`,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363400240662312@newsletter',
          newsletterName: '『 𝙳𝙰𝚁𝙺-𝙺𝙽𝙸𝙶𝙷𝚃-𝚇𝙼𝙳 』',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // Success reaction
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('Error downloading file:', error);
    reply('❌ Error downloading the file. Please check the link or try again later.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});



cmd({
  pattern: "mediafire2",
  alias: ["mfire2"],
  desc: "To download MediaFire files.",
  react: "📂",
  category: "download",
  filename: __filename
}, async (conn, m, store, {
  from,
  quoted,
  q,
  reply
}) => {
  try {
    if (!q) {
      return reply("❌ Please provide a valid MediaFire link.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const response = await axios.get(`https://vajira-api.vercel.app/download/mfire?url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.result || !data.result.dl_link) {
      return reply("⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public.");
    }

    const { dl_link, fileName, fileType } = data.result;
    const file_name = fileName || "mediafire_download";
    const mime_type = fileType || "application/octet-stream";

    await conn.sendMessage(from, {
      react: { text: "⬆️", key: m.key }
    });

    const caption = `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷\n`
      + `┃▸ *File Name:* ${file_name}\n`
      + `┃▸ *File Type:* ${mime_type}\n`
      + `╰━━━⪼\n\n`
      + `📥 *Downloading your file...*`;

    await conn.sendMessage(from, {
      document: { url: dl_link },
      mimetype: mime_type,
      fileName: file_name,
      caption: caption
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});

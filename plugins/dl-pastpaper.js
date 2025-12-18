const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "pastpaper",
  alias: ["pastp"],
  desc: "📄 Search & download Past Papers",
  category: "education",
  react: "📘",
  filename: __filename
}, async (conn, mek, m, { from, q }) => {

  if (!q) {
    return conn.sendMessage(from, {
      text: "❗ Use: .papers <paper name>"
    }, { quoted: mek });
  }

  try {
    // 🔍 SEARCH
    const searchUrl = `https://api-pass.vercel.app/api/search?query=${encodeURIComponent(q)}`;
    const res = await axios.get(searchUrl);
    const data = res.data;

    if (!data.results || data.results.length === 0) {
      return conn.sendMessage(from, { text: "❌ No papers found." }, { quoted: mek });
    }

    const list = data.results.map((v, i) => ({
      id: i + 1,
      title: v.title,
      url: v.url,
      thumb: v.thumbnail,
      desc: v.description
    }));

    let text = "🔢 *Reply with number*\n━━━━━━━━━━━━━━\n\n";
    list.forEach(p => {
      text += `📄 *${p.id}. ${p.title}*\n`;
    });

    const listMsg = await conn.sendMessage(from, {
      text: `*📘 PAST PAPERS SEARCH*\n\n${text}`
    }, { quoted: mek });

    const listener = async (update) => {
      const msg = update.messages?.[0];
      if (!msg?.message?.extendedTextMessage) return;

      const reply = msg.message.extendedTextMessage.text.trim();
      const repliedId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

      if (repliedId !== listMsg.key.id) return;

      const num = parseInt(reply);
      const selected = list.find(x => x.id === num);
      if (!selected) {
        return conn.sendMessage(from, { text: "❌ Invalid number." }, { quoted: msg });
      }

      await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

      // 📥 DOWNLOAD DETAILS
      const dUrl = `https://api-pass.vercel.app/api/download?url=${encodeURIComponent(selected.url)}`;
      const dRes = await axios.get(dUrl);
      const d = dRes.data;

      const info =
        `📄 *${d.download_info.file_title}*\n\n` +
        `📝 *Exam:* ${d.paper_details.examination}\n` +
        `📚 *Medium:* ${d.paper_details.medium}\n\n` +
        `🔗 *Source:* ${d.source_url}\n\n` +
        `⬇️ *Reply with* 1 *to download*`;

      const detailMsg = await conn.sendMessage(from, {
        image: { url: selected.thumb },
        caption: info
      }, { quoted: msg });

      const downloadListener = async (up) => {
        const m2 = up.messages?.[0];
        if (!m2?.message?.extendedTextMessage) return;

        const r = m2.message.extendedTextMessage.text.trim();
        const rId = m2.message.extendedTextMessage.contextInfo?.stanzaId;

        if (rId !== detailMsg.key.id) return;

        if (r !== "1") {
          return conn.sendMessage(from, { text: "❌ Invalid option." }, { quoted: m2 });
        }

        await conn.sendMessage(from, {
          document: { url: d.download_info.download_url },
          mimetype: "application/pdf",
          fileName: d.download_info.file_name,
          caption: `📘 *Past Paper*\n\n> Powered by DARK-KNIGHT-XMD`
        }, { quoted: m2 });

        conn.ev.off("messages.upsert", downloadListener);
      };

      conn.ev.on("messages.upsert", downloadListener);
      conn.ev.off("messages.upsert", listener);
    };

    conn.ev.on("messages.upsert", listener);

  } catch (e) {
    console.error(e);
    conn.sendMessage(from, {
      text: "⚠️ Error occurred while fetching paper."
    }, { quoted: mek });
  }
});

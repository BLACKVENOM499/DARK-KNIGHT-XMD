const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "ai",
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for OpenAI.\nExample: `.ai Hello`");

        const apiUrl = `https://supun-md-api-xmjh.vercel.app/api/ai/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.results) {
            await react("❌");
            return reply("OpenAI failed to respond. Please try again later.");
        }

        await reply(`🧠 *OpenAI Response:*\n\n${data.results}`);
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        reply("An error occurred while communicating with OpenAI.");
    }
});

cmd({
    pattern: "openai",
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");

        const apiUrl = `https://malvin-api.vercel.app/ai/openai?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return reply("OpenAI failed to respond. Please try again later.");
        }

        await reply(`🧠 *OpenAI Response:*\n\n${data.result}`);
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        reply("An error occurred while communicating with OpenAI.");
    }
});

cmd({
    pattern: "venice",
    desc: "Chat with Microsoft Copilot - GPT-5",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) {
            return reply("🧠 Please provide a message for the AI.\nExample: `.venice Hello`");
        }

        // ✅ Malvin API - GPT-5 Endpoint
        const apiUrl = `https://malvin-api.vercel.app/ai/venice?text=${encodeURIComponent(q)}`;

        const { data } = await axios.get(apiUrl);

        // 🧾 Validate Response
        if (!data?.status || !data?.result) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        // 🧩 Nicely formatted response
        const responseMsg = `
Venice AI - Dolphin 3.0 Mistral 24B  
━━━━━━━━━━━━━━━  
${data.result}
        `.trim();

        await reply(responseMsg);
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});

cmd({
    pattern: "copilot",
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("🧠 Please provide a message for the AI.\n\nExample: `.copilot Hello`");

        // ✅ Updated API URL (Malvin API)
        const apiUrl = `https://malvin-api.vercel.app/ai/copilot?text=${encodeURIComponent(q)}`;

        const { data } = await axios.get(apiUrl);

        if (!data?.status || !data?.result) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        // 🧾 Format the response nicely
        const responseMsg = `
🤖 *Microsoft Copilot AI Response*  
━━━━━━━━━━━━━━━  
${data.result}  

🕒 *Response Time:* ${data.response_time}
        `.trim();

        await reply(responseMsg);
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});


cmd({
    pattern: "copilot2",
    desc: "Chat with Microsoft Copilot (Deep Thinking)",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("🧠 Please provide a message for the AI.\nExample: `.copilot2 Hello`");

        // ✅ Malvin API (Deep Thinking mode)
        const apiUrl = `https://malvin-api.vercel.app/ai/copilot-think?text=${encodeURIComponent(q)}`;

        const { data } = await axios.get(apiUrl);

        // 🧾 Validate response
        if (!data?.status || !data?.result) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        // 🧩 Nicely formatted AI message
        const responseMsg = `
🤖 *Microsoft Copilot - Deep Thinking*  
━━━━━━━━━━━━━━━  
${data.result}

🕒 *Response Time:* ${data.response_time}  
        `.trim();

        await reply(responseMsg);
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});


cmd({
    pattern: "gpt",
    desc: "Chat with Microsoft Copilot - GPT-5",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) {
            return reply("🧠 Please provide a message for the AI.\nExample: `.gpt Hello`");
        }

        // ✅ Malvin API - GPT-5 Endpoint
        const apiUrl = `https://malvin-api.vercel.app/ai/gpt-5?text=${encodeURIComponent(q)}`;

        const { data } = await axios.get(apiUrl);

        // 🧾 Validate Response
        if (!data?.status || !data?.result) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        // 🧩 Nicely formatted response
        const responseMsg = `
🤖 *Microsoft Copilot GPT-5 AI Response*  
━━━━━━━━━━━━━━━  
${data.result}

🕒 *Response Time:* ${data.response_time}
        `.trim();

        await reply(responseMsg);
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});

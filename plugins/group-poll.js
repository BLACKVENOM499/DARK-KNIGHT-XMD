
const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

// Function to extract display number from any ID format
function extractDisplayNumber(id) {
    if (!id) return 'Unknown';
    if (id.includes(':')) {
        return id.split(':')[0];
    }
    if (id.includes('@')) {
        return id.split('@')[0];
    }
    return id;
}

cmd({
    pattern: "poll",
    alias: ["vote", "voting", "createpoll"],
    react: "📊",
    category: "group",
    desc: "Create a poll with a question and options in the group.",
    use: ".poll question;option1,option2,option3",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, q, reply }) => {
    try {
        // Check if in group (polls work best in groups)
        if (!isGroup) {
            return reply("❌ Polls work best in groups. Please use this command in a group.");
        }

        // Get sender ID with LID support
        const senderId = mek.key.participant || mek.key.remoteJid || (mek.key.fromMe ? conn.user?.id : null);
        
        // Check if input is provided
        if (!q || q.trim() === '') {
            return reply(`📊 *How to Create a Poll*\n\n*Format:*\n${prefix}poll question;option1,option2,option3\n\n*Examples:*\n• ${prefix}poll What's your favorite color?;Red,Blue,Green\n• ${prefix}poll Best programming language?;JavaScript,Python,Java,C++\n• ${prefix}poll Should we have a meetup?;Yes,No,Maybe\n\n*Note:*\n• Separate question and options with ;\n• Separate options with ,\n• Minimum 2 options required\n• Maximum 12 options allowed`);
        }

        // Parse input
        let [question, optionsString] = q.split(";");

        // Validate question
        if (!question || question.trim() === '') {
            return reply("❌ Please provide a question for the poll.\n\n*Example:*\n" + prefix + "poll What's your favorite food?;Pizza,Burger,Pasta");
        }

        // Validate options
        if (!optionsString || optionsString.trim() === '') {
            return reply("❌ Please provide options for the poll.\n\n*Example:*\n" + prefix + "poll What's your favorite food?;Pizza,Burger,Pasta");
        }

        // Clean and parse options
        let options = [];
        for (let option of optionsString.split(",")) {
            const trimmedOption = option.trim();
            if (trimmedOption !== "" && trimmedOption.length > 0) {
                // Avoid duplicate options
                if (!options.includes(trimmedOption)) {
                    options.push(trimmedOption);
                }
            }
        }

        // Validate minimum options
        if (options.length < 2) {
            return reply("❌ Please provide at least 2 different options for the poll.\n\n*Example:*\n" + prefix + "poll Best day?;Monday,Friday,Sunday");
        }

        // Validate maximum options (WhatsApp limit is 12)
        if (options.length > 12) {
            return reply("❌ Maximum 12 options allowed for a poll.\n\nYou provided: " + options.length + " options");
        }

        // Clean the question
        question = question.trim();

        // Validate question length
        if (question.length > 256) {
            return reply("❌ Question is too long!\n\n*Maximum:* 256 characters\n*Your question:* " + question.length + " characters");
        }

        // Get sender number for display
        const senderNum = extractDisplayNumber(senderId);

        // Show processing
        await conn.sendMessage(from, { react: { text: '📊', key: mek.key } });

        // Create the poll
        await conn.sendMessage(from, {
            poll: {
                name: question,
                values: options,
                selectableCount: 1,  // Single choice poll
                // toAnnouncementGroup: false  // Not needed for regular polls
            }
        }, { quoted: mek });

        // Optional: Send confirmation message
        // You can remove this if you don't want a confirmation message
        /*
        const confirmMessage = `📊 *Poll Created!*\n\n` +
            `❓ *Question:* ${question}\n` +
            `📝 *Options:* ${options.length}\n` +
            `👤 *Created By:* @${senderNum}`;

        await conn.sendMessage(from, {
            text: confirmMessage,
            mentions: [senderId]
        });
        */

    } catch (e) {
        console.error("Poll command error:", e);
        
        if (e.message?.includes('429')) {
            return reply("❌ Rate limit reached. Please try again in a few seconds.");
        } else if (e.message?.includes('not-authorized')) {
            return reply("❌ I'm not authorized to create polls in this group.");
        } else {
            return reply(`❌ An error occurred while creating the poll.\n\n_Error:_ ${e.message}`);
        }
    }
});

// Multi-choice poll command (allows selecting multiple options)
cmd({
    pattern: "mpoll",
    alias: ["multipoll", "multichoice"],
    react: "📊",
    category: "group",
    desc: "Create a multi-choice poll (can select multiple options).",
    use: ".mpoll question;option1,option2,option3",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, q, reply }) => {
    try {
        // Check if in group
        if (!isGroup) {
            return reply("❌ Polls work best in groups. Please use this command in a group.");
        }

        // Get sender ID with LID support
        const senderId = mek.key.participant || mek.key.remoteJid || (mek.key.fromMe ? conn.user?.id : null);
        
        // Check if input is provided
        if (!q || q.trim() === '') {
            return reply(`📊 *How to Create a Multi-Choice Poll*\n\n*Format:*\n${prefix}mpoll question;option1,option2,option3\n\n*Example:*\n${prefix}mpoll What foods do you like?;Pizza,Burger,Pasta,Sushi\n\n*Note:* Users can select multiple options!`);
        }

        // Parse input
        let [question, optionsString] = q.split(";");

        // Validate question and options
        if (!question || question.trim() === '') {
            return reply("❌ Please provide a question for the poll.");
        }

        if (!optionsString || optionsString.trim() === '') {
            return reply("❌ Please provide options for the poll.");
        }

        // Clean and parse options
        let options = [];
        for (let option of optionsString.split(",")) {
            const trimmedOption = option.trim();
            if (trimmedOption !== "" && !options.includes(trimmedOption)) {
                options.push(trimmedOption);
            }
        }

        // Validate options count
        if (options.length < 2) {
            return reply("❌ Please provide at least 2 different options.");
        }

        if (options.length > 12) {
            return reply("❌ Maximum 12 options allowed.");
        }

        question = question.trim();

        // Show processing
        await conn.sendMessage(from, { react: { text: '📊', key: mek.key } });

        // Create multi-choice poll
        await conn.sendMessage(from, {
            poll: {
                name: question,
                values: options,
                selectableCount: options.length,  // Allow selecting all options
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Multi-poll command error:", e);
        return reply(`❌ An error occurred.\n\n_Error:_ ${e.message}`);
    }
});
/*
const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

cmd({
  pattern: "poll",
  category: "group",
  desc: "Create a poll with a question and options in the group.",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, body, sender, groupMetadata, participants, prefix, pushname, reply }) => {
  try {
    let [question, optionsString] = body.split(";");
    
    if (!question || !optionsString) {
      return reply(`Usage: ${prefix}poll question;option1,option2,option3...`);
    }

    let options = [];
    for (let option of optionsString.split(",")) {
      if (option && option.trim() !== "") {
        options.push(option.trim());
      }
    }

    if (options.length < 2) {
      return reply("*Please provide at least two options for the poll.*");
    }

    await conn.sendMessage(from, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1,
        toAnnouncementGroup: true,
      }
    }, { quoted: mek });
  } catch (e) {
    return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
  }
});
*/

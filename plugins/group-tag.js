
const config = require('../config')
const { cmd } = require('../command')

// Function to check admin status with LID support (if needed)
async function checkAdminStatus(conn, chatId, senderId) {
    try {
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants || [];
        
        const botId = conn.user?.id || '';
        const botLid = conn.user?.lid || '';
        
        // Extract bot information
        const botNumber = botId.includes(':') ? botId.split(':')[0] : (botId.includes('@') ? botId.split('@')[0] : botId);
        const botIdWithoutSuffix = botId.includes('@') ? botId.split('@')[0] : botId;
        const botLidNumeric = botLid.includes(':') ? botLid.split(':')[0] : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
        const botLidWithoutSuffix = botLid.includes('@') ? botLid.split('@')[0] : botLid;
        
        // Extract sender information
        const senderNumber = senderId.includes(':') ? senderId.split(':')[0] : (senderId.includes('@') ? senderId.split('@')[0] : senderId);
        const senderIdWithoutSuffix = senderId.includes('@') ? senderId.split('@')[0] : senderId;
        
        let isBotAdmin = false;
        let isSenderAdmin = false;
        
        for (let p of participants) {
            if (p.admin === "admin" || p.admin === "superadmin") {
                // Check participant IDs
                const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
                const pId = p.id ? p.id.split('@')[0] : '';
                const pLid = p.lid ? p.lid.split('@')[0] : '';
                const pFullId = p.id || '';
                const pFullLid = p.lid || '';
                
                // Extract numeric part from participant LID
                const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : pLid;
                
                // Check if this participant is the bot
                const botMatches = (
                    botId === pFullId ||
                    botId === pFullLid ||
                    botLid === pFullLid ||
                    botLidNumeric === pLidNumeric ||
                    botLidWithoutSuffix === pLid ||
                    botNumber === pPhoneNumber ||
                    botNumber === pId ||
                    botIdWithoutSuffix === pPhoneNumber ||
                    botIdWithoutSuffix === pId ||
                    (botLid && botLid.split('@')[0].split(':')[0] === pLid)
                );
                
                if (botMatches) {
                    isBotAdmin = true;
                }
                
                // Check if this participant is the sender
                const senderMatches = (
                    senderId === pFullId ||
                    senderId === pFullLid ||
                    senderNumber === pPhoneNumber ||
                    senderNumber === pId ||
                    senderIdWithoutSuffix === pPhoneNumber ||
                    senderIdWithoutSuffix === pId ||
                    (pLid && senderIdWithoutSuffix === pLid)
                );
                
                if (senderMatches) {
                    isSenderAdmin = true;
                }
            }
        }
        
        return { isBotAdmin, isSenderAdmin, participants };
        
    } catch (err) {
        console.error('❌ Error checking admin status:', err);
        return { isBotAdmin: false, isSenderAdmin: false, participants: [] };
    }
}

// Function to check if user is owner with LID support
function isOwnerUser(senderId) {
    const senderNumber = senderId.includes(':') 
        ? senderId.split(':')[0] 
        : (senderId.includes('@') ? senderId.split('@')[0] : senderId);
    
    const ownerNumbers = [];
    
    if (config.OWNER_NUMBER) {
        const ownerNum = config.OWNER_NUMBER.includes('@') 
            ? config.OWNER_NUMBER.split('@')[0] 
            : config.OWNER_NUMBER;
        ownerNumbers.push(ownerNum.includes(':') ? ownerNum.split(':')[0] : ownerNum);
    }
    
    const validOwnerNumbers = ownerNumbers.filter(Boolean);
    
    return validOwnerNumbers.some(ownerNum => {
        return senderNumber === ownerNum || 
               senderNumber === ownerNum.replace(/[^0-9]/g, '');
    });
}

// Function to get all participant IDs for mentions (LID compatible)
function getAllParticipantIds(participants) {
    return participants.map(p => p.id).filter(Boolean);
}

// URL validation function
const isUrl = (url) => {
    return /https?:\/\/(www\.)?[\w\-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([\w\-@:%_\+.~#?&//=]*)/.test(url);
};

cmd({
    pattern: "hidetag",
    alias: ["tag", "h", "alltag"],
    react: "🔊",
    desc: "Tag all members with any message or media",
    category: "group",
    use: '.hidetag Hello or reply to a message',
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, quoted, reply }) => {
    try {
        // Check if in group
        if (!isGroup) return reply("❌ This command can only be used in groups!");

        // Get sender ID with LID support
        const senderId = mek.key.participant || mek.key.remoteJid || (mek.key.fromMe ? conn.user?.id : null);
        if (!senderId) return reply("❌ Could not identify sender.");

        // Get group metadata and participants
        const metadata = await conn.groupMetadata(from);
        const participants = metadata.participants || [];

        // Get all participant IDs for mentions (LID compatible)
        const allParticipantIds = getAllParticipantIds(participants);
        
        if (allParticipantIds.length === 0) {
            return reply("❌ No participants found in this group.");
        }

        const mentionAll = { mentions: allParticipantIds };

        // If no message or reply is provided
        if (!q && !m.quoted) {
            return reply("❌ Please provide a message or reply to a message to tag all members.\n\n*Usage:*\n• .hidetag Hello everyone!\n• Reply to any message with .hidetag");
        }

        // Show processing reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // If replying to a message
        if (m.quoted) {
            const type = m.quoted.mtype || '';
            
            // If it's a text message (extendedTextMessage or conversation)
            if (type === 'extendedTextMessage' || type === 'conversation') {
                await conn.sendMessage(from, { react: { text: '🔊', key: mek.key } });
                return await conn.sendMessage(from, {
                    text: m.quoted.text || 'No message content found.',
                    ...mentionAll
                }, { quoted: mek });
            }

            // Handle media messages
            if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type)) {
                try {
                    const buffer = await m.quoted.download?.();
                    if (!buffer) {
                        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                        return reply("❌ Failed to download the quoted media.");
                    }

                    let content;
                    switch (type) {
                        case "imageMessage":
                            content = { 
                                image: buffer, 
                                caption: m.quoted.text || "📷 Image", 
                                ...mentionAll 
                            };
                            break;
                        case "videoMessage":
                            content = { 
                                video: buffer, 
                                caption: m.quoted.text || "🎥 Video", 
                                gifPlayback: m.quoted.message?.videoMessage?.gifPlayback || false, 
                                ...mentionAll 
                            };
                            break;
                        case "audioMessage":
                            content = { 
                                audio: buffer, 
                                mimetype: "audio/mp4", 
                                ptt: m.quoted.message?.audioMessage?.ptt || false, 
                                ...mentionAll 
                            };
                            break;
                        case "stickerMessage":
                            content = { 
                                sticker: buffer, 
                                ...mentionAll 
                            };
                            break;
                        case "documentMessage":
                            content = {
                                document: buffer,
                                mimetype: m.quoted.message?.documentMessage?.mimetype || "application/octet-stream",
                                fileName: m.quoted.message?.documentMessage?.fileName || "file",
                                caption: m.quoted.text || "",
                                ...mentionAll
                            };
                            break;
                    }

                    if (content) {
                        await conn.sendMessage(from, { react: { text: '🔊', key: mek.key } });
                        return await conn.sendMessage(from, content, { quoted: mek });
                    }
                } catch (e) {
                    console.error("Media download/send error:", e);
                    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                    return reply("❌ Failed to process the media. Please try again.");
                }
            }

            // Fallback for any other message type
            await conn.sendMessage(from, { react: { text: '🔊', key: mek.key } });
            return await conn.sendMessage(from, {
                text: m.quoted.text || "📨 Message",
                ...mentionAll
            }, { quoted: mek });
        }

        // If no quoted message, but a direct message is sent
        if (q) {
            await conn.sendMessage(from, { react: { text: '🔊', key: mek.key } });
            
            // Send the text with mentions
            await conn.sendMessage(from, {
                text: q,
                ...mentionAll
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Hidetag Error:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ Error occurred: ${e.message}`);
    }
});

/*
const { cmd } = require('../command');

// Fixed & Created By JawadTechX
cmd({
  pattern: "hidetag",
  alias: ["tag", "h"],  
  react: "🔊",
  desc: "To Tag all Members for Any Message/Media",
  category: "group",
  use: '.hidetag Hello',
  filename: __filename
},
async (conn, mek, m, {
  from, q, isGroup, isCreator, isAdmins,
  participants, reply
}) => {
  try {
    const isUrl = (url) => {
      return /https?:\/\/(www\.)?[\w\-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([\w\-@:%_\+.~#?&//=]*)/.test(url);
    };

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins && !isCreator) return reply("❌ Only group admins can use this command.");

    const mentionAll = { mentions: participants.map(u => u.id) };

    // If no message or reply is provided
    if (!q && !m.quoted) {
      return reply("❌ Please provide a message or reply to a message to tag all members.");
    }

    // If a reply to a message
    if (m.quoted) {
      const type = m.quoted.mtype || '';
      
      // If it's a text message (extendedTextMessage)
      if (type === 'extendedTextMessage') {
        return await conn.sendMessage(from, {
          text: m.quoted.text || 'No message content found.',
          ...mentionAll
        }, { quoted: mek });
      }

      // Handle media messages
      if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type)) {
        try {
          const buffer = await m.quoted.download?.();
          if (!buffer) return reply("❌ Failed to download the quoted media.");

          let content;
          switch (type) {
            case "imageMessage":
              content = { image: buffer, caption: m.quoted.text || "📷 Image", ...mentionAll };
              break;
            case "videoMessage":
              content = { 
                video: buffer, 
                caption: m.quoted.text || "🎥 Video", 
                gifPlayback: m.quoted.message?.videoMessage?.gifPlayback || false, 
                ...mentionAll 
              };
              break;
            case "audioMessage":
              content = { 
                audio: buffer, 
                mimetype: "audio/mp4", 
                ptt: m.quoted.message?.audioMessage?.ptt || false, 
                ...mentionAll 
              };
              break;
            case "stickerMessage":
              content = { sticker: buffer, ...mentionAll };
              break;
            case "documentMessage":
              content = {
                document: buffer,
                mimetype: m.quoted.message?.documentMessage?.mimetype || "application/octet-stream",
                fileName: m.quoted.message?.documentMessage?.fileName || "file",
                caption: m.quoted.text || "",
                ...mentionAll
              };
              break;
          }

          if (content) {
            return await conn.sendMessage(from, content, { quoted: mek });
          }
        } catch (e) {
          console.error("Media download/send error:", e);
          return reply("❌ Failed to process the media. Sending as text instead.");
        }
      }

      // Fallback for any other message type
      return await conn.sendMessage(from, {
        text: m.quoted.text || "📨 Message",
        ...mentionAll
      }, { quoted: mek });
    }

    // If no quoted message, but a direct message is sent
    if (q) {
      // If the direct message is a URL, send it as a message
      if (isUrl(q)) {
        return await conn.sendMessage(from, {
          text: q,
          ...mentionAll
        }, { quoted: mek });
      }

      // Otherwise, just send the text without the command name
      await conn.sendMessage(from, {
        text: q, // Sends the message without the command name
        ...mentionAll
      }, { quoted: mek });
    }

  } catch (e) {
    console.error(e);
    reply(`❌ *Error Occurred !!*\n\n${e.message}`);
  }
});
*/

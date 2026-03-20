
const { cmd } = require('../command');
const config = require('../config');

// Function to check admin status with LID support
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
        
        return { isBotAdmin, isSenderAdmin };
        
    } catch (err) {
        console.error('❌ Error checking admin status:', err);
        return { isBotAdmin: false, isSenderAdmin: false };
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
    
    if (config.DEV) {
        const devNum = config.DEV.includes('@') 
            ? config.DEV.split('@')[0] 
            : config.DEV;
        ownerNumbers.push(devNum.includes(':') ? devNum.split(':')[0] : devNum);
    }
    
    if (config.SUDO) {
        const sudoList = config.SUDO.split(',').map(num => {
            const cleaned = num.trim();
            const extracted = cleaned.includes('@') ? cleaned.split('@')[0] : cleaned;
            return extracted.includes(':') ? extracted.split(':')[0] : extracted;
        });
        ownerNumbers.push(...sudoList);
    }
    
    const validOwnerNumbers = ownerNumbers.filter(Boolean);
    
    return validOwnerNumbers.some(ownerNum => {
        return senderNumber === ownerNum || 
               senderNumber === ownerNum.replace(/[^0-9]/g, '');
    });
}

// Function to check if target is already admin
async function isTargetAlreadyAdmin(conn, chatId, targetId) {
    try {
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants || [];
        
        const targetNumber = targetId.includes(':') 
            ? targetId.split(':')[0] 
            : (targetId.includes('@') ? targetId.split('@')[0] : targetId);
        const targetIdWithoutSuffix = targetId.includes('@') ? targetId.split('@')[0] : targetId;
        
        for (let p of participants) {
            if (p.admin === "admin" || p.admin === "superadmin") {
                const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
                const pId = p.id ? p.id.split('@')[0] : '';
                const pLid = p.lid ? p.lid.split('@')[0] : '';
                const pFullId = p.id || '';
                const pFullLid = p.lid || '';
                
                const targetMatches = (
                    targetId === pFullId ||
                    targetId === pFullLid ||
                    targetNumber === pPhoneNumber ||
                    targetNumber === pId ||
                    targetIdWithoutSuffix === pPhoneNumber ||
                    targetIdWithoutSuffix === pId ||
                    (pLid && targetIdWithoutSuffix === pLid)
                );
                
                if (targetMatches) {
                    return true;
                }
            }
        }
        return false;
    } catch (err) {
        console.error('❌ Error checking target admin status:', err);
        return false;
    }
}

// Function to check if target is in the group
async function isTargetInGroup(conn, chatId, targetId) {
    try {
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants || [];
        
        const targetNumber = targetId.includes(':') 
            ? targetId.split(':')[0] 
            : (targetId.includes('@') ? targetId.split('@')[0] : targetId);
        const targetIdWithoutSuffix = targetId.includes('@') ? targetId.split('@')[0] : targetId;
        
        for (let p of participants) {
            const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
            const pId = p.id ? p.id.split('@')[0] : '';
            const pLid = p.lid ? p.lid.split('@')[0] : '';
            const pFullId = p.id || '';
            const pFullLid = p.lid || '';
            
            const targetMatches = (
                targetId === pFullId ||
                targetId === pFullLid ||
                targetNumber === pPhoneNumber ||
                targetNumber === pId ||
                targetIdWithoutSuffix === pPhoneNumber ||
                targetIdWithoutSuffix === pId ||
                (pLid && targetIdWithoutSuffix === pLid)
            );
            
            if (targetMatches) {
                return { found: true, participantId: p.id };
            }
        }
        return { found: false, participantId: null };
    } catch (err) {
        console.error('❌ Error checking if target in group:', err);
        return { found: false, participantId: null };
    }
}

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
    pattern: "promote",
    alias: ["p", "makeadmin", "addadmin"],
    desc: "Promotes a member to group admin",
    category: "admin",
    react: "⬆️",
    use: ".promote @user or reply to message",
    filename: __filename
},
async (conn, mek, m, { from, quoted, isGroup, reply }) => {
    try {
        // Check if in group
        if (!isGroup) return reply("❌ This command only works in groups!");

        // Get sender ID with LID support
        const senderId = mek.key.participant || mek.key.remoteJid || (mek.key.fromMe ? conn.user?.id : null);
        if (!senderId) return reply("❌ Could not identify sender.");

        // Check admin status using the integrated function
        const { isBotAdmin, isSenderAdmin } = await checkAdminStatus(conn, from, senderId);

        // Check if sender is admin or owner
        const isOwner = isOwnerUser(senderId);
        
        if (!isSenderAdmin && !isOwner) {
            return reply("❌ Only group admins or bot owner can use this command!");
        }

        // Check if bot is admin
        if (!isBotAdmin) {
            return reply("❌ I need to be an admin to promote members!");
        }

        // Get target user
        let target;
        
        // Check if replying to a message
        if (quoted && quoted.sender) {
            target = quoted.sender;
        } 
        // Check if mentioning someone
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0];
        } 
        // No target specified
        else {
            return reply("❌ Please reply to a message or mention a user to promote!\n\n*Examples:*\n• Reply to message → .promote\n• Mention user → .promote @user");
        }

        // Check if target is in the group
        const targetInGroup = await isTargetInGroup(conn, from, target);
        if (!targetInGroup.found) {
            return reply("❌ This user is not in the group!");
        }

        // Check if target is already admin
        const alreadyAdmin = await isTargetAlreadyAdmin(conn, from, target);
        if (alreadyAdmin) {
            const targetNum = extractDisplayNumber(target);
            return reply(`ℹ️ @${targetNum} is already an admin!`, {
                mentions: [target]
            });
        }

        // Show processing
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // Promote the user using the correct participant ID
        await conn.groupParticipantsUpdate(from, [targetInGroup.participantId || target], "promote");

        // Get numbers for display
        const targetNum = extractDisplayNumber(target);
        const senderNum = extractDisplayNumber(senderId);

        // Success reaction
        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        // Success message
        const successMessage = `✅ *User Promoted!*\n\n` +
            `👤 *User:* @${targetNum}\n` +
            `👑 *New Role:* Admin\n` +
            `🔧 *Promoted By:* @${senderNum}\n` +
            `📅 *Time:* ${new Date().toLocaleString()}`;

        await reply(successMessage, {
            mentions: [target, senderId]
        });

    } catch (error) {
        console.error("Promote Error:", error);
        
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        
        if (error.message?.includes('not-authorized')) {
            return reply("❌ I don't have permission to promote users in this group.");
        } else if (error.message?.includes('429')) {
            return reply("❌ Rate limit reached. Please try again in a few seconds.");
        } else if (error.message?.includes('not-participant')) {
            return reply("❌ This user is not a participant in this group.");
        } else {
            return reply("❌ Failed to promote user. Please try again.\n\nError: " + (error.message || 'Unknown error'));
        }
    }
});
/*
const { cmd } = require('../command');

cmd({
    pattern: "promote",
    alias: ["p", "makeadmin"],
    desc: "Promotes a member to group admin",
    category: "admin",
    react: "⬆️",
    filename: __filename
},
async(conn, mek, m, {
    from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply
}) => {
    // Check if the command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Check if the user is an admin
    if (!isAdmins) return reply("❌ Only group admins can use this command.");

    // Check if the bot is an admin
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0]; // If replying to a message, get the sender's number
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, ''); // If manually typing a number
    } else {
        return reply("❌ Please reply to a message or provide a number to promote.");
    }

    // Prevent promoting the bot itself
    if (number === botNumber) return reply("❌ The bot cannot promote itself.");

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "promote");
        reply(`✅ Successfully promoted @${number} to admin.`, { mentions: [jid] });
    } catch (error) {
        console.error("Promote command error:", error);
        reply("❌ Failed to promote the member.");
    }
});
*/

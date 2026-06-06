const db = require('../db');
const config = require('../config');

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    
    const dDisplay = d > 0 ? `${d}d ` : "";
    const hDisplay = h > 0 ? `${h}h ` : "";
    const mDisplay = m > 0 ? `${m}m ` : "";
    const sDisplay = s > 0 ? `${s}s` : "";
    return dDisplay + hDisplay + mDisplay + sDisplay || '0s';
}

module.exports = {
    match: (msg) => msg.body && msg.body.trim().toLowerCase() === '/wspstatus',
    handle: async ({ msg, client }) => {
        try {
            // Get connection state
            let state = 'UNKNOWN';
            try {
                state = await client.getState();
            } catch (e) {
                state = 'ERROR_GETTING_STATE';
            }

            // Get database info
            const messages = db.getMessages(config.dbPath);
            const pendingCount = messages.filter(m => m.status === 'pending').length;
            const sentCount = messages.filter(m => m.status === 'sent').length;
            const failedCount = messages.filter(m => m.status === 'failed').length;

            // Get auto reactions info
            const autoReactions = db.getAutoReactions(config.dbPath);
            const autoReactionsCount = Object.keys(autoReactions).length;

            // Get memory usage
            const memory = process.memoryUsage();
            const heapUsedMB = (memory.heapUsed / 1024 / 1024).toFixed(2);
            const rssMB = (memory.rss / 1024 / 1024).toFixed(2);

            // Get uptime
            const uptimeStr = formatUptime(process.uptime());

            const statusMsg = `🤖 *Estado del Bot de WhatsApp*\n\n` +
                `🟢 *Conexión:* \`${state}\`\n` +
                `👤 *Usuario JID:* \`${client.info ? client.info.wid._serialized : 'No vinculado'}\`\n` +
                `⏱️ *Tiempo Activo:* \`${uptimeStr}\`\n\n` +
                `📊 *Mensajes en Cola:* \n` +
                `• Pendientes: \`${pendingCount}\`\n` +
                `• Enviados: \`${sentCount}\`\n` +
                `• Fallidos: \`${failedCount}\`\n` +
                `• Auto-reacciones configuradas: \`${autoReactionsCount}\`\n\n` +
                `🖥️ *Recursos del Servidor:* \n` +
                `• Heap Usado: \`${heapUsedMB} MB\`\n` +
                `• Memoria RSS: \`${rssMB} MB\``;

            await msg.reply(statusMsg);
        } catch (err) {
            console.error('[Bot] Error in /wspstatus command:', err);
            await msg.reply(`❌ *Error al obtener el estado del bot:* \`${err.message}\``);
        }
    }
};

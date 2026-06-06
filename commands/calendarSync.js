const google = require('../google');
const config = require('../config');

module.exports = {
    match: (msg) => msg.body && msg.body.trim() === '/calendar sync',
    handle: async ({ msg, client, dbPath }) => {
        try {
            await msg.reply('🔄 Sincronizando eventos del calendario...');
            const results = await google.syncCalendarMessages(client, config.google.calendarId, dbPath);
            await msg.reply(`✅ Sincronización completada!\n*Agregados:* ${results.added}\n*Actualizados:* ${results.updated}\n*Omitidos:* ${results.skipped}\n*Errores:* ${results.errors}`);
        } catch (error) {
            await msg.reply(`❌ Error al sincronizar calendario: ${error.message}`);
        }
    },
};

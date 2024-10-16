const Command = require('../../structures/Command.js');

module.exports = class RebootCommand extends Command {
    constructor(client, module) {
        super(client, module, {
            name: 'reboot',
            description: 'Reboots the bot if running under PM2',
            requiredFlag: ['OWNER']
        });
    }

    /**
     * 
     * @param {import('..')} client 
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     * @param {*} args 
     */
    async run(client, interaction, args) {
        const { promisify } = require("util");
        const write = promisify(require("fs").writeFile);
        if (!interaction.replied) await interaction.reply({ ephemeral: true, content: "OK" });
        const m = await interaction.channel.send(":hourglass_flowing_sand: Rebooting...");
        await write('./reboot.json', `{"id": "${m.id}", "channel": "${m.channel.id}"}`).catch(this.logger.error);
        
        process.exit(1);
    }
}
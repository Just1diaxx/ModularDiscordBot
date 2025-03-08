const Logger = require('./Logger.js');
const PowerLevels = require('./PowerLevels.js');
const { Message } = require('discord.js');

module.exports = class BaseCommand {
    constructor(client, {
        name = 'Unspecified',
        description = 'Unspecified.',
        enabled = true,
        usage = null,
        cooldown = 0,
        minLevel = PowerLevels.USER,
        guildOnly = false,
        alts = null, // Alternative names for the command (Array of strings)
        options = [],
        customHandling = false
    }) {
        /** @type {import('..')} */
        this.client = client
        this.module = module
        this.config = { name, description, cooldown, minLevel, alts, guildOnly, options, usage, enabled, customHandling };

        this.logger = new Logger(this.constructor.name);
    }

    /**
     * @param {import('../index.js')} client 
     * @param {Message} message
     * @param {...any} args
     * @returns {Promise<any>}
     */
    run(client, message, ...args) {}

    toJson() {
        const client = this.client;
        const config = this.config;
        const module = this.module;
    
        return {
            client,
            module,
            config
        };
    }
}
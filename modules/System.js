const Module = require("../structures/Module.js");
const Discord = require('discord.js');
const fs = require('fs');
const ConfigurationManager = require("../structures/ConfigurationManager.js");

module.exports = class System extends Module {
    constructor(client) {
        super(client, {
            info: "Loads the system utility commands",
            enabled: true,
            events: ["ready", "interactionCreate"] 
        }),

        this.config = new ConfigurationManager(this, {
            flags: {
                list: {
                    title: "🚩 <user>'s flags:",
                    flags: {
                        OWNER: "**Bot Owner**: This user is a developer of this bot",
                        STAFF: "**Bot Staff**: This user has staff priviliges on this bot",
                        PREMIUM: "**Premium**: This user supported the development of this bot",
                        BLACKLISTED: "**Blacklisted**: This user is blacklisted from this bot",
                    },
                    none: "🚩 <user> has no flags"
                },
                add: "✅ Flag `<flag>` has been assigned to <user>",
                remove:"✅ Flag `<flag>` has been removed to <user>",
                errors: {
                    alreadyHasFlag: "⚠️ Flag already assigned",
                    notHasFlag: "⚠️ Nothing to remove"
                }
            } 
        })
    }

    async ready(client) {
        let serverIds = this.client.config.get('systemServer');

        if (!serverIds) {
            this.logger.error(`System servers not found in config.yml!`);
            return;
        }

        for (const serverId of serverIds) {
            try {
                let systemGuild = await this.client.guilds.fetch(serverId);

                if (!systemGuild) {
                    this.logger.error(`System server not found: ${serverId}. Set it on config.yml!`);
                }

                await systemGuild.commands.set(this.systemCommands.map(c => c.toJson()));
            } catch (error) {
                this.logger.error(`Failed to fetch server ${serverId}: ${error}`);
            }
        }


        this.commands = this.systemCommands;
    }

    async interactionCreate(client, interaction) {
        if (!interaction.isAutocomplete()) return;

        const command = this.systemCommands.get(interaction.commandName);
        if (!command) return;

        if (interaction.commandName == "plugman") {
            let modules = [...this.client.moduleManager.modules.keys()];
            let options = modules.map(m => ({ name: m, value: m }));
            return interaction.respond(options);
        }
    }


    // Override
    async loadCommands() {
        this.systemCommands = new Discord.Collection();
        const commands = fs.existsSync(`./modules/${this.options.name}`) ? fs.readdirSync(`./modules/${this.options.name}`).filter(file => file.endsWith(".js")) : [];

        commands.forEach(file => {
            try {
                /**
                 * @type {import('./InteractionCommand')}
                 */
                const command = require(`../modules/${this.options.name}/${file}`);
                delete require.cache[require.resolve(`../modules/${this.options.name}/${file}`)];
                const _command = new command(this.client, this);

                this.systemCommands.set(file.split(".")[0], _command);
                this.logger.verbose(`Loaded system command ${file.split(".")[0]} from ${this.options.name}`);
            } catch (e) {
                this.logger.error(`Failed to load system command ${file} from ${this.options.name}: ${e.stack || e}`);
            }
        });
    }
}
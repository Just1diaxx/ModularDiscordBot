const { Collection } = require("discord.js");
const Logger = require("./Logger");
const fs = require("fs");

module.exports = class BaseCommandManager {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
        this.commandssize = 0;

        this.logger = new Logger("BaseCommandManager");
    }

    init() {
        this.logger.info(`Loading commands...`)
        const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
        commands.forEach(file => {
            if (!this.isLoaded(file.split(".")[0])) {
                this.load(file)
            }
        });
        this.client.database.reconfigure(); 
        this.logger.success(`Successfully Loaded ${this.commandssize} commands (${this.commands.size} with alts)`)

    }

    isLoaded(name) {
        return this.commands.has(name);
    }

    load(file) {
            let command;
            try{
                command = require(`../commands/${file}`);
            } catch (e) {
                return "COMMAND_NOT_FOUND";
            }

            delete require.cache[require.resolve(`../commands/${file}`)];

            const _command = new command(this.client);

            if(!_command.toJson().config.enabled) return "COMMAND_DISABLED";

            if (_command.toJson().config.alts){
                for (const alt of _command.toJson().config.alts) {
                    this.commands.set(alt.toLowerCase(), [_command, `${file}`]);
                }
            }

            this.commands.set(_command.toJson().config.name.toLowerCase(), [_command, `${file}`]);

            this.commandssize++;
            this.logger.success(`Loaded command ${command.name}`)
    }

    get(name) {
        return this.commands.get(name);
    }

    unload(name) {
        const _command = this.commands.get(name);
        if (!_command) return;
        const command = _command[0];
        if (command.config.alts) {
            for (const alt of command.config.alts) {
                this.commands.delete(alt.toLowerCase());
            }
        }
        this.commands.delete(name.toLowerCase());
        this.logger.success(`Unloaded command ${name}`)
    }

    reload(name) {
        const file = this.get(name)[1];

        this.unload(name);
        this.load(`${file}`);
        this.logger.success(`Reloaded command ${file.replace(".js", "")}`)
    }
}
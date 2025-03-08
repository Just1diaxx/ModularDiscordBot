const Discord = require('discord.js');
const Module = require("../structures/Module.js");
const Command = require("../structures/Command.js");
const BotClient = require('../index.js');
const PowerLevels = require('../structures/PowerLevels.js');
const ModulePriorities = require('../structures/ModulePriorities.js');
const Wait = require('../structures/Wait.js');
const BaseCommandOptionType = require('../structures/BaseCommandOptionType.js');
const BaseCommandOptionTypeUtils = require('../structures/BaseCommandOptionTypeUtils.js');

module.exports = class BaseCommandHandler extends Module {
    constructor(client) {
        super(client, {
            name: "BaseCommandHandler",
            info: "Adds base commands (by message) support.",
            enabled: true,
            events: ["messageCreate"],
            priority: ModulePriorities.HIGH
        });
    }

    /**
     * @param {BotClient} client
     * @param {Discord.Message} message
     */
    async messageCreate(client, message) {
        try{
            const prefix = client.config.get("baseCommandsPrefix");

            if (!message.content.startsWith(prefix)) return;

            let _args = message.content.slice(prefix.length).trim().split(/ +/);
            const command = _args.shift().toLowerCase();

            message.author.data = await client.database.forceUser(message.author.id);

            const __cmd = client.baseCommandManager.get(command);
            if (!__cmd){
                const errormessage = await message.reply({ content: ":no_entry: Command not found"});
                await new Wait().wait(3000)
                await errormessage.delete()
                await message.delete()
                return;
            }
            const cmd = __cmd[0];

            if (!cmd){
                const errormessage = await message.reply({ content: ":no_entry: Command not found"});
                await new Wait().wait(3000)
                await errormessage.delete()
                await message.delete()
                return;
            }

            if (message.author.data.powerlevel < cmd.config.minLevel){
                const errormessage = await message.reply({ content: `:no_entry: You don't have permission to use this command. The required permission level is ${Object.keys(PowerLevels).find(k => PowerLevels[k] == cmd.config.minLevel)}`});
                await await new Wait().wait(3000)
                await errormessage.delete()
                await message.delete()
                return;
            }

            if(cmd.config.guildOnly){
                if (!message.guild){
                    const errormessage = await message.reply({ content: `:no_entry: This command can be used only in a server`});
                    await new Wait().wait(3000)
                    await errormessage.delete()
                    await message.delete()
                    return;
                }
            }

            if(cmd.config.customHandling)
                return await cmd.commandCreate(client, message);

            if (cmd.config.options) {
                let reqArgs = []
                for (const option of cmd.config.options){
                    if (option.required)
                        reqArgs.push(option.name)
                }
                if (_args.length < reqArgs.length) {
                    let usage = ""
                    if (cmd.config.usage)
                        usage = ` Correct usage: ${cmd.config.usage}`

                    const errormessage = await message.reply({ content: `:no_entry: You used an incorrect usage.${usage}`});
                    await new Wait().wait(3000)
                    await errormessage.delete()
                    await message.delete()
                    return;
                }
                let allArgs = cmd.config.options.length
                if (_args.length > allArgs) {
                    let usage = ""
                    if (cmd.config.usage)
                        usage = ` Correct usage: ${cmd.config.usage}`

                    const errormessage = await message.reply({ content: `:no_entry: You used an incorrect usage.${usage}`});
                    await new Wait().wait(3000)
                    await errormessage.delete()
                    await message.delete()
                    return;
                }
            }

            let args = {}
            if (cmd.config.options) {
                let i = 0
                for (const option of cmd.config.options) {
                    switch (option.type) {
                        case BaseCommandOptionType.STRING: {
                            args[option.name] = _args[i]
                            i++
                            break;
                        }
                        case BaseCommandOptionType.INTEGER: {
                            args[option.name] = await new BaseCommandOptionTypeUtils().toInteger(_args[i])
                            i++
                            break;
                        }
                        case BaseCommandOptionType.BOOLEAN: {
                            args[option.name] = await new BaseCommandOptionTypeUtils().toBoolean(_args[i])
                            i++
                            break;
                        }
                        case BaseCommandOptionType.USER: {
                            args[option.name] = await new BaseCommandOptionTypeUtils().toUser(client, _args[i])
                            i++
                            break;
                        }
                        case BaseCommandOptionType.CHANNEL: {
                            args[option.name] = await new BaseCommandOptionTypeUtils().toChannel(client, _args[i])
                            i++
                            break;
                        }
                        case BaseCommandOptionType.ROLE: {
                            args[option.name] = await new BaseCommandOptionTypeUtils().toRole(client, message.guild, _args[i])
                            i++
                            break;
                        }
                        case BaseCommandOptionType.MEMBER: {
                            args[option.name] = await new BaseCommandOptionTypeUtils().toMember(client, message.guild, _args[i])
                            i++
                            break;
                        }
                        default: {
                            args[option.name] = _args[i]
                            i++
                            break;
                        }
                    }
                }
            }
            await cmd.run(client, message, args);
        } catch (e) {
            const errormessage = await message.reply({
                content: ":no_entry: Uh-oh, there was an error trying to execute the command, please contact bot developers.",
            })
            await new Wait().wait(3000)
            await errormessage.delete()
            await message.delete()
            this.logger.error(e.stack || e)
        }

        return { cancelEvent: true };
    }
}

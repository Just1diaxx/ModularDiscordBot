const BaseCommand = require('../structures/BaseCommand');
const { Message, EmbedBuilder } = require('discord.js');
const PowerLevels = require('../structures/PowerLevels.js');
const BaseCommandOptionType = require('../structures/BaseCommandOptionType.js');
const Wait = require('../structures/Wait.js');
const { Pagination } = require('pagination.djs');

module.exports = class CommandMan extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'CommandMan',
            description: 'Manage basecommands.',
            enabled: true,
            usage: '?commandman <action> [module]',
            minLevel: PowerLevels.OWNER,
            alts: ["basecmdman", "cmdman"],
            options: [
                {
                    name: 'action',
                    type: BaseCommandOptionType.STRING,
                    description: 'Action to perform.',
                    required: true
                },
                {
                    name: 'command',
                    type: BaseCommandOptionType.STRING,
                    description: 'In which command to perform the action.',
                    required: false
                }
            ]
        }),
        this.client = client;
    }

    /**
     * @param {import('../index.js')} client 
     * @param {Message} message
     * @param {Object} args
     */
    async run(client, message, args) {
        switch(args.action){
            case 'load': {
                if (!args.command) {
                    const errormessage = await message.reply('Please specify a command to load.');
                    await new Wait().wait(3000)
                    message.delete();
                    errormessage.delete();
                    return;
                }

                let command = client.baseCommandManager.get(args.command);
                if (command){
                    const errormessage = await message.reply('Command already loaded. If you want to reload it, use the `reload` action.');
                    await new Wait().wait(3000)
                    message.delete();
                    errormessage.delete();
                    return;
                }

                try {
                    const m = client.baseCommandManager.load(args.command);
                    if (m === 'COMMAND_DISABLED'){
                        const errormessage = await message.reply('This command is disabled. Error code: COMMAND_DISABLED');
                        await new Wait().wait(3000)
                        message.delete();
                        errormessage.delete();
                        return;
                    }

                    if (m === 'COMMAND_NOT_FOUND'){
                        const errormessage = await message.reply('Command not found. Make sure you typed the name of the file, and not the name of the command. Error code: COMMAND_NOT_FOUND');
                        await new Wait().wait(3000)
                        message.delete();
                        errormessage.delete();
                        return;
                    }

                    if (m === 'BAD_COMMAND_NAME'){
                        const errormessage = await message.reply('Command name is invalid. Error code: BAD_COMMAND_NAME');
                        await new Wait().wait(3000)
                        message.delete();
                        errormessage.delete();
                        return;
                    }

                    message.reply('Command loaded.');
                } catch (error) {
                    console.error(error);
                    const errormessage = await message.reply('An error occurred while loading the command.');
                    await new Wait().wait(3000)
                    message.delete();
                    errormessage.delete();
                    return;
                }
                break;
            }

            case 'unload': {
                if (!args.command) {
                    const errormessage = await message.reply('Please specify a command to unload.');
                    await new Wait().wait(3000)
                    message.delete();
                    await errormessage.delete();
                    return;
                }

                let command = client.baseCommandManager.get(args.command);
                if (!command){
                    const errormessage = await message.reply('Command not found.');
                    await new Wait().wait(3000)
                    message.delete();
                    errormessage.delete();
                    return;
                }

                try {
                    client.baseCommandManager.unload(args.command);
                    message.reply('Command unloaded.');
                } catch (error) {
                    console.error(error);
                    const errormessage = await message.reply('An error occurred while unloading the command.');
                    await new Wait().wait(3000)
                    message.delete();
                    errormessage.delete();
                    return;
                }
                break;
            }

            case 'reload': {
                if (!args.command) {
                    const errormessage = await message.reply('Please specify a command to reload.');
                    await new Wait().wait(3000)
                    message.delete();
                    errormessage.delete();
                    return;
                }

                let command = client.baseCommandManager.get(args.command);
                if (!command){
                    const errormessage = await message.reply('Command not found.');
                    await new Wait().wait(3000)
                    message.delete();
                    errormessage.delete();
                    return;
                }

                try {
                    client.baseCommandManager.reload(args.command);
                    message.reply('Command reloaded.');
                } catch (error) {
                    console.error(error);
                    const errormessage = await message.reply('An error occurred while reloading the command.');
                    await new Wait().wait(3000)
                    message.delete();
                    errormessage.delete();
                    return;
                }
                break;
            }

            case 'list': {
                const pagination = new Pagination(message);
                const prefix = client.config.get('baseCommandsPrefix');
                const embeds = []
                const alreadysent = []

                const commands = client.baseCommandManager.commands;
                commands.forEach((value, key) => {
                    const _cmd = value[0];
                    if (alreadysent.includes(_cmd.config.name)) return;
                    console.log(_cmd)
                    let options = null;
                    if (_cmd.config.options.length !== 0)
                        options = _cmd.config.options
                        .filter(o => o.name)
                        .map(o => o.name)
                        .join(', ')

                    let embed = new EmbedBuilder()
                        .setColor('Random')
                        .setTitle(prefix + _cmd.config.name.toLowerCase())
                        .addFields(
                            {name: 'Description', value: _cmd.config.description, inline: true},
                            {name: 'Enabled', value: String(_cmd.config.enabled), inline: true},
                            {name: '\n', value: '\n', inline: false},
                            {name: 'Usage', value: _cmd.config.usage, inline: true},
                            {name: 'Cooldown', value: _cmd.config.cooldown ? String(_cmd.config.cooldown) : '0', inline: true},
                            {name: '\n', value: '\n', inline: false},
                            {name: 'Min. PowerLevel', value: Object.entries(PowerLevels).find(l => l[1] == _cmd.config.minLevel)[0], inline: true},
                            {name: 'Options', value: options || 'N/A', inline: true}
                        )
                    
                    embeds.push(embed)
                    alreadysent.push(_cmd.config.name)  
                })

                if (embeds.length === 0) {
                    let embed = new EmbedBuilder()
                       .setTitle('No commands found')
                       .setDescription('There are no loaded commands.')
                       .setColor('Random')
                    embeds.push(embed);
                }

                pagination.setAuthorizedUsers([message.author.id])
                pagination.setEmbeds(embeds, (embed, index, array) => {
                    return embed.setFooter({ text: `Page: ${index + 1}/${array.length}` });
                });
                await pagination.render();
                break;
            }

            default: {
                const errormessage = await message.reply('Invalid action. Valid actions are `load`, `unload`, `reload`, and `list`.');
                await new Wait().wait(3000)
                message.delete();
                errormessage.delete();
                return;
            }   
        }
    }
}
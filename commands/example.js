const BaseCommand = require('../structures/BaseCommand'); // Import the BaseCommand class
const BaseCommandOptionType = require('../structures/BaseCommandOptionType'); // Import the BaseCommandOptionType class
const { Message } = require('discord.js');
const PowerLevels = require('../structures/PowerLevels.js');


module.exports = class ExampleCommand extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'Example', // Name of the command, it is fundamental to be unique because the user will use it to run the command
            description: 'Just an example command.', // Description of the command
            enabled: true, // If the command is enabled,
            usage: '?example <args1> <args2>', // Usage of the command
            cooldown: 0, // Cooldown of the command (working on it)
            minLevel: PowerLevels.STAFF, // Minimum level required to run the command
            guildOnly: false, // If the command is only for guilds
            alts: ['ex'], // Aliases for the command
            options: [
                {
                    name: 'arg1',
                    type: BaseCommandOptionType.BOOLEAN, // Everything different to "true" will be parsed as false
                    description: 'First argument.',
                    required: true
                },
                {
                    name: 'arg2',
                    type: BaseCommandOptionType.CHANNEL, // The user will have to tag it in format <#channel_id>
                    description: 'Second argument.',
                    required: true
                },
                {
                    name: 'arg3',
                    type: BaseCommandOptionType.INTEGER, // The user will have to put a number
                    description: 'Third argument.',
                    required: true
                },
                {
                    name: 'arg4',
                    type: BaseCommandOptionType.MEMBER, // The user will have to tag it in format <@member_id>
                    description: 'Fourth argument.',
                    required: true
                },
                {
                    name: 'arg5',
                    type: BaseCommandOptionType.ROLE, // The user will have to tag it in format <@&role_id>
                    description: 'Fifth argument.',
                    required: true
                },
                {
                    name: 'arg6',
                    type: BaseCommandOptionType.STRING,
                    description: 'Sixth argument.',
                    required: true
                },
                {
                    name: 'arg7',
                    type: BaseCommandOptionType.USER, // The user will have to tag it in format <@user_id>
                    description: 'Seventh argument.',
                    required: true
                },
            ],
            customHandling: true // If you want to handle the commandCreate yourself
        }),
        this.client = client;
    }

    /**
     * @param {import('../index.js')} client 
     * @param {Message} message
     * @param {Object} args
     */
    async run(client, message, args) { // The main function of the command
        message.reply(`Args: ${Object.values(args).join(', ')}`);
    }

    /**
     * @param {BotClient} client
     * @param {Discord.Message} message
     */
    async commandCreate(client, message) { // Custom handling of the commandCreate
        let args = message.content.split(' ').slice(1).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
        
        return this.run(client, message, args);
    }

}
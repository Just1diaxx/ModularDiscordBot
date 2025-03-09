# ModularBot
Discord Modular Bot with Custom Module support.
## Installation
1. Clone or download the repository
2. Run `npm install` on the repo's folder
3. Rename `.env.example` in `.env`
4. Replace `YourBotToken` with your bot's token in `.env` file
5. Change the settings in `config.js` file
6. Try the bot by executing `node index.js` in the repo's folder
If you have troubles just open an issue or join my Discord server https://discord.gg/SJgMCrd

## Making a Module
Modules are stored in modules/ directory and are loaded into the bot on startup. Enabled modules are executed when they get triggered by respective events.
```js
const Module = require("../structures/Module.js"); // Import the base module

module.exports = class Example extends Module {
    constructor(client) {
        super(client, {
            name: "Example", // Name of the module
            info: "Description", // Description of the module
            enabled: true, // Defines if this module should be enabled on startup
            events: ["ready"], // Event that triggeres the module (can be more than one)
            config: { // Default module configuration, it will be stored in a config.yml inside module directory
                myOptions: {
                    configurableString: "Hey!",
                    configurableList: ["This", "is", "crazy!"]
                }
            },
            settings: { // Default module settings. Can be modified per-guild with the /settings command
                myDouble: 10.1,
                myList: ["Hello", "world!"],
                myString: "Hi!"
            }
        })
    }

    async ready(client, ...args) { // args are the arguments of Discord.js Events (es. for presenceUpdate you would have [oldPresence, newPresence]
        this.logger.log("Hi!")
    }
}
```

## Making a BaseCommand
Remember when there wasn't the Slash Commands? So, because I'm a little too much nostalgic, i recreated them (stored in /commands)

```js
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
```

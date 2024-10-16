const BotClient = require("../..");
const Command = require("../../structures/Command.js");

module.exports = class UpdateCommand extends Command {
    constructor(client, module) {
        super(client, module, {
            name: "update",
            description: "Pulls commits from git and reboots the bot",
            cooldown: 3,
            requiredFlag: ["OWNER"]
        })
    }

    /**
     * @param {BotClient} client
     */
    async run(client, interaction, args) {
        const [exec] = client.moduleManager.getCommand("exec");
        if (!exec)
            return interaction.reply("Unknown command `exec`, aborting.");

        await exec.run(client, interaction, { code: "git pull --no-rebase" });

        const [reboot] = client.moduleManager.getCommand("reboot");
        if (!reboot)
            return interaction.reply("Unknown command `reboot`, aborting.");

        await reboot.run(client, interaction, {});
    }
}
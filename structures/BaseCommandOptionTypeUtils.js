const { User, BaseChannel, Role, Guild, GuildMember } = require("discord.js")
const BotClient = require("..")

module.exports = class BaseCommandOptionTypeUtils {
    async toInteger(value){
        return parseInt(value)
    }

    async toBoolean(value){
        return value.toLowerCase() === "true"
    }
    
    /**
     * 
     * @param {BotClient} client 
     * @param {String} value 
     * @returns {User}
     */
    async toUser(client, value){
        const _user = value.replace(/[<@!>]/g, "")
        return client.users.cache.get(_user) || await client.users.fetch(_user)
    }

    /**
     * 
     * @param {BotClient} client 
     * @param {String} value 
     * @returns {BaseChannel}
     */
    async toChannel(client, value){
        const _channel = value.replace(/[<#>]/g, "")
        return client.channels.cache.get(_channel) || await client.channels.fetch(_channel)
    }

    /**
     * 
     * @param {BotClient} client 
     * @param {String} value 
     * @param {Guild} guild 
     * @returns {Role}
     */
    async toRole(client, guild, value) {
        const _role = value.replace(/[<@&>]/g, "")
        return guild.roles.cache.get(_role) || await guild.roles.fetch(_role)
    }

     /**
     * 
     * @param {BotClient} client 
     * @param {String} value 
     * @param {Guild} guild 
     * @returns {GuildMember}
     */
    async toMember(client, guild, value){
        const _member = value.replace(/[<@!>]/g, "")
        return guild.members.cache.get(_member) || await guild.members.fetch(_member)
    }
}
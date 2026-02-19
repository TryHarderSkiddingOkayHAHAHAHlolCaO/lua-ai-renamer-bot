const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Upload a Lua file to have its variables renamed by AI')
        .addAttachmentOption(option => 
            option.setName('file')
                .setDescription('The .lua file to rename')
                .setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully registered /rename command!');
    } catch (error) {
        console.error('Error:', error);
    }
})();

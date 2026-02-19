const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const OpenAI = require('openai');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'rename') {
        const file = interaction.options.getAttachment('file');

        if (!file.name.endsWith('.lua')) {
            return interaction.reply({ content: "❌ Please upload a valid `.lua` file.", ephemeral: true });
        }

        await interaction.deferReply();

        try {
            // Download file content
            const response = await axios.get(file.url);
            const originalCode = response.data;

            // AI Processing
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { 
                        role: "system", 
                        content: "You are a Lua expert. Rename all obfuscated/cryptic variables and functions to descriptive names. Keep logic identical. Return ONLY the code, no markdown backticks." 
                    },
                    { role: "user", content: String(originalCode) }
                ],
            });

            const renamedCode = completion.choices[0].message.content;
            
            // Create the output file
            const buffer = Buffer.from(renamedCode, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `renamed_${file.name}` });

            await interaction.editReply({
                content: "✅ Here is your renamed script:",
                files: [attachment]
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply("❌ Failed to process. The script might be too large for the AI context.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

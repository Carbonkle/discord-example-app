import { Client, Events, GatewayIntentBits, REST, Routes, Collection } from 'discord.js';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import 'dotenv/config';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error('Missing DISCORD_TOKEN or CLIENT_ID in environment variables.');
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

async function loadCommands() {
    const commands = [];
    for (const folder of commandFolders) {
        const commandsPath = join(foldersPath, folder);
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            const command = await import(`file://${filePath}`);
            if (command.default?.data && command.default?.execute) {
                commands.push(command.default.data.toJSON());
                client.commands.set(command.default.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    return commands;
}

async function registerCommands() {
    try {
        console.log('Registering slash commands...');
        const commands = await loadCommands();
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        const test = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(test)
        console.log('Slash commands registered successfully.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    await registerCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
    console.log('test');
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.default.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
});

client.login(TOKEN);

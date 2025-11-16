const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  // updated to Discord helper SlashCommandBuilder for future compatibility
  new SlashCommandBuilder()
    .setName('teamstats')
    .setDescription('Get stats for an FTC team')
    .addStringOption(opt =>
      opt.setName('team')
         .setDescription('Type the name or number of team to get stats. REQUIRED.')
         .setRequired(true))
    .addStringOption(opt =>
      opt.setName('region')
         .setDescription('Type "global" or a state to see global/state stats. Defaults to "global"')
         .setRequired(false))
    .addStringOption(opt =>
      opt.setName('year')
         .setDescription('Type year of the stats you want to see. Defaults to the latest year.')
         .setRequired(false))
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (global) commands.');

    // For quick testing, register to a single guild (instant update):
    // await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });

    // For global registration (can take up to an hour to propagate):
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (global) commands.');
  } catch (error) {
    console.error(error);
  }
})();

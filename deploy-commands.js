const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'teamstats', // Command name
    description: 'Get stats for an FTC team', // Command description
    options: [
      {
        name: 'team', // Name of the argument
        type: 3, // Type 3 is a string
        description: 'Type the name or number of team to get stats', // Description of the argument
        required: true, // Makes this argument mandatory
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (global) commands.');

    // Register global commands
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (global) commands.');
  } catch (error) {
    console.error(error);
  }
})();

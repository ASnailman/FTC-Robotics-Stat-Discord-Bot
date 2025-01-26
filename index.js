require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js'); //Defines what events your bot listens to
const axios = require('axios'); //HTTP Library that sends requests to external websites, in this case FTC Stats
const cheerio = require('cheerio'); //Libary to parse and query HTML, scrapes FTC stats page

// Debug line to verify the token
console.log('DISCORD_TOKEN:', process.env.DISCORD_TOKEN);

//instance of discord bot
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const token = process.env.DISCORD_TOKEN;

//runs when bot is ready
client.once('ready', () => {
    console.log('Bot is online!');
});

client.login(token);

//triggered when message sent in the server
client.on('messageCreate', async (message) => {
    console.log(`Message received: ${message.content}`); // Log the received message
  
    if (message.author.bot) return; // Ignore messages sent by bots
    console.log(`Command check passed: ${message.content.startsWith('/teamstats')}`);
  
    if (message.content.startsWith('/teamstats')) {
      const args = message.content.split(' ');
      const teamName = args.slice(1).join(' ');
      console.log(`Extracted team name: ${teamName}`);
  
      if (!teamName) {
        message.reply('Please specify a team name. Usage: `/teamstats [team name]`');
        return;
      }
  
      try {
        const stats = await fetchTeamStats(teamName);
        console.log(`Fetched stats: ${stats}`);
        message.reply(stats);
      } catch (error) {
        console.error('Error fetching team stats:', error);
        message.reply('An error occurred while fetching team stats.');
      }
    }
  });
  

// funtion for fetching team stats
async function fetchTeamStats(teamName) {
    const url = 'http://www.ftcstats.org/2025/illinois.html';

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let stats = 'Team not found.';
        $('tr.trow').each((i, row) => {
            // Extract the team name
            const team = $(row).find('td#teamname abbr').text().trim();

            // Extract the team number
            const teamNumber = $(row).find('td[id^="team"] a').text().trim(); //CSS attribute selector, ^= is startswith, selects id starting with "team"

            // Extract the record (wins, losses, ties)
            // const record = $(row).find('td[sorttable_customkey]').text().trim();
            // const [wins, losses, ties] = record.split(' &#8209; ');

            // Match the user-provided team name with the scraped name
            if (team.toLowerCase() === teamName.toLowerCase()) {
                // stats = `**Team Number:** ${teamNumber}\n**Team Name:** ${team}\n**Wins:** ${wins}\n**Losses:** ${losses}\n**Ties:** ${ties}`;
                stats = `**Team Name: ** ${team}\n **Team Number: ** ${teamNumber}`;
            }
        });
        return stats;
    } catch (error) {
        console.error('Error fetching team stats:', error.message);
        throw new Error('Failed to fetch team stats.');
    }
}

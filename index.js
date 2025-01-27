require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js'); //Defines what events your bot listens to
const axios = require('axios'); //HTTP Library that sends requests to external websites, in this case FTC Stats
const cheerio = require('cheerio'); //Libary to parse and query HTML, scrapes FTC stats page

//instance of discord bot
// const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_TOKEN;

//runs when bot is ready
client.once('ready', () => {
    console.log('Bot is online!');
});

client.login(token);

//triggered when command sent in the server
client.on('interactionCreate', async (message) => {
    //console.log(`Message received: ${message.content}`); // Log the received message
  
    // if (message.author.bot) return; // Ignore messages sent by bots
    // console.log(`Command check passed: ${message.content.startsWith('/teamstats')}`);
    
    // if (message.content.startsWith('/teamstats')) {
      // const args = message.content.split(' ');
      // const teamName = args.slice(1).join(' ');
      // console.log(`Extracted team name: ${teamName}`);
  
      // if (!teamName) {
      //   message.reply('Please specify a team name. Usage: `/teamstats [team name]`');
      //   return;
      // }

    if (!message.isCommand()) return;
    const {commandName, options} = message;

    if (commandName == 'teamstats') {  
      const commandInput = options.getString('team'); //team argument from global slash command
      await message.deferReply(); // Defer reply if processing takes time

      try {
        const stats = await fetchTeamStats(commandInput);
        await message.editReply(stats); //replay with stats
        // console.log(`Fetched stats: ${stats}`);
        // message.reply(stats);
      } catch (error) {
        console.error('Error fetching team stats:', error);
        await message.editReply('An error occurred while fetching team stats.');
        // message.reply('An error occurred while fetching team stats.');
      }
    }
  });
  

// funtion for fetching team stats
async function fetchTeamStats(teamNameOrNumber) {
    const url = 'http://www.ftcstats.org/2025/index.html';

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let stats = 'Team not found.';
        const teamRow = $('tr.trow').filter((i, row) => {
          // const teamNumber = $(row).find('td[id^="team"] a').text().trim(); //CSS attribute selector, ^= is startswith, selects id starting with "team"
          const team = $(row).find('td#teamname abbr').text().trim();
          const teamNumber = $(row).find('td').eq(1).text().trim();
          return team.toLowerCase() === teamNameOrNumber.toLowerCase() || teamNumber === teamNameOrNumber;
        });

        if (teamRow.length) {
          // const team = teamRow.find('td#teamname abbr').text().trim();
          const team = teamRow.find('td').eq(2).text().trim();
          const teamNumber = teamRow.find('td').eq(1).text().trim();
          const currentRank = teamRow.find('td').eq(0).text().trim();
          const nonPenaltyOPR = teamRow.find('td').eq(3).text().trim();;
          const OPR = teamRow.find('td').eq(4).text().trim();;
          const avgScore = teamRow.find('td').eq(15).text().trim();;
          const bestScore = teamRow.find('td').eq(17).text().trim();

          //template literals preserve whitespace
          stats = `**Team Name:** ${team}\n**Team Number:** ${teamNumber}\n**Current Global Rank:** ${currentRank}\n**Non-Penalty OPR:** ${nonPenaltyOPR}\n**Offensive Power Ranking (OPR):** ${OPR}\n**Avg Score:** ${avgScore}\n**Best Score:** ${bestScore}`;
        }
        return stats;
    } catch (error) {
        console.error('Error fetching team stats:', error.message);
        throw new Error('Failed to fetch team stats.');
    }
}

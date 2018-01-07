const helpers = require("./command-helpers");

module.exports = function quest(questIndex, userID, bot, channelID, logger) {
  const quest = helpers.getRandomItem(questIndex);
  const questUrlPath = quest.replace(/\s/g, "-");
  const url = `http://hallofbeorn.com/Cards/Scenarios/${questUrlPath}`;
  bot.sendMessage({
    to: channelID,
    message:
      `<@${userID}> ` + "Here's a quest for you: " + `**${quest}**\n${url}`
  });
}

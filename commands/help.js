module.exports = function help(channel) {
  channel.send(
    "**BeornBot** - Lord of the Rings: The Card Game - Bear Bot 3.9.15 (2025-07-15)\n\n" +
      "List of Commands:\n" +
      "!help - This help message\n" +
      "!hob <query> - Find and display card text from Hall of Beorn\n" +
      "!hob+ <query> - Find and display card text from Hall of Beorn (including unofficial)\n" +
      "!hobimg <query> - Find and display card image from Hall of Beorn\n" +
      "!hobimg+ <query> - Find and display card image from Hall of Beorn (including unofficial)\n" +
      "!quest - Select a random quest\n" +
      "!hero - Select a random hero\n" +
      "!hero+ - Select a random hero (including unofficial)\n" +
      "!card - Select a random player card\n" +
      "!card+ - Select a random player card (including unofficial)\n" +
      "!blog <query> - Find community blog links related to the query\n" +
      "!podcast <query> - Find community podcast links related to the query\n" +
      "!video <query> - Find community video links related to the query\n" +
      "!faq <text> - Finds questions in FAQ containing <text>\n" +
      "!glossary <text> - Finds questions in Glossary containing <text>\n" +
      "!errata <cardname> - Finds errata for card with name <cardname>\n" +
      "!myrings - Display your links from RingsDB\n\n" +
      "**It was a good story, that of yours, but I like it still better now I am sure it is true.**\n" +
      "**Special thanks to Hone for his help with hosting BeornBot!**\n" +
      "**Patreon support welcome: https://www.patreon.com/Beorn **\n"
  );
};

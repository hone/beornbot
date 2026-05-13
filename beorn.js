const fetch = require("node-fetch");
const Discord = require("discord.js");
const Winston = require("winston");
const getCommandList = require("./commands");
const cardOfTheDay = require("./commands/cardOfTheDay.js");

const logger = Winston.createLogger({
  level: "debug",
  format: Winston.format.json(),
  transports: [new Winston.transports.Console()],
});

function getCardIndex() {
  var json = require('./data/Cards.json');
  return json;
}

function getQuestIndex() {
    var json = require('./data/Quests.json');
    return json;
}

function getScenarioIndex() {
    var json = require('./data/Scenarios.json');
    return json;
}

function getBlogIndex() {
    var json = require('./data/Blogs.json');
    return json;
}

function getPodcastIndex() {
    var json = require('./data/Podcasts.json');
    return json;
}

function getVideoIndex() {
    var json = require('./data/Videos.json');
    return json;
}

/**
 * QC format =
 * {
 *   quests: {
 *      cycle: {
 *        @attributes: {
 *          name
 *        },
 *        url,
 *        hoburl
 *      }
 *    }
 * }
 *
 * This function extracts the name, QC url and hall of beorn url.
 */
/*
async function getQCData() {
    logger.info("Retrieving data from QC");
    return []; //NOTE: This is temporary while QC is down
  try {
    return fetch(
      "http://lotr-lcg-quest-companion.gamersdungeon.net/api.php?format=json&parse=discord"
    ).then((res) => res.json());
  } catch (err) {
    logger.error(err);
    return [];
  }
}*/

function getNameAndFilters(args) {
  return args.reduce(
    (acc, arg) => {
      if (arg.indexOf(":") > -1) {
        const [filterKey, value] = arg.split(":");
        return {
          ...acc,
          filters: [...acc.filters, { filterKey, value }],
        };
      }
      const name = arg
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
      return {
        ...acc,
        name: `${acc.name} ${name}`.trim(),
      };
    },
    {
      name: "",
      filters: [],
    }
  );
}

function parseQCData(qcData) {
  const {
    quests: { cycle },
    faq: { entry: faqEntries },
    glossary: { entry: glossaryEntries },
    carderratas: { card: cardErratas },
  } = qcData;

  const scenarios = cycle.reduce((acc, { quest }) => {
    if (quest) {
      return [
        ...acc,
        ...(Array.isArray(quest)
          ? quest.map(({ "@attributes": { name }, url, hoburl }) => ({
              name,
              url,
              hoburl,
            }))
          : [
              {
                name: quest["@attributes"].name,
                url: quest.url,
                hoburl: quest.hoburl,
              },
            ]),
      ];
    }
    return acc;
  }, []);
  const faq = faqEntries.map(({ "@attributes": { title, id }, ruletext }) => ({
    title,
    id,
    ruletext,
  }));
  const glossary = glossaryEntries.map(
    ({ "@attributes": { title, id }, ruletext }) => ({
      title,
      id,
      ruletext,
    })
  );
  const erratas = cardErratas.map(
    ({ "@attributes": { title, id }, ruling, qa, errata }) => ({
      title,
      id,
      ruling,
      qa,
      errata,
    })
  );
  return {
    scenarios,
    faq,
    glossary,
    erratas,
  };
}

function parseQuestData(questData) {
    return {
        scenarios: questData,
        faq: {},
        glossary: {},
        erratas: {},
    };
}

// Initialize Discord Bot
Promise.all([getCardIndex(), getBlogIndex(), getPodcastIndex(), getVideoIndex(), getScenarioIndex()])
  .then(([cardList, blogList, podcastList, videoList, questList]) => {
      return [cardList, blogList, podcastList, videoList, parseQCData(questList)];
  })
  .then(([cardList, blogList, podcastList, videoList, { scenarios, ...rulesRef }]) => {
    const bot = new Discord.Client();
    const emojiNames = [
      "lore",
      "spirit",
      "leadership",
      "tactics",
      "neutral",
      "fellowship",
      "baggins",
      "attack",
      "defense",
      "willpower",
      "threat",
      "hitpoints",
      "attackblack",
      "defenseblack",
      "willpowerblack",
      "threatblack",
      "hitpointsblack",
    ];
    let emojiSymbols;

    const DAY_MILLIS = 86400000;

    function millisUntilCutoff() {
      let now = new Date();
      let millis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0, 0, 0) - now;
      if (millis < 0) millis += DAY_MILLIS;
      return millis;
    }

    bot.once("ready", (evt) => {
      logger.info("Connected");
      logger.info("Logged in as: ");
      logger.info(bot.user.username + " - (" + bot.user.tag + ")");
      emojiSymbols = bot.emojis.cache.reduce((acc, emoji) => {
        if (
          emoji.guild.name === "COTR" &&
          emojiNames.indexOf(emoji.name) > -1
        ) {
          return {
            ...acc,
            [emoji.name]: emoji,
          };
        }
        return acc;
      }, {});

      setTimeout(function() {
          cardOfTheDay(cardList, emojiSymbols, logger, bot);
          setInterval(function() {
            cardOfTheDay(cardList, emojiSymbols, logger, bot);
          }, DAY_MILLIS);
      }, millisUntilCutoff());
    });

    bot.on("message", ({ author, content, channel }) => {

      if (content && content.toLowerCase().includes('access to the marketplace'))
      {
        channel.send({
          files: ['https://hallofbeorn-resources.s3.us-east-1.amazonaws.com/Images/LotR/Community/Beorn/BeornBot/you_shall_not_pass.jpg']
        });
        return;
      }

      // Our bot needs to know if it will execute a command
      // It will listen for messages that will start with `!`
      if (content.startsWith("!")) {
        let args = content.substring(1).split(" ");
        const cmd = args[0];

        args = args.splice(1);

        filterUnofficial = !cmd.endsWith('+');

        const query = getNameAndFilters(args);
        const commandConfig = {
          author,
          cardList,
          blogList,
          podcastList,
          videoList,
          scenarios,
          rulesRef,
          emojiSymbols,
          bot,
          channel,
          logger,
          filterUnofficial,
        };
        const commands = getCommandList(commandConfig);
        switch (cmd) {
          case "help":
            return commands.help();
          case "rings":
          case "hob":
          case "hob+":
            return commands.rings(query);
          case "ringsimg":
          case "hobimg":
          case "hobimg+":
            return commands.ringsimg(query);
          case "quest":
          case "quest+":
              return commands.quest();
              //channel.send("this feature is disabled while the LotR Quest Companion is offline");
              //return null;
          case "hero":
          case "hero+":
            return commands.hero(query);
          case "card":
          case "card+":
              return commands.card(query);
          case "day":
              return cardOfTheDay(cardList, emojiSymbols, logger, bot);
          case "blog":
              return commands.blog(query);
          case "podcast":
              return commands.podcast(query);
          case "video":
              return commands.video(query);
          case "faq":
              return commands.rr({
                ...query,
                type: "faq",
              });
              //channel.send("this feature is disabled while the LotR Quest Companion is offline");
              //return null;
          case "glossary":
              return commands.rr({
                ...query,
                type: "glossary",
              });
              //channel.send("this feature is disabled while the LotR Quest Companion is offline");
              //return null;
          case "errata":
              return commands.rr({
                ...query,
                type: "errata",
              });
              //channel.send("this feature is disabled while the LotR Quest Companion is offline");
              //return null;
          case "myrings":
            return commands.myrings();
          default:
            return null;
        }
      }
    });

    bot.on("error", (e) => console.error(e));
    bot.on("warn", (e) => console.warn(e));
    bot.on("debug", (e) => console.debug(e));

    bot.login(process.env.DISCORD_TOKEN);
  })
  .catch((err) => {
    logger.error(`Error getting indexes: ${err}`);
    logger.error(err.stack);
  });

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught exception: ${err}`);
  logger.error(err.stack);
  process.exit(1);
});

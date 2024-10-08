const help = require("./help");
const rings = require("./rings");
const ringsimg = require("./ringsimg");
const quest = require("./quest");
const hero = require("./hero");
const card = require("./card");
const rr = require("./rulesRef");
const myrings = require("./myrings");
const blog = require("./blog");
const podcast = require("./podcast");
const video = require("./video");

module.exports = function({
  author,
  cardList,
  blogList,
  podcastList,
  videoList,
  scenarios,
  rulesRef,
  emojiSymbols,
  channel,
  logger,
  filterUnofficial,
}) {
  return {
    help: () => help(channel),
    rings: query =>
      rings(query, cardList, emojiSymbols, channel, author, logger, filterUnofficial),
    ringsimg: query => ringsimg(query, cardList, emojiSymbols, channel, author, logger, filterUnofficial),
    quest: () => quest(scenarios, author, channel, logger),
    hero: query => hero(query, cardList, emojiSymbols, channel, logger, filterUnofficial),
    card: query => card(query, cardList, emojiSymbols, channel, logger, filterUnofficial),
    rr: query => rr(query, rulesRef, emojiSymbols, channel, author, logger),
    myrings: () => myrings(author, channel, logger),
    blog: query => blog(query, blogList, emojiSymbols, channel, author, logger, filterUnofficial),
    podcast: query => podcast(query, podcastList, emojiSymbols, channel, author, logger, filterUnofficial),
    video: query => video(query, videoList, emojiSymbols, channel, author, logger, filterUnofficial),
  };
};

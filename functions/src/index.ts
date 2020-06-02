/* API response.data is an array of objects - in JSON object format
  [l1_text] is in GERMAN
  [l2_text] is in ENG
  [wortart] is wordclass NOMEN, ADJ, VERB, ADVERB or {wordclass}
  [synonyme1] is in ENG
  [synonyme2] is in GERMAN
*/
import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

// Bot variables
const BOT_COMMANDS = {
  start : '/start',
  help : '/help',
  about : '/about',
  toen : '/toen',
  tode : '/tode',
}
let BOT_HELP = "\n<b>Meine Deutschlehrerin</b> || <b>My German Teacher</b>\n";
BOT_HELP += "Version 1.2 supports verbs, nouns, adverbs, adjectives.\n";
BOT_HELP += "***** Special feature - synonyms available to broaden your German vocabulary!\n";
BOT_HELP += "\nTry some commands:\n";
BOT_HELP += "/help - shows command list \n";
BOT_HELP += "/about - about bot creation \n";
BOT_HELP += "/tode walk - translates walk to DE(German) \n";
BOT_HELP += "/toen verdienen - translates verdienen to EN(English) \n";

let BOT_ABOUT = "\n<b>Meine Deutschlehrerin</b> || <b>My German Teacher</b>\n";
BOT_ABOUT += "There are 3 genders in the German Language.\n";
BOT_ABOUT += "Every noun in German is assigned one of 3 genders: masculine, feminine or neuter.\n";
BOT_ABOUT += "Some of the genders are obvious, such as the word for 'woman' is feminine (die Frau), the word for 'man' is masculine (der Mann).\n";
BOT_ABOUT += "Since the creator @leerachel is female, the bot is naturally named in the feminine term of a teacher <i>Lehrer</i> as <i>Lehrerin</i>\n";
BOT_ABOUT += "Likewise, refering to your male teacher would be - <b>Mein Deutschlehrer</b>\n";

// Routing
const axios = require('axios');
const app = express()
app.use(cors({ origin: true })) // Automatically allow cross-origin request

// Functions
function getTranslationDirection(toWhichLanguage) {
  var obj = {
    botReplyHeading : " ",
    toJSONField_wordclass : " ",
    toJSONField_translation : " ",
    toJSONField_synonym : " ",
    toDestLanguage : " ",
  }
  switch (toWhichLanguage)
  {
    case "en-de":
      obj.botReplyHeading = 'ENG-DEU';
      obj.toJSONField_wordclass = 'wortart'; // Word to translation - possible word classes
      obj.toJSONField_translation = 'l1_text'; // Translated Version
      obj.toJSONField_synonym = 'synonyme2'; // Translated Version - synonyms
      obj.toDestLanguage = 'German';
      break;
    case "de-en":
      obj.botReplyHeading = 'DEU-ENG';
      obj.toJSONField_wordclass = 'wortart'; // Word to translation - possible word classes
      obj.toJSONField_translation = 'l2_text'; // Translated Version
      obj.toJSONField_synonym = 'synonyme1'; // Translated Version - synonyms
      obj.toDestLanguage = 'English';
      break;
    default:
      break;
  }
  return obj;
}

async function getTranslationFromAPI(wordToTranslate, wordclass, toWhichLanguage) {
  const directionObj = getTranslationDirection(toWhichLanguage);
  let replyFromBot = `No translation found. Try another word or press /help for more info.`;
  await axios.get('https://petapro-translate-v1.p.rapidapi.com/', {
    "headers": {
      "content-type":"application/json",
      "x-rapidapi-host":"petapro-translate-v1.p.rapidapi.com",
      "x-rapidapi-key":RAPID_API_KEY,
      "useQueryString":true
    },
    "params": {
      "langpair":toWhichLanguage, // en-de or de-en
      "query":wordToTranslate,
      "wortart":wordclass // NOMEN, ADJ, VERB, ADVERB or {wordclass}
    }
  })
  .then(function (response) {
    const data = response.data;
    for (let i=0; i<data.length; i++) {
      if (i===0) { replyFromBot = `${directionObj.botReplyHeading} Translation: <b>${wordToTranslate.toLowerCase()}</b>\n`; }
      const translatedVersion = data[i][directionObj.toJSONField_translation];
      const possibleWordClasses = data[i][directionObj.toJSONField_wordclass];
      const translatedVersion_synonym = data[i][directionObj.toJSONField_synonym];
      replyFromBot += `--- <b>${translatedVersion}</b> <i>(${possibleWordClasses.toLowerCase()})</i>\n`;
      replyFromBot += `>>>>>> synonym(s): <i>${translatedVersion_synonym}</i>\n`;
      replyFromBot += `\n`;
    }
  })
  .catch(function (error) {
    replyFromBot = `Bot error in translating to ${directionObj.toDestLanguage}! Please reflect to my creator @leerachel. Thank you for your help!`;
  });
  return replyFromBot;
}

// our single entry point for every message
app.post('/', async (req, res) => {
  const isTelegramMessage = req.body
                          && req.body.message
                          && req.body.message.chat
                          && req.body.message.chat.id
                          && req.body.message.from
                          && req.body.message.from.first_name

  if (isTelegramMessage) {
    const chat_id = req.body.message.chat.id
    const { first_name } = req.body.message.from
    const text = req.body.message.text 
    const textArr = text.split(' '); // separate user's message by spacing

    let replyFromBot = `Entschuldigung ${first_name}!\n`;

    // When user first enters /start
    if (textArr.length === 1 && textArr[0] === BOT_COMMANDS.start) 
    {
      replyFromBot = `<i>Liebe ${first_name}</i>\n`;
      replyFromBot += `Willkommen in Ihrer Deutschklasse\n`;
      replyFromBot += `Let's start by translating <b>love</b> to German(de): enter <b>/tode love</b>\n`;
      replyFromBot += `You can double check by translating <b>lieben</b> to English(en): enter <b>/toen lieben</b>\n`;
      replyFromBot += `Class is dismissed!\n`;
    }

    // Case 1: Not a registered command
    if (textArr.length !== 0 && typeof BOT_COMMANDS[textArr[0].substring(1,textArr[0].length)] === 'undefined') 
    {
      replyFromBot = `Ich würde gerne plaudern, aber ich bin ein Roboter...\n`;
      replyFromBot += `(I would love to chat, but I am a robot...)\n`;
      replyFromBot += `Oops, press <b>/help</b> for command list.`;
    }

    // Case 2: help command, or about command, or translation command but missing keyword
    else if (textArr.length === 1)
    {
      if (textArr[0] === BOT_COMMANDS.tode || textArr[0] === BOT_COMMANDS.toen) {
        replyFromBot = `Missing keyword to translate. Please re-enter command and a word to translate.`
      }
      else if (textArr[0] === BOT_COMMANDS.help) {
        replyFromBot = `Brauchen Sie Hilfe? || Need help?\n`;
        //const myCommands = res.status(100).send({ method: 'getMyCommands' }); // Returns Array of BotCommand
        replyFromBot += BOT_HELP;
      }
      else if (textArr[0] === BOT_COMMANDS.about) {
        replyFromBot = `A Telegram Bot created by @leerachel, for fun...\n`;
        replyFromBot += "（*´▽`*)";
        replyFromBot += BOT_ABOUT;
      }
    }

    // Case 3: User entered translation commands correctly
    else if (textArr.length === 2) 
    {
      if (textArr[0] === BOT_COMMANDS.tode) {
        await getTranslationFromAPI(textArr[1], "{wordclass}", "en-de").then(res_DE => {
          replyFromBot = res_DE;
        })
      }
      else if (textArr[0] === BOT_COMMANDS.toen) {
        await getTranslationFromAPI(textArr[1], "{wordclass}", "de-en").then(res_EN => {
          replyFromBot = res_EN;
        })
      }
    }

    // finally send reply to user
    return res.status(200).send({
      method: 'sendMessage',
      chat_id,
      text: replyFromBot,
      parse_mode: 'HTML'
    })
  }
  return res.status(200).send({ status: "not a telegram message" })
})
// this is the only function it will be published in firebase
export const router = functions.https.onRequest(app)

/* API response.data is an array of objects - in JSON object format
  [l1_text] is in GERMAN
  [l2_text] is in ENG
  [wortart] is wordclass NOMEN, ADJ, VERB, ADVERB
  [synonyme1] is in ENG
  [synonyme2] is in GERMAN
*/
import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

// Bot variables
const BOT_COMMANDS = {
  help : '/help',
  about : '/about',
  toEN : '/toen',
  toDE : '/tode',
}

// Routing
const axios = require('axios');
const app = express()
app.use(cors({ origin: true })) // Automatically allow cross-origin request

// Functions
function getTranslationDirection(toWhichLanguage) {
  var obj = {
    botReplyHeading : " ",
    toJSONField : " ",
    toDestLanguage : " ",
  }
  switch (toWhichLanguage)
  {
    case "en-de":
      obj.botReplyHeading = 'ENG-DEU';
      obj.toJSONField = 'l1_text'; // Translated Version
      obj.toDestLanguage = 'German';
      break;
    case "de-en":
      obj.botReplyHeading = 'DEU-ENG';
      obj.toJSONField = 'l2_text'; // Translated Version
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
      "wortart":wordclass // NOMEN, ADJ, VERB, ADVERB
    }
  })
  .then(function (response) {
    const data = response.data;
    for (let i=0; i<data.length; i++) {
      if (i===0) { replyFromBot = `${directionObj.botReplyHeading} Translation: <b><i>${wordToTranslate.toLowerCase()} (${wordclass.toLowerCase()})</i></b>\n`; }
      const translatedVersion = data[i][directionObj.toJSONField];
      replyFromBot += `--- <b>${translatedVersion}</b>\n`;
    }
  })
  .catch(function (error) {
    replyFromBot = `Bot error in translating to ${directionObj.toDestLanguage}! Please reflect to my creater @leerachel. Thank you for your help!`;
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

    // Case 1: Not a registered command
    if (textArr.length !== 0 && typeof BOT_COMMANDS[textArr[0].substring(1,textArr[0].length)] === undefined) 
    {
      replyFromBot = `Ich würde gerne plaudern, aber ich bin ein Roboter...\n`;
      replyFromBot += `Oops, not a registered command. Press <b>/help</b> for command list.`;
    }

    // Case 2: help command, or about command, or translation command but missing keyword
    else if (textArr.length === 1)
    {
      if (textArr[0] === BOT_COMMANDS.toDE || textArr[0] === BOT_COMMANDS.toEN) {
        replyFromBot = `Missing keyword to translate. Please re-enter command and a word to translate.`
      }
      else if (textArr[0] === BOT_COMMANDS.help) {
        replyFromBot = `Brauchen Sie Hilfe? || Need help?\n`;
        //const myCommands = res.status(100).send({ method: 'getMyCommands' }); // Returns Array of BotCommand
        //replyFromBot += myCommands;
      }
      else if (textArr[0] === BOT_COMMANDS.about) {
        replyFromBot = `A Telegram Bot created by @leerachel, for fun...\n`;
        replyFromBot += "（*´▽`*)";
      }
    }

    // Case 3: User entered translation commands correctly
    else if (textArr.length === 2) 
    {
      if (textArr[0] === BOT_COMMANDS.toDE) {
        await getTranslationFromAPI(textArr[1], "VERB", "en-de").then(res_DE => {
          replyFromBot = res_DE;
        })
      }
      else if (textArr[0] === BOT_COMMANDS.toEN) {
        await getTranslationFromAPI(textArr[1], "VERB", "de-en").then(res_EN => {
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

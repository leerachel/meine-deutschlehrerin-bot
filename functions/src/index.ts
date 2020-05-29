import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

const axios = require('axios');
//const parser = require('./parser.js');

// give us the possibility of manage request properly
const app = express()

// Automatically allow cross-origin requests
app.use(cors({ origin: true }))

// our single entry point for every message
app.post('/', async (req, res) => {
  /*
    You can put the logic you want here
    the message receive will be in this
    https://core.telegram.org/bots/api#update
    Translation 'eng' - English, 'deu' - German.
    https://glosbe.com/gapi/translate?from=pol&dest=eng&format=json&phrase=witaj&pretty=true:[https://glosbe.com/gapi/translate?from=pol&dest=eng&format=json&phrase=witaj&pretty=true]
  */
  const isTelegramMessage = req.body
                          && req.body.message
                          && req.body.message.chat
                          && req.body.message.chat.id
                          && req.body.message.from
                          && req.body.message.from.first_name

  const isBotCommand = (req.body.message.entities[0].type === "bot_command") ? true : false

  if (isTelegramMessage && isBotCommand) {
    const chat_id = req.body.message.chat.id
    const { first_name } = req.body.message.from
    const text = req.body.message.text 
    const textArr = text.split(' '); // "/word hello"
    //let replyFromBot = `no reply`;

    if (textArr[0] === "/word") // user entered "/word"
    {
      axios.get('https://petapro-translate-v1.p.rapidapi.com/', {
        headers: {
          "content-type":"application/octet-stream",
          "x-rapidapi-host":"petapro-translate-v1.p.rapidapi.com",
          "x-rapidapi-key":"99fd5a3572mshff34da0f02a03bbp1adf6bjsn2a7955889a27",
          "useQueryString":true
        },
        params: {
          "langpair":"en-de",
          "query":"change",
          "wortart":"VERB"
        }
      })
      .then(response => {
        const parsedHtml = response.data.toString();
        return res.status(200).send({
          method: 'sendMessage',
          chat_id,
          text: parsedHtml,
          parse_mode: 'HTML'
        })
      })
      .catch(error => {
        //const errorText = error;
        return res.status(200).send({
          method: 'sendMessage',
          chat_id,
          text: `replyFromBot error`,
          parse_mode: 'HTML'
        })
      });
      /*
      return res.status(200).send({
        method: 'sendMessage',
        chat_id,
        text: replyFromBot,
        parse_mode: 'HTML'
      })*/
    }
    return res.status(200).send({
      method: 'sendMessage',
      chat_id,
      text: `Hello ${first_name} ${textArr[1]} `,
      parse_mode: 'HTML'
    })
  }

  return res.status(200).send({ status: 'not a telegram message' })
})
// this is the only function it will be published in firebase
export const router = functions.https.onRequest(app)

# meine-deutschlehrerin-bot
 
A Telegram bot to help learn German words.

Credits: 
- https://blog.soshace.com/building-a-telegram-bot-with-node-js/?fbclid=IwAR26w08TcAB-I8s1fEAUlpee6eSAIbOkvl8yrEghdUWnPYW6aZm-y9z_nRw
- https://medium.com/@pikilon/serverless-telegram-bot-with-firebase-d11d07579d8a

APIs used: 
- Telegram API @ https://core.telegram.org/api
- RapidAPI @ https://linguatools.org/language-apis/linguatools-translate-api/

Here’s a brief rundown of what each installed package actually helps us with:

- axios : is a promise-based Javascript library that enables us to perform HTTP requests in Node, we’ll use this library particularly to communicate with the Oxford Dictionary API from our Node application.

- express: makes it easy to build APIs and server-side applications with Node, providing useful features such as routing, middlewares, etc..

Version 1 Feature:
- Translates German<->English (verbs only, 1 word at a time)
- Commands: `/help` `/about` `/toen` (to English) `/tode` (to Deutsch)

Version 1.2 Feature:
- Translates German<->English (verbs nouns adverbs adjectives, 1 word at a time)
- Commands: `/start` `/help` `/about` `/toen` (to English) `/tode` (to Deutsch)
- Special feature - synonyms added (supplied together with translation)

Note: API Keys are hidden. Please supply your own keys.
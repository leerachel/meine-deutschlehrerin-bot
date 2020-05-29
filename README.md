# meine-deutschlehrerin-bot
 
A Telegram bot to help learn German words and their gender.

Credits: 
- https://blog.soshace.com/building-a-telegram-bot-with-node-js/?fbclid=IwAR26w08TcAB-I8s1fEAUlpee6eSAIbOkvl8yrEghdUWnPYW6aZm-y9z_nRw
- https://medium.com/@pikilon/serverless-telegram-bot-with-firebase-d11d07579d8a

Here’s a brief rundown of what each installed package actually helps us with:

- axios : is a promise-based Javascript library that enables us to perform HTTP requests in Node, we’ll use this library particularly to communicate with the Oxford Dictionary API from our Node application.

- node-telegram-bot-api : is a package that wraps around the official Telegram Bot API . It provides methods that help us to interact with the Bot API easily and makes developing our bot seamless.

- dotenv: This package loads environmental variables from a .env file into Node’s process.env object. It makes specified environmental variables available all through the application.

- body-parser: is used to parse incoming data from request bodies such as form data and attaches the parsed value to an object which can then be accessed by an express middleware.

- express: makes it easy to build APIs and server-side applications with Node, providing useful features such as routing, middlewares, etc..

Express is one of the web server frameworks of NodeJS which is widely used in many applications nowadays. It is designed for building web applications and APIs. Some of the features it provides includes :-

Allows to set up middlewares to respond to HTTP Requests. These middlewares work according to the sequence of implementation
Defines routing which is used to perform different actions based on HTTP Verbs and URLs.
Allows to dynamically render HTML Pages using templates.
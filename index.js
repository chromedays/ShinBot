const discord = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

const token = process.env.BOT_TOKEN;
const prefix = "!";

const client = new discord.Client();
let enableBaram = false;

client.once("ready", () => {
  console.log("Ready!");
  console.log(`Prefix is '${prefix}'`);
});

client.login(token);

client.on("message", (message) => {
  console.log(`Message received: ${message.content}`);
});

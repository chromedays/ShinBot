import * as discord from "discord.js";
import * as dotenv from "dotenv";
import ytdl from "ytdl-core";
import { cpus } from "os";

main();

function main() {
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

  let commands = new Map<
    string,
    (message: discord.Message, args: string[]) => void
  >();

  commands.set("ping", (message, args) => {
    message.channel.send("Pong!");
  });

  commands.set("play", (message, args) => {
    let url = args[0];
    if (url) {
      tryPlayYoutubeAudio(message, url);
    }
  });

  commands.set("stop", (message, args) => {
    dispatcher.end();
  });

  commands.set("leave", (message, args) => {
    if (message.member?.voice.channel) {
      message.member.voice.channel.join().then((connection) => {
        connection.disconnect();
      });
    }
  });

  let dispatcher: discord.StreamDispatcher;

  function tryPlayYoutubeAudio(message: discord.Message, url: string) {
    if (message.member?.voice.channel) {
      message.member.voice.channel.join().then((connection) => {
        dispatcher = connection.play(ytdl(url, { filter: "audioonly" }));
      });
    }
  }

  client.on("message", (message) => {
    if (message.author.bot) {
      return;
    }
    console.log(`Message received: ${message.content}`);

    if (message.content.startsWith(prefix)) {
      let args = message.content.slice(prefix.length).split(/ +/);
      let command = args.shift();
      if (command) {
        let callback = commands.get(command);
        if (callback) {
          console.log(`Executing command: ${command}`);
          console.log(`Arguments: ${args}`);
          callback(message, args);
        } else {
          console.log(`Unknown command: ${command}`);
        }
      }
    }
  });
}

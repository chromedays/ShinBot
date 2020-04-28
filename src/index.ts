import * as discord from "discord.js";
import * as dotenv from "dotenv";
import ytdl from "ytdl-core";

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

    message.channel.send(`Playing ${url}`);
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

  let customYoutubePlayCommands = new Map<string, string>();

  commands.set("register", (message, args) => {
    if (args.length > 1) {
      let keyword = args[0];
      let url = args[1];
      customYoutubePlayCommands.set(keyword, url);
      message.channel.send(`Now typing "${keyword}" will play ${url}`);
    }
  });

  commands.set("unregister", (message, args) => {
    if (args.length > 0) {
      let keyword = args[0];
      if (keyword === "all") {
        customYoutubePlayCommands.clear();
        message.channel.send("Unregistered all keywords");
      } else {
        customYoutubePlayCommands.delete(keyword);
        message.channel.send(`Deleted "${keyword}" keyword`);
      }
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

    let keywordToPlay: string | null = null;
    let urlToPlay: string | null = null;
    customYoutubePlayCommands.forEach((url, keyword) => {
      console.log(keyword);
      if (message.content.includes(keyword)) {
        keywordToPlay = keyword;
        urlToPlay = url;
      }
    });
    if (keywordToPlay && urlToPlay) {
      console.log(`${keywordToPlay} detected. Playing ${urlToPlay}`);
      tryPlayYoutubeAudio(message, urlToPlay);
    }

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

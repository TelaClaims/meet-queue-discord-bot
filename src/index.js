import { Client, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import { checkTime } from "./utils.js";

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Token required");
  process.exit(1);
}

const voiceChannelEntries = new Map();
let textChannelId = null;
let startHour = 12;
let startMinute = 0;

client.once(Events.ClientReady, () => {
  console.log("Bot is ready!");
});

client.on(Events.MessageCreate, (message) => {
  if (message.content === "/init") {
    textChannelId = message.channel.id;
    message.channel.send(
      `This channel is now set to register the order in which members join the meeting.`,
    );
  }

  if (message.content === "/order") {
    if (!textChannelId) {
      message.channel.send(
        "Notification channel not set. Use /init to set the channel.",
      );
      return;
    }

    const channelEntries = [...voiceChannelEntries.entries()];

    if (channelEntries.length === 0) {
      return message.channel.send("No users currently in voice channels.");
    }

    const channelData = channelEntries.map(([channelId, entries]) => {
      const channelName =
        client.channels.cache.get(channelId)?.name || "Unknown";
      const userList = entries.map((entry) => {
        const username =
          client.users.cache.get(entry.userId)?.username || "Unknown";

        const entryTime = entry.entryTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `${username} (Joined at ${entryTime})`;
      });

      return {
        channelId: channelId,
        channelName: channelName,
        userList: userList,
      };
    });

    const currentDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());

    const messageContent = channelData
      .map(({ channelName, userList }) => {
        if (userList.length === 0) {
          return `Channel: ${channelName}\nNo users currently in this channel.`;
        }
        const formattedUserList = userList.join("\n");
        return `Channel: ${channelName}\nOrder:\n${formattedUserList}`;
      })
      .join("\n\n");

    message.channel.send(
      `**Voice Channel User Order on ${currentDate}:**\n${messageContent}`,
    );
  }

  if (message.content.startsWith("/set-meet-time")) {
    const args = message.content.split(" ");
    if (args.length !== 2) {
      message.channel.send("Invalid command format. Use /set-meet-time HH:MM");
      return;
    }

    const timeParts = args[1].split(":");
    if (timeParts.length !== 2) {
      message.channel.send("Invalid time format. Use HH:MM.");
      return;
    }

    const [hour, minute] = timeParts.map(Number);
    if (
      isNaN(hour) ||
      isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      message.channel.send("Invalid time values. Use HH:MM in 24-hour format.");
      return;
    }

    startHour = hour;
    startMinute = minute;
    message.channel.send(
      `Meet time has been set to ${startHour}:${startMinute < 10 ? "0" : ""}${startMinute}.`,
    );
  }

  if (message.content === "/help") {
    message.channel.send(`
      **Bot Commands:**

      **/init**: Initializes the current text channel to receive notifications about voice channel activity.

      **/order**: Displays the current order of users in each voice channel, along with their join times.

      **/set-meet-time HH:MM**: Sets the start time for when the bot begins tracking voice channel entries, using a 24-hour format.

      **/help**: Shows this help message with available bot commands and their descriptions.

      This bot tracks when users join and leave voice channels, and logs their entry order with timestamps.
      `);
  }
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  if (!checkTime(startHour, startMinute)) return;

  const textChannel = client.channels.cache.get(textChannelId);

  if (!textChannel || !textChannel.isTextBased()) {
    console.error("Text channel not found or not a text channel");
    return;
  }

  if (!oldState.channel && newState.channel) {
    const { channel, member } = newState;

    if (!voiceChannelEntries.has(channel.id)) {
      voiceChannelEntries.set(channel.id, []);
    }

    const entries = voiceChannelEntries.get(channel.id);

    if (!entries.includes(member.user.id)) {
      const entryTime = new Date();
      entries.push({ userId: member.user.id, entryTime });
      textChannel.send(
        `${member.user.username} joined the voice channel ${channel.name} at ${entryTime.toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )}.`,
      );
    }
  }

  if (oldState.channel && !newState.channel) {
    const { channel, member } = oldState;

    if (voiceChannelEntries.has(channel.id)) {
      const entries = voiceChannelEntries.get(channel.id);

      const index = entries.findIndex(
        (entry) => entry.userId === member.user.id,
      );
      if (index !== -1) {
        entries.splice(index, 1);
        const exitTime = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        textChannel.send(
          `${member.user.username} left the voice channel ${channel.name} at ${exitTime}.`,
        );
      }
    }
  }
});

client.login(token);


app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
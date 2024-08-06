# Discord Voice Channel Order Bot

This Discord bot tracks the order in which users join and leave voice channels. It allows you to set a specific time to start tracking, and provides commands to initialize the bot, set the meeting time, and view the current order of users in voice channels.

## Features

- **Track User Entry and Exit:** Automatically logs the order in which users join and leave voice channels.
- **Set Meeting Start Time:** Allows users to set the start time for tracking using a command.
- **Display Order:** Provides a command to display the current order of users in each voice channel.

## Commands

- `/init`: Sets the current text channel as the notification channel for bot messages.
- `/set-meet-time HH:MM`: Sets the time (in 24-hour format) to start tracking user entries and exits.
- `/order`: Displays the current order of users in each voice channel.

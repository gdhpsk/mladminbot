import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import env from "dotenv";
import addLevel from "./commands/add-level";
import removeLevel from "./commands/remove-level";
import moveLevel from "./commands/move-level";
import updateLevelName from "./commands/update-level-name";
import updateLevelCreator from "./commands/update-level-creator";
import addPlayer from "./commands/add-player";
import banPlayer from "./commands/ban-player";
import updatePlayerName from "./commands/update-player-name";
import updatePlayerDiscord from "./commands/update-player-discord";
import addRecord from "./commands/add-record";
import removeRecord from "./commands/remove-record";
import updateClassRoles from "./commands/update-class-roles";
import noDiscordPlayers from "./commands/no-discord-players";

env.config();

export const siteURI = process.env.SITE_URI as string;
export const siteToken = process.env.SITE_TOKEN as string;

export interface SlashCommand {
  command: SlashCommandBuilder;
  execute: (ctx: ChatInputCommandInteraction) => Promise<void>;
}

export const confirmation = new ActionRowBuilder().addComponents([
  new ButtonBuilder()
    .setCustomId("confirm")
    .setLabel("Confirm")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("cancel")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Secondary),
]);

export const pagination = new ActionRowBuilder().addComponents([
  new ButtonBuilder()
    .setCustomId("prev")
    .setLabel("⬅️")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("next")
    .setLabel("➡️")
    .setStyle(ButtonStyle.Secondary),
]);

export default [
  addLevel,
  removeLevel,
  moveLevel,
  updateLevelName,
  updateLevelCreator,
  addPlayer,
  banPlayer,
  updatePlayerName,
  updatePlayerDiscord,
  addRecord,
  removeRecord,
  updateClassRoles,
  noDiscordPlayers
];

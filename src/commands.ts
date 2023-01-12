import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export interface SlashCommand {
  command: SlashCommandBuilder;
  execute: (ctx: CommandInteraction) => Promise<void>;
}

const confirmButton = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Primary)
  )

const addLevel: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("addLevel")
    .setDescription("Add a level to the mobile list")
    .addStringOption((option) => 
      option
        .setName("name")
        .setDescription("Level name")
        .setRequired(true))
    .addStringOption((option) =>
      option
        .setName("creator")
        .setDescription("Level creator(s)")
        .setRequired(true))
    .addIntegerOption((option) =>
      option
        .setName("position")
        .setDescription("List placement position")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    ;
  },
};

export default [addLevel];

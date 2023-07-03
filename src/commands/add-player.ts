import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";
import axios from "axios";

const addPlayer: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("add-player")
    .setDescription("Add a player to the mobile list leaderboard")
    .addStringOption((option) =>
      option.setName("name").setDescription("Player name").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("discord").setDescription("Player discord ID")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    const interaction = await ctx.editReply({
      content: `Adding ${ctx.options.getString("name")} to the leaderboard.`,
      components: [confirmation],
    } as InteractionReplyOptions);
    await interaction
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 30000,
      })
      .then(async (button) => {
        await button.deferUpdate();
        if (button.customId === "confirm") {
          axios
            .post(
              `${siteURI}/players`,
              JSON.stringify({
                name: ctx.options.getString("name"),
                discord: ctx.options.getString("discord"),
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                  auth: siteToken,
                },
              }
            )
            .then(() => {
              ctx.editReply({
                content: `✅ "${ctx.options.getString(
                  "name"
                )}" was added to the leaderboard.`,
                components: [],
              });
            })
            .catch((error) => {
              switch (error.response.status) {
                case 409:
                  ctx.editReply({
                    content: `⛔ "${ctx.options.getString(
                      "name"
                    )}" is already on the leaderboard.`,
                    components: [],
                  });
                  break;
                default:
                  ctx.editReply({
                    content: "⚠️ An unknown error has occurred.",
                    components: [],
                  });
                  console.error(error);
                  break;
              }
            });
        } else if (button.customId === "cancel") {
          ctx.deleteReply();
        }
      })
      .catch(() => ctx.deleteReply());
  },
};

export default addPlayer;

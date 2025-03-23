import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";
import axios from "axios";

const updatePlayerDiscord: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("update-player-discord")
    .setDescription("Update the discord ID of a player on the mobile list")
    .addStringOption((option) =>
      option.setName("name").setDescription("Player name").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("newdiscord")
        .setDescription("New discord ID")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    const interaction = await ctx.editReply({
      content: `Updating ${ctx.options.getString(
        "name"
      )} discord ID to "${ctx.options.getString("newdiscord")}".`,
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
            .patch(
              `${siteURI}/players/${ctx.options.getString("name")}`,
              JSON.stringify({
                newdiscord: ctx.options.getString("newdiscord"),
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
                )}" discord ID was updated to "${ctx.options.getString(
                  "newdiscord"
                )}".`,
                components: [],
              });
            })
            .catch((error) => {
              switch (error.response.status) {
                case 404:
                  ctx.editReply({
                    content: `⛔ "${ctx.options.getString(
                      "name"
                    )}" was not found.`,
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

export default updatePlayerDiscord;

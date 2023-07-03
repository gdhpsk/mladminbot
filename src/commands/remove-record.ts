import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";
import axios from "axios";

const removeRecord: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("remove-record")
    .setDescription("Remove a record from the mobile list")
    .addStringOption((option) =>
      option.setName("player").setDescription("Player name").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("level").setDescription("Level name").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    const interaction = await ctx.editReply({
      content: `Removing record for ${ctx.options.getString(
        "player"
      )} on ${ctx.options.getString("level")}.`,
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
            .delete(`${siteURI}/records`, {
              headers: {
                "Content-Type": "application/json",
                auth: siteToken,
              },
              data: JSON.stringify({
                player: ctx.options.getString("player"),
                level: ctx.options.getString("level"),
              }),
            })
            .then(() => {
              ctx.editReply({
                content: `✅ Record for "${ctx.options.getString(
                  "player"
                )}" on ${ctx.options.getString(
                  "level"
                )} was removed from the list.`,
                components: [],
              });
            })
            .catch((error) => {
              switch (error.response.status) {
                case 404:
                  ctx.editReply({
                    content: `⛔ Player or level was not found.`,
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

export default removeRecord;

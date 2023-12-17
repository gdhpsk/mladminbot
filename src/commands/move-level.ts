import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";
import axios from "axios";

const moveLevel: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("move-level")
    .setDescription("Move a level to a new position on the mobile list")
    .addStringOption((option) =>
      option.setName("name").setDescription("Level name").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("position")
        .setDescription("New position")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    let req = await fetch(`${siteURI}/levels?position=${(ctx.options.getInteger("position") || 2) - 1}`)
    let below = await req.json()
    const interaction = await ctx.editReply({
      content: `Moving ${ctx.options.getString(
        "name"
      )} to #${ctx.options.getInteger("position")}, below ${below[0]?.name || "nothing"}.`,
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
              `${siteURI}/levels/${ctx.options.getString("name")}`,
              JSON.stringify({
                newpos: ctx.options.getInteger("position"),
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
                )}" was moved to #${ctx.options.getInteger("position")}, below ${below[0]?.name || "nothing"}.`,
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

export default moveLevel;

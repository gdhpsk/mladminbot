import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";
import axios from "axios";

const updateLevelCreator: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("update-level-creator")
    .setDescription("Update the creator of a level on the mobile list")
    .addStringOption((option) =>
      option.setName("name").setDescription("Level name").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("creator")
        .setDescription("New level creator(s)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    const interaction = await ctx.editReply({
      content: `Updating ${ctx.options.getString(
        "name"
      )} creator to "${ctx.options.getString("creator")}".`,
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
                newcreator: ctx.options.getString("creator"),
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                  auth: siteToken,
                },
              }
            )
            .then((data) => {
              if (data.status === 200) {
                ctx.editReply({
                  content: `✅ "${ctx.options.getString(
                    "name"
                  )}" creator was updated to "${ctx.options.getString(
                    "creator"
                  )}".`,
                  components: [],
                });
              } else if (data.status === 404) {
                ctx.editReply({
                  content: `⛔ "${ctx.options.getString(
                    "name"
                  )}" was not found.`,
                  components: [],
                });
              } else {
                ctx.editReply({
                  content: "⚠️ An unknown error has occurred.",
                  components: [],
                });
              }
            })
            .catch((error) => {
              ctx.editReply("⚠️ Request did not go through. Try again later.");
              console.error(error);
            });
        } else if (button.customId === "cancel") {
          ctx.deleteReply();
        }
      })
      .catch(() => ctx.deleteReply());
  },
};

export default updateLevelCreator;

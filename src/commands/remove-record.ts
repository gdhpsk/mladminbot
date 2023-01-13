import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";

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
    const interaction = await ctx.reply({
      content: `Removing record for ${ctx.options.getString(
        "player"
      )} on ${ctx.options.getString("level")}.`,
      components: [confirmation],
    } as InteractionReplyOptions);
    interaction
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 30000,
      })
      .then((button) => {
        button.deferUpdate();
        if (button.customId === "confirm") {
          fetch(`${siteURI}/records`, {
            method: "DELETE",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              auth: siteToken,
            },
            body: JSON.stringify({
              player: ctx.options.getString("player"),
              level: ctx.options.getString("level"),
            }),
          })
            .then((data) => {
              if (data.status === 200) {
                ctx.editReply({
                  content: `✅ Record for "${ctx.options.getString(
                    "player"
                  )}" on ${ctx.options.getString(
                    "level"
                  )} was removed from the list.`,
                  components: [],
                });
              } else if (data.status === 404) {
                ctx.editReply({
                  content: `⛔ Player or level was not found.`,
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

export default removeRecord;

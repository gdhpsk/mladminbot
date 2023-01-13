import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";

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
    const interaction = await ctx.reply({
      content: `Adding ${ctx.options.getString("name")} to the leaderboard.`,
      components: [confirmation],
    } as InteractionReplyOptions);
    interaction
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 30000,
      })
      .then(async (button) => {
        await button.deferUpdate();
        if (button.customId === "confirm") {
          fetch(`${siteURI}/players`, {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              auth: siteToken,
            },
            body: JSON.stringify({
              name: ctx.options.getString("name"),
              discord: ctx.options.getString("discord"),
            }),
          })
            .then((data) => {
              if (data.status === 201) {
                ctx.editReply({
                  content: `✅ "${ctx.options.getString(
                    "name"
                  )}" was added to the leaderboard.`,
                  components: [],
                });
              } else if (data.status === 409) {
                ctx.editReply({
                  content: `⛔ "${ctx.options.getString(
                    "name"
                  )}" is already on the leaderboard.`,
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

export default addPlayer;

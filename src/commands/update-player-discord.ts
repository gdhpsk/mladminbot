import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";

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
    const interaction = await ctx.reply({
      content: `Updating ${ctx.options.getString(
        "name"
      )} discord ID to "${ctx.options.getString("newdiscord")}".`,
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
          fetch(`${siteURI}/players/${ctx.options.getString("name")}`, {
            method: "PATCH",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              auth: siteToken,
            },
            body: JSON.stringify({
              newdiscord: ctx.options.getString("newdiscord"),
            }),
          })
            .then((data) => {
              if (data.status === 200) {
                ctx.editReply({
                  content: `✅ "${ctx.options.getString(
                    "name"
                  )}" discord ID was updated to "${ctx.options.getString(
                    "newdiscord"
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

export default updatePlayerDiscord;

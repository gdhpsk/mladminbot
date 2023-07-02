import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";
import axios from "axios";

const banPlayer: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("ban-player")
    .setDescription("Ban a player from the mobile list")
    .addStringOption((option) =>
      option.setName("name").setDescription("Player name").setRequired(true)
    )
    .setDefaultMemberPermissions(0),
  execute: async (ctx) => {
    if (
      !(ctx.user.id === "220989535218171904") &&
      !(ctx.user.id === "733456210925322331")
    ) {
      await ctx.editReply(
        "⛔ You are not <@220989535218171904>. Prepare to die."
      );
    } else {
      const interaction = await ctx.editReply({
        content: `Banning ${ctx.options.getString(
          "name"
        )} from the mobile list.`,
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
              .delete(`${siteURI}/players/${ctx.options.getString("name")}`, {
                headers: {
                  "Content-Type": "application/json",
                  auth: siteToken,
                },
              })
              .then((data) => {
                if (data.status === 200) {
                  ctx.editReply({
                    content: `✅ ${ctx.options.getString(
                      "name"
                    )} was banned from the mobile list.`,
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
                ctx.editReply(
                  "⚠️ Request did not go through. Try again later."
                );
                console.error(error);
              });
          } else if (button.customId === "cancel") {
            ctx.deleteReply();
          }
        })
        .catch(() => ctx.deleteReply());
    }
  },
};

export default banPlayer;

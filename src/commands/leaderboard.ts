import {
  SlashCommandBuilder,
  EmbedBuilder,
  InteractionReplyOptions,
} from "discord.js";
import axios from "axios";
import { SlashCommand, siteURI, pagination } from "../commands";

const leaderboard: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Get the current leaderboard")
    .setDefaultMemberPermissions(0),
  execute: async (ctx) => {
    axios
      .get(`${siteURI}/players`)
      .then((resp) => {
        const { data: player } = resp;
        const leaderboardEmbed = new EmbedBuilder()
          .setTitle("Leaderboard")
          .addFields({ name: "", value: player.mclass.comb });
        ctx.editReply({
          embeds: [leaderboardEmbed],
          components: [pagination],
        } as InteractionReplyOptions);
      })
      .catch((error) => {
        switch (error.response.status) {
          case 404:
            ctx.editReply({
              content: `⛔ "${ctx.options.getString("name")}" was not found.`,
            });
            break;
          default:
            ctx.editReply({
              content: "⚠️ An unknown error has occurred.",
            });
            console.error(error);
            break;
        }
      });
  },
};

export default leaderboard;

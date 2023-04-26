import {
  SlashCommandBuilder,
  EmbedBuilder,
  InteractionReplyOptions
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
        if (resp.status === 200) {
          const { data: player } = resp;
          const leaderboardEmbed = new EmbedBuilder()
            .setTitle("Leaderboard")
            .addFields(
              { name: "", value: player.mclass.comb }
            )
          ctx.editReply({
            embeds: [leaderboardEmbed],
            components: [pagination]
          } as InteractionReplyOptions);
        } else if (resp.status === 404) {
          ctx.editReply({
            content: `⛔ "${ctx.options.getString("name")}" was not found.`
          });
        } else {
          ctx.editReply({
            content: "⚠️ An unknown error has occurred."
          });
        }
      })
      .catch((error) => {
        ctx.editReply("⚠️ Request did not go through. Try again later.");
        console.error(error);
      });
  },
};

export default leaderboard;

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import { SlashCommand, siteURI } from "../commands";

const getPlayer: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("get-player")
    .setDescription("Get a player's stats and records")
    .addStringOption((option) =>
      option.setName("name").setDescription("Player name").setRequired(true)
    )
    .setDefaultMemberPermissions(0),
  execute: async (ctx) => {
    axios
      .get(`${siteURI}/players/${ctx.options.getString("name")}`)
      .then((resp) => {
        if (resp.status === 200) {
          const { data: player } = resp;
          const playerEmbed = new EmbedBuilder()
            .setTitle(player.name)
            .addFields(
              { name: "Class", value: player.mclass.comb, inline: true },
              {
                name: "Points",
                value: player.points.comb.toFixed(2),
                inline: true,
              },
              {
                name: "Refresh Rate",
                value: Object.keys(player.hertz)
                  .map((rr) => rr + "hz")
                  .join(" / "),
                inline: true,
              },
              { name: "Tag", value: player.discord ?? "N/A", inline: true }
            );
          ctx.editReply({
            embeds: [playerEmbed],
          });
        } else if (resp.status === 404) {
          ctx.editReply({
            content: `⛔ "${ctx.options.getString("name")}" was not found.`,
          });
        } else {
          ctx.editReply({
            content: "⚠️ An unknown error has occurred.",
          });
        }
      })
      .catch((error) => {
        ctx.editReply("⚠️ Request did not go through. Try again later.");
        console.error(error);
      });
  },
};

export default getPlayer;

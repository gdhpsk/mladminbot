import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";

const addRecord: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("add-record")
    .setDescription("Add a record to the mobile list")
    .addStringOption((option) =>
      option.setName("player").setDescription("Player name").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("level").setDescription("Level name").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("hertz")
        .setDescription("Refresh rate of completion")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("link")
        .setDescription("Link to youtube completion video")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    const interaction = await ctx.reply({
      content: `Adding record for ${ctx.options.getString(
        "player"
      )} on ${ctx.options.getString("level")} (${ctx.options.getInteger(
        "hertz"
      )}hz) (${ctx.options.getString("link")}).`,
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
          fetch(`${siteURI}/records`, {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              auth: siteToken,
            },
            body: JSON.stringify({
              player: ctx.options.getString("player"),
              level: ctx.options.getString("level"),
              hertz: ctx.options.getInteger("hertz"),
              link: ctx.options.getString("link"),
            }),
          })
            .then((data) => {
              if (data.status === 201) {
                ctx.editReply({
                  content: `✅ Record was added for ${ctx.options.getString(
                    "player"
                  )} on "${ctx.options.getString(
                    "level"
                  )}" (${ctx.options.getInteger(
                    "hertz"
                  )}hz) (${ctx.options.getString("link")}).`,
                  components: [],
                });
              } else if (data.status === 404) {
                ctx.editReply({
                  content: `⛔ Player or level not found.`,
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

export default addRecord;

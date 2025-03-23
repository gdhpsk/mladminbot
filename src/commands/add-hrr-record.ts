import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ComponentType,
    InteractionReplyOptions,
  } from "discord.js";
  import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";
  import axios from "axios";
  
  const addHRRRecord: SlashCommand = {
    command: new SlashCommandBuilder()
      .setName("add-hrr-record")
      .setDescription("Add a HRR record to the mobile list")
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
      const interaction = await ctx.editReply({
        content: `Adding HRR record for ${ctx.options.getString(
          "player"
        )} on ${ctx.options.getString("level")} (${ctx.options.getInteger(
          "hertz"
        )}hz) (${ctx.options.getString("link")}).`,
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
              .post(
                `${siteURI}/records/hrr`,
                JSON.stringify({
                  player: ctx.options.getString("player"),
                  level: ctx.options.getString("level"),
                  hertz: ctx.options.getInteger("hertz"),
                  link: ctx.options.getString("link"),
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
                  content: `✅ Record was added for ${ctx.options.getString(
                    "player"
                  )} on "${ctx.options.getString(
                    "level"
                  )}" (${ctx.options.getInteger(
                    "hertz"
                  )}hz) (${ctx.options.getString("link")}).`,
                  components: [],
                });
              })
              .catch((error) => {
                switch (error.response.status) {
                  case 404:
                    ctx.editReply({
                      content: "⛔ Player or level not found.",
                      components: [],
                    });
                    break;
                  case 409:
                    ctx.editReply({
                      content: "⛔ Record already added.",
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
  
  export default addHRRRecord;  
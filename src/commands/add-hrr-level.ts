import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ComponentType,
    InteractionReplyOptions,
  } from "discord.js";
  import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";
  import axios from "axios";
  
  const addHRRLevel: SlashCommand = {
    command: new SlashCommandBuilder()
      .setName("add-hrr-level")
      .setDescription("Add a HRR level to the mobile list")
      .addStringOption((option) =>
        option.setName("name").setDescription("Level name").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("creator")
          .setDescription("Level creator(s)")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("position")
          .setDescription("List placement position")
          .setMinValue(1)
          .setMaxValue(50)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (ctx) => {
      let req = await fetch(`${siteURI}/levels/hrr?position=${(ctx.options.getInteger("position") || 2) - 1}`)
      let below = await req.json()
      const interaction = await ctx.editReply({
        content: `Adding HRR Level ${ctx.options.getString(
          "name"
        )} by ${ctx.options.getString("creator")} at #${ctx.options.getInteger(
          "position"
        )}, below ${below[0]?.name || "nothing"}`,
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
                `${siteURI}/levels/hrr`,
                JSON.stringify({
                  name: ctx.options.getString("name"),
                  creator: ctx.options.getString("creator"),
                  position: ctx.options.getInteger("position"),
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
                  content: `✅ HRR Level "${ctx.options.getString(
                    "name"
                  )}" was placed at #${ctx.options.getInteger("position")}, below ${below[0]?.name || "nothing"}.`,
                  components: [],
                });
              })
              .catch((error) => {
                switch (error.response.status) {
                  case 409:
                    ctx.editReply({
                      content: `⛔ HRR Level "${ctx.options.getString(
                        "name"
                      )}" is already on the list.`,
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
  
  export default addHRRLevel;  
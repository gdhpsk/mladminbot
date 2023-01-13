import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../commands";

const addLevel: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("add-level")
    .setDescription("Add a level to the mobile list")
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
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    const interaction = await ctx.reply({
      content: `Adding ${ctx.options.getString(
        "name"
      )} by ${ctx.options.getString("creator")} at #${ctx.options.getInteger(
        "position"
      )}`,
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
          fetch(`${siteURI}/levels`, {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              auth: siteToken,
            },
            body: JSON.stringify({
              name: ctx.options.getString("name"),
              creator: ctx.options.getString("creator"),
              position: ctx.options.getInteger("position"),
            }),
          })
            .then((data) => {
              if (data.status === 201) {
                ctx.editReply({
                  content: `✅ "${ctx.options.getString(
                    "name"
                  )}" was placed at #${ctx.options.getInteger("position")}.`,
                  components: [],
                });
              } else if (data.status === 409) {
                ctx.editReply({
                  content: `⛔ "${ctx.options.getString(
                    "name"
                  )}" is already on the list.`,
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

export default addLevel;

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
} from "discord.js";
import { SlashCommand, confirmation, siteURI, siteToken } from "../../commands";

const addLog: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("add-log")
    .setDescription("Push a list update to the site")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Level was added")
        .addStringOption((option) =>
          option.setName("level").setDescription("Level name").setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("pos")
            .setDescription("List placement position")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("date").setDescription("(m/d/y)").setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("knocked")
            .setDescription("Level that fell off")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Level was removed")
        .addStringOption((option) =>
          option.setName("level").setDescription("Level name").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("date").setDescription("(m/d/y)").setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("readded")
            .setDescription("Level that came back")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("move")
        .setDescription("Level was moved")
        .addStringOption((option) =>
          option.setName("level").setDescription("Level name").setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("oldpos")
            .setDescription("Old list placement position")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("newpos")
            .setDescription("New list placement position")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("date").setDescription("m/d/y").setRequired(false)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    var logContent = "";
    var logType = 0;
    if (ctx.options.getSubcommand() === "add") {
      logContent = `"${ctx.options.getString(
        "level"
      )}" was placed at #${ctx.options.getNumber("pos")}${
        ctx.options.getString("knocked")
          ? `, pushing "${ctx.options.getString("knocked")}" off the list.`
          : "."
      }`;
      logType = 1;
    } else if (ctx.options.getSubcommand() === "remove") {
      logContent = `"${ctx.options.getString(
        "level"
      )}" was removed from the list${
        ctx.options.getString("readded")
          ? `, bringing "${ctx.options.getString(
              "readded"
            )}" back onto the list.`
          : "."
      }`;
      logType = 2;
    } else if (ctx.options.getSubcommand() === "move") {
      logContent = `"${ctx.options.getString(
        "level"
      )}" was moved from #${ctx.options.getNumber(
        "oldpos"
      )} to #${ctx.options.getNumber("newpos")}.`;
      logType = 3;
    }
    const interaction = await ctx.editReply({
      content: `Sending log "(${ctx.options.getString("date")}) ${logContent}"`,
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
          fetch(`${siteURI}/logs`, {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              auth: siteToken,
            },
            body: JSON.stringify({
              date: ctx.options.getString("date"),
              content: logContent,
              type: logType,
            }),
          })
            .then(async (data) => {
              if (data.status === 201) {
                ctx.editReply({
                  content: `✅ Logged with reference ID: ${
                    (await data.json()).id
                  }`,
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

export default addLog;

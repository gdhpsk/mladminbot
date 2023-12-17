import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ComponentType,
    InteractionReplyOptions,
    Role,
  } from "discord.js";
  import { SlashCommand, siteURI } from "../commands";
  
  const updateClassRoles: SlashCommand = {
    command: new SlashCommandBuilder()
      .setName("no-discord-players")
      .setDescription("List profiles with no discord ID")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (ctx) => {
      await ctx.editReply({
        content: "Fetching players...",
        components: [],
      } as InteractionReplyOptions);
      try {
        let req = await fetch(`${siteURI}/members?disc=false`)
        let nodisc = await req.json()
        ctx.editReply({
            content: nodisc.map((e: any) => e.name).join("\n") || "Every player has a discord ID! Great job!",
            components: [],
          });
    } catch(error) {
        ctx.editReply({
            content: "⚠️ An unknown error has occurred.",
            components: [],
          });
          console.error(error);
    }
    }
  };
  
  export default updateClassRoles;
  
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ComponentType,
  InteractionReplyOptions,
  Role,
} from "discord.js";
import { SlashCommand, confirmation, siteURI } from "../commands";
import axios from "axios";

const updateClassRoles: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("update-class-roles")
    .setDescription("Update all class roles in the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (ctx) => {
    const interaction = await ctx.editReply({
      content: "Updating class roles for all MS members...",
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
            .get(`${siteURI}/members`)
            .then(async (resp) => {
              ctx.editReply({
                content: "Updating class roles for all MS members...",
                components: [],
              });
              const classes = [
                [1, "696050378642554882"],
                [50, "405929546584555524"],
                [150, "696050705387094056"],
                [300, "696051140965433414"],
                [600, "405929862398869506"],
                [1000, "791898249438167040"],
                [20000, "696051402929078412"],
              ];
              try {
                for (const player of resp.data) {
                  await ctx.guild?.members.fetch();
                  const member = ctx.guild?.members.cache.get(player.discord);
                  if (member === undefined) continue;
                  if (member.id === "220989535218171904") continue;
                  const correctRole = ctx.guild?.roles.cache.get(
                    (classes.find((c) => player.points.comb < c[0]) ??
                      classes[0])[1] as string
                  );
                  const currentRole = member.roles.cache.find((_, id) =>
                    classes.map((c) => c[1]).includes(id)
                  );
                  if (correctRole?.id === currentRole?.id) continue;
                  currentRole && (await member.roles.remove(currentRole));
                  await member.roles.add(correctRole as Role);
                  const report = await ctx.channel?.send(
                    `🔸 ${member.user.username}`
                  );
                  await report?.edit(
                    `🔸 ${member.user.username}  -  ${
                      currentRole ? `<@&${currentRole.id}>` : "No Role"
                    } ➡️ <@&${correctRole?.id}>`
                  );
                }
              } catch (e) {
                console.error(e);
              }
              await ctx.channel?.send("✅ All roles updated.");
            })
            .catch((error) => {
              ctx.editReply({
                content: "⚠️ An unknown error has occurred.",
                components: [],
              });
              console.error(error);
            });
        } else if (button.customId === "cancel") {
          ctx.deleteReply();
        }
      })
      .catch(() => ctx.deleteReply());
  },
};

export default updateClassRoles;

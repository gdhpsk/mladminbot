import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import commands, { SlashCommand } from "./commands";

console.log("Bot is starting...");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const cmds = new Collection<string, SlashCommand>();

for (const c of commands) {
  cmds.set(c.command.name, c);
}

client.once(Events.ClientReady, (c) => {
  console.log(`${c.user.tag} is online`);
});

client.on(Events.InteractionCreate, async (ctx) => {
  if (!ctx.isChatInputCommand()) return;
  const cmd = cmds.get(ctx.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(ctx);
  } catch (e) {
    console.error(e);
    await ctx.reply({ content: "Error", ephemeral: true });
  }
});

client.login(process.env.BOT_TOKEN as string);

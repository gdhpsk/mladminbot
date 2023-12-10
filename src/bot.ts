import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  InteractionReplyOptions,
} from "discord.js";
import commands, { SlashCommand } from "./commands";
import listener from "./listener";

console.log("Bot is starting...");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
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
  await ctx.deferReply();
  const cmd = cmds.get(ctx.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(ctx);
  } catch (e) {
    console.error(e);
    await ctx.editReply({
      content: "Error",
      ephemeral: true,
    } as InteractionReplyOptions);
  }
});

const app = listener(client);

client.login(process.env.BOT_TOKEN as string);

app.listen(process.env.PORT ?? 3001, () => {
  console.log("Listener at " + process.env.PORT ?? 3001);
});

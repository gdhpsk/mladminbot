import { REST, Routes } from "discord.js";
import env from "dotenv"
import commands from "./commands";

env.config();

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN as string);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string),
			{ body: commands.map((c) => c.command.toJSON()) },
		);
		console.log(`Successfully reloaded ${(data as []).length} application (/) commands.`);
	} catch (e) {
		console.error(e);
	}
})();
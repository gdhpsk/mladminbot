import express from "express";
import bodyParser from "body-parser";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ComponentType,
  EmbedBuilder,
  MessageCreateOptions,
  TextChannel,
} from "discord.js";
import { siteURI, siteToken } from "./commands";

export default (client: Client) => {
  const app = express();
  app.use(bodyParser.json());

  app.post("/submit", async (req, res) => {
    try {
      var alertNew = "";
      var showButtons = false;
      switch (req.body.isNew) {
        case 1:
          alertNew = "(New Player)";
          break;
        case 2:
          alertNew = "(New Level)";
          break;
        case 3:
          alertNew = "(New Player) (New Level)";
          break;
        default:
          showButtons = true;
          break;
      }
      delete req.body.isNew;
      const recordEmbed = new EmbedBuilder()
        .setColor(showButtons ? "Blue" : "Yellow")
        .setTitle(`Record Submission ${alertNew}`)
        .addFields(
          { name: "Player", value: req.body.player, inline: true },
          { name: "Level", value: req.body.level, inline: true },
          { name: "Hertz", value: String(req.body.hertz), inline: true },
          { name: "Raw Footage", value: req.body.raw },
          { name: "Video", value: req.body.link }
        )
        .setTimestamp();
      const decision = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("accept")
          .setLabel("Accept")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("reject")
          .setLabel("Reject")
          .setStyle(ButtonStyle.Danger)
      );
      const channel = client.channels.cache.get(
        "1064986062100897932"
      ) as TextChannel;
      const message = await channel.send({
        embeds: [recordEmbed],
        components: showButtons ? [decision] : [],
      } as MessageCreateOptions);
      if (showButtons) {
        message
          .awaitMessageComponent({ componentType: ComponentType.Button })
          .then(async (button) => {
            await button.deferUpdate();
            if (button.customId === "accept") {
              fetch(`${siteURI}/records`, {
                method: "POST",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json",
                  auth: siteToken,
                },
                body: JSON.stringify(req.body),
              }).then((data) => {
                if (data.status === 201) {
                  message.edit({
                    content: `✅ Record was accepted for ${req.body.player} on "${req.body.level}" (${req.body.hertz}hz) (${req.body.link}).`,
                    components: [],
                    embeds: [],
                  });
                } else {
                  message.edit({
                    content: "⚠️ An unknown error has occurred.",
                    components: [],
                    embeds: [],
                  });
                }
              });
            } else if (button.customId === "reject") {
              message.edit({
                content: `❌ Record was rejected for ${req.body.player} on "${req.body.level}" (${req.body.hertz}hz) (${req.body.link}).`,
                components: [],
                embeds: [],
              });
            }
          })
          .catch((e) => {
            throw e;
          });
      }
      return res.sendStatus(201);
    } catch (e) {
      console.error(e);
      return res.sendStatus(500);
    }
  });

  return app;
};

const Discord = require("discord.js"),
Job = require("../models/ModelJob"),
fuc = require("../Functions/functions"),
prox = require("../Functions/continue");
exports.run = async (SMCodes, message, args, author, prefix, server, user) =>{
    if(args[0].toLowerCase() === "create") {
        message.channel.send("Você iniciou uma sessão de criação de emprego.");
        message.channel.send("**[Sessão] Por favor digite o id do emprego »**");
        prox.add(author.user.id, "create_job");
    }
};
exports.config ={
    name: 'emprego',
    status: true,
    help: 'Esse comando serve para meu criador gerencionar o sistema de empregos.',
    emojicommand: '🧰',
    aliases: [],
    category: 'RPG',
    categoryemoji: '⚒',
    permission: 0
};
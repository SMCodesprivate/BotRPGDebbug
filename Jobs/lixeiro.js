const Discord = require("discord.js"),
User = require("../models/ModelUser");
exports.run = async (SMCodes, message, args, author, prefix, server, user) =>{
    if(user.job !== 0 || !user.job) return message.reply("você não tem o emprego **LIXEIRO** então não poderá usar os comandos de tal.");

};
exports.config ={
    name: 'lixeiro',
    status: true,
    help: 'Esse comando gerencia as funções do emprego **LIXEIRO**.',
    emojicommand: '🗑️',
    aliases: [],
    category: 'Empregos',
    categoryemoji: '🧰'
};
// { user_id: '360247173356584960',
//   id: '0',
//   name: 'lixeiro',
//   description:
//    'Esse emprego é um emprego básico para começar a evoluir dentro de nosso sistema de empregos, esse emprego poderá recolher lixos de casas, hotéis, locais fechados e abertos. Nesse emprego quanto mais level o jogador tem mais chance tem de encontrar algo valioso no lixo de outras pessoas.',
//   salary: '7393',
//   unique: 'lixeiro, coletar, vl',
//   level: '0' }
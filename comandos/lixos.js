const Discord = require("discord.js"),
Lixo = require("../models/ModelLixo"),
fuc = require("../Functions/functions");
exports.run = async (SMCodes, message, args, author, prefix, server, user) =>{
    var embed = new Discord.RichEmbed()
        .setColor("#"+fuc.getColor())
        .setTitle("**Lista de lixos**")
        .setThumbnail(author.user.avatarURL)
        .addBlankField()
        .setTimestamp()
        .setFooter(author.user.username+" - "+author.user.id, author.user.avatarURL);
    var lixos = await Lixo.find();
    var tt = false;
    for(var x = 0;x <= lixos.length-1;x++) {
        if(x <= 5) {
            embed.addField("**Nome »**", "`"+lixos[x].name+"`")
                .addField("**Preço »**", "`"+lixos[x].price+"`")
                .addField("**Raridade »**", "`"+lixos[x].rarity+"`")
                .addBlankField();
        } else {
            tt = true;
        }
    }
    message.channel.send(embed).then(async msg => {
        if(tt === true) {
            await msg.react("⏪");
            await msg.react("⏩");
        }
    });
};
exports.config ={
    name: 'lixos',
    status: true,
    help: 'Esse comando um usuário pode ver a lista de lixos.',
    emojicommand: '🗒️',
    aliases: [],
    category: 'RPG',
    categoryemoji: '⚒'
}
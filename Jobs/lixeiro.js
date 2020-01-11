const Discord = require("discord.js"),
User = require("../models/ModelUser"),
fuc = require("../Functions/functions"),
Lixo = require("../models/ModelLixo");
exports.run = async (SMCodes, message, args, author, prefix, server, user) =>{
    if(user.job != 0 || user.job === undefined) return message.channel.send("**[LIXEIRO]** Você não tem o emprego **LIXEIRO** então não poderá usar os comandos de tal, você pode pegar o emprego utilizando `"+prefix+"trabalhar {lixeiro/0}`.");
    await User.findOneAndUpdate({
        user_id: author.user.id
    }, {
        luck: 0
    });
    switch(args[0]) {
        case 'coletar':
            console.log(await Lixo.find());
            var embed = new Discord.RichEmbed()
                .setColor(fuc.getColor())
                .setTitle("**Coleta de lixo de "+author.user.username+"**")
                .setDescription('**\n__Money »__** `$ '+user.money+'`\n**__Level »__** `✴️ '+user.level+'`\n**__Energia »__** `⚡ '+user.energia+'/'+user.limitenergia+'`\n**__Sorte »__** `🎲 '+user.luck+'`')
                .addBlankField()
                .setTimestamp()
                .setFooter(author.user.tag, author.user.avatarURL);
            message.channel.send(embed);
            break;
        case 'commands':
            var embed = new Discord.RichEmbed()
                .setColor(fuc.getColor())
                .setTitle("**Esses são os comandos disponíveis para `LIXEIROS`**")
                .addBlankField()
                .addField("**1°- `"+prefix+this.config.name+" coletar`**", "Com esse sub-comando você pode usar para inicializar uma coleta de lixo, porém ela dura até sua energia acabar, a cada 5 segundos consome 1 de energia, ou seja quanto mais level de ***stamina*** mais tempo durará sua coleta de lixo, consequentemente você ganhará mais ***money***.")
                .addBlankField()
                .setTimestamp()
                .setFooter(author.user.username+" - "+author.user.id, author.user.avatarURL);
            message.channel.send(embed);
            break;
    }

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
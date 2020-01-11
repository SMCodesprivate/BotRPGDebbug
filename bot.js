// https://discordapp.com/oauth2/authorize?client_id=639077779383648266&permissions=2147479031&scope=bot
const Discord = require("discord.js");
config = require("./config.json"),
SMCodes = new Discord.Client(),
Channel = require("./models/ModelChannel"),
fs = require('fs'),
diff = require('./date'),
searchPrefix = require("./Functions/searchPrefix"),
Server = require("./models/ModelServer"),
User = require("./models/ModelUser"),
mongoose = require('mongoose'),
cooldown = require("./Functions/cooldown"),
fuc = require("./Functions/functions"),
prox = require("./Functions/continue"),
Job = require("./models/ModelJob"),
Conta = require("./models/ModelConta"),
Lixo = require("./models/ModelLixo");
SMCodes.commands = new Discord.Collection();
SMCodes.aliases = new Discord.Collection();
mongoose.connect('mongodb+srv://SMCodes:samuelpvp@omnistack9-kbth1.mongodb.net/botrpg?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});


SMCodes.on("guildMemberAdd", async member => {
	const verificar = await Server.findOne({ server_id: member.guild.id });
	if(verificar != null) {
		if(verificar.bem_vindo != null && verificar.channel_bem_vindo != null) {
			canal = SMCodes.channels.get(verificar.channel_bem_vindo);
			canal.send(verificar.bem_vindo);
		}
	}
});
SMCodes.on("guildMemberRemove", async member => {
	const verificar = await Server.findOne({ server_id: member.guild.id });
	if(verificar != null) {
		if(verificar.bye_bye != null && verificar.channel_bye_bye != null) {
			canal = SMCodes.channels.get(verificar.channel_bye_bye);
			canal.send(verificar.bye_bye);
		}
	}
});

var comandos = [];
fs.readdir('./comandos', function(err,file) {
	if(err) console.log(err)
	let jsfile = file.filter(f => f.split('.')
	.pop() === 'js')
	if(jsfile.length < 0) {
		console.log('Não temos nenhum comando na pasta de Comandos.')
	}
	jsfile.forEach(function (f, i) {
        let pull = require(`./comandos/${f}`)
        comandos.push({ name: pull.config.name, help: pull.config.help, permission: pull.config.permission });
		SMCodes.commands.set(pull.config.name, pull)
		pull.config.aliases.forEach(function(alias) {
			SMCodes.aliases.set(alias, pull.config.name)
		})
	})
});
fs.readdir('./Jobs', function(err,file) {
	if(err) console.log(err)
	let jsfile = file.filter(f => f.split('.')
	.pop() === 'js')
	if(jsfile.length < 0) {
		console.log('Não temos nenhum comando na pasta de Jobs.')
	}
	jsfile.forEach(function (f, i) {
        let pull = require(`./Jobs/${f}`)
        comandos.push({ name: pull.config.name, help: pull.config.help, permission: pull.config.permission });
		SMCodes.commands.set(pull.config.name, pull)
		pull.config.aliases.forEach(function(alias) {
			SMCodes.aliases.set(alias, pull.config.name)
		})
	})
});
SMCodes.on("ready", async () => {
    var usrs = await User.find();
    usrs.map(async us => {
        await User.findOneAndUpdate({
            user_id: us.user_id
        }, {
            mining: false
        });
        var job = await Job.findOne({ id: us.job });
        setInterval(async () => {
            var time = await User.findOne({ user_id: us.user_id });
            if(time.salary <= 0) {
                var guild = SMCodes.guilds.get(us.server_id);
                var user = guild.members.get(us.user_id.toString());
                var a = await Conta.findOne({ user_id: us.user_id });
                var date = new Date();
                await Conta.findOneAndUpdate({
                    user_id: us.user_id
                }, {
                    money: a.money + job.salary
                });
                await User.findOneAndUpdate({
                    user_id: us.user_id
                }, {
                    salary: 3600000
                });
                user.send("**[JOBS]** Parabéns você recebeu um salário de `$ "+job.salary+"` por trabalhar de `"+job.name+"`, continue trabalhando para receber salário novamente, com meu sistema de salário você recebe o salário de acordo com sua profissão a cada 1 hora.");
            } else {
                await User.findOneAndUpdate({
                    user_id: us.user_id
                }, {
                    salary: time.salary - 60000
                });
            }
        }, 3600000);
    });
	console.log(`Bot foi iniciado, com ${SMCodes.users.size} usuários, em ${SMCodes.channels.size} canais, em ${SMCodes.guilds.size} servidores.`);
	let status = [
		{name: `Fui criado pelo SMCodes#0032`, type: 'STREAMING', url:'https://www.twitch.tv/smcodesbot'},
		{name: `Olá meu prefixo é ${config.prefix}`, type: 'PLAYING' },
		{name: `Eu estou em ${SMCodes.guilds.size} servidores`, type: 'PLAYING'},
		{name: `${SMCodes.users.size} pessoas falando blablabla em meu ouvido`,type: 'LISTENING'}
	];
	function setStatus(){
		let altstatus = status [Math.floor(Math.random()*status.length)]
		SMCodes.user.setPresence({game:altstatus})
	}
    setStatus();
    setInterval(async () => {
        var users = await User.find();
        users.map(async u => {
            if(u.energia < u.limitenergia && u.mining === false) {
                await User.findOneAndUpdate({
                    user_id: u.user_id
                }, {
                    energia: u.energia + 1
                });
            }
        });
    }, 10000);
	setInterval(() => setStatus(), 10000);
});
function msToTime(duration) {
	var milliseconds = parseInt((duration % 1000)/100),
	    seconds = parseInt((duration/1000) % 60),
	    minutes = parseInt((duration/(1000 * 60)) % 60),
	    hours = parseInt((duration/(1000 * 60 * 60)) % 24);
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	return hours + ":" + minutes + ":" + seconds;
}
var users_data = [],
trash_data = [];
SMCodes.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    var { tt, position, infos } = prox.is(message.author.id);
    if(tt === true) {
        if(message.content.toLowerCase() === "cancelar") {
            message.reply("**[Sessão] Sessão cancelada com sucesso!**");
        }
        switch(infos.type) {
            case 'create_trash':
                var z = -1;
                for(var x = 0;x <= trash_data.length-1;x++) {
                    if(trash_data[x].user_id === message.author.id) {
                        z = x;
                    }
                }
                console.log(z);
                switch(infos.level) {
                    case 0:
                        message.channel.send("**[Sessão]** Muito bem você digitou o nome do lixo agora por favor digite o valor do lixo »");
                        trash_data.push({ user_id: message.author.id, name: message.content });
                        prox.up(message.author.id);
                        break;
                    case 1:
                        if(isNaN(message.content) === true) return message.reply("**[Sessão] Por favor digite um valor numérico para ser colocado como valor do lixo.**");
                        trash_data[z].value = Number(message.content);
                        message.channel.send("**[Sessão]** Tudo ocorreu bem até agora por favor digite valor de raridade de 1-10 »");
                        prox.up(message.author.id);
                        break;
                    case 2:
                        if(isNaN(message.content) === true) return message.reply("**[Sessão] Por favor digite um valor numérico para ser colocado como um valor de probabildade do lixo.**");
                        await Lixo.create({
                            name: trash_data[z].name,
                            price: trash_data[z].value,
                            rarity: Number(message.content)
                        });
                        message.channel.send("**[Sessão]** Okay, tudo ocorreu bem durante essa sessão então consequentemente o lixo foi criado agora você pode usa-lo.");
                        prox.remove(message.author.id);
                    default:
                        prox.remove(message.author.id);
                        break;
                }
                break;
            case 'create_job':
                var z = -1;
                for(var x = 0;x <= users_data.length-1;x++) {
                    if(users_data[x].user_id === message.author.id) {
                        z = x;
                    }
                }
                switch(infos.level) {
                    case 0:
                        if(isNaN(message.content) === true) return message.reply("**[Sessão]** Por favor digite um valor numérico para ser colocado no id");
                        users_data.push({ user_id: message.author.id, id: message.content });
                        message.channel.send("**[Sessão]** Tudo ocorreu bem agora digite um nome do emprego »");
                        prox.up(message.author.id);
                        break;
                    case 1:
                        var job = await Job.findOne({ name: message.content });
                        if(job !== null) return message.reply("**[Sessão]** um emprego com esse nome já existe.");
                        users_data[z].name = message.content.toLowerCase();
                        message.channel.send("**[Sessão]** Tudo ocorreu bem agora digite uma descrição sobre o emprego »");
                        prox.up(message.author.id);
                        break;
                    case 2:
                        users_data[z].description = message.content;
                        message.channel.send("**[Sessão]** Tudo ocorreu bem agora digite um valor para o sálario do emprego »");
                        prox.up(message.author.id);
                        break;
                    case 3:
                        if(isNaN(message.content) === true) return message.reply("**[Sessão]** Por favor digite um valor numérico para ser setado como salário.");
                        users_data[z].salary = message.content;
                        message.channel.send("**[Sessão]** Tudo ocorreu bem agora digite os comandos exclusivos do emprego (separado por `,`) »");
                        prox.up(message.author.id);
                        break;
                    case 4:
                        var msg = message.content.split(",");
                        for(var loop = 0;loop <= msg.length-1;loop++) {
                            msg[loop] = msg[loop].trim();
                        }
                        users_data[z].unique = msg;
                        message.channel.send("**[Sessão]** Tudo ocorreu bem agora digite o level necessário para conseguir trabalhar nesse emprego »");
                        prox.up(message.author.id);
                        break;
                    case 5:
                        if(isNaN(message.content) === true) return message.reply("**[Sessão]** Por favor digite um valor numérico para ser setado como level necessário.");
                        users_data[z].level = message.content;
                        var job = await Job.create({
                            id: users_data[z].id,
                            name: users_data[z].name.toLowerCase(),
                            description: users_data[z].description,
                            salary: users_data[z].salary,
                            category: "Empregos",
                            unique_commands: users_data[z].unique,
                            level: message.content
                        });
                        message.channel.send("**[Sessão]** Parabéns você conseguiu completar 100% de uma Sessão com sucesso");
                        prox.remove(message.author.id);
                        break;
                    default:
                        prox.remove(message.author.id);
                        break;
                }
                break;
        }
        return;
    }
    var verificar = await Channel.findOne({ channel_id: message.channel.id });
    var prefix = await searchPrefix(message.mentions._guild.id);
    var status = await fuc.verificationStaffer(message.author.id);
    if(verificar !== null && verificar.muted === true) {
        if(!message.member.hasPermission("ADMINISTRATOR") && status === false) {
            message.delete().catch(O_o=>{});
            var user = message.guild.members.get(message.author.id);
            var userblocked = message.guild.members.get(verificar.pquem);
            var canal = SMCodes.channels.get(verificar.channel_id);
            user.send("Não foi possível enviar mensagem no canal "+canal+" o staffer "+userblocked.user.username+" bloqueou esse canal.");
            return;
        }
    }
	var servidor = await Server.findOne({ server_id: message.mentions._guild.id });
	if(servidor !== null && servidor.block_link === true) {
		if(message.content.toLowerCase().indexOf("https://") != -1 || message.content.toLowerCase().indexOf("http://") != -1) {
            if(!message.member.hasPermission("ADMINISTRATOR") && status === false) {
                message.delete().catch(O_o=>{}).then(msg => {
                    msg.channel.send(message.author+", por favor não mande link nesse servidor.");
                });
                return;
            }
		}
	}
	if(message.content.startsWith(`<@!${SMCodes.user.id}>`)){
		if(prefix) {
            message.channel.send(` **Oi**, **eu me chamo ${SMCodes.user.username} e meu prefixo é **\`${prefix}\` `);
        }
	}
	if(prefix) {
		const usuario = await User.findOne({ user_id: message.author.id });
		if(!message.content.startsWith(prefix)) return
		let args = message.content.slice(prefix.length).trim().split(" ")
		let cmd = args.shift().toLowerCase()
		let commandFile = SMCodes.commands.get(cmd) || SMCodes.commands.get(SMCodes.aliases.get(cmd))
		if(!commandFile) {
		} else {
            message.delete().catch(O_o=>{});
			if(usuario != null && usuario.banido === true) {
				message.reply("Você está banido de nosso sistema não pode usar nenhum comando.");
			} else {
                if(usuario.server_id != message.guild.id) {
                    console.log("O usuário "+usuario.user_id+" trocou de servidor para o "+message.guild.id);
                    await User.findOneAndUpdate({
                        user_id: message.author.id
                    }, {
                        server_id: message.guild.id
                    });
                }
                var st = true;
                comandos.map(comando => {
                    if(cmd === comando.name) {
                        if(usuario.cargo > comando.permission) {
                            st = false;
                        }
                    }
                });
                if(st === false) return message.reply("Você não tem permissão para executar esse comando.");
                var author = message.guild.members.get(message.author.id);
				commandFile.run(SMCodes, message, args, author, prefix, message.mentions._guild, usuario);
			}
		}
	}
});
SMCodes.login(config.token);
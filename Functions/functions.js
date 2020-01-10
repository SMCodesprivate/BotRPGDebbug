const Discord = require("discord.js"),
    Conta = require("../models/ModelConta"),
    Banco = require("../models/ModelBanco"),
    Reg = require("../models/modelreg"),
    Cargos = require("../models/ModelCargos"),
    Categoria = require("../models/modelcategorias"),
    fs = require('fs'),
    User = require("../models/ModelUser"),
    Bot = require("../models/ModelBot"),
    searchPrefix = require('../Functions/searchPrefix');
function getColor() {
    var colors = "0123456789ABCDEF";
    colors.split("");
    var color = "";
    for (var x = 0; x <= 5; x++) {
        color += colors[Math.floor(Math.random() * colors.length)];
    }
    return color;
}

async function registerCategoria(file, path, id) {
    var sd = await file.split(".js");
    var top = {};
    top[sd[0]] = require("../" + path + "/" + sd[0] + ".js");
    var { name, category, aliases, categoryemoji } = top[sd[0]].config;
    var catego = await Categoria.findOne({ categoria: category });
    if(catego == null) {
        commands = await Reg.find({ category: category });
        var af = [];
        af.push({ name, path });
        catego = await Categoria.create({
            categoria: category,
            emoji: categoryemoji,
            quantidade: commands.length,
            comandos: JSON.stringify([{ name: sd[0], path }]),
            quantidade: 1
        });
    } else {
        var names = [];
        JSON.parse(catego.comandos).map(cat => {
            names.push(cat.name);
        });
        if(names.indexOf(sd[0]) !== -1) return;
        var vejo = await Categoria.find({ categoria: category });
        var [{ comandos, quantidade }] = vejo;
        comandos = JSON.parse(comandos);
        var pos = [];
        var deixa = Number(quantidade + 1);
        if(pos.indexOf(sd[0]) == -1) {
            comandos.push({ name: sd[0], path });
            let mudar = await Categoria.findOneAndUpdate({
                categoria: category
            }, {
                comandos: JSON.stringify(comandos),
                quantidade: deixa
            });
        }
    }
}
async function Registrar(id) {
    fs.readdir('./comandos', async function (error, files) {
        for(var o = 0;o <= files.length-1;o++) {
            await registerCategoria(files[o], "comandos", id);
        }
    });
    fs.readdir('./Jobs', async function (error, files) {
        for(var o = 0;o <= files.length-1;o++) {
            await registerCategoria(files[o], "Jobs", id);
        }
    });
}
async function upBot(qtn, id) {
    var update = await Bot.findOne({ id: id });
    if (update === null) {
        await Registrar(id);
        var categorias = await Categoria.find();
        var quantia = 0;
        categorias.map(cg => {
            console.log(cg.comandos, JSON.parse(cg.comandos));
            quantia += JSON.parse(cg.comandos).length;
        });
        var users = await User.find();
        update = await Bot.create({
            id: id,
            version: 100,
            comandos: quantia,
            categorias: categorias.length,
            registered: users.length
        });
    } else {
        var users = await User.find();
        await Registrar(id);
        var categorias = await Categoria.find();
        var quantia = 0;
        categorias.map(cg => {
            quantia += JSON.parse(cg.comandos).length;
        });
        await Bot.findOneAndUpdate({
            id
        }, {
            version: Number(update.version) + Number(qtn),
            registered: users.length,
            comandos: quantia
        });
        update = await Bot.findOne({ id });
    }
    return update;
}
function msToHMS( ms ) {
    var seconds = ms / 1000;
    var hours = parseInt( seconds / 3600 );
    seconds = seconds % 3600;
    var minutes = parseInt( seconds / 60 );
    seconds = seconds % 60;
    var result = hours+":"+minutes+":"+seconds;
    return result;
}
async function verificationStaffer(id) {
    var user = await User.findOne({ user_id: id });
    var cargos = await Cargos.find();
    var status = false;
    if(user === null || user.cargo === null) return status;
    for(var x = 0;x <= cargos.length-1;x++) {
        if(user.cargo === cargos[x].level) {
            status = true;
        }
    }
    return status;
}
async function createBank(server_id) {
    var banco = await Banco.create({
        server_id,
        imposto: 13,
        taxas: 0,
        money: 0,
        depositos: 0,
        saques: 0,
        funcionarios: [],
        cartoes: []
    });
    return banco;
}
async function withdraw(user_id, server, quantidade, msg) {
    var conta = await Conta.findOne({ user_id: user_id });
    var error = null;
    if(conta.money >= Number(quantidade)) {
        var banco = await Banco.findOne({ server_id: server });
        if(banco === null) {
            banco = await createBank(server);
        }
        if(banco.money >= Number(quantidade)) {
            var user = await User.findOne({ user_id: user_id });
            await Conta.findOneAndUpdate({
                user_id: user_id
            }, {
                money: conta.money - quantidade,
                saques: conta.saques + 1
            });
            await User.findOneAndUpdate({
                user_id: user_id
            }, {
                money: user.money + quantidade
            });
            await Banco.findOneAndUpdate({
                server_id: server
            }, {
                money: banco.money - quantidade,
                saques: banco.saques + 1
            });
        } else {
            error = "o cofre do banco não tem "+Number(quantidade)+" então não pode ser retirado.";
        }
    } else {
        error = "você não tem "+Number(quantidade)+" em sua conta.";
    }
    conta = await Conta.findOne({ user_id: user_id }),
    banco = await Banco.findOne({ server }),
    user = await User.findOne({ user_id: user_id })
    return { error, conta, banco, user };
}
async function deposit(user_id, server, quantidade, msg) {
    var user = await User.findOne({ user_id: user_id });
    var error = null;
    if(user.money >= Number(quantidade)) {
        var conta = await Conta.findOne({ user_id: user_id }),
        banco = await Banco.findOne({ server_id: server });
        if(banco === null) {
            banco = await createBank(server);
        }
        var newMoney = Math.floor((Number(quantidade) / 100) * (100 - banco.imposto));
        var taxa = Math.floor(Number(quantidade) - newMoney);
        await Conta.findOneAndUpdate({
            user_id: user_id
        }, {
            money: Math.floor(conta.money + newMoney),
            taxas: conta.taxas + taxa,
            depositos: conta.depositos + 1
        });
        await User.findOneAndUpdate({
            user_id: user_id
        }, {
            money: Math.floor(user.money - Number(quantidade))
        });
        await Banco.findOneAndUpdate({
            server_id: server
        }, {
            money: Math.floor(banco.money + newMoney),
            taxas: Math.floor(banco.taxas + taxa),
            depositos: banco.depositos + 1
        });
    } else {
        error = "você não tem "+Number(quantidade)+" para ser depositado.";
    }
    conta = await Conta.findOne({ user_id: user_id }),
    banco = await Banco.findOne({ server }),
    user = await User.findOne({ user_id: user_id })
    return { error, conta, banco, user };
}
function transformAcc(conta, author) {
    var embed = new Discord.RichEmbed()
        .setColor("#"+getColor())
        .setTitle("Conta de "+author.user.username)
        .setThumbnail(author.user.avatarURL)
        .addBlankField()
        .addField("**Saques »**", "```"+conta.saques+"```", true)
        .addField("**Depósitos »**", "```"+conta.depositos+"```", true)
        .addField("**Money »**", "```"+conta.money+"```", false)
        .addField("**Taxas recolhidas »**", "```"+conta.taxas+"```", false)
        .addBlankField()
        .setTimestamp()
        .setFooter(author.user.tag+" - "+author.user.id, author.user.avatarURL);
    return embed;
}
async function createAccount(id, server_id) {
    var server = await Banco.findOne({ server_id });
    if(server === null) {
        createBank();
    }
    var conta = await Conta.create({
        user_id: id,
        saques: 0,
        depositos: 0,
        money: 0,
        taxas: 0
    });
    return conta;
}
function calculate(number, decPlaces) {
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations
    var abbrev = ["K", "M", "G", "T", "P", "E", "Z", "Y"];

    // Go through the array backwards, so we do the largest first
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation
             if((number == 1000) && (i < abbrev.length - 1)) {
                 number = 1;
                 i++;
             }

             // Add the letter for the abbreviation
             number += abbrev[i];

             // We are done... stop
             break;
        }
    }

    return number;
}
module.exports = {
    getColor,
    Registrar,
    upBot,
    msToHMS,
    verificationStaffer,
    createAccount,
    deposit,
    createBank,
    transformAcc,
    withdraw,
    calculate
};
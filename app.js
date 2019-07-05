const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const token = require('./config/token');
const Pib = require('./models/Pib');
const bot = new TelegramBot(token, {polling: true});

mongoose.connect('mongodb://localhost:27017/pibsdb',{useNewUrlParser: true});

bot.onText(/\/start/,(msg)=>{
    bot.sendMessage(msg.chat.id, 'If you need some help press /help');
});

bot.onText(/\/help/,(msg)=>{
    bot.sendMessage(msg.chat.id, '/create<YearMonthDay>^<Notification>');
    bot.sendMessage(msg.chat.id, '/all - get all of actual notifications');
    bot.sendMessage(msg.chat.id, '/delete<id>');
});

bot.onText(/\/create (.+)/, async (msg, match) => {
    let authorId = msg.from.id;
    let chatId = msg.chat.id;
    let fullMessage = match[1].split('^');
    let data = new Date(fullMessage[0]);
    let message = fullMessage[1];

    data.setUTCHours(data.getUTCHours() + 3);
    try {
        if (!authorId || !message || !data || !authorId || !chatId){
            throw new Error('Some field is empty');
        }
        let pib = await Pib.create({
            text: message,
            date: data,
            authorId: authorId,
            chatId: chatId,
            checked: false
        });
        console.log(pib);
        bot.sendMessage(msg.chat.id, `Notification created`);
    } catch (e) {
        bot.sendMessage(msg.chat.id, `${e.message}`);
    }
});

bot.onText(/\/all/,async (msg)=>{
    try{
        let pibs = await Pib.find({authorId: msg.from.id});
        bot.sendMessage(msg.chat.id, 'If there is nothing, you may not create notification');
        bot.sendMessage(msg.chat.id, 'To create notification use /start');
        bot.sendMessage(msg.chat.id, `${pibs}`);
    }catch (e) {
        console.log(e);
        bot.sendMessage(msg.chat.id, `${e.message}`);
    }
});


bot.onText(/\/delete (.+)/,async (msg,match)=>{
    try{
        await Pib.findByIdAndRemove(match[1],{authorId: msg.from.id});
        bot.sendMessage(msg.chat.id, 'Notification removed');
    }catch (e) {
        console.log(e);
        bot.sendMessage(msg.chat.id, `${e.message}`);
    }
});
setInterval(async () => {
    let date = new Date();
    date.setUTCHours(date.getUTCHours() + 3);
    let activePibs = await Pib.find({checked: false, date:{$lte: date}});
    await Pib.update({_id:activePibs},{checked: true},{multi: true});
    for (const pib of activePibs) {
        bot.sendMessage(pib.chatId, `${pib.text}`);
    }
},5000);

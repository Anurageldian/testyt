const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Replace '' with your actual Telegram Bot API token
const token = '7023424756:AAEhsnny4dDQlb4I5zK3bTDwOf7D_zlvCHI';
const bot = new TelegramBot(token, { polling: true });

// Function to handle incoming messages
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome! Send me a YouTube video URL.');
});

// Function to download video or audio
const downloadMedia = (url, format, chatId) => {
    const fileName = downloaded.${format === 'mp4' ? 'mp4' : 'mp3'};

    if (format === 'mp4') {
        // Download video as MP4
        ytdl(url, { quality: 'highestvideo' })
            .pipe(fs.createWriteStream(fileName))
            .on('finish', () => {
                bot.sendDocument(chatId, fileName).then(() => {
                    fs.unlinkSync(fileName); // Delete after sending
                });
            });
    } else {
        // Download video and convert to MP3
        const tempFile = 'temp-video.mp4';
        ytdl(url)
            .pipe(fs.createWriteStream(tempFile))
            .on('finish', () => {
                ffmpeg(tempFile)
                    .toFormat('mp3')
                    .on('end', () => {
                        bot.sendDocument(chatId, 'temp-video.mp3').then(() => {
                            fs.unlinkSync(tempFile); // Delete the temporary video
                            fs.unlinkSync('temp-video.mp3'); // Delete the MP3 after sending
                        });
                    })
                    .save('temp-video.mp3');
            });
    }
};

// Function to handle video URLs
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const url = msg.text;

    if (ytdl.validateURL(url)) {
        // Ask for format preference
        bot.sendMessage(chatId, 'Choose format: MP3 or MP4', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'MP3', callback_data: 'mp3' },
                        { text: 'MP4', callback_data: 'mp4' }
                    ]
                ]
            }
        });
    } else {
        bot.sendMessage(chatId, 'Please send a valid YouTube URL.');
    }
});

// Handle user's format choice
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const format = callbackQuery.data;
    const url = callbackQuery.message.reply_to_message.text;

    downloadMedia(url, format, chatId);
});

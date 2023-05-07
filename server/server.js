const express = require('express');
const app = express();
const fs = require('fs');
const ftp = require('basic-ftp');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config();
const crypto = require('crypto');

// Отримуємо корінь проекту
const rootDir = path.resolve();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Роут для вивантаження файлів на FTP
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Отримуємо ім'я файлу і його шлях
    const { folderName } = req.body;
    const filename = req.file.originalname;
    const filePath = path.join(rootDir, req.file.path);
    // Підключаємось до FTP-сервера
    const client = new ftp.Client();
    await client.access({
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
    });
    // Створення папки
    await client.ensureDir(folderName);

    // Вивантажуємо файл на FTP
    await client.uploadFrom(filePath, filename);
    client.close();

    // Видаляємо файл з сервера
    fs.unlinkSync(filePath);

    //cтворення посилання на файл
    const md5 = crypto
      .createHash('md5')
      .update(
        `${process.env.SECRET_KEY}${
          folderName ? folderName + '/' : ''
        }${filename}`
      )
      .digest('binary');
    let base64 = Buffer.from(md5, 'binary').toString('base64');
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const secureLink =
      process.env.CDN_BASE + base64 + '/' + folderName + '/' + filename;

    // Повертаємо відповідь з успішним статусом та посиланням
    res
      .status(200)
      .json({ message: 'File uploaded successfully', link: secureLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Запускаємо сервер
app.listen(5000, () => {
  console.log('Server started on port 5000');
});

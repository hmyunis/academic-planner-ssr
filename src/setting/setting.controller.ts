import { Body, Controller, Get, Param, Post, Render } from '@nestjs/common';
import * as fs from 'fs';

@Controller('setting')
export class SettingController {
  @Get('/:username')
  @Render('settingPage')
  getSettingPage(@Param('username') username) {
    const user = getUserbyUsername(username);
    return {
      username,
      timeFormat12: user.setting['12hr'],
      enableNotification: user.setting.enableNotifications,
    };
  }

  @Get('/:username/about')
  @Render('modals/aboutPage')
  getAboutPage(@Param('username') username) {
    const user = getUserbyUsername(username);
    return { username };
  }

  @Post('/:username/save')
  @Render('settingPage')
  updateSetting(@Body() body, @Param('username') username) {
    const readUser = JSON.parse(JSON.stringify(getUserbyUsername(username)));
    readUser.setting['12hr'] = body['12hr'] ?? '';
    readUser.setting.enableNotifications = body.enableNotifications ?? '';
    overwriteFile(readUser, username);
    addNewNotification(
      'You have successfully updated your setting.',
      true,
      username,
    );
    const user = getUserbyUsername(username);
    return {
      username,
      timeFormat12: user.setting['12hr'],
      enableNotification: user.setting.enableNotifications,
    };
  }

  @Get('/:username/delete')
  @Render('signupPage')
  deleteUserAccount(@Param('username') username) {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    readJson.splice(getUserIndex(username), 1);
    const jsonString = JSON.stringify(readJson, null, 2);
    fs.writeFileSync(process.env.FILE_PATH, jsonString);
  }
}

function getUserbyUsername(username: string) {
  try {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    for (let i = 0; i < Object.keys(readJson).length; i++) {
      let user = readJson[i][`user_${i + 1}`];
      if (user.accountDetails.username.trim() === username.trim()) {
        return user;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading or parsing file:', error);
  }
}

function overwriteFile(newUserObj, username: string) {
  try {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    for (let i = 0; i < Object.keys(readJson).length; i++) {
      const user = readJson[i][`user_${i + 1}`];
      if (user.accountDetails.username.trim() === username.trim()) {
        readJson[i][`user_${i + 1}`] = JSON.parse(JSON.stringify(newUserObj));
        const jsonString = JSON.stringify(readJson, null, 2);
        fs.writeFileSync(process.env.FILE_PATH, jsonString);
        console.log('Data has been successfully overwritten.');
        break;
      }
    }
  } catch (error) {
    console.error('Error writing file:', error);
  }
}

function getUserIndex(username: string) {
  try {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    for (let i = 0; i < Object.keys(readJson).length; i++) {
      let user = readJson[i][`user_${i + 1}`];
      if (user.accountDetails.username.trim() === username.trim()) {
        return i;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading or parsing file:', error);
  }
}

function addNewNotification(
  message: string,
  emailIt: boolean,
  username: string,
) {
  const readUser = JSON.parse(JSON.stringify(getUserbyUsername(username)));
  if (readUser.setting.enableNotifications !== 'checked') return null;
  const notification = {
    message,
    timestamp: new Date().toLocaleString(),
    isEmailed: emailIt ? 'green' : 'red',
  };
  readUser.notifications.push(notification);
  overwriteFile(readUser, username);
  if (emailIt) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: readUser.accountDetails.email,
      subject: 'Message from Academic Planner Team',
      text: message,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error:', error.message);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }
}

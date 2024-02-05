import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class SettingService {
  getUserbyUsername(username: string) {
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

  overwriteFile(newUserObj, username: string) {
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

  getUserIndex(username: string) {
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

  addNewNotification(message: string, success: boolean, username: string) {
    const readUser = JSON.parse(
      JSON.stringify(this.getUserbyUsername(username)),
    );
    if (readUser.setting.enableNotifications !== 'checked') return null;
    const notification = {
      message,
      timestamp: new Date().toLocaleString(),
      isPositive: success ? 'green' : 'red',
    };
    readUser.notifications.push(notification);
    this.overwriteFile(readUser, username);
    const emailIt = readUser.setting.allowEmail === 'checked' ? true : false;
    // Email credentials need to be set inside .env
    // if (emailIt) {
    if (false) {
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

  renameUserIds() {
    try {
      const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
      const readJson = JSON.parse(data);
      let transformedArray = readJson.map((obj, index) => {
        let newObj = {};
        Object.keys(obj).forEach((key) => {
          newObj[`user_${index + 1}`] = obj[key];
        });
        Object.keys(obj).forEach((key) => {
          delete obj[key];
        });
        return newObj;
      });
      const jsonString = JSON.stringify(transformedArray, null, 2);
      fs.writeFileSync(process.env.FILE_PATH, jsonString);
    } catch (error) {
      console.error('Error reading or parsing file:', error);
    }
  }
}

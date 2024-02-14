import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class TasksService {
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

  taskExists(taskName: string) {
    try {
      const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
      const readJson = JSON.parse(data);
      for (let i = 0; i < Object.keys(readJson).length; i++) {
        let tasks = readJson[i][`user_${i + 1}`].tasks;
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].taskName.trim() === taskName.trim()) return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error reading or parsing file:', error);
    }
  }

  promoteTask(taskId, username) {
    const readUser = this.getUserbyUsername(username);
    let currentPriority = readUser.tasks[taskId].priority;
    if (currentPriority === '#1EFE80') {
      currentPriority = 'yellow';
    } else if (currentPriority === 'yellow') {
      currentPriority = 'red';
    }
    readUser.tasks[taskId].priority = currentPriority;
    this.overwriteFile(readUser, username);
  }

  demoteTask(taskId, username) {
    const readUser = this.getUserbyUsername(username);
    let currentPriority = readUser.tasks[taskId].priority;
    if (currentPriority === 'red') {
      currentPriority = 'yellow';
    } else if (currentPriority === 'yellow') {
      currentPriority = '#1EFE80';
    }
    readUser.tasks[taskId].priority = currentPriority;
    this.overwriteFile(readUser, username);
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

  courseExists(courseCode: string, username: string) {
    try {
      const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
      const readJson = JSON.parse(data);
      for (let i = 0; i < Object.keys(readJson).length; i++) {
        const user = readJson[i][`user_${i + 1}`];
        if (user.accountDetails.username.trim() === username.trim()) {
          for (let j = 0; j < user.courses.length; j++) {
            if (user.courses[j].courseCode.trim() === courseCode.trim()) {
              return true;
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error(error);
    }
  }

  convertTimeFormat(dateString, is24HourFormat) {
    let dateObj = new Date(dateString);

    if (isNaN(dateObj.getTime())) {
      console.log('Invalid date format');
      return null;
    }

    let formattedDate = dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24HourFormat,
    });

    return formattedDate;
  }

  is12HourFormat(dateString) {
    let dateObj = new Date(dateString);

    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date format');
      return null;
    }

    let formattedTime = dateObj
      .toLocaleString('en-US', { hour12: true })
      .toUpperCase();
    return formattedTime.includes('AM') || formattedTime.includes('PM');
  }

  getAppropriateTimeString(dateString: string, username: string) {
    try {
      const userObj = this.getUserbyUsername(username);
      // true for 12-hour format, false for 24-hour format
      let userTimeSetting =
        userObj.setting.hr12.trim() === 'checked' ? true : false;
      if (this.is12HourFormat(dateString)) {
        if (userTimeSetting) {
          return dateString;
        } else {
          return this.convertTimeFormat(dateString, true);
        }
      } else {
        if (userTimeSetting) {
          return this.convertTimeFormat(dateString, false);
        } else {
          return dateString;
        }
      }
    } catch (error) {
      console.error('');
    }
  }

  getFormattedDatesArray(array, timePropertyName, username) {
    const result = [...array];
    for (let i = 0; i < result.length; i++) {
      let existingTime = result[i][timePropertyName];
      result[i][timePropertyName] = this.getAppropriateTimeString(
        existingTime,
        username,
      );
    }
    return result;
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
}

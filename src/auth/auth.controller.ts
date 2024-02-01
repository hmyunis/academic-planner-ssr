import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
} from '@nestjs/common';
import * as fs from 'fs';

@Controller()
export class AuthController {
  @Get('/signin')
  @Render('loginPage')
  getLoginPage() {}

  @Post('/signin')
  signInUser(@Body() body, @Res() res) {
    if (usernameExists(body.username)) {
      res.render('dashboardPage', {
        currentTime: new Date().toLocaleString(),
        username: body.username,
        pendingTaskCount: getArrayOfTasks(body.username).length,
        arrayOfTasks: getArrayOfTasks(body.username),
      });
    } else {
      res.render('modals/signinFail', {
        imposter: body.username,
        outlineColor: 'red',
      });
    }
  }

  @Get('/signup')
  @Render('signupPage')
  getSignupPage() {}

  @Post('/signup')
  signUpUser(@Body() body, @Res() res) {
    console.log(body);
    if (
      body.password !== body.confirmPassword ||
      emailExists(body.email.trim()) ||
      usernameExists(body.username)
    ) {
      res.render('modals/signupFail', {
        imposter: body.username,
        outlineColor: 'red',
      });
    } else {
      const userId = +getNumberOfExistingUsers() + 1;
      const newUserObj = {
        accountDetails: {
          username: body.username,
          email: body.email,
          password: body.password,
          fullName: '',
          schoolName: '',
          major: '',
          academicYear: '',
        },
        tasks: [],
        courses: [],
        notifications: [],
        setting: {
          hr12: 'checked',
          allowEmail: '',
          enableNotifications: 'checked',
        },
      };
      const wrappedUser = {};
      wrappedUser[`user_${userId}`] = newUserObj;
      const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
      const readJson = JSON.parse(data);
      readJson.push(wrappedUser);
      const jsonString = JSON.stringify(readJson, null, 2);
      fs.writeFileSync(process.env.FILE_PATH, jsonString);
      res.render('moreProfileDetailsPage', {
        username: body.username,
      });
    }
  }

  @Post('/customize/:username')
  customizeUser(@Param('username') username, @Body() body, @Res() res) {
    const readUser = getUserbyUsername(username);
    readUser.accountDetails.fullName = body.fullName;
    readUser.accountDetails.schoolName = body.schoolName;
    readUser.accountDetails.major = body.major;
    readUser.accountDetails.academicYear = body.academicYear;
    readUser.setting.hr12 = body.hr12 ?? '';
    readUser.setting.enableNotifications = body.enableNotifications ?? '';
    readUser.setting.allowEmail = body.allowEmail ?? '';
    overwriteFile(readUser, username);
    addNewNotification(
      'You have customized your profile successfully.',
      true,
      username,
    );
    return res.redirect(`/dashboard/${username}`);
  }
}

function usernameExists(username: string) {
  try {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    for (let i = 0; i < Object.keys(readJson).length; i++) {
      let accountDetail = readJson[i][`user_${i + 1}`].accountDetails;
      if (accountDetail.username.trim() === username.trim()) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error reading or parsing file:', error);
  }
}

function emailExists(email) {
  try {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    for (let i = 0; i < Object.keys(readJson).length; i++) {
      let accountDetail = readJson[i][`user_${i + 1}`].accountDetails;
      if (accountDetail.email.trim() === email.trim()) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error reading or parsing file:', error);
  }
}

function getArrayOfTasks(username: string) {
  const user = getUserbyUsername(username);
  return user.tasks;
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

function getNumberOfExistingUsers() {
  try {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    return readJson.length;
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

function addNewNotification(
  message: string,
  success: boolean,
  username: string,
) {
  const readUser = JSON.parse(JSON.stringify(getUserbyUsername(username)));
  if (readUser.setting.enableNotifications !== 'checked') return null;
  const notification = {
    message,
    timestamp: new Date().toLocaleString(),
    isPositive: success ? 'green' : 'red',
  };
  readUser.notifications.push(notification);
  overwriteFile(readUser, username);
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

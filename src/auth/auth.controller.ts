import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import * as fs from 'fs';

@Controller()
export class AuthController {
  @Get('/signin')
  @Render('loginPage')
  getLoginPage() {
    // console.log(userExists('Hamdi', '12345678'));
    // console.log(getArrayOfTasks('Hamdi').length);
  }

  @Post('/signin')
  signInUser(@Body() body, @Res() res) {
    if (userExists(body.username, body.password)) {
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
  signUpUser(@Body() body) {
    console.log(body);
  }
}

function userExists(username: string, password: string) {
  try {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    for (let i = 0; i < Object.keys(readJson).length; i++) {
      let accountDetail = readJson[i][`user_${i + 1}`].accountDetails;
      if (
        accountDetail.username.trim() === username.trim() &&
        accountDetail.password.trim() === password.trim()
      ) {
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

function getUserbyUsername(username: string){
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
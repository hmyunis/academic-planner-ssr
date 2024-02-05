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
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('/signin')
  @Render('loginPage')
  getLoginPage() {}

  @Post('/signin')
  signInUser(@Body() body, @Res() res) {
    if (this.authService.usernameExists(body.username)) {
      res.render('dashboardPage', {
        currentTime: new Date().toLocaleString(),
        username: body.username,
        pendingTaskCount: this.authService.getArrayOfTasks(body.username)
          .length,
        arrayOfTasks: this.authService.getArrayOfTasks(body.username),
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
    if (
      body.password !== body.confirmPassword ||
      this.authService.emailExists(body.email.trim()) ||
      this.authService.usernameExists(body.username) ||
      !body.email.includes('.')
    ) {
      res.render('modals/signupFail', {
        imposter: body.username,
        outlineColor: 'red',
      });
    } else {
      const userId = +this.authService.getNumberOfExistingUsers() + 1;
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
    const readUser = this.authService.getUserbyUsername(username);
    readUser.accountDetails.fullName = body.fullName;
    readUser.accountDetails.schoolName = body.schoolName;
    readUser.accountDetails.major = body.major;
    readUser.accountDetails.academicYear = body.academicYear;
    readUser.setting.hr12 = body.hr12 ?? '';
    readUser.setting.enableNotifications = body.enableNotifications ?? '';
    readUser.setting.allowEmail = body.allowEmail ?? '';
    this.authService.overwriteFile(readUser, username);
    this.authService.addNewNotification(
      'You have customized your profile successfully.',
      true,
      username,
    );
    return res.redirect(`/dashboard/${username}`);
  }
}

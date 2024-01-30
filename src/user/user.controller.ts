import { Body, Controller, Get, Param, Post, Render, Res } from '@nestjs/common';
import { UserService } from './user.service';
import * as fs from 'fs';

@Controller()
export class UserController {
  constructor(public userService: UserService) {}

  @Get('/dashboard/:username')
  @Render('dashboardPage')
  getDashboardPage(@Param('username') username) {
    const user = getUserbyUsername(username);
    return {
        currentTime: new Date().toLocaleString(),
        username,
        pendingTaskCount: user.tasks.length,
        arrayOfTasks: user.tasks,
      };
  }

  

  @Get('/calendar/:username')
  @Render('calendarPage')
  getCalendarPage(@Param('username') username) {
    const user = getUserbyUsername(username);
    return {
      username,
    };
  }

  @Get('/notification/:username')
  getNotificationPage(@Param('username') username, @Res() res) {
    const user = getUserbyUsername(username);
    res.render('notificationsPage', {
        currentTime: new Date().toLocaleString(),
        username,
        arrayOfNotifications: user.notifications,
        numberOfNotifications: user.notifications.length,
      });
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

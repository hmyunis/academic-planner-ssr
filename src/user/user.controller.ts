import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
} from '@nestjs/common';
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

  @Post('/dashboard/:username/new')
  addNewTask(@Body() body, @Param('username') username, @Res() res) {
    const readUser = JSON.parse(JSON.stringify(getUserbyUsername(username)));
    if (!taskExists(body.taskName)) {
      if (courseExists(body.courseCode, username)) {
        readUser.tasks.push(body);
        console.log('Task has been appended successfully.');
        overwriteFile(readUser, username);
      } else {
        console.log(
          `You haven't been registered for the course ${body.courseCode}.`,
        );
      }
    } else {
      console.log(`"${body.taskName}" already exists.`);
    }
    return res.redirect(`/dashboard/${username}`);
  }

  @Get('/dashboard/:username/new')
  @Render('modals/addNewTask')
  getNewTaskAddingPage(@Param('username') username) {
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

function taskExists(taskName: string) {
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

function courseExists(courseCode: string, username: string) {
  try {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    for (let i = 0; i < Object.keys(readJson).length; i++) {
      const user = readJson[i][`user_${i + 1}`];
      if (
        user.accountDetails.username.trim() === username.trim() &&
        user.courses.courseCode.trim() === courseCode.trim()
      ) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error();
  }
}

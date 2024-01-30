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
      arrayOfTasks: getFormattedDatesArray(user.tasks, "dueTime", username),
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
      arrayOfTasks: getFormattedDatesArray(user.tasks, "dueTime", username),
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
      arrayOfNotifications: getFormattedDatesArray(user.notifications, "timestamp", username),
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

function convertTimeFormat(dateString, is24HourFormat) {
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

function is12HourFormat(dateString) {
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

function getAppropriateTimeString(dateString: string, username: string) {
  try {
    const userObj = getUserbyUsername(username);
    // true for 12-hour format, false for 24-hour format
    let userTimeSetting =
      userObj.setting['12hr'].trim() === 'checked' ? true : false;
    if (is12HourFormat(dateString)) {
      if (userTimeSetting) {
        return dateString;
      } else {
        return convertTimeFormat(dateString, true);
      }
    } else {
      if (userTimeSetting) {
        return convertTimeFormat(dateString, false);
      } else {
        return dateString;
      }
    }
  } catch (error) {
    console.error('');
  }
}

function getFormattedDatesArray(array, timePropertyName, username){
  const result = [...array];
  for (let i = 0 ; i < result.length; i++){
    let existingTime = result[i][timePropertyName];
    result[i][timePropertyName] = getAppropriateTimeString(existingTime, username);
  }
  return result;
}
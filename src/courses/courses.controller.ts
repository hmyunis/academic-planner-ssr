import { Body, Controller, Get, Param, Post, Render, Res } from '@nestjs/common';
import * as fs from 'fs';

@Controller('courses')
export class CoursesController {
  @Get('/:username')
  openCoursesPage(@Param('username') username, @Res() res) {
    const user = getUserbyUsername(username);
    res.render('coursesPage', {
      username,
      arrayOfCourses: user.courses,
      numberOfCourses: user.courses.length,
    });
  }

  @Post('/:username/new')
  addNewCourse(@Body() body, @Param('username') username, @Res() res) {
    const readUser = JSON.parse(JSON.stringify(getUserbyUsername(username)));
      if (!courseExists(body.courseCode, username)) {
        readUser.courses.push(body);
        console.log('Course has been appended successfully.');
        overwriteFile(readUser, username);
      } else {
        console.log(
          `Course ${body.courseCode} already exists.`,
        );
      }
    return res.redirect(`/courses/${username}`);
  }

  @Get('/:username/new')
  @Render('modals/addNewCourse')
  getNewCourseAddingPage(@Param('username') username) {
    const user = getUserbyUsername(username);
    return {
      username,
      arrayOfCourses: user.courses,
      numberOfCourses: user.courses.length,
    };
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
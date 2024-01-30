import { Body, Controller, Get, Param, Res } from '@nestjs/common';
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

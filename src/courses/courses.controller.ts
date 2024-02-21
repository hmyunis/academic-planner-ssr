import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('courses')
@UseGuards(AuthGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get('/:username')
  openCoursesPage(@Param('username') username, @Res() res) {
    const user = this.coursesService.getUserbyUsername(username);
    res.render('coursesPage', {
      username,
      arrayOfCourses: user.courses,
      numberOfCourses: user.courses.length,
    });
  }

  @Post('/:username/new')
  addNewCourse(@Body() body, @Param('username') username, @Res() res) {
    const readUser = JSON.parse(
      JSON.stringify(this.coursesService.getUserbyUsername(username)),
    );
    if (!this.coursesService.courseExists(body.courseCode, username)) {
      readUser.courses.push(body);
      console.log('Course has been appended successfully.');
      this.coursesService.overwriteFile(readUser, username);
      this.coursesService.addNewNotification(
        `You have registered the course ${body.courseName} successfully.`,
        true,
        username,
      );
    } else {
      console.log(`Course ${body.courseCode} already exists.`);
    }
    return res.redirect(`/courses/${username}`);
  }

  @Get('/:username/new')
  @Render('modals/addNewCourse')
  getNewCourseAddingPage(@Param('username') username) {
    const user = this.coursesService.getUserbyUsername(username);
    return {
      username,
      arrayOfCourses: user.courses,
      numberOfCourses: user.courses.length,
    };
  }

  @Get('/:username/reset')
  @Render('coursesPage')
  deleteAllCourses(@Param('username') username, @Res() res) {
    const readUser = JSON.parse(
      JSON.stringify(this.coursesService.getUserbyUsername(username)),
    );
    readUser.courses = [];
    this.coursesService.overwriteFile(readUser, username);
    return res.redirect(`/courses/${username}`);
  }
}

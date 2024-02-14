import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Render,
  Res,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('/dashboard/:username')
  @Render('dashboardPage')
  getDashboardPage(
    @Param('username') username,
    @Query('promote') pTaskId,
    @Query('demote') dTaskId,
    @Query('completed') cTaskId,
  ) {
    if (pTaskId) {
      const existingUser = this.tasksService.getUserbyUsername(username);
      const realTaskId = existingUser.tasks.length - 1 - pTaskId;
      this.tasksService.promoteTask(realTaskId, username);
      console.log(
        `Task number ${realTaskId + 1} has been promoted successfully.`,
      );
    } else if (dTaskId) {
      const existingUser = this.tasksService.getUserbyUsername(username);
      const realTaskId = existingUser.tasks.length - 1 - dTaskId;
      this.tasksService.demoteTask(realTaskId, username);
      console.log(
        `Task number ${realTaskId + 1} has been demoted successfully.`,
      );
    } else if(cTaskId){
      const existingUser = this.tasksService.getUserbyUsername(username);
      const realTaskId = existingUser.tasks.length - 1 - dTaskId;
      this.tasksService.removeTask(realTaskId, username);
      console.log(
        `Task number ${realTaskId + 1} has been removed successfully.`,
      );
    }
    const user = this.tasksService.getUserbyUsername(username);
    return {
      currentTime: new Date().toLocaleString(),
      username,
      pendingTaskCount: user.tasks.length,
      arrayOfTasks: this.tasksService
        .getFormattedDatesArray(user.tasks, 'dueTime', username)
        .reverse(),
    };
  }

  @Post('/dashboard/:username/new')
  addNewTask(@Body() body, @Param('username') username, @Res() res) {
    const readUser = JSON.parse(
      JSON.stringify(this.tasksService.getUserbyUsername(username)),
    );
    if (!this.tasksService.taskExists(body.taskName)) {
      if (this.tasksService.courseExists(body.courseCode, username)) {
        readUser.tasks.push(body);
        console.log('Task has been appended successfully.');
        this.tasksService.overwriteFile(readUser, username);
        this.tasksService.addNewNotification(
          'You have successfully added your task.',
          true,
          username,
        );
      } else {
        console.log(
          `You haven't been registered for the course ${body.courseCode}.`,
        );
        this.tasksService.addNewNotification(
          `You haven't been registered for the course ${body.courseCode}.`,
          false,
          username,
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
    const user = this.tasksService.getUserbyUsername(username);
    return {
      currentTime: new Date().toLocaleString(),
      username,
      pendingTaskCount: user.tasks.length,
      arrayOfTasks: this.tasksService
        .getFormattedDatesArray(user.tasks, 'dueTime', username)
        .reverse(),
    };
  }

  @Get('/dashboard/:username/edit/:taskId')
  @Render('modals/updateTask')
  getUpdateTaskPage(@Param('username') username, @Param('taskId') taskId) {
    const user = this.tasksService.getUserbyUsername(username);
    const realTaskId = user.tasks.length - 1 - taskId;
    const task = user.tasks[realTaskId];
    const { taskName, courseCode, dueTime, description } = task;
    return {
      currentTime: new Date().toLocaleString(),
      username,
      taskId,
      taskName,
      courseCode,
      dueTime,
      description,
      pendingTaskCount: user.tasks.length,
      arrayOfTasks: this.tasksService
        .getFormattedDatesArray(user.tasks, 'dueTime', username)
        .reverse(),
    };
  }

  @Post('/dashboard/:username/:taskId')
  updateTask(
    @Param('username') username,
    @Param('taskId') taskId,
    @Body() body,
    @Res() res,
  ) {
    console.log('You made it to patch handler!');
    console.log(body);
    const user = this.tasksService.getUserbyUsername(username);
    const realTaskId = user.tasks.length - 1 - taskId;
    this.tasksService.editTask(realTaskId, body, username);
    return res.redirect(`/dashboard/${username}`);
  }
}

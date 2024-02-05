import { Controller, Get, Param, Render, Res } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/calendar/:username')
  @Render('calendarPage')
  getCalendarPage(@Param('username') username) {
    const user = this.userService.getUserbyUsername(username);
    return {
      username,
    };
  }

  @Get('/gradebook/:username')
  @Render('gradebookPage')
  getGradebookPage(@Param('username') username) {
    const user = this.userService.getUserbyUsername(username);
    return {
      username,
    };
  }

  @Get('/notification/:username')
  getNotificationPage(@Param('username') username, @Res() res) {
    const user = this.userService.getUserbyUsername(username);
    res.render('notificationsPage', {
      currentTime: new Date().toLocaleString(),
      username,
      arrayOfNotifications: this.userService
        .getFormattedDatesArray(user.notifications, 'timestamp', username)
        .reverse(),
      numberOfNotifications: user.notifications.length,
    });
  }

  @Get('/notification/:username/clear')
  @Render('notificationsPage')
  deleteAllNotification(@Param('username') username, @Res() res) {
    const readUser = JSON.parse(
      JSON.stringify(this.userService.getUserbyUsername(username)),
    );
    readUser.notifications = [];
    this.userService.overwriteFile(readUser, username);
    return res.redirect(`/notification/${username}`);
  }
}

import { Body, Controller, Get, Param, Post, Render } from '@nestjs/common';
import * as fs from 'fs';
import { SettingService } from './setting.service';

@Controller('setting')
export class SettingController {
  constructor(private settingService: SettingService) {}

  @Get('/:username')
  @Render('settingPage')
  getSettingPage(@Param('username') username) {
    const user = this.settingService.getUserbyUsername(username);
    return {
      username,
      timeFormat12: user.setting.hr12,
      enableNotification: user.setting.enableNotifications,
    };
  }

  @Get('/:username/about')
  @Render('modals/aboutPage')
  getAboutPage(@Param('username') username) {
    const user = this.settingService.getUserbyUsername(username);
    return { username };
  }

  @Post('/:username/save')
  @Render('settingPage')
  updateSetting(@Body() body, @Param('username') username) {
    const readUser = JSON.parse(
      JSON.stringify(this.settingService.getUserbyUsername(username)),
    );
    readUser.setting.hr12 = body.hr12 ?? '';
    readUser.setting.enableNotifications = body.enableNotifications ?? '';
    this.settingService.overwriteFile(readUser, username);
    this.settingService.addNewNotification(
      'You have successfully updated your setting.',
      true,
      username,
    );
    const user = this.settingService.getUserbyUsername(username);
    return {
      username,
      timeFormat12: user.setting.hr12,
      enableNotification: user.setting.enableNotifications,
    };
  }

  @Get('/:username/delete')
  @Render('signupPage')
  deleteUserAccount(@Param('username') username) {
    const data = fs.readFileSync(process.env.FILE_PATH, 'utf-8');
    const readJson = JSON.parse(data);
    readJson.splice(this.settingService.getUserIndex(username), 1);
    const jsonString = JSON.stringify(readJson, null, 2);
    fs.writeFileSync(process.env.FILE_PATH, jsonString);
    this.settingService.renameUserIds();
  }
}

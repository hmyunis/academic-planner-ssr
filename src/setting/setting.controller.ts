import { Controller, Get, Param, Render } from '@nestjs/common';
import * as fs from 'fs';

@Controller('setting')
export class SettingController {
  @Get('/:username')
  @Render('settingPage')
  getSettingPage(@Param('username') username) {
    const user = getUserbyUsername(username);
    return {
      username,
      timeFormat12: user.setting['12hr'],
      enableNotification: user.setting.enableNotifications,
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

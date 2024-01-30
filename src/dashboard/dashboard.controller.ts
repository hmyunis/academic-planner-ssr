import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Task } from './dtos/create-task.dto';

@Controller('dashboard')
export class DashboardController {
    constructor(private dashboardService: DashboardService){}

    @Get()
    @Render('dashboard')
    serveDashboardPage(){
        return this.dashboardService.loadDashboard();
    }

    @Post('/new')
    @Render('dashboard-new-task')
    createTask(@Body() body: Task){
        return this.dashboardService.createTask(body);
    }
}

import { Injectable } from '@nestjs/common';
import { Task } from './dtos/create-task.dto';

@Injectable()
export class DashboardService {

    loadDashboard(){
        return {};
    }
    createTask(task: Task){
        return {};
    }
    updateTask(task: Task){
        return {};
    }
    removeTask(task: Task){
        return {};
    }
}

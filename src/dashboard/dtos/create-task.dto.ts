import { IsString } from "class-validator";

export class Task{
    @IsString()
    id: string;
    
    @IsString()
    title: string;
    
    @IsString()
    description: string;
    
    @IsString()
    dueTime: string;
    
    status: TaskStatus;
    priority: PriorityLevel;
}

export enum PriorityLevel{
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}

export enum TaskStatus{
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}
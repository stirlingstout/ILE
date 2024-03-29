import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmptyTask, ITask } from '../services/task';
import { TaskService } from '../services/task.service';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit, OnDestroy {

  currentTask: ITask = EmptyTask;

  taskHtml = '';

  constructor(private taskService: TaskService) { }

  private sub?: Subscription;

  hasPreviousTask() {
    return !!this.currentTask.PreviousTask;
  }

  onPreviousTask() {
    this.taskService.gotoTask(this.currentTask.PreviousTask!);
  }

  hasNextTask() {
    return !!this.currentTask.NextTask;
  }

  onNextTask() {
    this.taskService.gotoTask(this.currentTask.NextTask!);
  }

  ngOnInit(): void {
    this.sub = this.taskService.currentTask.subscribe(task => {
      this.currentTask = task;
      this.taskService.getHtml(this.currentTask.Description).pipe(first()).subscribe(h => this.taskHtml = h);
    })
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}

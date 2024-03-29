import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ITask } from '../services/task';
import { TaskService } from '../services/task.service';

import { TaskComponent } from './task.component';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let taskSubject = new Subject<ITask>();

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['load', 'getHtml', 'gotoTask'], { currentTask: taskSubject });
    taskServiceSpy.getHtml.and.returnValue(of('test html'));

    await TestBed.configureTestingModule({
      declarations: [TaskComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: TaskService,
          useValue: taskServiceSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the task html file', () => {

    const testTask = { Description: 'testfile.html' } as unknown as ITask;
    taskSubject.next(testTask);

    expect(taskServiceSpy.getHtml).toHaveBeenCalledWith('testfile.html');
    expect(component.currentTask).toEqual(testTask);
    expect(component.taskHtml).toEqual('test html');
  });

  it('should disable next task if no next task', () => {

    const testTask = { NextTask: ""} as unknown as ITask;
    taskSubject.next(testTask);

    expect(component.hasNextTask()).toEqual(false);   
  });


  it('should get the next task', () => {

    const testTask = { NextTask: "nexttask.json"} as unknown as ITask;
    taskSubject.next(testTask);
    expect(component.hasNextTask()).toEqual(true);
    component.onNextTask();
    expect(taskServiceSpy.gotoTask).toHaveBeenCalledWith('nexttask.json');
  });

  it('should disable previous task if no previous task', () => {

    const testTask = { PreviousTask: ""} as unknown as ITask;
    taskSubject.next(testTask);

    expect(component.hasPreviousTask()).toEqual(false);   
  });

  it('should get the previous task', () => {

    const testTask = { PreviousTask: "previoustask.json"} as unknown as ITask;
    taskSubject.next(testTask);
    expect(component.hasPreviousTask()).toEqual(true);
    component.onPreviousTask();
    expect(taskServiceSpy.gotoTask).toHaveBeenCalledWith('previoustask.json');
  });


});

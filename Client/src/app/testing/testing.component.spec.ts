import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ITask } from '../services/task';
import { TaskService } from '../services/task.service';
import { of, Subject } from 'rxjs';

import { TestingComponent } from './testing.component';
import { JobeServerService } from '../services/jobe-server.service';
import { RulesService } from '../services/rules.service';
import { EmptyRunResult, RunResult } from '../services/run-result';
import { wrapTests } from '../languages/language-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';

let testRunResultTestPass: RunResult = {
  run_id: 'a',
  outcome: 15,
  cmpinfo: '',
  stdout: 'test pass',
  stderr: ''
}

let testRunResultTestFail: RunResult = {
  run_id: 'a',
  outcome: 12,
  cmpinfo: '',
  stdout: 'test failed',
  stderr: 'test failed error'
}

let testRunResultTestErr: RunResult = {
  run_id: 'a',
  outcome: 12,
  cmpinfo: '',
  stdout: '',
  stderr: 'run error'
}

let testRunResultTestCmp: RunResult = {
  run_id: 'a',
  outcome: 11,
  cmpinfo: 'compile error',
  stdout: '',
  stderr: ''
}

let testRunResultTestOutcome: RunResult = {
  run_id: 'a',
  outcome: 18,
  cmpinfo: '',
  stdout: '',
  stderr: ''
}



describe('TestingComponent', () => {
  let component: TestingComponent;
  let fixture: ComponentFixture<TestingComponent>;
  let jobeServerServiceSpy: jasmine.SpyObj<JobeServerService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let rulesServiceSpy: jasmine.SpyObj<RulesService>;
  let taskSubject = new Subject<ITask>();

  beforeEach(async () => {
    jobeServerServiceSpy = jasmine.createSpyObj('JobeServerService', ['submit_run', 'hasFunctionDefinitions'], { "selectedLanguage": "csharp" });
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['load', 'getHtml'], { currentTask: taskSubject });
    rulesServiceSpy = jasmine.createSpyObj('RulesService', ['filter']);

    await TestBed.configureTestingModule({
      declarations: [TestingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: JobeServerService,
          useValue: jobeServerServiceSpy
        },
        {
          provide: TaskService,
          useValue: taskServiceSpy
        },
        {
          provide: RulesService,
          useValue: rulesServiceSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.result = EmptyRunResult;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the test code file', () => {

    taskServiceSpy.getHtml.and.returnValue(of('test code'));

    const testTask = { Tests: 'testfile.cs' } as unknown as ITask;
    taskSubject.next(testTask);

    expect(taskServiceSpy.getHtml).toHaveBeenCalledWith('testfile.cs');
    expect(component.tests).toEqual('test code');
  });

  it('should disable run tests until code compiled', () => {

    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(false);
    expect(component.canRunTests()).toEqual(false);
  });

  it('should enable run tests when code compiled', () => {

    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(true);
    expect(component.canRunTests()).toEqual(true);
  });

  it('should submit test code - test pass', () => {
    jobeServerServiceSpy.submit_run.and.returnValue(of<RunResult>(testRunResultTestPass));
    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(true);

    component.tests = 'test code';
    const wrapped = wrapTests('csharp', 'test code');

    component.onRunTests();

    expect(jobeServerServiceSpy.submit_run).toHaveBeenCalledWith(wrapped);

    expect(component.currentResultMessage).toEqual('All tests passed.');
    expect(component.currentErrorMessage).toEqual('');
    expect(component.message()).toEqual('All tests passed.');
    expect(component.testedOk).toEqual(true);
  });

  it('should submit test code - test fail', () => {
    jobeServerServiceSpy.submit_run.and.returnValue(of<RunResult>(testRunResultTestFail));
    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(true);

    component.tests = 'test code';
    const wrapped = wrapTests('csharp', 'test code');

    component.onRunTests();

    expect(jobeServerServiceSpy.submit_run).toHaveBeenCalledWith(wrapped);

    expect(component.currentResultMessage).toEqual('test failed');
    expect(component.currentErrorMessage).toEqual('');
    expect(component.message()).toEqual('test failed');
    expect(component.testedOk).toEqual(false);
  });

  it('should submit test code - test error', () => {
    jobeServerServiceSpy.submit_run.and.returnValue(of<RunResult>(testRunResultTestErr));
    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(true);
    rulesServiceSpy.filter.and.callFake((_l, _e, tf) => tf);

    component.tests = 'test code';
    const wrapped = wrapTests('csharp', 'test code');

    component.onRunTests();

    expect(jobeServerServiceSpy.submit_run).toHaveBeenCalledWith(wrapped);

    expect(component.currentResultMessage).toEqual('');
    expect(component.currentErrorMessage).toEqual('run error');
    expect(component.message()).toEqual('');
    expect(component.testedOk).toEqual(false);
  });

  it('should submit test code - test compile error', () => {
    jobeServerServiceSpy.submit_run.and.returnValue(of<RunResult>(testRunResultTestCmp));
    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(true);


    component.tests = 'test code';
    const wrapped = wrapTests('csharp', 'test code');

    component.onRunTests();

    expect(jobeServerServiceSpy.submit_run).toHaveBeenCalledWith(wrapped);

    expect(component.currentResultMessage).toEqual("Your function signature does not match that expected by the tests. Re-read the Task and, if you can't see why your function signature is wrong, use a Hint.");
    expect(component.currentErrorMessage).toEqual('compile error');
    expect(component.message()).toEqual("Your function signature does not match that expected by the tests. Re-read the Task and, if you can't see why your function signature is wrong, use a Hint.");
    expect(component.testedOk).toEqual(false);
  });

  it('should submit test code - test outcome error', () => {
    jobeServerServiceSpy.submit_run.and.returnValue(of<RunResult>(testRunResultTestOutcome));
    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(true);

    component.tests = 'test code';
    const wrapped = wrapTests('csharp', 'test code');

    component.onRunTests();

    expect(jobeServerServiceSpy.submit_run).toHaveBeenCalledWith(wrapped);

    expect(component.currentResultMessage).toEqual('');
    expect(component.currentErrorMessage).toEqual('Unknown or pending outcome');
    expect(component.message()).toEqual('');
    expect(component.testedOk).toEqual(false);
  });

  it('should allow testing when jobe server has test functions', () => {
    
    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(true);
    component.testedOk = true;
    component.currentErrorMessage = 'message';
    component.result = EmptyRunResult;

    expect(component.canRunTests()).toEqual(true);
    expect(component.testedOk).toBe(true);
    expect(component.currentErrorMessage).toEqual('message');
    expect(component.result.outcome).toBe(0);
  });

  it('should not allow testing when jobe server has no test functions', () => {
    
    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(false);

    component.testedOk = true;
    component.currentErrorMessage = 'message';
    component.result = EmptyRunResult;

    expect(component.canRunTests()).toEqual(false);
    expect(component.testedOk).toBe(false);
    expect(component.currentErrorMessage).toEqual('');
    expect(component.result.outcome).toBe(0);
  });

  it('should not allow testing when tests run', () => {
    
    jobeServerServiceSpy.hasFunctionDefinitions.and.returnValue(false);
    component.testedOk = true;
    component.currentErrorMessage = 'message';
    component.result = testRunResultTestOutcome;

    expect(component.canRunTests()).toEqual(false);
    expect(component.testedOk).toBe(false);
    expect(component.currentErrorMessage).toEqual('');
    expect(component.result.outcome).toBe(0);
  });

});

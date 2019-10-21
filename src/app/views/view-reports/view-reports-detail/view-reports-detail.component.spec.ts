import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReportsDetailComponent } from './view-reports-detail.component';

describe('viewReportsDetailComponent', () => {
  let component: ViewReportsDetailComponent;
  let fixture: ComponentFixture<ViewReportsDetailComponent>;

  beforeEach(async(() => {
    let component: ViewReportsDetailComponent;
  let fixture: ComponentFixture<ViewReportsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewReportsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReportsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  }));
});

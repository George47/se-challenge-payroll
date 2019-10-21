import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RowPaginatorComponent } from './row-paginator.component';

describe('RowPaginatorComponent', () => {
  let component: RowPaginatorComponent;
  let fixture: ComponentFixture<RowPaginatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RowPaginatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RowPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

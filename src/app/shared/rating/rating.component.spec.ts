import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RatingComponent } from './rating.component';

@Component({
  template: ` <app-rating [(ngModel)]="rating" [disabled]="disabled" (ngModelChange)="onChange()"> </app-rating>`,
})
class TestHostComponent {
  disabled = false;
  rating = 1;
  changed = 0;
  onChange() {
    this.changed++;
  }
}

describe('RatingComponent', () => {
  let hostComponent: TestHostComponent;
  let ratingEl: HTMLElement;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RatingComponent, TestHostComponent],
      imports: [FormsModule, IonicModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    ratingEl = fixture.nativeElement.querySelector('app-rating');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
    expect(ratingEl).toBeTruthy();
  });

  describe('when enabled', () => {
    it('sets the rating on click', () => {
      const stars = ratingEl.querySelectorAll('ion-icon');
      stars[3].click();
      expect(hostComponent.rating).toEqual(4);
    });

    it('calls the change handler on click', () => {
      const stars = ratingEl.querySelectorAll('ion-icon');
      hostComponent.changed = 0;
      stars[3].click();
      expect(hostComponent.changed).toEqual(1);
    });

    it('sets the opacity to 1', () => {
      expect(ratingEl.style.opacity).toEqual('1');
    });
  });

  describe('when disabled', () => {
    beforeEach(() => {
      hostComponent.disabled = true;
      fixture.detectChanges();
    });

    it('sets the opacity to 0.25', () => {
      expect(ratingEl.style.opacity).toEqual('0.25');
    });

    it('does not set the rating on click', () => {
      const stars = ratingEl.querySelectorAll('ion-icon');
      stars[3].click();
      expect(hostComponent.rating).toEqual(1);
    });

    it('does not call the change handler on click', () => {
      const stars = ratingEl.querySelectorAll('ion-icon');
      hostComponent.changed = 0;
      stars[3].click();
      expect(hostComponent.changed).toEqual(0);
    });
  });
});

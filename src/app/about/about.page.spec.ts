import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideMockStore } from '@ngrx/store/testing';
import { IonicModule } from '@ionic/angular';

import { AboutPage } from './about.page';
import { AuthenticationService } from '@app/core';
import { createAuthenticationServiceMock } from '@app/core/testing';
import { Store } from '@ngrx/store';
import { logout } from '@app/store/actions';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AboutPage],
      imports: [IonicModule],
      providers: [
        provideMockStore(),
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('logout button', () => {
    it('dispatches the logout button', () => {
      const button = fixture.debugElement.query(By.css('[data-testid="logout-button"]'));
      const store = TestBed.inject(Store);
      spyOn(store, 'dispatch');
      click(button.nativeElement);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(logout());
    });
  });

  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };
});

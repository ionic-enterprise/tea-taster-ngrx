import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Tea } from '@app/models';
import { SharedModule } from '@app/shared';
import { selectTeas } from '@app/store';
import { teaDetailsChangeRating } from '@app/store/actions';
import { DataState, initialState } from '@app/store/reducers/data.reducer';
import { IonicModule, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { createActivatedRouteMock, createNavControllerMock } from '@test/mocks';

import { TeaDetailsPage } from './tea-details.page';

describe('TeaDetailsPage', () => {
  let component: TeaDetailsPage;
  let fixture: ComponentFixture<TeaDetailsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TeaDetailsPage],
      imports: [IonicModule.forRoot(), FormsModule, SharedModule],
      providers: [
        provideMockStore<{ data: DataState }>({
          initialState: { data: initialState },
        }),
        { provide: ActivatedRoute, useFactory: createActivatedRouteMock },
        { provide: NavController, useFactory: createNavControllerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeaDetailsPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    let store: MockStore;
    beforeEach(() => {
      const route = TestBed.inject(ActivatedRoute);
      (route.snapshot.paramMap.get as any).withArgs('id').and.returnValue('7');
      store = TestBed.inject(Store) as MockStore;
      store.overrideSelector(selectTeas, [
        {
          id: 7,
          name: 'White',
          description: 'Often looks like frosty silver pine needles',
          image: 'imgs/white.png',
          rating: 4,
        },
        {
          id: 42,
          name: 'Green',
          description: 'Delecate flavor',
          image: 'imgs/green.png',
          rating: 3,
        },
      ]);
    });

    it('binds the name', () => {
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('[data-testid="name"]'));
      expect(el.nativeElement.textContent.trim()).toBe('White');
    });

    it('binds the description', () => {
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('[data-testid="description"]'));
      expect(el.nativeElement.textContent.trim()).toBe('Often looks like frosty silver pine needles');
    });

    it('initializes the rating', () => {
      fixture.detectChanges();
      expect(component.rating).toBe(4);
    });
  });

  describe('rating click', () => {
    let store: MockStore;
    const tea = {
      id: 7,
      name: 'White',
      description: 'Often looks like frosty silver pine needles',
      image: 'imgs/white.png',
      rating: 4,
    };
    beforeEach(() => {
      store = TestBed.inject(Store) as MockStore;
      fixture.detectChanges();
    });

    it('dispatches a rating change action', () => {
      spyOn(store, 'dispatch');
      component.rating = 3;
      component.changeRating(tea);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(teaDetailsChangeRating({ tea, rating: 3 }));
    });
  });
});

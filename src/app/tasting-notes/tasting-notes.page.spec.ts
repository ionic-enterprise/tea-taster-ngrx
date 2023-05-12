import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AlertController, IonicModule, IonRouterOutlet, ModalController } from '@ionic/angular';

import { DataState, initialState } from '@app/store/reducers/data.reducer';
import { TastingNotesPage } from './tasting-notes.page';
import { selectNotes } from '@app/store';
import { TastingNote } from '@app/models';
import { noteDeleted, notesPageLoaded } from '@app/store/actions';
import { createOverlayControllerMock, createOverlayElementMock } from '@test/mocks';
import { TastingNoteEditorModule } from './tasting-note-editor/tasting-note-editor.module';
import { TastingNoteEditorComponent } from './tasting-note-editor/tasting-note-editor.component';

describe('TastingNotesPage', () => {
  let component: TastingNotesPage;
  let fixture: ComponentFixture<TastingNotesPage>;
  let alert: HTMLIonAlertElement;
  let modal: HTMLIonModalElement;
  let testData: Array<TastingNote>;

  const mockRouterOutlet = {
    nativeEl: {},
  };

  beforeEach(waitForAsync(() => {
    initializeTestData();
    alert = createOverlayElementMock('Alert');
    modal = createOverlayElementMock('Modal');
    TestBed.configureTestingModule({
      declarations: [TastingNotesPage],
      imports: [IonicModule, TastingNoteEditorModule],
      providers: [
        { provide: AlertController, useFactory: () => createOverlayControllerMock('AlertController', alert) },
        { provide: ModalController, useFactory: () => createOverlayControllerMock('ModalController', modal) },
        { provide: IonRouterOutlet, useValue: mockRouterOutlet },
        provideMockStore<{ data: DataState }>({
          initialState: { data: initialState },
        }),
      ],
    }).compileComponents();

    const store = TestBed.inject(Store) as MockStore;
    store.overrideSelector(selectNotes, testData);

    fixture = TestBed.createComponent(TastingNotesPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('dispatches notes page loaded', () => {
      const store = TestBed.inject(Store);
      spyOn(store, 'dispatch');
      fixture.detectChanges();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(notesPageLoaded());
    });

    it('displays the notes', () => {
      fixture.detectChanges();
      const items = fixture.debugElement.queryAll(By.css('ion-item'));
      expect(items.length).toEqual(2);
      expect(items[0].nativeElement.textContent).toContain('Bentley');
      expect(items[1].nativeElement.textContent).toContain('Lipton');
    });
  });

  describe('add new note', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('creates the editor modal', () => {
      const modalController = TestBed.inject(ModalController);
      const button = fixture.debugElement.query(By.css('[data-testid="add-new-button"]')).nativeElement;
      click(button);
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        component: TastingNoteEditorComponent,
        backdropDismiss: false,
        presentingElement: mockRouterOutlet.nativeEl as any,
      });
    });

    it('displays the editor modal', fakeAsync(() => {
      const button = fixture.debugElement.query(By.css('[data-testid="add-new-button"]')).nativeElement;
      click(button);
      tick();
      expect(modal.present).toHaveBeenCalledTimes(1);
    }));
  });

  describe('update an existing note', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('creates the editor modal', () => {
      const modalController = TestBed.inject(ModalController);
      const item = fixture.debugElement.query(By.css('ion-item')).nativeElement;
      click(item);
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        component: TastingNoteEditorComponent,
        backdropDismiss: false,
        presentingElement: mockRouterOutlet.nativeEl as any,
        componentProps: { note: testData[0] },
      });
    });

    it('displays the editor modal', fakeAsync(() => {
      const item = fixture.debugElement.query(By.css('ion-item')).nativeElement;
      click(item);
      tick();
      expect(modal.present).toHaveBeenCalledTimes(1);
    }));
  });

  describe('deleting a note', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenRenderingDone();
      (alert.onDidDismiss as jasmine.Spy).and.resolveTo({ role: 'yes' });
    });

    it('asks the user if they would like to remove the note', fakeAsync(() => {
      const buttons = fixture.debugElement.queryAll(By.css('ion-item-option'));
      click(buttons[1].nativeElement);
      tick();
      expect(alert.present).toHaveBeenCalledTimes(1);
    }));

    describe('when the user answers yes', () => {
      beforeEach(() => {
        (alert.onDidDismiss as jasmine.Spy).and.resolveTo({ role: 'yes' });
      });

      it('dispatches a delete for the note', fakeAsync(() => {
        const store = TestBed.inject(Store);
        spyOn(store, 'dispatch');
        const buttons = fixture.debugElement.queryAll(By.css('ion-item-option'));
        click(buttons[1].nativeElement);
        tick();
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(
          noteDeleted({
            note: {
              id: 42,
              brand: 'Lipton',
              name: 'Yellow Label',
              notes: 'Overly acidic, highly tannic flavor',
              rating: 1,
              teaCategoryId: 3,
            },
          })
        );
      }));
    });

    describe('when the user answers no', () => {
      beforeEach(() => {
        (alert.onDidDismiss as jasmine.Spy).and.resolveTo({ role: 'no' });
      });

      it('does not dispatch a delete', fakeAsync(() => {
        const store = TestBed.inject(Store);
        spyOn(store, 'dispatch');
        const buttons = fixture.debugElement.queryAll(By.css('ion-item-option'));
        click(buttons[1].nativeElement);
        tick();
        expect(store.dispatch).not.toHaveBeenCalled();
      }));
    });
  });

  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };

  const initializeTestData = () => {
    testData = [
      {
        id: 73,
        brand: 'Bentley',
        name: 'Brown Label',
        notes: 'Essentially OK',
        rating: 3,
        teaCategoryId: 2,
      },
      {
        id: 42,
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      },
    ];
  };
});

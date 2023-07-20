import { Component, Input, OnInit } from '@angular/core';
import { TastingNote, Tea } from '@app/models';
import { selectTeas } from '@app/store';
import { noteSaved } from '@app/store/actions';
import { Share } from '@capacitor/share';
import { ModalController, Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tasting-note-editor',
  templateUrl: './tasting-note-editor.component.html',
  styleUrls: ['./tasting-note-editor.component.scss'],
})
export class TastingNoteEditorComponent implements OnInit {
  @Input() note: TastingNote;

  brand: string;
  name: string;
  teaCategoryId: string;
  rating: number;
  notes: string;

  teaCategories$: Observable<Array<Tea>>;

  constructor(
    private modalController: ModalController,
    private platform: Platform,
    private store: Store,
  ) {}

  get title(): string {
    return this.note ? 'Tasting Note' : 'Add New Tasting Note';
  }

  get buttonLabel(): string {
    return this.note ? 'Update' : 'Add';
  }

  get sharingIsAvailable(): boolean {
    return this.platform.is('hybrid');
  }

  get allowSharing(): boolean {
    return !!(this.brand && this.name && this.rating);
  }

  ngOnInit() {
    this.teaCategories$ = this.store.select(selectTeas);
    if (this.note) {
      this.brand = this.note.brand;
      this.name = this.note.name;
      this.teaCategoryId = this.note.teaCategoryId.toString();
      this.rating = this.note.rating;
      this.notes = this.note.notes;
    }
  }

  close() {
    this.modalController.dismiss();
  }

  save() {
    const note: TastingNote = {
      brand: this.brand,
      name: this.name,
      teaCategoryId: parseInt(this.teaCategoryId, 10),
      rating: this.rating,
      notes: this.notes,
    };

    if (this.note) {
      note.id = this.note.id;
    }

    this.store.dispatch(noteSaved({ note }));
    this.modalController.dismiss();
  }

  async share(): Promise<void> {
    await Share.share({
      title: `${this.brand}: ${this.name}`,
      text: `I gave ${this.brand}: ${this.name} ${this.rating} stars on the Tea Taster app`,
      dialogTitle: 'Share your tasting note',
      url: 'https://tea-taster-training.web.app',
    });
  }
}

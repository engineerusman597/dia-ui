import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [
    PdfViewerModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent {
  @Input() src: string | null = null;
  @Input() height: string = '400px';

  rotation: number = 0;

  rotateCw() {
    this.rotation = (this.rotation + 90) % 360;
  }

  rotateCcw() {
    this.rotation = (this.rotation - 90 + 360) % 360;
  }
}

import { Component, Inject, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface CameraDialogData {
  type: 'id' | 'proof';
}

export interface CameraDialogResult {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-camera-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './camera-dialog.component.html',
  styleUrls: ['./camera-dialog.component.scss']
})
export class CameraDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  capturedImage: string | null = null;
  capturedBlob: Blob | null = null;
  streamReady = false;
  cameraError: string | null = null;
  private stream: MediaStream | null = null;

  constructor(
    private dialogRef: MatDialogRef<CameraDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CameraDialogData
  ) { }

  ngAfterViewInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  private async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      this.videoRef.nativeElement.srcObject = this.stream;
      this.streamReady = true;
    } catch (err) {
      this.cameraError = 'Unable to access camera. Please check permissions.';
      console.error('Camera error:', err);
    }
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  capture() {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      this.capturedImage = canvas.toDataURL('image/jpeg', 0.9);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            this.capturedBlob = blob;
          }
        },
        'image/jpeg',
        0.9
      );
      this.stopCamera();
    }
  }

  retake() {
    this.capturedImage = null;
    this.capturedBlob = null;
    this.startCamera();
  }

  usePhoto() {
    if (this.capturedBlob && this.capturedImage) {
      this.dialogRef.close({
        file: this.capturedBlob,
        previewUrl: this.capturedImage
      } as CameraDialogResult);
    }
  }

  close() {
    this.stopCamera();
    this.dialogRef.close(null);
  }
}

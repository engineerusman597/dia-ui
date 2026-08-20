import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { IdName } from '@core/domain-classes/id-name';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, switchMap, concatMap, EMPTY, of, catchError, finalize, from } from 'rxjs';
import { ClientStore } from '../client/client-store';
import { Client } from '../client/model/client';
import { ClientDocument } from '../client/model/client-documents';
import { Gender } from '../client/model/client-gender';
import { ClientService } from '../client/services/client.service';
import { FileRequestService } from '../client/services/file-request.service';
import { BaseComponent } from '../base.component';
import { HttpResponse } from '@angular/common/http';
import { DocumentType } from '../client/model/document-type';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@shared/pipes/pipes.module';
import { ClientAttachmentComponent } from '../client/client-attachment/client-attachment.component';

@Component({
  selector: 'app-support-team-add-client',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatRadioModule,
    PipesModule,
    ClientAttachmentComponent
  ],
  templateUrl: './support-team-add-client.component.html',
  styleUrl: './support-team-add-client.component.css'
})
export class SupportTeamAddClientComponent extends BaseComponent implements OnInit {
  clientForm!: FormGroup;
  isEditMode = false;
  currentClient?: Client;
  countryList: IdName[] = [];
  fb = inject(FormBuilder);
  router = inject(Router);
  activeRoute = inject(ActivatedRoute);
  clientStore = inject(ClientStore);
  clientService = inject(ClientService);
  fileService = inject(FileRequestService);
  toastr = inject(ToastrService);
  countryControl = new FormControl('');

  genderOptions = Object.keys(Gender)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      id: Gender[key as keyof typeof Gender],
      name: key,
    }));

  get policiesFormArray(): FormArray {
    return this.clientForm.get('policies') as FormArray;
  }

  constructor() {
    super();
    this.subscribeIsAddorUpdate();
  }

  ngOnInit(): void {
    this.createClientForm();
    this.onChangeTheCountryOfOrigin();
    this.applyFilter();
    this.countryControl.setValue('');
  }

  applyFilter() {
    this.activeRoute.queryParams.subscribe(params => {
      const id = params['userId'];
      if (id) {
        this.clientForm.get('assignToId')?.setValue(id || '');
      }
    });

    this.sub$.sink = this.activeRoute.data.subscribe((data) => {
      const clientData = data as { client: Client };

      if (clientData.client) {
        this.isEditMode = true;
        this.currentClient = clientData.client;
        this.clientForm.patchValue(clientData.client);
        this.clientForm.get('email')?.disable();

        let policiesValue = (clientData.client as any).policies || [];

        if (typeof policiesValue === 'string') {
          policiesValue = policiesValue.split(',').map((p: string) => p.trim()).filter((p: string) => p);
        }

        if (!Array.isArray(policiesValue) || policiesValue.length === 0) {
          policiesValue = [''];
        }

        this.setPoliciesFormArray(policiesValue);

      } else {
        this.isEditMode = false;
        this.clientForm.get('email')?.enable(); // enable email field in add mode
        this.setPoliciesFormArray(['']);
      }
    });
  }


  createClientForm() {
    this.clientForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      relationship: [''],
      dateOfBirth: ['', [Validators.required]],
      commencementDate: [''],
      email: ['', [Validators.required, Validators.email]],
      countryId: [''],
      policies: this.fb.array([], [this.atLeastOnePolicyRequired] as any),
      trim: [''],
      physicalAddress: [''],
      gender: ['M'],
      premiumPayableTo: [''],
      proofOfId: [null],
      proofOfAddress: [null],
      additionalDocument: [[]],
      assignToId: ['']
    });
  }

  atLeastOnePolicyRequired(formArray: FormArray) {
    const hasAtLeastOne = formArray && formArray.controls.some(ctrl => !!ctrl.value && ctrl.value.trim() !== '');
    return hasAtLeastOne ? null : { atLeastOne: true };
  }

  onChangeTheCountryOfOrigin() {
    this.sub$.sink = this.countryControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((c) => {
          return this.clientService.getCountriesForDropDown(c || '');
        })
      )
      .subscribe((resp) => {
        if (resp) {
          const courses = resp as HttpResponse<IdName[]>;
          if (courses && courses.body) {
            this.countryList = [...courses.body];
          }
        }
      });
  }

  setPoliciesFormArray(policies: string[]) {
    const policiesArray = this.clientForm.get('policies') as FormArray;
    policiesArray.clear();
    policies.forEach(policy => policiesArray.push(new FormControl(policy)));
  }

  saveClient(isEmail?: boolean) {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    // Save policies as array of strings
    const policiesArray = this.policiesFormArray.controls.map(c => c.value.trim()).filter((p: string) => p);
    let client = this.clientForm.getRawValue() as Client;
    (client as any).policies = policiesArray;

    // Convert Date objects from mat-datepicker to ISO strings expected by API
    if (client.dateOfBirth && client.dateOfBirth instanceof Date) {
      client.dateOfBirth = (client.dateOfBirth as Date).toLocaleDateString();
    }
    if (client.commencementDate && client.commencementDate instanceof Date) {
      client.commencementDate = (client.commencementDate as Date).toLocaleDateString();
    }
    if (client.premiumPayableTo) {
      client.premiumPayableTo = client.premiumPayableTo.toString();
    }

    client.hasEmailBeenSent = isEmail ?? false;
    if (this.isEditMode) {
      if (this.currentClient && this.currentClient.clientDocuments) {
        client.clientDocuments = this.currentClient.clientDocuments;
      }
      this.clientStore.updateClient(client);
    } else {
      this.clientStore.addClient(client);
    }
  }

  addPolicy() {
    this.policiesFormArray.push(new FormControl(''));
  }

  removePolicy(index: number) {
    if (this.policiesFormArray.length > 1) {
      this.policiesFormArray.removeAt(index);
    }
  }

  subscribeIsAddorUpdate() {
    this.sub$.sink = toObservable(this.clientStore.isAddUpdate)
      .pipe(
        concatMap((flag) => {
          if (!flag) {
            return EMPTY;
          }

          const client = this.clientStore.client();
          const upload$ = client?.id ? this.uploadFilesForClient(client.id) : of(null);

          return upload$.pipe(
            catchError((err) => {
              console.error('File upload error', err);
              this.toastr.error('One or more file uploads failed');
              return EMPTY;
            }),
            finalize(() => {
              this.clientStore.resetflag();
              this.router.navigate(['/support/upload-document', this.clientForm.get('assignToId')?.value]);
            })
          );
        })
      )
      .subscribe();
  }

  private uploadFilesForClient(clientId: string) {
    const filesToUpload: ClientDocument[] = [];

    const proofId = this.clientForm.get('proofOfId')?.value as File | null;
    const proofAddress = this.clientForm.get('proofOfAddress')?.value as File | null;

    if (proofId) {
      filesToUpload.push({
        clientId,
        documentType: DocumentType.IdentityProof,
        file: proofId
      });
    }

    if (proofAddress) {
      filesToUpload.push({
        clientId,
        documentType: DocumentType.AddressProof,
        file: proofAddress
      });
    }

    const additionalDocuments =
      (this.clientForm.get('additionalDocument')?.value as File[]) || [];

    additionalDocuments.forEach(file => {
      if (file) {
        filesToUpload.push({
          clientId,
          documentType: DocumentType.AdditionalDocument,
          file
        });
      }
    });

    return from(filesToUpload).pipe(
      concatMap(file => this.uploadFileByType(file))
    );
  }

  private uploadFileByType(file: ClientDocument) {
    return file.documentType === DocumentType.AdditionalDocument
      ? this.fileService.uploadAdditionalProof(file.file as File, file.clientId)
      : this.fileService.uploadFile(file, true);
  }

  downloadClientsCsv() {
    const clientId = this.currentClient?.id ?? this.clientForm.get('id')?.value;
    if (!clientId) {
      this.toastr.error('Client ID is missing. Cannot download CSV.');
      return;
    }

    this.clientService.downloadClientsCsv(clientId).subscribe({
      next: (blob) => {
        const newBlob = blob as Blob;
        if (newBlob) {
          const url = window.URL.createObjectURL(newBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `client_${this.policiesFormArray.at(0).value}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.toastr.success('File downloaded successfully');
        }
      }
    });
  }
}

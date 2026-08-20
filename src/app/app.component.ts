import { Component, OnInit } from '@angular/core';
import { SecurityService } from '@core/security/security.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from './base.component';
import { Title } from '@angular/platform-browser';
import { IdleService } from '@core/services/idle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseComponent implements OnInit {
  title = 'user-management';
  logoUrl!: string;
  /**
   *
   */
  constructor(
    private securityService: SecurityService,
    public translate: TranslateService,
    private translationService: TranslationService,
    private titleService: Title,
    private idleService: IdleService
  ) {
    super();
    translate.addLangs(['en']);
    translate.setDefaultLang('en');
    this.setLanguage();
  }

  setLanguage(): void {
    const currentLang = this.translationService.getSelectedLanguage();
    if (currentLang) {
      this.translationService.setLanguage(currentLang)?.subscribe(() => { });
    } else {
      const browserLang = this.translate.getBrowserLang() ?? 'en';
      const lang = browserLang.match(/en|es|ar|ru|cn|ja|ko|fr/) ? browserLang : 'en';
      this.translationService.setLanguage(lang)?.subscribe(() => { });
    }
  }

  ngOnInit(): void {
    this.securityService.initializeSessionTimers();
    if(this.securityService.isLogin()){
      this.securityService.setBearerToken('');
    }
    this.idleService.reset();
    this.getCompanyProfile();
  }

  getCompanyProfile(): void {
    this.securityService.companyProfile.subscribe((c) => {
      if (c) {
        this.titleService.setTitle(c.name || '');
      }
    });
  }
}

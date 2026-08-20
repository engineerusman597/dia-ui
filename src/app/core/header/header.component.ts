import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { LanguageFlag } from '@core/domain-classes/language-flag';
import { UserNotification } from '@core/domain-classes/notification';
import { User } from '@core/domain-classes/user';
import { SecurityService } from '@core/security/security.service';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { WINDOW } from '@core/services/window.service';
import { BaseComponent } from 'src/app/base.component';
import { NotificationService } from 'src/app/notification/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends BaseComponent implements OnInit {
  logoUrl?: string;
  isNavbarCollapsed = true;
  isNavbarShow = true;
  isOpenSidebar?: boolean;
  isFullScreen = false;
  docElement?: HTMLElement;
  appUserAuth: User = null;
  newNotificationCount = 0;
  notifications: UserNotification[] = [];
  language: LanguageFlag;
  direction = 'ltr';
  hasClass = false;
  languages: LanguageFlag[] = [
    {
      lang: 'en',
      name: 'English',
      flag: '../../../assets/images/flags/united-states.svg',
    },
    {
      lang: 'es',
      name: 'Spanish ',
      flag: '../../../assets/images/flags/brazil.svg',
    },
    {
      lang: 'fr',
      name: 'French ',
      flag: '../../../assets/images/flags/france.svg',
    },
    {
      lang: 'ar',
      name: 'Arabic ',
      flag: '../../../assets/images/flags/saudi-arabia.svg',
    },
    {
      lang: 'ru',
      name: 'Russian',
      flag: '../../../assets/images/flags/russia.svg',
    },
    {
      lang: 'ja',
      name: 'Japanese',
      flag: '../../../assets/images/flags/japan.svg',
    },
    {
      lang: 'ko',
      name: 'Korean',
      flag: '../../../assets/images/flags/south-korea.svg',
    },
    {
      lang: 'cn',
      name: 'Chinese',
      flag: '../../../assets/images/flags/china.svg',
    }
  ];
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(WINDOW) private window: Window,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private router: Router,
    private securityService: SecurityService,
    private notificationService: NotificationService,
    private translationService: TranslationService,
    private cd: ChangeDetectorRef,
    private commonService: CommonService
  ) {
    super();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.window.pageYOffset ||
      this.document.documentElement.scrollTop ||
      this.document.body.scrollTop ||
      0;
  }

  ngOnInit() {
    const hasClass = this.document.body.classList.contains('side-closed');
    this.docElement = document.documentElement;
    this.sidebarMenuStatus();
    this.setTopLogAndName();
    this.setDefaultLanguage();
    this.getCompanyProfile();

  }
  sidebarMenuStatus() {
    this.commonService.sideMenuStatus$.subscribe((status) => {
      this.isOpenSidebar = status;
    });
  }

  callFullscreen() {
    if (!this.isFullScreen) {
      if (this.docElement?.requestFullscreen != null) {
        this.docElement?.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }

  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(
      className
    );
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }

  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.commonService.setSideMenuStatus(false);
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'false');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'true');
      this.commonService.setSideMenuStatus(true);
    }
  }

  setDefaultLanguage() {
    const lang = this.translationService.getSelectedLanguage();
    if (lang) this.setLanguageWithRefresh(lang);
  }

  setLanguageWithRefresh(lang: string) {
    this.languages.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
    this.translationService.setLanguage(lang);
  }

  setNewLanguageRefresh(lang: string) {
    this.sub$.sink = this.translationService
      .setLanguage(lang)
      .subscribe((response) => {
        this.setLanguageWithRefresh(response['LANGUAGE']);
      });
  }

  setTopLogAndName() {
    this.sub$.sink = this.securityService.SecurityObject.subscribe((c) => {
      if (c) {
        this.appUserAuth = c;
      }
    });
  }

  onLogout(): void {
    this.securityService.logout();
    this.router.navigate(['/login']);
  }

  onMyProfile(): void {
    this.router.navigate(['/my-profile']);
  }

  // subscribeToNotification() {
  //   this.sub$.sink = this.signalrService.userNotification$.subscribe((c) => {
  //     this.getNotification();
  //   });
  // }

  getNotification() {
    this.sub$.sink = this.notificationService
      .getNotification()
      .subscribe((notifications: UserNotification[]) => {
        this.newNotificationCount = notifications.filter(
          (c) => !c.isRead
        ).length;
        this.notifications = notifications;
        this.cd.detectChanges();
      });
  }

  markAllAsReadNotification() {
    this.sub$.sink = this.notificationService.markAllAsRead().subscribe(() => {
      this.getNotification();
    });
  }

  viewNotification(notification: UserNotification) {
    if (!notification.isRead) {
      this.markAsReadNotification(notification.id);
    }
    this.router.navigate(['reminders']);
  }

  markAsReadNotification(id) {
    this.sub$.sink = this.notificationService.markAsRead(id).subscribe(() => {
      this.getNotification();
    });
  }

  getCompanyProfile(): void {
    this.securityService.companyProfile.subscribe((c) => {
      if (c) {
        this.logoUrl = c.logoUrl;
      }
    });
  }
}

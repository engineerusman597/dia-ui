import { Direction } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from '@core/security/security.service';
import { InConfiguration } from '@core/services/config.interface';
import { ConfigService } from '@core/services/config.service';
import { DirectionService } from '@core/services/direction.service';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit,  AfterViewInit {
  direction!: Direction;
  public config!: InConfiguration;
  constructor(
    private directoryService: DirectionService,
    private configService: ConfigService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private securityService: SecurityService
  ) {
    this.config = this.configService.configData;
    this.directoryService.currentData.subscribe((currentData) => {
      if (currentData) {
        this.direction = currentData === 'ltr' ? 'ltr' : 'rtl';
      } else {
        if (localStorage.getItem('isRtl')) {
          if (localStorage.getItem('isRtl') === 'true') {
            this.direction = 'rtl';
          } else if (localStorage.getItem('isRtl') === 'false') {
            this.direction = 'ltr';
          }
        } else {
          if (this.config) {
            if (this.config.layout.rtl === true) {
              this.direction = 'rtl';
              localStorage.setItem('isRtl', 'true');
            } else {
              this.direction = 'ltr';
              localStorage.setItem('isRtl', 'false');
            }
          }
        }
      }
    });
    this.setProfile();
  }

  ngOnInit(): void {
     this.securityService.setBearerToken('');
  }

  ngAfterViewInit(): void {

    if (localStorage.getItem('isRtl')) {
      if (localStorage.getItem('isRtl') === 'true') {
        this.setRTLSettings();
      } else if (localStorage.getItem('isRtl') === 'false') {
        this.setLTRSettings();
      }
    } else {
      if (this.config.layout.rtl == true) {
        this.setRTLSettings();
      } else {
        this.setLTRSettings();
      }
    }

    if (localStorage.getItem('collapsed_menu')) {
      if (localStorage.getItem('collapsed_menu') === 'true') {
        this.renderer.addClass(this.document.body, 'sidebar-closed');
        this.renderer.addClass(this.document.body, 'sidebarsubmenu-closed');
      }
    } else {
      if (this.config.layout.sidebar.collapsed == true) {
        this.renderer.addClass(this.document.body, 'sidebar-closed');
        this.renderer.addClass(this.document.body, 'sidebarsubmenu-closed');
        localStorage.setItem('collapsed_menu', 'true');
      } else {
        this.renderer.removeClass(this.document.body, 'sidebar-closed');
        this.renderer.removeClass(this.document.body, 'sidebarsubmenu-closed');
        localStorage.setItem('collapsed_menu', 'false');
      }
    }
  }

  setRTLSettings() {
    document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
    this.renderer.addClass(this.document.body, 'rtl');

    localStorage.setItem('isRtl', 'true');
  }
  setLTRSettings() {
    document.getElementsByTagName('html')[0].removeAttribute('dir');
    this.renderer.removeClass(this.document.body, 'rtl');

    localStorage.setItem('isRtl', 'false');
  }

  setProfile() {
    this.route.data.subscribe((data) => {
      if (data.profile) {
        this.securityService.updateUserProfile(data.profile);
      }
    });
  }

  toggleMobileSidebar(): void {
    const hasOverlay = this.document.body.classList.contains('overlay-open');
    if (hasOverlay) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
      return;
    }
    this.renderer.addClass(this.document.body, 'overlay-open');
  }

}

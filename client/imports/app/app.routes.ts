import { Meteor } from 'meteor/meteor';
import { Route } from '@angular/router';

import { HomeComponent } from './home/home';

import { AuthService } from './services-global/auth/auth.service';
import { AuthGuard } from './services-global/auth/auth-guard';
import { AuthGuardAdmin } from './services-global/auth/auth-guard-admin';
import { AuthGuardContractor } from './services-global/auth/auth-guard-contractor';

export function loadLandingPageModule() {
  return module.dynamicImport('./landing-page/landing-page.module').then(({LandingPageModule}) => LandingPageModule);
}
export function loadFavoritesModule() {
  return module.dynamicImport('./favorites/favorites.module').then(({FavoritesModule}) => FavoritesModule);
}
export function loadSubmitPageModule() {
  return module.dynamicImport('./submit-page/submit-page.module').then(({SubmitPageModule}) => SubmitPageModule);
}
// export function loadTopPayoutModule() {
//   return module.dynamicImport('./top-payout/top-payout.module').then(({TopPayoutModule}) => TopPayoutModule);
// }


export function loadLoginModule() {
  return module.dynamicImport('./auth/login/login.module').then(({LoginModule}) => LoginModule);
}
export function loadSignupModule() {
  return module.dynamicImport('./auth/signup/signup.module').then(({SignupModule}) => SignupModule);
}
export function loadRecoverModule() {
  return module.dynamicImport('./auth/recover/recover.module').then(({RecoverModule}) => RecoverModule);
}
export function loadResetModule() {
  return module.dynamicImport('./auth/reset/reset.module').then(({ResetModule}) => ResetModule);
}
export function loadSetPasswordModule() {
  return module.dynamicImport('./auth/setPassword/setPassword.module').then(({SetPasswordModule}) => SetPasswordModule);
}


export function loadRequestsModule() {
  return module.dynamicImport('./requestprices/requests/requests.module').then(({RequestsModule}) => RequestsModule);
}
export function loadRQActiveModule() {
  return module.dynamicImport('./requestprices/rq-active/rq-active.module').then(({RQActiveModule}) => RQActiveModule);
}
export function loadRQReceivedModule() {
  return module.dynamicImport('./requestprices/rq-received/rq-received.module').then(({RQReceivedModule}) => RQReceivedModule);
}
export function loadRQRejectedModule() {
  return module.dynamicImport('./requestprices/rq-rejected/rq-rejected.module').then(({RQRejectedModule}) => RQRejectedModule);
}
export function loadRQClosedModule() {
  return module.dynamicImport('./requestprices/rq-closed/rq-closed.module').then(({RQClosedModule}) => RQClosedModule);
}
export function loadRQDetailedViewModule() {
  return module.dynamicImport('./requestprices/rq-detailed-view/rq-detailed-view.module').then(({RQDetailedViewModule}) => RQDetailedViewModule);
}
export function loadRequestpricesEditModule() {
  return module.dynamicImport('./requestprices/requestprices-edit/requestprices-edit.module').then(({RequestpricesEditModule}) => RequestpricesEditModule);
}
export function loadRequestpricesCreatePModule() {
  return module.dynamicImport('./requestprices/requestprices-create-p/requestprices-create-p.module').then(({RequestpricesCreatePModule}) => RequestpricesCreatePModule);
}
export function loadDepositModule() {
  return module.dynamicImport('./requestprices/deposit/deposit.module').then(({DepositModule}) => DepositModule);
}


export function loadSPClosedModule() {
  return module.dynamicImport('./submitprices/sp-closed/sp-closed.module').then(({SPClosedModule}) => SPClosedModule);
}
export function loadSPDetailedViewModule() {
  return module.dynamicImport('./submitprices/sp-detailed-view/sp-detailed-view.module').then(({SPDetailedViewModule}) => SPDetailedViewModule);
}
export function loadSPRejectedMddule() {
  return module.dynamicImport('./submitprices/sp-rejected/sp-rejected.module').then(({SPRejectedMddule}) => SPRejectedMddule);
}
export function loadSPSubmittedModule() {
  return module.dynamicImport('./submitprices/sp-submitted/sp-submitted.module').then(({SPSubmittedModule}) => SPSubmittedModule);
}
export function loadSubmitpricesCreateModule() {
  return module.dynamicImport('./submitprices/submitprices-create/submitprices-create.module').then(({SubmitpricesCreateModule}) => SubmitpricesCreateModule);
}
export function loadSubmitpricesCreatePModule() {
  return module.dynamicImport('./submitprices/submitprices-p/submitprices-p.module').then(({SubmitpricesCreatePModule}) => SubmitpricesCreatePModule);
}
export function loadSubmitpricesRejectModule() {
  return module.dynamicImport('./submitprices/submitprices-reject/submitprices-reject.module').then(({SubmitpricesRejectModule}) => SubmitpricesRejectModule);
}


export function loadNewItemModule() {
  return module.dynamicImport('./items/new-item/new-item.module').then(({NewItemModule}) => NewItemModule);
}
export function loadItemsConfirmedModule() {
  return module.dynamicImport('./items/confirmed/items-confirmed.module').then(({ItemsConfirmedModule}) => ItemsConfirmedModule);
}
export function loadItemsRejectedModule() {
  return module.dynamicImport('./items/rejected/items-rejected.module').then(({ItemsRejectedModule}) => ItemsRejectedModule);
}
export function loadItemsSubmittedModule() {
  return module.dynamicImport('./items/submitted/items-submitted.module').then(({ItemsSubmittedModule}) => ItemsSubmittedModule);
}


export function loadSubmitsModule() {
  return module.dynamicImport('./submitprices/submits/submits.module').then(({SubmitsModule}) => SubmitsModule);
}
export function loadMyTransactionsModule() {
  return module.dynamicImport('./submitprices/my-transactions/my-transactions.module').then(({MyTransactionsModule}) => MyTransactionsModule);
}
export function loadWithdrawModule() {
  return module.dynamicImport('./submitprices/withdraw/withdraw.module').then(({WithdrawModule}) => WithdrawModule);
}


export function loadEmailLinkModule() {
  return module.dynamicImport('./settings-page/email-link/email-link.module').then(({EmailLinkModule}) => EmailLinkModule);
}
export function loadProfileModule() {
  return module.dynamicImport('./settings-page/profile/profile.module').then(({ProfileModule}) => ProfileModule);
}
export function loadSettingsPageModule() {
  return module.dynamicImport('./settings-page/settings-page/settings-page.module').then(({SettingsPageModule}) => SettingsPageModule);
}
export function loadProfileEditModule() {
  return module.dynamicImport('./settings-page/profile-edit/profile-edit.module').then(({ProfileEditModule}) => ProfileEditModule);
}
export function loadSliderSettingsModule() {
  return module.dynamicImport('./settings-page/slider-settings/slider-settings.module').then(({SliderSettingsModule}) => SliderSettingsModule);
}
export function loadVerifyEmailModule() {
  return module.dynamicImport('./settings-page/verify-email/verify-email.module').then(({VerifyEmailModule}) => VerifyEmailModule);
}
export function loadVerifyCellphoneModule() {
  return module.dynamicImport('./settings-page/verify-cellphone/verify-cellphone.module').then(({VerifyCellphoneModule}) => VerifyCellphoneModule);
}


export function loadIssuesListModule() {
  return module.dynamicImport('./issues/issues-list.module').then(({IssuesListModule}) => IssuesListModule);
}


export function loadMocksModule() {
  return module.dynamicImport('./mocks/mocks/mocks.module').then(({MocksModule}) => MocksModule);
}
export function loadTModule() {
  return module.dynamicImport('./mocks/t/t.module').then(({TModule}) => TModule);
}
export function loadVModule() {
  return module.dynamicImport('./mocks/v/v.module').then(({VModule}) => VModule);
}
export function loadWModule() {
  return module.dynamicImport('./mocks/w/w.module').then(({WModule}) => WModule);
}
export function loadXModule() {
  return module.dynamicImport('./mocks/x/x.module').then(({XModule}) => XModule);
}
export function loadYModule() {
  return module.dynamicImport('./mocks/y/y.module').then(({YModule}) => YModule);
}
export function loadZModule() {
  return module.dynamicImport('./mocks/z/z.module').then(({ZModule}) => ZModule);
}
export function loadAutoComplete() {
  return module.dynamicImport('./mocks/auto-complete/auto-complete.module').then(({AutoCompleteModule}) => AutoCompleteModule);
}


export const routes: Route[] = [

  { path: 'mocks', loadChildren: loadMocksModule },
  { path: 't', loadChildren: loadTModule },
  { path: 'v', loadChildren: loadVModule },
  { path: 'w', loadChildren: loadWModule },
  { path: 'x', loadChildren: loadXModule },
  { path: 'y', loadChildren: loadYModule },
  { path: 'z', loadChildren: loadZModule },
  { path: 'favs', loadChildren: loadFavoritesModule },
  { path: 'auto-complete', loadChildren: loadAutoComplete },

  { path: '', redirectTo: 'init', pathMatch: 'full' },
  { path: 'init', component: HomeComponent },

  { path: 'landing', loadChildren: loadLandingPageModule, data: {preload: true} },
  { path: 'sp', loadChildren: loadSubmitPageModule },
  // { path: 'tp', loadChildren: loadTopPayoutModule, data: {preload: true} },

  { path: 'login', loadChildren: loadLoginModule, data: {preload: true} },
  { path: 'signup', loadChildren: loadSignupModule, data: {preload: true} },
  { path: 'recover', loadChildren: loadRecoverModule },
  { path: 'reset-password/:token', loadChildren: loadResetModule },
  { path: 'set-password', loadChildren: loadSetPasswordModule, canActivate: [AuthGuard] },

  { path: 'requests', loadChildren: loadRequestsModule, data: {preload: true}, canActivate: [AuthGuard] },  
  { path: 'rqactive', loadChildren: loadRQActiveModule, canActivate: [AuthGuard] },
  { path: 'rqreceived', loadChildren: loadRQReceivedModule,  canActivate: [AuthGuard] },
  { path: 'rqrejected', loadChildren: loadRQRejectedModule,  canActivate: [AuthGuard] },
  { path: 'rqclosed', loadChildren: loadRQClosedModule,  canActivate: [AuthGuard] },
  { path: 'rqdetails', loadChildren: loadRQDetailedViewModule,  canActivate: [AuthGuard] },
  { path: 'requestprices-edit', loadChildren: loadRequestpricesEditModule, canActivate: [AuthGuard] },
  { path: 'requestprices-p', loadChildren: loadRequestpricesCreatePModule, canActivate: [AuthGuard] },
  { path: 'deposit', loadChildren: loadDepositModule, canActivate: [AuthGuard] },

  { path: 'submits', loadChildren: loadSubmitsModule, data: {preload: true}, canActivate: [AuthGuard] },  
  { path: 'spsubmitted', loadChildren: loadSPSubmittedModule, canActivate: [AuthGuard] },
  { path: 'sprejected', loadChildren: loadSPRejectedMddule, canActivate: [AuthGuard] },
  { path: 'spclosed', loadChildren: loadSPClosedModule, canActivate: [AuthGuard] },
  { path: 'spdetails', loadChildren: loadSPDetailedViewModule, canActivate: [AuthGuard] },
  { path: 'submitprices-create/:priceId', loadChildren: loadSubmitpricesCreateModule, canActivate: [AuthGuard] },
  { path: 'submitprices-p', loadChildren: loadSubmitpricesCreatePModule, canActivate: [AuthGuard] },
  { path: 'submitprices-reject', loadChildren: loadSubmitpricesRejectModule, canActivate: [AuthGuard] },
  { path: 'transactions', loadChildren: loadMyTransactionsModule, canActivate: [AuthGuard] },
  { path: 'withdraw', loadChildren: loadWithdrawModule, canActivate: [AuthGuard] },

  { path: 'items-submitted', loadChildren: loadItemsSubmittedModule, canActivate: [AuthGuard] },
  { path: 'items-rejected', loadChildren: loadItemsRejectedModule, canActivate: [AuthGuard] },
  { path: 'new-item', loadChildren: loadNewItemModule, canActivate: [AuthGuard] },
  { path: 'item-confirmed', loadChildren: loadItemsConfirmedModule, canActivate: [AuthGuard] },

  { path: 'email-link', loadChildren: loadEmailLinkModule, canActivate: [AuthGuard] },
  { path: 'profile', loadChildren: loadProfileModule, canActivate: [AuthGuard] },
  { path: 'settings', loadChildren: loadSettingsPageModule, canActivate: [AuthGuard] },
  { path: 'profile-edit', loadChildren: loadProfileEditModule, canActivate: [AuthGuard] },
  { path: 'slider-settings', loadChildren: loadSliderSettingsModule, canActivate: [AuthGuard] },
  { path: 'verify-email/:token', loadChildren: loadVerifyEmailModule, canActivate: [AuthGuard] },
  { path: 'verify-cell', loadChildren: loadVerifyCellphoneModule, canActivate: [AuthGuard] },

  { path: 'issues', loadChildren: loadIssuesListModule, canActivate: [AuthGuardAdmin] },

];


export const ROUTES_PROVIDERS = [{
  provide: 'canActivateForLoggedIn',
  useValue: () => !! Meteor.userId(),
  AuthService,
  AuthGuard,
  AuthGuardAdmin,
  AuthGuardContractor  
}];

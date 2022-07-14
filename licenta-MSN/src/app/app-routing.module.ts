import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { HomeComponent } from './pages/home/home.component';
import { MyFeedComponent } from './pages/my-feed/my-feed.component';
import { PostFeedComponent } from './pages/post-feed/post-feed.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent
  },
  {
    path: "emailVerification", component: EmailVerificationComponent
  },
  {
    path: "postfeed", component: PostFeedComponent
  },
  {
    path: "myFeed/:userId", component: MyFeedComponent
  },
  {
    path: "**", component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

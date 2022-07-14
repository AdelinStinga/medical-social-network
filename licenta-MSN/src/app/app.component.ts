import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AuthenticatorComponent } from 'src/app/tools/authenticator/authenticator.component';

import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';
import { FirebaseTSFirestore, Limit } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { HomeComponent } from './pages/home/home.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'licenta-MSN';

  auth = new FirebaseTSAuth();

  firestore = new FirebaseTSFirestore();

  userHasProfile = true;
  formGroup: FormGroup;

  private static userDocument: UserDocument | any; // |any if it's not working
  usersFound: UserDocument[] = [];
  currentProfile: UserDocument | undefined;

  constructor(private loginSheet: MatBottomSheet, private router: Router, private formBuilder: FormBuilder)
  {
    this.formGroup = this.formBuilder.group(
      {
        "searchFormControl": ['']
      },
    )

    this.formGroup.valueChanges.subscribe(search => 
    {
      let userToSearch = search.searchFormControl as string;
        if(userToSearch && userToSearch != '')
        {
          this.getUsers(userToSearch)
        }
    })

    this.auth.listenToSignInStateChanges
    (
      user =>
      {
        this.auth.checkSignInState
        (
          {
            whenSignedIn: user =>
            {
              //alert("Logged in!");
            },
            whenSignedOut: user =>
            {
              //alert("Logged out!")
              AppComponent.userDocument = null;
            },
            whenSignedInAndEmailNotVerified: user =>
            {
              this.router.navigate(["emailVerification"]);
            },
            whenSignedInAndEmailVerified: user =>
            {
              this.getUserProfile();
            },
            whenChanged: user =>
            {

            }
          }
        );
      }
    );
  }

  goToProfile(user: UserDocument | undefined){
    if(user)
    {
      this.router.navigate(["myFeed",user.userId]);
    }else
    {
      this.router.navigate(['postFeed']);
    }
    this.formGroup.get("searchFormControl")?.setValue(undefined);
  }

  getUsers(userToSearch: string)
  {
    this.usersFound = [];
    this.firestore.getCollection
    (
      {
        path: ["Users"],
        where: 
        [
          new Limit(60),
        ],
        onComplete: (result) => 
        {
          result.docs.forEach
          (
            doc => 
            {
              let user = <UserDocument>doc.data();
              user.userId = doc.id;
              if(user.publicName.toLowerCase().includes(userToSearch.toLowerCase()))
              {
                this.usersFound.push(user);
              }
            }
          )
        },
        onFail: err =>
        {

        }
      }
    );
  }


  public static getUserDocument()
  {
    return AppComponent.userDocument;
  }


  getUsername()
  {
    try{
      return AppComponent.userDocument.publicName;
    } catch (err) {
      
    }
  }

  //post user info from firebase and shows updates
  getUserProfile()
  {
    this.firestore.listenToDocument
    (
      {
        name: "Getting Document",
        path: ["Users", String(this.auth.getAuth().currentUser?.uid)],
        onUpdate: (result) =>
        {
          AppComponent.userDocument = <UserDocument>result.data();
          this.userHasProfile = result.exists;
          AppComponent.userDocument.userId = String(this.auth.getAuth().currentUser?.uid);
          this.currentProfile = AppComponent.userDocument;
          if(this.userHasProfile)
          {
            this.router.navigate(["postfeed"]);
          }
        }
      }
    );
  }

  onLogoutClick()
  {
    this.auth.signOut();
    this.router.navigate([""]);
  }

  loggedIn()
  {
    return this.auth.isSignedIn();
  }

  onLoginClick() 
  {
    this.loginSheet.open(AuthenticatorComponent);
  }

  onNavigateTo(route: string)
  {
    this.router.navigate([route]);
  }
  
}

export interface UserDocument
{
  publicName: string;
  description: string;
  userId: string;
}
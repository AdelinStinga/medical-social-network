import { Component, Input, OnInit } from '@angular/core';

import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  @Input() show: boolean | undefined;

  firestore: FirebaseTSFirestore;
  auth: FirebaseTSAuth;

  constructor() 
  {
    this.firestore = new FirebaseTSFirestore();
    this.auth = new FirebaseTSAuth();
  }

  ngOnInit(): void {
  }

  //input to go to firebase
  onContinueClick(nameInput: HTMLInputElement, descriptionInput: HTMLTextAreaElement)
  {
    let name = nameInput.value;
    let description = descriptionInput.value;
   

    //push to firestore
    this.firestore.create
    (
      {
        path: ["Users", String(this.auth.getAuth().currentUser?.uid)],
        data: 
        {
          publicName: name,
          description: description
        },
        onComplete: (docId) =>
        {
          alert("Profile Created!");
          nameInput.value = "";
          descriptionInput.value = "";
        },
        onFail: (err) =>
        {

        }
      }
    );
  }
}

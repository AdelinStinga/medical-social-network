import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FirebaseTSFirestore, Limit, OrderBy } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { AppComponent, UserDocument } from 'src/app/app.component';
import { PostData } from '../post-feed/post-feed.component';

@Component({
  selector: 'app-my-feed',
  templateUrl: './my-feed.component.html',
  styleUrls: ['./my-feed.component.css']
})
export class MyFeedComponent implements OnInit {
  firestore = new FirebaseTSFirestore();
  userId: string | undefined;
  constructor(private route: ActivatedRoute) {
   }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => this.userId = params['userId']);
  }

}

import { Component, Input, OnInit } from '@angular/core';
import { PostData } from 'src/app/pages/post-feed/post-feed.component';

import { FirebaseTSFirestore, Where } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { MatDialog } from '@angular/material/dialog';
import { ReplyComponent } from '../reply/reply.component';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input() postData: PostData | undefined;

  @Input() userId: string | undefined;

  creatorName: string | undefined;
  creatorDescription: string | undefined;
  firestore = new FirebaseTSFirestore();
  postLikedByUser: boolean | undefined = undefined;
  likeId: string | undefined;

  deletePost: boolean | undefined = undefined;
  currentUserId: string | undefined;



  constructor(private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    this.getCreatorInfo();
  
    this.currentUserId = AppComponent.getUserDocument()?.userId;
  }

  onDeleteClick()
  {
      this.firestore.delete
      (
        {
          path:["Posts", this.postData?.postId as string]
        }
      );
    
   
  }

  onReplyClick()
  {
    this.dialog.open(ReplyComponent, {data: this.postData?.postId} );
  }

  async onLike(){
    if(this.postLikedByUser == false){
      await this.firestore.create
      (
        {
          path:["Posts", this.postData?.postId as string, "Likes"],
          data: {
            creatorId: AppComponent.getUserDocument().userId as string, 
            creatorName: AppComponent.getUserDocument().publicName as string
          }
        }
      );
    }
    else{
      await this.firestore.delete
      (
        {
          path:["Posts", this.postData?.postId as string, "Likes",this.likeId as string],
        }
      );
    }
    debugger;
    this.postLikedByUser = !this.postLikedByUser;
  }

  likedByUser(): boolean | undefined {
   if(this.postLikedByUser != undefined) {
    return this.postLikedByUser;
   }
   this.postLikedByUser = false;
   this.firestore.getCollection
    (
      {
        path: ["Posts",this.postData?.postId as string,"Likes"],
        where: 
        [],
        onComplete: (result) => 
        {
          result.docs.forEach
          (
            doc => 
            {
              let like = <Like>doc.data();
              if(like.creatorId == AppComponent.getUserDocument().userId){
                this.likeId = doc.id;
                this.postLikedByUser = true;
                return;
              }
            }
          )
        },
        onFail: err =>
        {

        }
      }
    );
  return this.postLikedByUser;
  }

  getCreatorInfo()
  {
    this.firestore.getDocument
    (
      {
        path: ["Users", String(this.postData?.creatorId)],
        onComplete: result => 
        {
          let userDocument = result.data();
            this.creatorName = userDocument?.['publicName'];
            this.creatorDescription = userDocument?.['description'];
        }
      }
    );
  }

  onNavigateToUser(){
    this.router.navigate(["myFeed",this.postData?.creatorId]);
  }

  

}

export interface Like {
  creatorId: string;
  likeId: string;
}

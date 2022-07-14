import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { CreatePostComponent } from 'src/app/tools/create-post/create-post.component';

import { FirebaseTSFirestore, Limit, OrderBy, Where } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { AppComponent, UserDocument } from 'src/app/app.component';

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html',
  styleUrls: ['./post-feed.component.css']
})
export class PostFeedComponent implements OnInit, OnChanges {
  @Input() userId: string | undefined;

  firestore = new FirebaseTSFirestore();

  posts: PostData [] = [];
  currentUserId: string | undefined;
  userFollowed: boolean | undefined = undefined;
  followId: string | undefined;

  constructor( private dialog: MatDialog) { }

  ngOnInit(): void {
    if(!this.userId){
      this.getPosts();
    }
    this.currentUserId = AppComponent.getUserDocument()?.userId;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['userId']){
      this.getPosts();
    }
  }


  onCreatePostClick()
  {
    this.dialog.open(CreatePostComponent);
  }

  async onFollowUser(){
    if(this.userFollowed == false){
      await this.firestore.create
      (
        {
          path:["Users", this.userId as string, "Followers"],
          data: {
            followerId: this.currentUserId,
            publicName: AppComponent.getUserDocument().publicName
          }
        }
      );
    }
    else{
      await this.firestore.delete
      (
        {
          path:["Users", this.userId as string, "Followers",this.followId as string],
        }
      );
    }
    this.userFollowed = !this.userFollowed;
  }

  followedByUser(): boolean | undefined {
    if(this.userFollowed != undefined) {
     return this.userFollowed;
    }
    this.userFollowed = false;
    this.firestore.getCollection
     (
       {
         path: ["Users",this.userId as string,"Followers"],
         where: [],
         onComplete: (result) => 
         {
           result.docs.forEach
           (
             doc => 
             {
               let follow = <Follow>doc.data();
               if(follow.followerId == AppComponent.getUserDocument().userId){
                 this.followId = doc.id;
                 this.userFollowed = true;
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
   return this.userFollowed;
   }

  getFollowButtonColor(){
    return this.followedByUser() ? "warn" : "black";
  }

  getPosts()
  {
    this.posts = [];
    this.firestore.getCollection
    (
      {
        path: ["Posts"],
        where: 
        [
          new OrderBy("timestamp", "desc"), //maybe asc later instead of desc
          new Limit(60),
        ],
        onComplete: (result) => 
        {
          result.docs.forEach
          (
            doc => 
            {
              let post = <PostData>doc.data();
              post.postId = doc.id;
              if(this.userId){
                post.creatorId == this.userId ? this.posts.push(post) : null
              } else {
                this.posts.push(post);
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
}

export interface PostData
{
  comment: string;
  creatorId: string;
  imageUrl?: string;
  postId: string;
}

export interface Follow {
  followerId: string;
  publicName: string;
}
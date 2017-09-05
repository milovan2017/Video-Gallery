function VideoPlayer(cont) {
   this.cont = cont;
   this.position = 0;
   this.oldPos = 0;
   this.vidCount = 0;
   this.playing = 0;
   this.curentTime = 0;
   this.durationTime = 0;
   this.volumeCtr = 0.7;
   this.myVotesArr =[];
}


VideoPlayer.prototype.showRatings = function(){  //show rating from DB
   var vid = this.getCurrentVid();
   if (vid.dataset.rat_count >= 1) {
      this.userRatings.innerHTML = `${vid.dataset.rat_avg}/5 <br> ${vid.dataset.rat_count} votes`;
   } else{
      this.userRatings.innerHTML = 'not rated';
   }
}

VideoPlayer.prototype.showMyRating = function(){  //show ratings from local storage
   var vid = this.getCurrentVid();
   var self = this;
   if (checkVote()) {
      this.rateCont.style.display = 'block';
      this.rating.style.display = 'none';
   } else {
      this.rateCont.style.display = 'none';
      this.rating.style.display = 'block';
      this.rating.innerHTML = `U voted ${vid.dataset.myvote}`;
   }

   function checkVote(){
      for (var i = 0; i < self.myVotesArr.length; i++) {
         if (self.myVotesArr[i].id == vid.dataset.id ) {
            return false;
         }
      }
      return true;
   }
}

VideoPlayer.prototype.addRating = function(id,rating){
   var self = this;
   var xml = new XMLHttpRequest;
   var ratingData = new FormData;
   ratingData.append('ratingData[]', id);
   ratingData.append('ratingData[]', rating);
   xml.open('post', 'php/addRating.php');
   xml.addEventListener('readystatechange', function(){
      if (xml.status === 200 && xml.readyState === 4) {
         var text = xml.responseText;
         console.log(text);
         self.showMyRating();
      }
   })
   xml.send(ratingData);
}

VideoPlayer.prototype.loadVideos = function(){
   var self = this;
   var xml = new XMLHttpRequest;
   xml.open('get', 'php/getRatings.php');
   xml.addEventListener('readystatechange', function(){
      if (xml.status === 200 && xml.readyState === 4) {
         var text = xml.responseText;
         var videoArr = JSON.parse(text);
         self.videos = videoArr.slice();
         self.elements();
      }
   })
   xml.send();
}
VideoPlayer.prototype.elements = function() {
   var self = this;
   var rating = '';
   function addElements() {
      var videosTxt = "";
      var titleTxt = "";
      for (var i = 0; i < self.videos.length; i++) {
         videosTxt += `<video width="640" height="360" poster="${self.videos[i].poster}" data-id='${self.videos[i].id}' data-rat_count='${self.videos[i].rat_count}' data-rat_avg='${self.videos[i].rat_avg}' data-title='${self.videos[i].title}'><source src=${self.videos[i].url} type="video/mp4"></video>`;
      }
      self.cont.innerHTML = `<div class="user_ratings"></div><div class="volume_cont"><i class="material-icons volume_icon">volume_up</i> <div class="volume"><div class="volume_bar"></div></div></div><div class='title'></div><div class="rating"></div><div class="rate_cont"><span data-pos="1">&star;</span><span data-pos="2">&star;</span><span data-pos="3">&star;</span><span data-pos="4">&star;</span><span data-pos="5">&star;</span></div><div class='progress_cont'><div class='line'></div><div class='progress_time'>00:00</div><div class='progress_bar'></div><div class='time_label'></div></div><i class="material-icons left">keyboard_arrow_left</i><i class="material-icons right">keyboard_arrow_right</i><i class="material-icons play">play_circle_outline</i><div class = "video_gallery">${videosTxt}</div>`;
   }

   function getElements(){
      self.videoArr = self.cont.querySelectorAll('video');
      self.videoWidth = parseInt(window.getComputedStyle(self.videoArr[0],null).getPropertyValue("width"));
      self.videoGalery = self.cont.querySelector('.video_gallery ');
      self.vidCount = self.videoArr.length;
      self.videoGalery.style.width = `${self.vidCount * self.videoWidth}px`;
      self.arrowLeft = self.cont.querySelector('.left');
      self.arrowRight = self.cont.querySelector('.right');
      self.play = self.cont.querySelector('.play');
      self.timeLabel = self.cont.querySelector('.time_label');
      self.progressCont = self.cont.querySelector('.progress_cont');
      self.progressBar = self.cont.querySelector('.progress_bar');
      self.progressTime = self.cont.querySelector('.progress_time');
      self.line = self.cont.querySelector('.line');
      self.title = self.cont.querySelector('.title');

      self.volumeCont = self.cont.querySelector('.volume_cont');
      self.volume = self.cont.querySelector('.volume');
      self.volumeBar = self.cont.querySelector('.volume_bar');
      self.volumeIcon = self.cont.querySelector('.volume_icon');

      self.rating = self.cont.querySelector('.rating');
      self.rateCont = self.cont.querySelector('.rate_cont');
      self.rateStars = self.rateCont.querySelectorAll('span');

      self.userRatings = self.cont.querySelector('.user_ratings');
   }

   function addListeners(){
      self.cont.addEventListener('mouseenter', enterF);
      self.cont.addEventListener('mouseleave', leaveF);
      self.arrowLeft.addEventListener('click', clickLeftF);
      self.arrowRight.addEventListener('click', clickRightF);
      self.play.addEventListener('click', clickPlay);
      self.videoArr[0].addEventListener('loadeddata', loadedData);

      self.progressCont.addEventListener('mousemove', progressMove);
      self.progressCont.addEventListener('click', progressClick);
      self.progressCont.addEventListener('mouseenter', progressEnter);
      self.progressCont.addEventListener('mouseleave', progressLeave);

      self.volume.addEventListener('click', volumeClick);
      self.volumeIcon.addEventListener('click', muteClick);


      for (var i = 0; i < self.rateStars.length; i++) {
         self.rateStars[i].addEventListener('mouseenter', starHover);
         self.rateStars[i].addEventListener('click', starClick);
      }

      function starHover(){
         this.style.color = 'red';
         var myPos = this.dataset.pos;
         for (var i = 0; i < self.rateStars.length; i++) {
            if (self.rateStars[i].dataset.pos < myPos) {
               self.rateStars[i].style.color = 'red';
            } else if (self.rateStars[i].dataset.pos > myPos){
               self.rateStars[i].style.color = 'black';
            }
         }
      }

      function starClick(){
         var vote = this.dataset.pos;
         self.addVote(vote);
      }

      function volumeClick(){
         var offsetX = self.cont.offsetLeft + self.volumeCont.offsetLeft + self.volume.offsetLeft ;
         var position = event.pageX-offsetX-2;
         self.volumeBar.style.width = position + "px";
         var volume = parseInt(window.getComputedStyle(self.volumeBar,null).getPropertyValue("width")) / parseInt(window.getComputedStyle(self.volume,null).getPropertyValue("width"));
         if (volume>1) {
            volume = 1
         }
         for (var i = 0; i < self.videoArr.length; i++) {
            self.videoArr[i].volume = volume;
         }
         self.volumeCtr = volume;
         self.volumeWidth = self.volumeBar.style.width;
      }

      function muteClick(){
         if (self.volumeIcon.innerHTML == "volume_up") {
            self.volumeBar.style.width = 0;
            self.volumeIcon.innerHTML = "volume_off"
            for (var i = 0; i < self.videoArr.length; i++) {
               self.videoArr[i].volume = 0;
            }
         } else{
            self.volumeIcon.innerHTML = "volume_up";
            self.volumeWidth = parseInt(window.getComputedStyle(self.volume,null).getPropertyValue("width")) * self.volumeCtr + "px";
            self.volumeBar.style.width = self.volumeWidth;
            for (var i = 0; i < self.videoArr.length; i++) {
               self.videoArr[i].volume = self.volumeCtr;
            }
         }
      }

      function progressEnter(){
         self.progressTime.style.opacity = .9;
         self.line.style.opacity = .9;
      }

      function progressLeave(){
         self.progressTime.style.opacity = 0;
         self.line.style.opacity = 0;
      }

      function progressClick(){
         var offsetX = self.cont.offsetLeft + self.progressCont.offsetLeft;
         var position = event.pageX-offsetX;
         self.clickTime(position);
         self.progress();
      }

      function progressMove(){
         var offsetX = self.cont.offsetLeft + self.progressCont.offsetLeft;
         var halfWidth = parseInt(window.getComputedStyle(self.progressTime,null).getPropertyValue("width"))/2;
         self.progressTime.style.left = event.pageX-offsetX-halfWidth+"px";
         self.hoverTime(event.pageX-offsetX);
         self.line.style.left = event.pageX-3-offsetX+'px';
      }

      function loadedData(){
         self.showTime();
         self.videoArr[0].removeEventListener('loadeddata', loadedData);
      }

      function enterF(){
         self.arrowLeft.style.opacity = .9;
         self.arrowRight.style.opacity = .9;
         self.play.style.opacity = .9;
         self.progressCont.style.opacity = .9;
         self.title.style.opacity = .9;
         self.volumeCont.style.opacity = .9;
         self.userRatings.style.opacity = .7;
         self.rating.style.opacity = .7;
         self.rateCont.style.opacity = .7;

      }

      function leaveF(){
         self.arrowLeft.style.opacity = 0;
         self.arrowRight.style.opacity = 0;
         self.play.style.opacity = 0;
         self.progressCont.style.opacity = 0;
         self.title.style.opacity = 0;
         self.volumeCont.style.opacity = 0;
         self.userRatings.style.opacity = 0;
         self.rating.style.opacity = 0;
         self.rateCont.style.opacity = 0;
      }

      function clickLeftF(){
         self.goLeft();
         self.showTime();
         if (self.getCurrentVid().paused) {
            self.showPlay();

         } else {
            self.showPause();
         }
         self.showTitle();
         self.showRatings();
         self.showMyRating();
      }

      function clickRightF(){
         self.goRight();
         self.showTime();
         if (self.getCurrentVid().paused) {
            self.showPlay();

         } else {
            self.showPause();
         }
         self.showTitle();
         self.showRatings();
         self.showMyRating();
      }

      function clickPlay(){
         self.addVote(5);
         var vid = self.getCurrentVid();
         vid.addEventListener('ended', endF);
         function endF(){
            self.play.innerHTML = `replay`;
            self.play.className = "material-icons replay";
         }
         if (self.getCurrentVid().paused) {
            self.getCurrentVid().play();
            self.playing = 1;
            self.bind1 = self.showTime.bind(self);
            self.loop1 = setInterval(self.bind1,20);
            self.showPause();
         } else {
            self.getCurrentVid().pause();
            self.playing = 0;
            clearInterval(self.loop1);
            self.showPlay();
         }
      }
   }
   addElements();
   getElements();
   addListeners();
   self.showTitle();
   self.getMyVotes();
   self.showRatings();
   self.showMyRating();
}

VideoPlayer.prototype.showTitle = function(){
   var vid = this.getCurrentVid();
   var title = vid.dataset.title;
   this.title.innerHTML = title;
}

VideoPlayer.prototype.showPause = function(){
   this.play.innerHTML = `pause_circle_outline`;
   this.play.className = "material-icons pause";
}

VideoPlayer.prototype.showPlay = function() {
   this.play.innerHTML = `play_circle_outline`;
   this.play.className = "material-icons play";
}

VideoPlayer.prototype.goLeft = function() {
   if (this.position > 0) {
      this.position--;
   } else {
      this.position = this.vidCount-1;
   }
   this.GoTo(this.position);
}


VideoPlayer.prototype.goRight = function() {
   if (this.position < this.vidCount-1) {
      this.position++;
   } else {
      this.position = 0 ;
   }
   this.GoTo(this.position);
}

VideoPlayer.prototype.GoTo = function(position){
   this.videoGalery.style.marginLeft = `${-(position)*(this.videoWidth)}px`;
   this.stopAll();
}

VideoPlayer.prototype.stopAll = function() {
   for (var i = 0; i < this.videoArr.length; i++) {
    this.videoArr[i].pause();
   }
}

VideoPlayer.prototype.formatSec = function(secSum) {
   var min = parseInt(secSum / 60);
   var sec = parseInt(secSum % 60);
   if (sec<10) {
      return `${min}:0${sec}`;
   }
   else {
      return `${min}:${sec}`;
   }
}

VideoPlayer.prototype.showTime = function () {
   this.timeLabel.innerHTML = `${this.getCurrentTime()}/${this.getDuration()}`;
   this.progress();
}

VideoPlayer.prototype.getCurrentVid = function() {
   return this.videoArr[this.position];
}

VideoPlayer.prototype.getDuration = function() {
   return this.formatSec(this.getCurrentVid().duration);
}

VideoPlayer.prototype.getCurrentTime = function() {
   return this.formatSec(this.getCurrentVid().currentTime);
}

VideoPlayer.prototype.progress = function() {
   this.maxWidth = parseInt(window.getComputedStyle(this.progressCont,null).getPropertyValue("width"));
   var currentWidth = parseInt((this.getCurrentVid().currentTime/this.getCurrentVid().duration)*this.maxWidth);
   this.progressBar.style.width = currentWidth+'px';
}

VideoPlayer.prototype.hoverTime = function(left) {
   var currentTime = parseInt((left/this.maxWidth)*this.getCurrentVid().duration);
   this.progressTime.innerHTML = this.formatSec(currentTime);
}

VideoPlayer.prototype.clickTime = function(left) {
   var currentTime = parseInt((left/this.maxWidth)*this.getCurrentVid().duration);
   this.getCurrentVid().currentTime = currentTime;
}

VideoPlayer.prototype.addVote = function(vote) {
   var vid = this.getCurrentVid();
   var id = vid.dataset.id;
   var title = vid.dataset.title;
   if (!vid.getAttribute('data-myvote')) {
      var myVote = {
         id : id,
         vote: vote
      };
      vid.setAttribute('data-myvote', vote);
      this.myVotesArr.push(myVote);
      var votesStr = JSON.stringify(this.myVotesArr);
      localStorage.setItem("myVotes", votesStr);
      this.addRating(id,vote);
   }
}

VideoPlayer.prototype.getMyVotes = function(){
   if (localStorage.getItem("myVotes")) {
      var storageVotes = localStorage.getItem("myVotes");
      storageVotes = JSON.parse(storageVotes);
      for (i = 0; i < this.videoArr.length; i++){
         for (j = 0; j < storageVotes.length; j++){
            if (this.videoArr[i].dataset.id == storageVotes[j].id){
               this.videoArr[i].setAttribute('data-myvote', storageVotes[j].vote);
            }
         }
      }
      this.myVotesArr = JSON.parse(localStorage.getItem('myVotes'));
   }
}

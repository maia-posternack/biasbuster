var URL = "";
var allSites;
var corAuth;
var testNewSite = 0;

var TITLE = "loading";
var TEXT = "loading";
var WORDS = [];
var FIRSTTHREE= "";
var AUTHOR = "not applicable";
var AUTHORLINK = "loading"
var checkWords = ["is","are","was","were","been","seem","seems","like","being","be"]
var topAdj = [];
var nounPair = [];
var sortedNouns = []
var authorFor = false;
var comments;
var spec;
var myData = []
var specBias = ""
var curCom = [];
var NAMES;

chrome.storage.sync.get('allSites', function(data) {
  allSites = data.allSites;
});
chrome.storage.sync.get('corAuth', function(data) {
  corAuth = data.corAuth;
});
chrome.storage.sync.get('comments', function(data) {
  comments = data.comments;
});
chrome.storage.sync.get('spec', function(data) {
  spec = data.spec;
});


let saveButton = document.getElementById('saveButton');
let saveButton2 = document.getElementById('saveButton2');
let btn = document.getElementById('btn');



$(function() {
 chrome.tabs.query({active: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
   URL+= tabs[0].url;
   for(var i = 0; i < allSites.length; i++){
     if(allSites[i].URL == URL){
       testNewSite += 1
       displayInfo()
       console.log("pre-loaded")
       break;
     }
   }

    if(allSites.length>0){
    var name = allSites[allSites.length-1].AUTH.split(" ")
     var name1 = name[0]
     var name2 = name[1]
     if((URL.includes(name1))||(URL.includes(name2))){
       authorFor = true;

   }
 }

  var already = false;
  for(var a = 0; a < spec.length; a++){
    if(spec[a].URL == URL){
    var specAvg = 0;
     for(var i = 0; i < spec[a].SPECDATA.length; i ++){
       specAvg += parseInt(spec[a].SPECDATA[i]);
       already = true;
     }
     console.log(specAvg)

     specAvg/=(spec[a].SPECDATA.length - 1)
     document.getElementById("myRange").value = specAvg;
     console.log(specAvg)

     if(specAvg < 20){
       document.getElementById('how').innerHTML = "people think that this article has a far left bias"
     }
     else if((specAvg >= 20)&&(specAvg < 40)){
       document.getElementById('how').innerHTML = "people think that this article has a moderate left bias"
     }
     else if((specAvg >= 40)&&(specAvg < 60)){
      document.getElementById('how').innerHTML = "people think that this article has a moderate bias"
     }
     else if((specAvg >= 60)&&(specAvg < 80)){
       document.getElementById('how').innerHTML = "people think that this article has a moderate right bias"
     }
     else{
      document.getElementById('how').innerHTML = "people think that this article has a far right bias"
     }
    }
  }
  if(already == false){
    document.getElementById('how').innerHTML = "no one has voted on this article yet. be the first!"
  }



if(testNewSite == 0){
  //sent to content to get title
    $(function() {
     chrome.tabs.query({active: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
       var activeTab = tabs[0];
       chrome.tabs.sendMessage(activeTab.id, {"message": "fetch_title"});
     });
    });

//send to content to get para
  $(function() {
   chrome.tabs.query({active: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
     var activeTab = tabs[0];
     chrome.tabs.sendMessage(activeTab.id, {"message": "fetch_para"});
   });
  });
}
});
});



saveButton.onclick = function(element) {
  let userinput = select('#userinput');
  let ui = userinput.value();
  let username = select('#username')
  let um = username.value();
  comments.push(addComment(URL, um, ui));
  chrome.storage.sync.set({comments});
  createP("username: " + um + " " + "comment: " + ui)

}

btn.onclick = function(element) {
  for(var i = 0; i < allSites.length; i++){
    if(allSites[i].URL == URL){

      console.log(allSites[i].AUTHURL)
      window.open(allSites[i].AUTHURL)

    }
  }
}


saveButton2.onclick = function(element) {
  let myRange = select('#myRange');
  var done = false;
  for(var i = 0; i < spec.length; i++){
    if(spec[i].URL == URL){
      spec[i].SPECDATA.push(myRange.value())
      done = true;
      console.log(spec[i].SPECDATA)

    }
  }
  if(done == false){
    myData.push(myRange.value());
    spec.push(createSpectrum(URL,myData))
    console.log(spec[spec.length-1])

  }
  chrome.storage.sync.set({spec});
}


chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
   if( request.message === "works_fetched" ) {
    corAuth.push(saveAuthor(allSites[allSites.length-1].URL,request.data));
     chrome.storage.sync.set({corAuth});
     console.log(request.data);
     console.log(corAuth[0].PASTURL)
   }
  }
);


//once get para from content
chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
  if( request.message === "para_fetched" ) {
  var LINETEXT=request.data;

  for(var i = 0; i < LINETEXT.length; i++){
    TEXT+= LINETEXT[i];
    TEXT+= " ";
  }

  //split at each space or enter so that individual words
  var WORDS = TEXT.split(" ");

  console.log(WORDS)

  //parameters for rita.js
  var params = {
    ignoreStopWords: true,
    ignoreCase: true,
    ignorePunctuation: true
  };
  //without stop words
  var noStop = RiTa.concordance(LINETEXT.join(" "), params);

  var allWords = [];
  for (var i in noStop) {
    allWords.push(i);
}


  for (var i = 1; i < allWords.length-1; i++) {
    if((RiTa.isAdjective(allWords[i]))&&(RiTa.isVerb(allWords[i])==false)){
    topAdj.push(allWords[i])


      if(RiTa.isNoun(allWords[i+1])){
          nounPair.push(allWords[i+1])
        }
      else if(RiTa.isNoun(allWords[i-1])){
        nounPair.push(allWords[i-1])
      }
      else{
        loop1:
        for(var b = 1; b < 5; b++){
          loop2:
          for(var a = 0; a < checkWords.length; a++){
            if(allWords[i-b]==checkWords[a]){
            loop3:
              for(var c = 0; c < 5; c++){
                if(RiTa.isNoun(allWords[i-b-c])){
                  nounPair.push(allWords[i-b-c])
                  break loop1;
              }
            }
          }
        }
      }
      if(nounPair.length<topAdj.length){
          nounPair.push("NO NOUN ")

      }
    }

  }

  }

  for(var y = 0; y < nounPair.length; y ++){
    if (nounPair[y] !== "NO NOUN "){
      sortedNouns.push(nounPair[y])
    }
  }

//
  sortedNouns.sort(compare2)

  function compare2(a, b) {
    return (noStop[b] - noStop[a])
  }


for(var i = 0; i<LINETEXT.length - 2; i++ ){

  if((LINETEXT[i][0]==="B")&&((LINETEXT[i][1]==="y")||(LINETEXT[i][1]==="Y"))&&(LINETEXT[i][2]===" ")){
    AUTHOR = "";
    for(var a = 3; a < LINETEXT[i].length; a++){
      AUTHOR+=LINETEXT[i][a];
    }
    }
    //break;
}

    /*NAMES = AUTHOR.toLowerCase().split(" ")

    console.log(NAMES)

    if((URL.includes(NAMES[0]))||(URL.includes(NAMES[0]))){
    authorFor = true;
  }*/

    $(function() {
     chrome.tabs.query({active: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
       var activeTab = tabs[0];
       chrome.tabs.sendMessage(activeTab.id, {"message": "fetch_hyper"});
     });
    });

  }
   }
);
//once get title from content
chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
   if( request.message === "title_fetched" ) {
     TITLE = request.data;
   }
  }
);

chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
   if( request.message === "hyper_fetched" ) {



    NAMES = AUTHOR.toLowerCase().split(" ")

    console.log(NAMES)
    console.log(AUTHOR)
    console.log(authorFor)


     if(authorFor == false){
     HYPER = request.data;

     for(var x = 0; x < HYPER.length; x++){
       if(HYPER[x].includes(NAMES[0])){
         AUTHORLINK = HYPER[x]

       }
       else if (HYPER[x].includes(NAMES[1])){
         AUTHORLINK = HYPER[x]
       }
     }

     console.log(AUTHORLINK)

     allSites.push(storeWebsite(URL, TITLE, topAdj, sortedNouns, nounPair, AUTHOR, AUTHORLINK));
     chrome.storage.sync.set({allSites});
     testNewSite += 1
     displayInfo()
     console.log("notauth")

   }
   else if (authorFor == true){

     document.body.innerHTML = "";
     createP("downloading info about author. return to article to see it!")

       $(function() {
        chrome.tabs.query({active: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
          var activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, {"message": "fetch_works"});
        });
       });

       console.log("auth")



   }

   }
  }

);
function draw(){
  createCanvas(350, 0);
}

function displayInfo(){


  for(var i = 0; i < allSites.length; i++){
    if(allSites[i].URL == URL){

      document.getElementById('tit').innerHTML = "TITLE: " + allSites[i].TITLE
      document.getElementById('aut').innerHTML = "AUTHOR: " + allSites[i].AUTH

      var pair1 = allSites[i].PAIR;
      var sort1 = allSites[i].SORT;
      var adj1 = allSites[i].ADJ;

      for(var x = 0; x < 5; x ++){
        for(var y = 0; y < pair1.length; y++){
          if(sort1[x] == pair1[y]){
            var num = (x+1).toString()
            document.getElementById(num).innerHTML = sort1[x] +" / " + adj1[y]
           }
         }
       }

  }
  }

  for(var b = 0; b < comments.length; b++){
    if(comments[b].URL == URL){
      createP("username: " + comments[b].NAME + "comment: " + comments[b].COM)
      console.log(comments[b].COM)
    }
  }

  for(var a = 0; a < corAuth.length; a++){
    if(corAuth[a].PASTURL == URL){

      document.getElementById('works').innerHTML = "this author wrote articles titled: "
      document.getElementById('works1').innerHTML =(corAuth[a].AUTHORWORKS[1])
      document.getElementById('works2').innerHTML =(corAuth[a].AUTHORWORKS[2])
      document.getElementById('works3').innerHTML =(corAuth[a].AUTHORWORKS[3])

    }
  }

}

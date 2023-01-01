
chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
   if( request.message === "fetch_para" ) {
       var links = document.querySelectorAll('p');

    var allText = [];
    for(var i = 0; i < links.length; i++){
      if((links[i].innerText!=="ADVERTISEMENT")&&(links[i].innerText!== "Supported by")){
      allText.push(links[i].innerText)
    }


    }
    chrome.runtime.sendMessage({"message": "para_fetched", "data": allText});

   }
 }
);

chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
   if( request.message === "fetch_title" ) {
     var links = document.querySelector('h1').textContent;
    chrome.runtime.sendMessage({"message": "title_fetched", "data": links});
   }
 }
);

chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
   if( request.message === "fetch_works" ) {
     var allWorks = document.querySelectorAll('h2');

     var links = [];
     for(var i = 0; i < allWorks.length; i++){
       links.push(allWorks[i].innerText)
     }

    chrome.runtime.sendMessage({"message": "works_fetched", "data": links});
   }
 }
);

chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
   if( request.message === "fetch_hyper" ) {
  //var hi = document.links[0].href;
     var topTen = []
     for(var i = 0; i < 30; i++){
       topTen[i]=document.links[i].href
     }
    chrome.runtime.sendMessage({"message": "hyper_fetched", "data": topTen});
   }
 }
);

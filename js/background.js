// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//use chrome.runtime to get info from background page
//make event listener
//if installed: do this
chrome.runtime.onInstalled.addListener(function() {

  let allSites = []
  chrome.storage.sync.set({allSites});
  console.log(allSites);

  let corAuth = []
  chrome.storage.sync.set({corAuth});

  let comments = []
  chrome.storage.sync.set({comments});

  let spec = []
  chrome.storage.sync.set({spec});






  //later makes button color (rn = green)
  //store data in a browser

//if on a dif website (page changed)
//take away all old rules. erase past data
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    //do the new rules below
    chrome.declarativeContent.onPageChanged.addRules([{
      //check what site
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlContains: '.com' },
      })],

      //connects to page action in json default popup and icon
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });



});

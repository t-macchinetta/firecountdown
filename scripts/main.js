/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
$(function () {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );

  if ('serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
      .then(function (registration) {
        // updatefound is fired if service-worker.js changes.
        registration.onupdatefound = function () {
          // updatefound is also fired the very first time the SW is installed,
          // and there's no need to prompt for a reload at that point.
          // So check here to see if the page is already controlled,
          // i.e. whether there's an existing service worker.
          if (navigator.serviceWorker.controller) {
            // The updatefound event implies that registration.installing is set:
            // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
            var installingWorker = registration.installing;

            installingWorker.onstatechange = function () {
              switch (installingWorker.state) {
                case 'installed':
                  // At this point, the old content will have been purged and the
                  // fresh content will have been added to the cache.
                  // It's the perfect time to display a "New content is
                  // available; please refresh." message in the page's interface.
                  break;

                case 'redundant':
                  throw new Error('The installing ' +
                    'service worker became redundant.');

                default:
                // Ignore
              }
            };
          }
        };
      }).catch(function (e) {
        console.error('Error during service worker registration:', e);
      });
  }

  // Your custom JavaScript goes here
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAZ1j0HNH3pFQrEPtRfwmiCNRTd3q4s2mk",
    authDomain: "firetimer-791f2.firebaseapp.com",
    databaseURL: "https://firetimer-791f2.firebaseio.com",
    projectId: "firetimer-791f2",
    storageBucket: "",
    messagingSenderId: "1012583610317"
  };
  firebase.initializeApp(config);

  // 変数
  var $hh = $('#hh');
  var $mm = $('#mm');
  var $ss = $('#ss');
  var t = 0;
  var i = 0;
  var now = 0;

  // ミリ秒に変更する関数
  function msTime(hh, mm, ss) {
    var h = Number(hh * 1000 * 60 * 60);
    var m = Number(mm * 1000 * 60);
    var s = Number(ss * 1000);
    t = h + m + s;
    return t;
  }

  // ミリ秒から戻す関数
  function perseTime(ms) {
    var h = String(Math.floor(ms / 3600000) + 100).substring(1);
    var m = String(Math.floor((ms - h * 3600000) / 60000) + 100).substring(1);
    var s = String(Math.round((ms - h * 3600000 - m * 60000) / 1000) + 100).substring(1);
    var arr = [h, m, s];
    return arr;
  }

  // database準備
  var newPostRef = firebase.database().ref('/timer');

  // 読み込み時の処理
  t = msTime($hh.val(), $mm.val(), $ss.val());
  newPostRef.set({
    time: t
  });

  // 時間を設定する関数
  function timeSet() {
    // alert($hh, $mm, $ss);
    var count = msTime($hh.val(), $mm.val(), $ss.val());
    t = count;
    newPostRef.set({
      time: count
    });
  }

  // カウントをへらす関数
  function countDown() {
    t = t - 1000;
    newPostRef.set({
      time: t
    });
  }

  // リアルタイムに更新
  newPostRef.on('value', function (data) {
    var v = data.val();
    t = v.time;
    var t_arr = perseTime(t);
    $('#output').text(t_arr[0] + ':' + t_arr[1] + ':' + t_arr[2]);
    if (t < 1000) {
      $('#output').text("TimeUp!!");
    }
  });

  // 時間変更時の処理
  $('.countTime').on('change', function () {
    timeSet();
  });

  // スタートボタンクリック
  $('#start').on('click', function () {
    $(this).addClass('hidden');
    $('#stop').removeClass('hidden');
    $('.countTime').prop("disabled", true);
    $('#reset').prop("disabled", true);
    if (now == 0) {
      timeSet();
    }
    now = 1;
    i = setInterval(function () {
      countDown();
      if (t < 1000) {
        clearInterval(i);
        now = 0;
        $('.countTime').prop("disabled", false);
        $('#reset').prop("disabled", false);
        $('#stop').addClass('hidden');
        $('#start').removeClass('hidden');
      }
    }, 1000);
  });

  // ストップボタンクリック
  $('#stop').on('click', function () {
    $(this).addClass('hidden');
    $('#start').removeClass('hidden');
    $('.countTime').prop("disabled", false);
    $('#reset').prop("disabled", false);
    clearInterval(i);
  });

  // リセットボタンクリック
  $('#reset').on('click', function () {
    timeSet();
  });

});

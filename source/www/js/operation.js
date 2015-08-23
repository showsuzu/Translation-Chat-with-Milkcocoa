// Translate spec
//  for voice recognition(Speech to Text) language1
//  to translate langage is language2
//    language1 -> speech to text -> translate to language2 -> text to speech
//
'use strict';

var translateDispModule = angular.module('translateDisp', []);

translateDispModule.config(function($sceProvider) {
//  $sceProvider.enabled(false);
})

translateDispModule.directive('onFinishRepeat', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
})

translateDispModule.service("chatTransSvc", ['$http', function ($http) {
    this.get_translateresult = function (fullURI, callback) {
        $http({
            url: fullURI,
            method: 'GET'
        })
        .success(function (data, status, headers, config) {
            console.log("ajax success");
            callback(data);
        })
        .error(function (data, status, headers, config) {
            alert(status + ' ' + data.message);
        });
    };
}])

translateDispModule.controller("translateDisplay", ['$scope', 'chatTransSvc', function($scope, chatTransSvc) {
//Global variable
    //  for Recognition
    $scope.nowRecognition = false;
    //  for Shacking
    $scope.nowShackProcessing = false;

    //Global defined valeu
    $scope.user_name = 'Virgil'
    $scope.ds = '';
    $scope.other_lang = 'en';
    $scope.select_lang = 'ja';
    $scope.input_lang = $scope.other_lang;
    $scope.output_lang = $scope.select_lang;
    //  for translator
    $scope.translaionURI = "http://mymemory.translated.net/api/get?q=";
    $scope.langQS = "&langpair=";

    $scope.whistleData = "Whistle.wav";

    // continuous_type
    //  0: frick start -> translate -> output -> whistle -> input
    //  1: frick start -> input -> translate -> output -> whistle
    $scope.continuous_type = 1;

    $scope.languages = [
        {name:'日本語', code:'ja'},
        {name:'English', code:'en'},
        {name:'Deutsch', code:'de'},
        {name:'español', code:'es'},
        {name:'Français', code:'fr'},
        {name:'Italiano', code:'it'},
        {name:'한국어', code:'ko'},
        {name:'中文', code:'zh'}
    ];

    $scope.results = [
        {
            "id": 0,
            "side": 2,
            "who": "you",
            "lang": "ja",
            "input": "ここに入力した文章",
            "mylang": "",
            "translated": ""
        },
        {
            "id": 1,
            "side": 1,
            "who": "who?",
            "lang": "en",
            "input": "Here is display that another persons messages",
            "mylang": "ja",
            "translated": "ここに他の人のメッセージ表示"
        }
    ];

    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        var obj = document.getElementById("wrapper");
        if(!obj) return;
        //TODO これは改善の余地あり。bodyを取得したいが、、、
        obj.parentElement.parentElement.parentElement.scrollTop = obj.parentElement.parentElement.parentElement.scrollHeight;
    });

//
//Speech to Text(voice recognize)
//
    $scope.start = function() {
        var maxMatches = 1;
        var promptString = '音声入力中 / Speak now'; // optional
        plugins.speechrecognizer.startRecognize(function(result){
            ////when div field
            //document.input_field.value = result;
            $scope.set_recognizedResult(result);
            //
            console.log("Result : " + result);
            //
        }, function(errorMessage){
            console.log("Error message: " + errorMessage);
        }, maxMatches, promptString, $scope.select_lang);

        $scope.nowRecognition = true;
    };

    $scope.stop = function() {
//    recognition.stop();
        $scope.nowRecognition = false;
    };

//
//Getter and Setter
//
    $scope.get_message = function() {
    //console.log("To transrate text : " + text);
        return document.getElementById("msg_text").value;
    };

    $scope.set_recognizedResult = function(recognizedText) {
        document.getElementById("msg_text").value = recognizedText;
    };

    $scope.set_translatedResult = function(translatedText) {
        //document.translate.translate_result.value = translatedText;
    };

    $scope.get_translatedResult = function() {
        //return document.translate.translate_result.value;
    };

    $scope.get_translateLang = function() {
        return {
            'from':$scope.input_lang,
            'to':$scope.output_lang
        }
    };

    $scope.set_translateLang = function(input, output) {
        $scope.input_lang = input;
        $scope.output_lang = output;
        console.log("input : " + input + ",  output ; " + output);
    };

//
//for Message area function
//
    $scope.json_add = function(side, who, lang, input) {
        var now = new Date();
        var id = Math.floor( now.getTime()/1000);
        var translate_lang, translate_result;
        var data = {
            "id": id,
            "side": side,
            "who": who,
            "lang": lang,
            'input': input,
            "mylang": " ",
            "translated": " "
        };
        if(lang != $scope.select_lang) {
            translate_lang = $scope.select_lang;

            var langpair = $scope.langQS + lang + '|' + translate_lang;
            var fullURI = $scope.translaionURI + input + langpair;

            chatTransSvc.get_translateresult(fullURI, function (res) {
                var translate_result = res.responseData.translatedText;
                console.log("Result : " + translate_result)
                data.mylang = translate_lang;
                data.translated = translate_result;
                $scope.updateResults(data);
            });
        } else {
            $scope.updateResults(data);
        }
    };


//
//Functional definition to the Button
//
    $scope.st_session = function() {
        $scope.user_name = document.getElementById("dispname").value;
        $scope.dsStart($scope.user_name);
    }

    $scope.rec_msg = function() {
        if ($scope.nowRecognition) {
            $scope.stop();
        } else {
            $scope.start();
        }
    };

    $scope.send_msg = function() {
        console.log('TAP send message button');
        var message = $scope.get_message();
        var data = {
            'who': $scope.user_name,
            'lang': $scope.select_lang,
            'message': message
        };
        $scope.ds.send(data,
            function(err, datnum) {
                console.log("sending complete" + datnum);
            },
            function(err){
                console.log("sending error");
            }
        );
        var side = 2;
        $scope.json_add(side, $scope.user_name, $scope.select_lang, message);
    };

    $scope.sel1_init = function() {
        $scope.sel1 = $scope.languages[0];
        $scope.lang = $scope.languages[0];
    };

    $scope.sel1_func = function() {
        console.log("Changed langage to " + $scope.sel1.code);
        $scope.select_lang = $scope.sel1.code;
        //$scope.circle_btn2_disp($scope.language2)
    };

//
//for Milkcocoa function
//
    $scope.dsStart = function(who) {
        var milkcocoa = new MilkCocoa(ここは各ユーザーのIDを設定する必要がある);
        $scope.ds = milkcocoa.dataStore('chat').child('message');
        $scope.ds.on("send", function(e) {
            $scope.msg_receive(e);
        });
        console.log("Sesstion created ");
        //Change the display contents
        var parentElement = document.getElementById("ang_area");
        parentElement.setAttribute('style', 'display:block;');
        parentElement = document.getElementById("wrapper");
        parentElement.setAttribute('style', 'display:block;');

        parentElement = document.getElementById("loginDisp");
        parentElement.setAttribute('style', 'display:none;');

    };

    $scope.msg_receive = function(e) {
        console.log('Receive the onother member messages');
        var side = 1;
        var who = e.value.who;
        if(who != $scope.user_name) {
            var lang = e.value.lang;
            var message = e.value.message;
            $scope.json_add(side, who, lang, message);
        }
    };


//
//Play Audio file
//  refer to : http://docs.phonegap.com/en/edge/cordova_media_media.md.html
//  useage : playAudio(whistleData);
//
    $scope.my_media = null;
    $scope.mediaTimer = null;

//絶対パスの取得
    $scope.getPath = function(){
        var str = location.pathname;
        var i = str.lastIndexOf('/');
        return str.substring(0,i+1);
    };

    $scope.playAudio = function(src) {
        if ($scope.my_media == null) {
            var path = $scope.getPath()+src;
            // Create Media object from src
            $scope.my_media = new Media(path, $scope.onSuccess, $scope.onError, $scope.onStatus);
        } // else play current audio
        // Play audio
        $scope.my_media.play();

        // Update my_media position every second
        if ($scope.mediaTimer == null) {
            $scope.mediaTimer = setInterval(function() {
                // get my_media position
                $scope.my_media.getCurrentPosition(
                    // success callback
                    function(position) {
                        if (position > -1) {
                            $scope.setAudioPosition((position) + " sec");
                        }
                    },
                    // error callback
                    function(e) {
                        console.log("Error getting pos=" + e);
                        $scope.setAudioPosition("Error: " + e);
                    }
                );
            }, 1000);
        }
    };

// Pause audio
//
    $scope.pauseAudio = function() {
        if ($scope.my_media) {
            $scope.my_media.pause();
        }
    };

// Stop audio
//
    $scope.stopAudio = function() {
        if ($scope.my_media) {
            $scope.my_media.stop();
        }
        if($scope.mediaTimer != null){
            clearInterval($scope.mediaTimer);
            $scope.mediaTimer = null;
        }
    };

// onSuccess Callback
//
    $scope.onSuccess = function() {
        console.log("playAudio():Audio Success");
    };

// onError Callback
//
    $scope.onError = function(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    };

// Status Changed Callback
//  status parameta
//    Media.MEDIA_NONE     = 0;
//    Media.MEDIA_STARTING = 1;
//    Media.MEDIA_RUNNING  = 2;
//    Media.MEDIA_PAUSED   = 3;
//    Media.MEDIA_STOPPED  = 4;
//
    $scope.onStatus = function(status){
        if(status==4){  //already stop status
            clearInterval($scope.mediaTimer);
            $scope.mediaTimer = null;
            $scope.my_media.release();
            $scope.my_media = null;
        }
    };

// Set audio position
//
    $scope.setAudioPosition = function(position) {
        console.log("Now play position : " + position);
        //document.getElementById('audio_position').innerHTML = position;
    };

///
/// for Timeline
///
    $scope.select_speaker = function(side) {
        return {
            'sp1_box' : side == 1,
            'sp2_box' : side == 2
        };
    };
    $scope.select_name = function(side) {
        return {
            'name' : side == 1,
            'name02' : side == 2
        };
    };
    $scope.updateResults = function(jsdata) {
        console.log("Call updateResults");
        $scope.results.push(jsdata);
    };


///do not move from end of file.Lang

}]);

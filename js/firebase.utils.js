
// a simple wrapper on Firebase and AngularFire to simplify deps and keep things DRY
var cpmodule = angular.module('fridgemagnets');
cpmodule
   .factory('fbutil', ['$window', 'FBURL', '$firebase', function($window, FBURL, $firebase) {
      "use strict";

      return {
        syncObject: function(path, factoryConfig) {
          return syncData.apply(null, arguments).$asObject();
        },

        syncArray: function(path, factoryConfig) {
          return syncData.apply(null, arguments).$asArray();
        },

        ref: firebaseRef,
	prepareRoom: prepareRoom,  
	changeMagnetSet: changeMagnetSet,  
	testRoomName: testRoomName,  
	presets: presets  
      };

      function pathRef(args) {
        for (var i = 0; i < args.length; i++) {
          if (angular.isArray(args[i])) {
            args[i] = pathRef(args[i]);
          }
          else if( typeof args[i] !== 'string' ) {
            throw new Error('Argument '+i+' to firebaseRef is not a string: '+args[i]);
          }
        }
        return args.join('/');
      }
       function getRandomInt(min, max) {
	   return Math.floor(Math.random() * (max - min + 1)) + min;
       }

     function prepareMagnets(wordList, height, width) {
	 var prepared = {};
	 var count = 0;
	 var wordList = shuffle(wordList).slice(0,75);
	 angular.forEach(wordList, function(word) {
	     count = count + 1;
	     var wordDict = {text:word.toLowerCase(),top:getRandomInt(100,height-100) + 'px',left:getRandomInt(100,width-200)+'px'};
	     var idx = 0;
	     var wordId = word.concat(idx);
	     while (prepared[wordId]) {
		 idx = idx + 1;
		 wordId = word.concat(idx);
	     }
	     prepared[wordId] = wordDict;
	     
	 });
	 prepared = addPunctuation(prepared, height, width);
	 return prepared
     }
       
     function addPunctuation(d, height, width) {
	 var numWords = _.keys(d).length;
	 var numPunc = Math.ceil(numWords/20);
	 for (var i=0;i<numPunc;i++){
	     d['zxzcomma'+i] = {'text':',', top:getRandomInt(100,height-100) + 'px',left:getRandomInt(100,width-200)+'px'}
	     d['zxzperiod'+i] = {'text':'.', top:getRandomInt(100,height-100) + 'px',left:getRandomInt(100,width-200)+'px'}
	     d['zxzqm'+i] = {'text':'?', top:getRandomInt(100,height-100) + 'px',left:getRandomInt(100,width-200)+'px'}
	 }
	 return d
     }

     function prepareRoom(roomName, height, width, scope) {
	 var startingSet = ["love","peace","war","is","the","a"];
	 var ref = syncData(roomName);
	 var sync = ref.$asObject();
	 sync.$loaded(function (data) {
	     if (data.$value !== null) {
		 var magnetNames = _.keys(data);
		 magnetNames = _.filter(magnetNames, function(key) {
		     return (key.indexOf("$") != 0)
		 });
		 bigBind(scope, roomName, magnetNames);
	     }
	     else {	
		 var prepared = prepareMagnets(startingSet, height, width);		 
		 ref.$set(prepared);
		 bigBind(scope, roomName, _.keys(prepared));
	     }
	 });
     }

     function bigBind(scope, roomName, magnets) {
	 angular.forEach(magnets, function(name) {
	     var ref = syncData(roomName + "/" + name);
	     var sync = ref.$asObject();
	     sync.$bindTo(scope,"shapes."+name);
	 });
     }
     function changeMagnetSet(wordList, roomName, height, width, scope) {
	 var ref = syncData(roomName);
	 var sync = ref.$asObject();
	 var prepared = prepareMagnets(wordList, height, width);
	 ref.$set(prepared).then(function(ref) {
	     bigBind(scope, roomName, _.keys(prepared));
	 }, function(error) {
	     console.log("Error:", error);
	 });
     }

     function testRoomName(roomName, cb) {
	 if (roomName == '' || roomName == null || !roomName) {
	     return cb(false);
	 }
	 var ref = syncData(roomName);
	 var sync = ref.$asObject();
	 sync.$loaded(function(data) {
	     if (data.$value !== null) {
		 return cb(false);
	     }
	     else {
		 return cb(true);
	     }
	 });
     }

      /**
       * Example:
       * <code>
       *    function(firebaseRef) {
         *       var ref = firebaseRef('path/to/data');
         *    }
       * </code>
       *
       * @function
       * @name firebaseRef
       * @param {String|Array...} path relative path to the root folder in Firebase instance
       * @return a Firebase instance
       */
      function firebaseRef(path) {
        var ref = new $window.Firebase(FBURL);
        var args = Array.prototype.slice.call(arguments);
        if( args.length ) {
          ref = ref.child(pathRef(args));
        }
        return ref;
      }

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

      /**
       * Create a $firebase reference with just a relative path. For example:
       *
       * <code>
       * function(syncData) {
         *    // a regular $firebase ref
         *    $scope.widget = syncData('widgets/alpha');
         *
         *    // or automatic 3-way binding
         *    syncData('widgets/alpha').$bind($scope, 'widget');
         * }
       * </code>
       *
       * Props is the second param passed into $firebase. It can also contain limit, startAt, endAt,
       * and they will be applied to the ref before passing into $firebase
       *
       * @function
       * @name syncData
       * @param {String|Array...} path relative path to the root folder in Firebase instance
       * @param {object} [props]
       * @return a Firebase instance
       */
      function syncData(path, props) {
        var ref = firebaseRef(path);
        props = angular.extend({}, props);
        angular.forEach(['limit', 'startAt', 'endAt'], function(k) {
          if( props.hasOwnProperty(k) ) {
            var v = props[k];
            ref = ref[k].apply(ref, angular.isArray(v)? v : [v]);
            delete props[k];
          }
        });
        return $firebase(ref, props);
      }

       function presets() {
	   return [{name: "Alice in Wonderland",
		    value: "It was all very well to say 'Drink me,' but the wise little Alice was not going to do that in a hurry. 'No, I'll look first,' she said, 'and see whether it's marked 'poison' or not'; for she had read several nice little histories about children who had got burnt, and eaten up by wild beasts and other unpleasant things, all because they would not remember the simple rules their friends had taught them: such as, that a red-hot poker will burn you if you hold it too long; and that if you cut your finger very deeply with a knife, it usually bleeds; and she had never forgotten that, if you drink much from a bottle marked 'poison,' it is almost certain to disagree with you, sooner or later."},
		    {name: 'Shakespearean Insults', value: "artless             base-court          apple-john,bawdy               bat-fowling         baggage,beslubbering        beef-witted         barnacle,             crook-pated         clack-dish,dankish             dismal-dreaming     clotpole,dissembling         dizzy-eyed          coxcomb,droning             doghearted          codpiece,errant              dread-bolted        death-token,fawning             earth-vexing        dewberry,fobbing             elf-skinned         flap-dragon,froward             fat-kidneyed        flax-wench,frothy              fen-sucked          flirt-gill,gleeking            flap-mouthed        foot-licker,goatish             fly-bitten          fustilarian,gorbellied          folly-fallen        giglet,impertinent         fool-born           gudgeon,infectious          full-gorged         haggard,jarring             guts-griping        harpy,loggerheaded        half-faced          hedge-pig,lumpish             hasty-witted        horn-beast,mammering           hedge-born          hugger-mugger,mangled             hell-hated          joithead,mewling             idle-headed         lewdster,paunchy             ill-breeding        lout,pribbling           ill-nurtured        maggot-pie,puking              knotty-pated        malt-worm,puny                milk-livered        mammet,qualling            motley-minded       measle,rank              sheep-biting        ratsbane,vain                spur-galled         scut,venomed             swag-bellied        skainsmate,villainous          tardy-gaited        strumpet,warped              tickle-brained      varlot,wayward             toad-spotted        vassal,weedy               unchin-snouted      whey-face,yeasty              weather-bitten      wagtail"},
		   {name: "ee cummings",
		    value: "i carry your heart with me(i carry it in my heart)i am never without it(anywhere i go you go,my dear;and whatever is done by only me is your doing,my darling)                                                       i fear no fate(for you are my fate,my sweet)i want no world(for beautiful you are my world,my true) and it’s you are whatever a moon has always meant and whatever a sun will always sing is you"},
		   {name: "Bad News",
		    value: "Hope faded Tuesday for any of the 162 people aboard AirAsia Flight 8501 after authorities confirmed that debris and bodies sighted were from the plane. Some of those on the flight, which vanished Sunday en route from Indonesia to Singapore, were traveling to provide for their families. Some were embarking on holiday vacations with friends or relatives. Some were not supposed to be on the plane at all."},
		   {name: "Cheesy",
		    value: "Throw rocks at my window  Hold the boom box up high.  Send me on scavenger hunts  Make me search far and wide.  Let me be your favorite song  A tune you can never get out of your head.  Recall your fondest memories  Those of when we first met.  Take me out to ball games  Introduce me to all your friends.  I want to be your now and forever  I want the cheesy moments to last a lifetime.  Take me in now and never look back  We can have a life we create out of whack."},		   
		  ]	   
       }
   }]);


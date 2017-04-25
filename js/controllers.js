'use strict';

/* Controllers */
var cpmodule = angular.module('fridgemagnets');

cpmodule.
  controller('HomeCtrl', ['$scope', "$routeParams", 'fbutil', 'FBURL', "$modal", "$window", "$location", function($scope, $routeParams, fbutil, FBURL, $modal, $window, $location) {
      $scope.FBURL = FBURL;
      $scope.shapes = {}
      var zindexCounter = 1;
      var container = document.querySelector("#fridge");
      console.log(container)
      var roomName = $routeParams.name || "start";
      $scope.roomName = roomName;
      fbutil.prepareRoom(roomName, (container.offsetHeight+fbutil.getElementOffset(container).top), (container.offsetWidth), $scope);
      
      $scope.onDropComplete1 =function(el, event) {
      }
      $scope.onStop = function(el, event) {
      	var obj = document.querySelector('#'+el.$id)
			  obj.style['box-shadow'] = '2px 2px 1px #888888';
			  obj.style['z-index'] = zindexCounter;
			  zindexCounter = zindexCounter + 1;
      	var obj = document.querySelector('#'+el.$id)
      	var data = $scope.shapes[el.$id]
      	data.top = (data.top.slice(0,-2) - event.event.offsetY) + 'px'
      	data.left = (data.left.slice(0,-2) - event.event.offsetX) + 'px'
      	obj.style.top = data.top
      	obj.style.left = data.left
      }
      $scope.onDragStart = function (data, event) {
			  var obj = document.querySelector('#'+data.$id)
			  obj.style['box-shadow'] = '8px 8px 8px #888888'
			  obj.style['z-index'] = '10000'
      }
      $scope.$on('draggable:start', function (event, el) {
      	console.log('wbyyyyyy')
      });

      $scope.$on('draggable:move', function(event, el) {
			  var data = el.data
			  var obj = document.querySelector('#'+data.$id)
			  var top = el.y
			  var left = el.x

			  var container_offset = fbutil.getElementOffset(container);	
			  var element_offset = fbutil.getElementOffset(obj);

	   	  if (element_offset.top < container_offset.top) {
			      obj.style.top = (container_offset.top+5)+'px';
			      top = container_offset.top+5;
			  }
			  else if ((element_offset.top+obj.offsetHeight) > (container.offsetHeight + fbutil.getElementOffset(container).top)) {
			      var newval = (container.offsetHeight + fbutil.getElementOffset(container).top) - (obj.offsetHeight + 7);
			      obj.style.top = newval+'px';
			      top = newval;
			  }
	   	  if (element_offset.left < container_offset.left) {
			      obj.style.left = (container_offset.left+5)+'px';
			      left = container_offset.left + 5;
			  }
			  else if ((element_offset.left+obj.offsetWidth) > (container.offsetWidth + fbutil.getElementOffset(container).left)) {
			      var newval = (container.offsetWidth+fbutil.getElementOffset(container).left) - (obj.offsetWidth+7);
			      obj.style.left = newval+'px';
			      left = newval;
			  }

			  var shapeid = data.$id;
			  $scope.shapes[shapeid].top = top + 'px';
			  $scope.shapes[shapeid].left = left + 'px';
      });


      $scope.changeSet = function() {
			  var modalInstance = $modal.open({
			      templateUrl: 'partials/choosemagnets.html',
			      controller: 'ChooseMagnets',
			      size: 'lg',
			      resolve: {
				  		roomName: function() {
				      	return roomName
				  		}, 
	      		}
		  		});
	  		modalInstance.result.then(function(data) {
		      var wordList = data.wordList;
		      var fridgeName = data.fridgeName;
		      fbutil.changeMagnetSet(wordList, 
			      fridgeName, 
	  		    (container.offsetHeight+fbutil.getElementOffset(container).top), 
					  (container.offsetWidth), 
					  $scope);
		      $location.path("/fridge/" + fridgeName);
				  }, function() {
			      return 
		  		});
    	};

      $scope.about = function() {
	  		var modalInstance = $modal.open({
	      	templateUrl: 'partials/about.html',
	      	controller: 'AboutCtrl'
	  		});
      }
  }]);

cpmodule
    .controller('ChooseMagnets', ['$scope','$modalInstance','fbutil', 'roomName', function($scope, $modalInstance, fbutil, roomName) {
	$scope.status = '';
	$scope.manualMode = 'false';
	$scope.roomName = roomName;
	$scope.fridgeName = '';
	$scope.wordListText = "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?' So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.";

	$scope.testValidation = function() {
	    if ($scope.newfridge.fridgenameinput.$invalid) {
		$scope.status = "Fridge names can only have letters and numbers, sorry.";
		return false
	    }
	    $scope.status = "";
	    return true
	};

	$scope.ok = function () {
	    if (!$scope.testValidation()) {
		return
	    }
	    $scope.status = "Loading..."
	    fbutil.testRoomName($scope.fridgeName, function(result) {
		if (!result) {
		    $scope.status = "This name is already taken - please try another.";
		}
		else {
		    $scope.status = "";
		    if ($scope.manualMode == 'true') {
			var wordsToUse = $scope.wordListText;
		    }
		    else {
			var wordsToUse = $scope.selectedPremade.t;
		    }
		    $modalInstance.close({wordList:tokenizeMagnets(wordsToUse), fridgeName:$scope.fridgeName});	    
		}
	    });

	};	
	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	var tokenizeMagnets = function(text) {
	    text = text.replace(/[^\w\s]|_/g, "")
		    .replace(/\s+/g, " ");
	    return text.split(" ");
	};

	$scope.presets = fbutil.presets(); //[{name:'s1',value:'a b c'}, {name:'s2',value:'d e f'}];
	$scope.selectedPremade = {t:$scope.presets[0].value};


    }]);

cpmodule
  .controller('AboutCtrl', ['$scope', '$modalInstance', 'fbutil', 'FBURL', function($scope, $modalInstance, fbutil, FBURL) {
      $scope.ok = function () {
	  $modalInstance.close();	    
	};
  }]);



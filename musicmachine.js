post("THERHEHREHRHERH_________");
function foo(a,b,c)
{
    post(a,b,c);
    outlet(0, a + b + c);
}

function msg_int(a)
{
    post(a);
}

function msg_float(a)
{
    post(a);
}

function output(a)
{
    outlet(0, a);
}

function anything(a)
{
    var txt = "this is form the anything function, the " + this.messagename + " function could not be found";
    outlet(0, txt);
}


var lastState = new StateRep(new Note(60,88,4,8), new Note(61,88,4,8), new Note(62,88,4,8));
var currentState = new StateRep(new Note(60,88,4,8), new Note(61,88,4,8), new Note(62,88,4,8));
var fileVersion = 0;
var lastAction = new Note(63,88,4,8);
var actionSeries = new Array(); 
var theLegalActions;
var melody;
	


function QLearner() {
    this.qValues = new DictCounter();
    this.epsilon = 0.7; // (exploration prob)
    this.alpha = 0.5; // (learning rate)
    this.discount = 0.9; // (discount rate) // maybe change to 1.0... 
}
   
QLearner.prototype.setQValue = function(state, value) {
        this.qValues.setValue(state, value);
    };

QLearner.prototype.getQValue = function(state, action) {
    //        """
    //          Returns Q(state,action)
    //          Should return 0.0 if we never seen
    //          a state or (state,action) tuple
    //        """
    //        "*** YOUR CODE HERE ***"
        //
    //        return self.qValues[(state, action)]
        

        var sa = combine(state, action);
        
        if (this.qValues.hasKey(sa)) {
            return this.qValues.getValue(sa);
        } else {
            return 0.0;
        };
    };
        
QLearner.prototype.getValue = function(state) {
        //"""
        //Returns max_action Q(state,action)
        //where the max is over legal actions.  Note that if
        //there are no legal actions, which is the case at the
        //terminal state, you should return a value of 0.0.
        //"""
        
        var actions = getLegalActions(state);
        var value = 0.0;
        for (var i = 0 ;i < actions.length;i++) {
            qValue = this.getQValue(state, actions[i]);
            if (qValue > value) {
                value = qValue;
            };
        return value;
        };
        
    };
    
    
    
QLearner.prototype.getPolicy = function(state) {
//  """
//    Compute the best action to take in a state.  Note that if there
//    are no legal actions, which is the case at the terminal state,
//    you should return None.
//  """
//  "*** YOUR CODE HERE ***"
        post("\n Q Get Policy");
        
        var actions = getLegalActions(state);
        post("\n NumberOfActions:", actions.length);
        if (actions.length == 0) {
            return "None"; // --fix what is none in js
        };
        var value = -Infinity; // -- fix ... does this work?
        var choices = new Array();
        for(var i = 0; i < actions.length;i++) {
            var qValue = this.getQValue(state, actions[i]);
            if (qValue == value) {
                choices.push(actions[i]);
            };
            if (qValue > value) {
                value = qValue;
                choices = new Array();
                choices.push(actions[i]);
            };
        };
        if (choices.length == 1) {
            post("\n state:" + state + " Has best choice:" + choices[0] + "\n");
            return choices[0];
        } else {
            post("\n state:" + state + " Has best choices including:" + choices[0] + 
            " and:" + choices[1] + "\n");
            return randomChoice(choices);
        };
    };
    
QLearner.prototype.getAction = function(state) {
        
//  def getAction(self, state):
//  """
//    Compute the action to take in the current state.  With
//    probability self.epsilon, we should take a random action and
//    take the best policy action otherwise.  Note that if there are
//    no legal actions, which is the case at the terminal state, you
//    should choose None as the action.
//
//    HINT: You might want to use util.flipCoin(prob)
//    HINT: To pick randomly from a list, use random.choice(list)

    	post("\n Q Get Action");
        var legalActions = getLegalActions();
        var action = null;
        
        if (flipCoin(this.epsilon) == true) {
            action = randomChoice(legalActions);
        } else {
            action = this.getPolicy(state);
        };
        
        lastAction = action;
        return action;

    };
    

QLearner.prototype.update = function(state, action, nextState, reward) {
        
    	post("\n Q Update------");
        
        var stateAction = combine(state, action);
        post("\n this.getvalue "+ nextState + ":" + this.getValue(nextState) + "\n");
        
        var sample = (reward + (this.discount * this.getValue(nextState))) ;
        var oldValue = this.getQValue(state, action);
        var newValue = ( ( (1 - this.alpha) * oldValue) + (this.alpha * sample) );
        
        this.qValues.setValue(stateAction, newValue);
        post("\n this.qValue["+stateAction+"]:"+this.qValues.getValue(stateAction)+"\n");
        
    };
    


function StateRep(n1,n2,n3) {
	this.note1 = n1;
	this.note2 = n2;
	this.note3 = n3;
	
	this.getNoteArray = function() {
		return [this.note1, this.note2, this.note3]
	}
	;
	this.toString = function() {
		return "(" + this.note1.toString() + 
			   "/" + this.note2.toString() +
			   "/" + this.note3.toString() + ")";
	};
};

function Note(p,v,l,d) {
	this.pitch = p;
	this.velocity = v;
	this.noteLength = l;
	this.delay = d;
	
	this.toString = function() {
		return "(" + this.pitch + 
			   "'" + this.velocity +
			   "'" + this.noteLength +
			   "'" + this.delay +")";
	};
};


function setFileVersion(a)
{
    fileVersion = a;
};

function resetFileVersion()
{
    fileVersion = 0;
};

function save()
{
    embedmessage("setFileVersion",fileVersion);
    embedmessage("loadValues", fileVersion);
    embedmessage("makeLegalActions");
};

function loadValues(n) { 
	
//	var startNote = new note(60,88,4,8);
//	var startState = new statRep(startNote,startNote,startNote);


    fileName = "qvalues-" + n%8 +".txt";
    var s = new String();
    s = fileName;
    f = new File(s, "read");
    post("\n File Name:" + fileName);
    if (f.isopen) {
    	post("\n preparing to load qValues");
    	var nextLine = f.readline(256);
    	while(nextLine != null) {
    		post("\n loaded:" + nextLine);
    		nextLine = nextLine.split(":");
    		theLearner.qValues.setValue(nextLine[0], nextLine[1]);
            var nextLine = f.readline(256);
    	};
        
        f.close();

    }  else {
    	post("\n could not open values file: ",f , "\n");

    };
};

function saveToFile() {
	
	fileVersion += 1;
	var cpt = fileVersion%8;
	var f = new File("qvalues-"+cpt + ".txt","readwrite", "TEXT"); 

    if (f.isopen) {
    	var theArray = theLearner.qValues.array;
    	for(state in theArray) {
			theLine = state + ":" + theArray[state];
    		if (theLine.split(":").length == 2) {
    			f.writeline(theLine);
    		};
    	};
    	
        f.close();

        post("\n The file ",f.foldername,f.filename,"has beed saved");


    }  else {
        post("\n could not create file: ",f , "\n");
    };

};

function test(){ 
	post("test");
	var theArray = theLearner.qValues.array;
	for(state in theArray) {
		theLine = state + ":" + theArray[state];
		post(theLine.split(":").length);
		if (theLine.split(":").length == 2) {
		};
	};
}

function printQ(){
	post("\n Print Q");
	var theArray = theLearner.qValues.array;
	for(state in theArray) {
		theLine = state + ":" + theArray[state];
		post("\n " + theLine);
	};
}

function setEpsilon(value) {
    this.theLearner.epsilon = value;
};

function setAlpha(value) {
    this.theLearner.alpha = value;
};

function setDiscount(value) {
    this.theLearner.discount = value;
};

function getPolicy(state) {
	post("\n Get Policy");
	post("\n currentState:" + currentState);
	var action = this.theLearner.getPolicy(currentState);

	var newState = this.makeNextState(currentState, action);
	lastState = currentState;
	currentState = newState;
	
	lastAction = action;
	
	post("\n Policy:" + action);
    outlet(0, "/policy", action.pitch, action.velocity, action.noteLength, action.delay );
    
    post("\n ");
};

function makeMelodyHelper() {
	post("\n Get Policy");
	post("\n currentState:" + currentState);
	var action = this.theLearner.getPolicy(currentState);

	var newState = this.makeNextState(currentState, action);
	lastState = currentState;
	currentState = newState;
	
	lastAction = action;
	
    
    return action;
};

function makeMelody(n) {
	var startTime = new Date().getTime();
	this.melody = new Array();
	for(var i = 0; i < n; i++ ) {
		nextNote = this.makeMelodyHelper();
		post('\n Note added' + nextNote);
		this.melody[i] = nextNote;
	};
	
	var endTime = new Date().getTime();
	var calcTime = endTime - startTime;
	calcTimeMin = calcTime / 60000;
	post("\n Calc Time Min:" + calcTimeMin + "\n calc time mill " + calcTime);
	outlet(0, "meldoy made");
};

function nextActionInMelody() {
	if( this.melody.length != 0) {
		nextNote = this.melody.pop();
		post("\n " + nextNote);
		outlet(0, "/policy", nextNote.pitch, nextNote.velocity, nextNote.noteLength, nextNote.delay );
	}else {
		post("\n MELODY___OVER");

	};
};

function getAction() {
	post("\n Get Action");
	
	outlet(0, "/getAction", 0);

};

function makeActionSeries() {
	post("\n Make Action Series");
	var action = this.theLearner.getAction(currentState);
	post("\n after get action")
	var oldState = currentState;
	var newState = this.makeNextState(currentState, action);

	lastState = currentState;
	currentState = newState;
	
	lastAction = action;
	
	post("\n oldState:" + oldState + "\n");
	post("\n action:" + action + "\n");
	post("\n newState:" + newState + "\n");
	post("\n currentState:" + currentState + "\n");
	
	actionSeries = new Array(action, oldState.note3, oldState.note2, oldState.note1);
};

function nextActionInSeries() {
	post("\n Next Action In Series");
	if (this.actionSeries.length == 0){
		this.makeActionSeries();
	};
	var nextAction = this.actionSeries.pop();
	post("\n action:", nextAction.toString());
	
	outlet(0, "/action", nextAction.pitch, nextAction.velocity, nextAction.noteLength, nextAction.delay );
	
};


function update(reward) {
    post("\n update-----");
    
    theLearner.update(lastState, lastAction, currentState, reward);
    post("\n statebeforeUpdate:", lastState.toString());
    post("\n stateAfterUpdate:", currentState.toString());
};

function makeLegalActions() {
	post("\n Make Legal Actions");
	var actions = new Array();
    var index = 0;
    for(var i =48; i < 72; i++) {
        for(var j = 40 ; j < 130; j += 40) {
            for(var p = 1; p < 32; p++) {
                for(var q = 1; q < 32; q++) {
                	actions[index] = new Note(i,j,p,q);
                	index++;
                }
            }
        }
    }
	this.theLegalActions = actions;
};

function getLegalActions(state) {
    
	if (this.theLegalActions === undefined) {
		this.theLegalAction = this.makeLegalActions();
	};
	actions = this.theLegalActions;
    post("\n " + actions.length);
    
//    actions[0] = new Note(60,88,4,8);
//    actions[1] = new Note(61,88,4,8);
//    actions[2] = new Note(62,88,4,8);
//    actions[3] = new Note(63,88,4,8);
//    actions[4] = new Note(64,88,4,8);
//    actions[5] = new Note(65,88,4,8);
//    actions[6] = new Note(66,88,4,8);
//    actions[7] = new Note(67,88,4,8);
//    actions[8] = new Note(68,88,4,8);
//    actions[9] = new Note(69,88,4,8);
//    actions[10] = new Note(70,88,4,8);
//    actions[11] = new Note(71,88,4,8);
    return actions;
};


function setQValue(state, action, value) {
    var sa = this.combine(state, action);
    this.theLearner.setQValue(sa, value);

};

function getValue(state) {
    return this.theLearner.getValue(state);
}



function combine(a, b) {
	return ( "(" + a + "'" + b + ")" );
};

function makeNextState(oldState, action) {

	nextState = new StateRep(oldState.note2, oldState.note3, action);
	return nextState;
};

function breakIntoNotes(state) {
	var notes = [];
	var subString = state.split(",");
	notes[0]= subString[0].split("(")[1];
	notes[1] = subString[1].split(")")[0];
	
	post("\n note1:" + notes[0] + "\n");
	post("\n note2:" + notes[1] + "\n");
	
	return notes;
}

function flipCoin(p) {
    r = Math.random();
    return r < p;
    
};

function randomChoice(choices) {
    var randomnumber = Math.floor(Math.random()*choices.length );
    
    return choices[randomnumber];
};

//--------------------
//Util functions
//--------------------
//Maybe use DictCounter to store values, instead of an extra object
function DictCounter() {
	this.obj = {};
}

DictCounter.prototype.hasKey = function(key) {
     return (key in this.obj);
};

DictCounter.prototype.getValue = function(state){
 if (state in this.obj) {
     return this.obj[state];
 } else {
     return 0.0;
 }
};

DictCounter.prototype.setValue = function (state, value) {
 this.obj[state] = value;
};

DictCounter.prototype.dotProduct = function (counter) {
 var product = 0;
 for (state in this.obj) {
     product += this.getValue(state) * counter.getValue(state);
 }
 return product;
};

function makeSA(state, action) {
	return ( '(' + state + ',' + action + ')' );
};



function forEach(array, action) {
for (var i = 0; i < array.length; i++)
 action(array[i]);
}

function forEachIn(object, action) {
for (var property in object) {
 if (Object.prototype.hasOwnProperty.call(object, property))
   action(property, object[property]);
}
}

function map(func, array) {
var result = [];
forEach(array, function (element) {
 result.push(func(element));
});
return result;
}

//takes in an array of numbers and outputs the average
function average (array) {
 var sum = 0;
 for (var i = 0; i < array.length; i++) {
     sum += array[i];
 }
 return sum/array.length;
}

var noteList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var cMajorScale = [0, 2, 4, 5, 7, 9, 11];

//remove ele from 'this' array if element exists
Array.prototype.remove = function (ele) {
 for (var i = 0; i < this.length; i++) {
     if (this[i] === ele) {
         this.splice(i,1);
         return;
     }
 }
};

//returns number of unique notes in set(scaleNum) intersect set(midiArray)
function numOfNotesInScale(scaleNum, midiArray) {
 var raisedScale = map(function (x) { return (x + scaleNum) % 12;}, cMajorScale);
 var num = 0;
 for (var i = 0; i < midiArray.length; i++) {
     var midiNote = midiArray[i];
     var ind = raisedScale.indexOf(midiNote);
     if (ind > -1) {
         raisedScale.splice(ind, 1);
         num++;
     }
 }
 return num;
}
 
//---------------------
//Feature vector code
//---------------------
function BasicExtractor() {
 this.properties = ['pitch', 'velocity', 'noteLength', 'delay'];
}

BasicExtractor.prototype.getFeatures = function (state, action) {
 var features = new DictCounter();
 // Fill in feature computation here:
 features.setValue('bias', 1.0);
 var notes = state.getNoteArray().concat([action]);
 var midiNums = notes.map(function (note) {
     return note.pitch;
 });


 for (var prop in this.properties) {
     var propValues = notes.map(function (note) { return note[prop];});
     features.setValue("diff-" + prop, action[prop] - average(propValues));
 }

/*    var note1 = state.note1,
     note2 = state.note2,
     note3 = state.note3;

 // change in pitch
 var avgPitch = average(note1.pitch + note2.pitch + note3.pitch);
 features.setValue("diff-newPitch-avgPitch", action.pitch - avgPitch);

 // change in velocity
 var avgVelocity = average(note1.velocity + note2.velocity + note3.velocity);
 features.setValue("diff-newVelocity-avgVelocity", action.velocity - avgVelocity);

 // change in noteLength
 var avgNoteLength = average(note1.noteLength + note2.noteLength + note3.noteLength);
 features.setValue("diff-newNoteLength-avgNoteLength", action.noteLength - avgNoteLength);

 // change in delay
 var avgDelay = average(note1.delay + note2.delay + note3.delay);
 features.setValue("diff-newDelay-avgDelay", action.delay - avgDelay);
*/
 // how many times appears in C,C#,...B - major scale
 // 0 represents C scale, 1 represents C# scale, etc.
 for (var i = 0; i < 12; i++) {
     var numNotes = numOfNotesInScale(i, midiNums.map(function (x) { return x % 12;}));
     features.setValue('num-of-notes-in-' + noteList[i] + '-maj-scale', numNotes);
 }

 return features
};

/* If too slow, take out BasicExtractor class and use getFeatures only
function getFeatures () {}
*/


function ApproxQAgent(Extractor) {
 this.qValues = new DictCounter();
 this.weights = new DictCounter();
 this.getFeatures = Extractor.getFeatures;
}

ApproxQAgent.prototype = new QLearner();
ApproxQAgent.prototype.constructor = ApproxQAgent; 

ApproxQAgent.prototype.getQValue = function (state, action) {
 var featVector = this.getFeatures(state, action);
 return this.weights.dotProduct(featVector);
};

ApproxQAgent.prototype.update = function (state, action, nextState, reward) {
 var featVector = this.getFeatures(state, action);
 var correction = (reward + this.discount * this.getValue()) - this.getQValue(state, action);
 for (var feature in featVector) {
     this.weights[feature] += this.alpha * correction * featVector[feature];
 }
};

var basicEx = new BasicExtractor();
var theLearner = new ApproxQAgent(basicEx);
//var theLearner = new QLearner();

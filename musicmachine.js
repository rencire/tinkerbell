post("THERHEHREHRHERH_________");
function foo(a, b, c) {
    post(a, b, c);
    outlet(0, a + b + c);
}

function msg_int(a) {
    post(a);
}

function msg_float(a) {
    post(a);
}

function output(a) {
    outlet(0, a);
}

function anything(a) {
    var txt = "this is form the anything function, the " + this.messagename + " function could not be found";
    outlet(0, txt);
}


var lastState = new StateRep(new Note(60, 88, 4, 8), new Note(61, 88, 4, 8), new Note(62, 88, 4, 8));
var currentState = new StateRep(new Note(60, 88, 4, 8), new Note(61, 88, 4, 8), new Note(62, 88, 4, 8));
var fileVersion = 0;
var lastAction = new Note(63, 88, 4, 8);
var actionSeries = new Array();
var theLegalActions;
var melody;


function QLearner() {
    this.qValues = new DictCounter();
    this.epsilon = 0.7; // (exploration prob)
    this.alpha = 0.01; // (learning rate)
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
    }
    ;
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
    for (var i = 0; i < actions.length; i++) {
        qValue = this.getQValue(state, actions[i]);
        if (qValue > value) {
            value = qValue;
        }
        ;
        return value;
    }
    ;

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
    }
    ;
    var value = -Infinity; // -- fix ... does this work?
    var choices = new Array();
    for (var i = 0; i < actions.length; i++) {
        var qValue = this.getQValue(state, actions[i]);
        if (qValue == value) {
            choices.push(actions[i]);
        }
        ;
        if (qValue > value) {
            value = qValue;
            choices = new Array();
            choices.push(actions[i]);
        }
        ;
    }
    ;
    if (choices.length == 1) {
        post("\n state:" + state + " Has best choice:" + choices[0] + "\n");
        return choices[0];
    } else {
        post("\n state:" + state + " Has best choices including:" + choices[0] +
            " and:" + choices[1] + "\n");
        return randomChoice(choices);
    }
    ;
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
    }
    ;

    lastAction = action;
    return action;

};


QLearner.prototype.update = function(state, action, nextState, reward) {

    post("\n Q Update------");

    var stateAction = combine(state, action);
    post("\n this.getvalue " + nextState + ":" + this.getValue(nextState) + "\n");

    var sample = (reward + (this.discount * this.getValue(nextState)));
    var oldValue = this.getQValue(state, action);
    var newValue = ( ( (1 - this.alpha) * oldValue) + (this.alpha * sample) );

    this.qValues.setValue(stateAction, newValue);
    post("\n this.qValue[" + stateAction + "]:" + this.qValues.getValue(stateAction) + "\n");

};


function StateRep(n1, n2, n3) {
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
}
;

function Note(p, v, l, d) {
    this.pitch = p;
    this.velocity = v;
    this.noteLength = l;
    this.delay = d;

    this.toString = function() {
        return "(" + this.pitch +
            "'" + this.velocity +
            "'" + this.noteLength +
            "'" + this.delay + ")";
    };
}
;


function setFileVersion(a) {
    fileVersion = a;
}
;

function resetFileVersion() {
    fileVersion = 0;
}
;

function save() {
    embedmessage("setFileVersion", fileVersion);
    embedmessage("loadValues", fileVersion);
    embedmessage("makeLegalActions");
}
;

function loadValues(n) {

//	var startNote = new note(60,88,4,8);
//	var startState = new statRep(startNote,startNote,startNote);


    fileName = "weights-" + n % 8 + ".txt";
    var s = new String();
    s = fileName;
    f = new File(s, "read");
    post("\n File Name:" + fileName);
    if (f.isopen) {
        post("\n preparing to load qValues");
        var nextLine = f.readline(256);
        while (nextLine != null) {
            post("\n loaded:" + nextLine);
            nextLine = nextLine.split(":");
            theLearner.weights.setValue(nextLine[0], parseFloat(nextLine[1]));
            var nextLine = f.readline(256);
        }
        ;

        f.close();

    } else {
        post("\n could not open values file: ", f, "\n");

    }
    ;
}
;

function saveToFile() {

    fileVersion += 1;
    var cpt = fileVersion % 8;
    var f = new File("Weights-" + cpt + ".txt", "readwrite", "TEXT");

    if (f.isopen) {
        var theArray = theLearner.weights.obj;
        for (state in theArray) {
            theLine = state + ":" + theArray[state];
            if (theLine.split(":").length == 2) {
                f.writeline(theLine);
            }
            ;
        }
        ;

        f.close();

        post("\n The file ", f.foldername, f.filename, "has beed saved");


    } else {
        post("\n could not create file: ", f, "\n");
    }
    ;

}
;

function test() {
    post("test");
    var theArray = theLearner.qValues.obj;
    for (state in theArray) {
        theLine = state + ":" + theArray[state];
        post(theLine.split(":").length);
        if (theLine.split(":").length == 2) {
        }
        ;
    }
    ;
}

function printQ() {
    post("\n Print Q");
    var theArray = theLearner.qValues.obj;
    for (state in theArray) {
        theLine = state + ":" + theArray[state];
        post("\n " + theLine);
    }
    ;
}

function printWeights() {
    post("\n Print Weights");
    var theArray = theLearner.weights.obj;
    for (state in theArray) {
        theLine = state + ":" + theArray[state];
        post("\n " + theLine);
    }
    ;
}

function setEpsilon(value) {
    this.theLearner.epsilon = value;
}
;

function setAlpha(value) {
    this.theLearner.alpha = value;
}
;

function setDiscount(value) {
    this.theLearner.discount = value;
}
;

function getPolicy(state) {
    post("\n Get Policy");
    post("\n currentState:" + currentState);
    var action = this.theLearner.getPolicy(currentState);

    var newState = this.makeNextState(currentState, action);
    lastState = currentState;
    currentState = newState;

    lastAction = action;

    post("\n Policy:" + action);
    outlet(0, "/policy", action.pitch, action.velocity, action.noteLength, action.delay);

    post("\n ");
}
;

function makeMelodyHelper() {
    post("\n Get Policy");
    post("\n currentState:" + currentState);
    var action = this.theLearner.getPolicy(currentState);

    var newState = this.makeNextState(currentState, action);
    lastState = currentState;
    currentState = newState;

    lastAction = action;


    return action;
}
;

function makeMelody(n) {
    var startTime = new Date().getTime();
    this.melody = new Array();
    for (var i = 0; i < n; i++) {
        nextNote = this.makeMelodyHelper();
        post('\n Note added' + nextNote);
        this.melody[i] = nextNote;
    }
    ;

    var endTime = new Date().getTime();
    var calcTime = endTime - startTime;
    calcTimeMin = calcTime / 60000;
    post("\n Calc Time Min:" + calcTimeMin + "\n calc time mill " + calcTime);
    outlet(0, "meldoy made");
}
;

function nextActionInMelody() {
    if (this.melody.length != 0) {
        nextNote = this.melody.pop();
        post("\n " + nextNote);
        outlet(0, "/policy", nextNote.pitch, nextNote.velocity, nextNote.noteLength, nextNote.delay);
    } else {
        post("\n MELODY___OVER");

    }
    ;
}
;

function getAction() {
    post("\n Get Action");
    outlet(0, "/getAction", 0);

}
;

function makeActionSeries() {
    post("\n Make Action Series");
    var action = this.theLearner.getAction(currentState);
    post("\n after get action");
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
}
;

function nextActionInSeries() {
    post("\n Next Action In Series");
    if (this.actionSeries.length == 0) {
        this.makeActionSeries();
    }
    ;
    var nextAction = this.actionSeries.pop();
    post("\n action:", nextAction.toString());

    outlet(0, "/action", nextAction.pitch, nextAction.velocity, nextAction.noteLength, nextAction.delay);

}
;


function update(reward) {
    post("\n update-----");
    post("\n LastState", lastState.toString());

    theLearner.update(lastState, lastAction, currentState, reward);
    post("\n statebeforeUpdate:", lastState.toString());
    post("\n stateAfterUpdate:", currentState.toString());
}
;

function makeLegalActions() {
    post("\n Make Legal Actions");
    var actions = new Array();
    var index = 0;
    for (var i = 48; i < 72; i++) {
        for (var j = 40; j < 130; j += 40) {
            for (var p = 1; p < 16; p++) {
                for (var q = 1; q < 16; q++) {
                    actions[index] = new Note(i, j, p, q);
                    index++;
                }
            }
        }
    }
    this.theLegalActions = actions;
}
;

function getLegalActions(state) {

    if (this.theLegalActions === undefined) {
        this.theLegalAction = this.makeLegalActions();
    }
    ;
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
}
;


function setQValue(state, action, value) {
    var sa = this.combine(state, action);
    this.theLearner.setQValue(sa, value);

}
;

function getValue(state) {
    return this.theLearner.getValue(state);
}


function combine(a, b) {
    return ( "(" + a + "'" + b + ")" );
}
;

function makeNextState(oldState, action) {

    nextState = new StateRep(oldState.note2, oldState.note3, action);
    return nextState;
}
;

function breakIntoNotes(state) {
    var notes = [];
    var subString = state.split(",");
    notes[0] = subString[0].split("(")[1];
    notes[1] = subString[1].split(")")[0];

    post("\n note1:" + notes[0] + "\n");
    post("\n note2:" + notes[1] + "\n");

    return notes;
}

function flipCoin(p) {
    r = Math.random();
    return r < p;

}
;

function randomChoice(choices) {
    var randomnumber = Math.floor(Math.random() * choices.length);

    return choices[randomnumber];
}
;

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

DictCounter.prototype.getValue = function(state) {
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
}
;


function forEachIn(object, action) {
    for (var property in object) {
        if (Object.prototype.hasOwnProperty.call(object, property))
            action(property, object[property]);
    }
}


//takes in an array of numbers and outputs the average
function average(array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

//var noteList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
//var cMajorScale = [0, 2, 4, 5, 7, 9, 11];

//remove ele from 'this' array if element exists
Array.prototype.remove = function (ele) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === ele) {
            this.splice(i, 1);
            return;
        }
    }
};

var scales = { 'C'  : [0, 2, 4, 5, 7, 9, 11],
    'C#' : [1, 3, 5, 6, 8, 10, 0],
    'D'  : [2, 4, 6, 7, 9, 11, 1],
    'D#' : [3, 5, 7, 8, 10, 0, 2],
    'E'  : [4, 6, 8, 9, 11, 1, 3],
    'F'  : [5, 7, 9, 10, 0, 2, 4],
    'F#' : [6, 8, 10, 11, 1, 3, 5],
    'G'  : [7, 9, 11, 0, 2, 4, 6],
    'G#' : [8, 10, 0, 1, 3, 5, 7],
    'A'  : [9, 11, 1, 2, 4, 6, 8],
    'A#' : [10, 0, 2, 3, 5, 7, 9],
    'B'  : [11, 1, 3, 4, 6, 8, 10]};

//returns number of unique notes in set(scaleNum) intersect set(midiArray)
function numOfNotesInScale(scale, midiArray) {
    var num = 0;
    var processedNotes = [];
    for (var i = midiArray.length; i; i--) {
        var midiNote = midiArray[i],
            ind = scale.indexOf(midiNote);

        if (processedNotes.indexOf(midiNote) > -1) {
            continue;
        }

        if (ind > -1) {
            num++;
        }
        processedNotes.push(midiNote);
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
    var midiNums = [state.note1.pitch % 12, state.note2.pitch % 12, state.note3.pitch % 12];

// unrolled the simple 'diff-' features
    var note1 = state.note1,
        note2 = state.note2,
        note3 = state.note3;

//// change in pitch
//    var avgPitch = (note1.pitch + note2.pitch + note3.pitch) / 3;
//    features.setValue("diff-newPitch-avgPitch", Math.abs(action.pitch - avgPitch));
//
//// change in velocity
//    var avgVelocity = (note1.velocity + note2.velocity + note3.velocity) / 3;
//    features.setValue("diff-newVelocity-avgVelocity", Math.abs(action.velocity - avgVelocity) / 40);
//
//// change in noteLength
//    var avgNoteLength = (note1.noteLength + note2.noteLength + note3.noteLength) / 3;
//    features.setValue("diff-newNoteLength-avgNoteLength", Math.abs(action.noteLength - avgNoteLength));
//
//// change in delay
//    var avgDelay = (note1.delay + note2.delay + note3.delay) / 3;
//    features.setValue("diff-newDelay-avgDelay", Math.abs(action.delay - avgDelay));
    
// notes Played Together
    var notesPlayedTogether = 0;
    if (action.delay == 0) {
    	notesPlayedTogether = 1;
    };
    features.setValue("notesPlayedTogether", notesPlayedTogether);
    
 // multiple notes played together
    var multiNotes = 0;
    if (notesPlayedTogether = 1) {
    	if (note1.delay == 0) {
    		multiNotes = 1;
    	} else if ( note2.delay == 0) {
    		multiNotes = 1;
    	} else if ( note3.delay == 0) {
    		multiNotes = 1;
    	};
    }
    features.setValue("multiNotes", multiNotes);

    
// silence to sequence
    var addQuiteTime = 0;
    if (action.length = 0) {
    	if( note1.length != 0 && note2.length != 0 && note3.length != 0) {
    		addQuiteTime = 1;
    	};
    };
    features.setValue("quiteTime", addQuiteTime);
    
// note pitch repition 
    var pitchRepition = 0;
    if (note3.pitch == action.pitch ) {
    	pitchRepition = 1;
    };
    features.setValue("pitchRepition", pitchRepition);
    
// multiple pitch repition
    var pitchRepition = 0;
    if (note1.pitch == action.pitch ) {
        pitchRepition += 1;

    };
    if (note2.pitch == action.pitch ) {
        pitchRepition += 1;

    };
    if (note3.pitch == action.pitch ) {
        pitchRepition += 1;
    };
    features.setValue("multiPitchRepition", pitchRepition);


    
//  timing repition
    var timingRepition = 0;
    if (note1.delay == action.delay || note2.delay == action.delay || note3.delay == action.delay) {
    	timingRepition = 1;
    };
    features.setValue("timingRepition", timingRepition);
    
// adds length repition
    var lengthRepition = 0;
    if (note1.length == action.length || note2.length == action.length || note3.length == action.length) {
    	lengthRepition = 1;
    };
    features.setValue("lengthRepition", lengthRepition);
    
// creates fast sequence
    var fastSeq = 0;
    if (action.delay < 5) {
    	if( (note2.delay < 5) && (note3.delay < 5)) {
    		fastSeq = 1;
    	}
    };
    features.setValue("fastSeq", fastSeq);

// creates long wait
    var longWait = 0;
    if (action.delay > 8) {
    	longWait = 1;
    };
    features.setValue("longWait", longWait);
    
// varing wait
    var varWait = 0;
    if (Math.abs( note3.delay - action.delay)  > 4) {
    	varWait = 1;
    };
    features.setValue("varWait", varWait);

    
// creates slow seq
    var slowSeq = 0;
    if (action.delay > 8) {
    	if( (note2.delay > 8) && (note3.delay > 8)) {
    		slowSeq = 1;
    	}
    };
    features.setValue("slowSeq", slowSeq);


    	
// fast seq to long delay
    var fToLong = 0;
    if ( fastSeq == 1 && longWait == 1) {
    	fToLong = 1;
    };
    features.setValue("fToLong", fToLong);

//end fast
    
// end slow

// creats shorts seq
    var shortSeq = 0;
    if (action.length < 4) {
    	if( (note2.length < 4) && (note3.length < 4)) {
    		shortSeq = 1;
    	}
    };
    features.setValue("shortSeq", shortSeq);

    
// creats longs seq
    var longSeq = 0;
    if (action.length > 7) {
    	if( (note2.length > 7) && (note3.length > 7)) {
    		longSeq = 1;
    	}
    };
    features.setValue("longSeq", longSeq);

    // maybe ends above
//shorts to long
// longs to short
    	
// increasing pitch and vice
    	


    
//// how many times appears in C,C#,...B - major scale
//// 0 represents C scale, 1 represents C# scale, etc.
//    for (var rootNote in scales) {
//        var numNotes = numOfNotesInScale(scales[rootNote], midiNums);
//        features.setValue('num-of-notes-in-' + rootNote + '-maj-scale', numNotes);
//    }
//
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
	var correction = (reward + (this.discount * this.getValue(nextState))) - this.getQValue(state, action);
	post("\n Correction: \n" + correction );
	post("\n nextV: \n" + this.getValue(nextState));
	post("\n nextV: \n" + this.getQValue(state,action));

	post("\n FeatureVals: \n" );

	for (var feature in featVector.obj) {
		post("\n:    " + feature + ":" +  featVector.obj[feature]);

		this.weights.setValue(feature, this.weights.getValue(feature) + (this.alpha * correction * featVector.getValue(feature)));
	}

	post("\n Weights: \n" );

	for (o in this.weights.obj) {
		post("\n    " + o + ":" + this.weights.obj[o]);
	}
	

};


var basicEx = new BasicExtractor();
var theLearner = new ApproxQAgent(basicEx);
//var theLearner = new QLearner();

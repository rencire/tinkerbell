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



var theLearner = new QLearner();
var lastState = new StateRep(new Note(60,88,4,8), new Note(61,88,4,8), new Note(62,88,4,8));
var currentState = new StateRep(new Note(60,88,4,8), new Note(61,88,4,8), new Note(62,88,4,8));
var fileVersion = 0;
var lastAction = new Note(62,88,4,8);


function QLearner() {
    this.qValues = new dict();
    this.epsilon = 0.7; // (exploration prob)
    this.alpha = 0.5; // (learning rate)
    this.discount = 0.9; // (discount rate) // maybe change to 1.0... 
    
   
    this.setQValue = function(state, value) {
        this.qValues.setValue(state, value);
    };
    
    this.getQValue = function(state, action) {
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
        
    this.getValue = function(state) {
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
    
    
    
    this.getPolicy = function(state) {
//  """
//    Compute the best action to take in a state.  Note that if there
//    are no legal actions, which is the case at the terminal state,
//    you should return None.
//  """
//  "*** YOUR CODE HERE ***"
        
        var actions = getLegalActions(state);
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
    
    this.getAction = function(state) {
        
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
    

    this.update = function(state, action, nextState, reward) {
        
    //  def update(self, state, action, nextState, reward):
//  """
//    The parent class calls this to observe a
//    state = action => nextState and reward transition.
//    You should do your Q-Value update here
// 
  //    
//      self.qValues[stateAction] =  ( ( (1-self.alpha) * self.getQValue(state, action))  + self.alpha * sample )
  //
        
        var stateAction = combine(state, action);
        post("\n this.getvalue "+ nextState + ":" + this.getValue(nextState) + "\n");
        
        var sample = (reward + (this.discount * this.getValue(nextState))) ;
        var oldValue = this.getQValue(state, action);
        var newValue = ( ( (1 - this.alpha) * oldValue) + (this.alpha * sample) );
        
        this.qValues.setValue(stateAction, newValue);
        post("\n this.qValue["+stateAction+"]:"+this.qValues.getValue(stateAction)+"\n");
        
        
    };
    
    this.testItQ = function(state,action) {
        post("\n" + combine(state,action));
    };
};

function StateRep(n1,n2,n3) {
	this.note1 = n1;
	this.note2 = n2;
	this.note3 = n3;
	
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


function test() {
	n1 = new Note(60,1,4,8);
	n2 = new Note(61,2,5,9);
	n3 = new Note(62,3,6,10);

	s = new StateRep(n1,n2,n3);
    outlet(0, s.toString());
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
    		if (theLine.split(":").length == 3) {
    			f.writeline(theLine);
    		};
    	};
    	
        f.close();

        post("\n The file ",f.foldername,f.filename,"has beed saved");


    }  else {
        post("\n could not create file: ",f , "\n");
    };

};

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

function getAction() {
	post("\n Get Action");
	var action = this.theLearner.getAction(currentState);
	
	var oldState = currentState;
	var newState = this.makeNextState(currentState, action);

	lastState = currentState;
	currentState = newState;
	
	lastAction = action;
	
	post("\n oldState:" + oldState + "\n");
	post("\n action:" + action + "\n");
	post("\n newState:" + newState + "\n");
	post("\n this.state:" + currentState + "\n");
	
	outlet(0, "/action", lastNotes[0], lastNotes[1], action);
	post("\n ");

//    outlet(0, ("/action " + this.theLearner.getAction(state)) );
};

function update(reward) {
    
    this.theLearner.update(lastState, lastAction, currentState, reward);
    post("\n statebeforeUpdate:", lastState);
    post("\n stateAfterUpdate:", currentState);
};

//function test(state,action) {
//	var its = new it();
//	post(its.it);
//	var notit = new notIt();
//	post(notit.it);
//};
//
//function it() {
//	this.it = "it";
//};
//
//function notIt() {
//	this.it = "not it";
//};

function getLegalActions(state) {
    var actions = new Array();
    var stateNum = parseInt(state);
    actions[0] = new Note(60,88,4,8);
    actions[1] = new Note(61,88,4,8);
    actions[2] = new Note(62,88,4,8);
    actions[3] = new Note(63,88,4,8);
    actions[4] = new Note(64,88,4,8);
    actions[5] = new Note(65,88,4,8);
    actions[6] = new Note(66,88,4,8);
    actions[7] = new Note(67,88,4,8);
    actions[8] = new Note(68,88,4,8);
    actions[9] = new Note(69,88,4,8);
    actions[10] = new Note(70,88,4,8);
    actions[11] = new Note(71,88,4,8);
    return actions;
};


function setQValue(state, action, value) {
    var sa = this.combine(state, action);
    this.theLearner.setQValue(sa, value);

};

function getValue(state) {
    return this.theLearner.getValue(state);
}

function dict() {
    this.array = new Array();

    this.getValue = function(state){
        if (state in this.array) {
            return this.array[state];
        } else {
            return 0.0;
        }
    };

    this.setValue = function (state, value) {
        this.array[state] = value;
    };
    
    this.hasKey = function(key) {
            return (key in this.array);
    };
};

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





//function someObj() {
//        this.publicVar = 'public';
//        var privateVar = 'private';
//        this.someMethod = function() {
//            alert('boo');
//            someOtherMethod();
//        };
//        // Private method. (Due to closure, this need not be declared before
//        // someMethod although someMethod uses it.)
//        var someOtherMethod = function() {
//            alert('indirect reference');
//        };
//    }
//    o_obj = new someObj();
//    o_obj.someOtherMethod(); //will throw an undefined function error
//    o_obj.someMethod(); //alerts "boo" followed by "indirect reference"
//};


//class QLearningAgent(ReinforcementAgent):
//  """
//    Q-Learning Agent
//
//    Functions you should fill in:
//      - getQValue
//      - getAction
//      - getValue
//      - getPolicy
//      - update
//
//    Instance variables you have access to
//      - self.epsilon (exploration prob)
//      - self.alpha (learning rate)
//      - self.discount (discount rate)
//
//    Functions you should use
//      - self.getLegalActions(state)
//        which returns legal actions
//        for a state
//  """
//  def __init__(self, **args):
//    "You can initialize Q-values here..."
//    ReinforcementAgent.__init__(self, **args)
//
//    "*** YOUR CODE HERE ***"
//    self.qValues = util.Counter()
//
//  def getQValue(self, state, action):
//    """
//      Returns Q(state,action)
//      Should return 0.0 if we never seen
//      a state or (state,action) tuple
//    """
//    "*** YOUR CODE HERE ***"
//
//    return self.qValues[(state, action)]
//
//
//  def getValue(self, state):
//    """
//      Returns max_action Q(state,action)
//      where the max is over legal actions.  Note that if
//      there are no legal actions, which is the case at the
//      terminal state, you should return a value of 0.0.
//    """
//    "*** YOUR CODE HERE ***"
//    actions = self.getLegalActions(state)
//    value = 0.0
//    for a in actions :
//        qValue = self.getQValue(state, a)
//        if qValue > value :
//            value = qValue
//        
//    return value
//
//  def getPolicy(self, state):
//    """
//      Compute the best action to take in a state.  Note that if there
//      are no legal actions, which is the case at the terminal state,
//      you should return None.
//    """
//    "*** YOUR CODE HERE ***"
//    
//    actions = self .getLegalActions(state)
//    if len(actions) == 0 :
//        return None
//    value = float('-inf')
//    choices = []
//    for a in actions :
//        qValue = self.getQValue(state, a)
//        if qValue == value :
//           choices.append(a)
//        if qValue > value :
//            value = qValue
//            choices = []
//            choices.append(a)
//    if len(choices) == 1 :
//        return choices[0]
//    else :
//        return random.choice(choices)
//        
//            
//
//  def getAction(self, state):
//    """
//      Compute the action to take in the current state.  With
//      probability self.epsilon, we should take a random action and
//      take the best policy action otherwise.  Note that if there are
//      no legal actions, which is the case at the terminal state, you
//      should choose None as the action.
//
//      HINT: You might want to use util.flipCoin(prob)
//      HINT: To pick randomly from a list, use random.choice(list)
//    """
//    # Pick Action
//    legalActions = self.getLegalActions(state)
//    action = None
//    "*** YOUR CODE HERE ***"
//
//    if util.flipCoin(self.epsilon) == True :
//        action = random.choice(legalActions)
//    else :
//        action = self.getPolicy(state)
//
//    return action
//
//  def update(self, state, action, nextState, reward):
//    """
//      The parent class calls this to observe a
//      state = action => nextState and reward transition.
//      You should do your Q-Value update here
//
//      NOTE: You should never call this function,
//      it will be called on your behalf
//    """
//    "*** YOUR CODE HERE ***"
//    
//    stateAction = (state, action)
//    sample = (reward + (self.discount * self.getValue(nextState)) ) 
//    
//    self.qValues[stateAction] =  ( ( (1-self.alpha) * self.getQValue(state, action))  + self.alpha * sample )
//

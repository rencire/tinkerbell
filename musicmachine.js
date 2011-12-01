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


//var QLearner = new QLearner();


function QLearner() {
    this.qValues = new DictCounter();
    this.epsilon = 0.7; // (exploration prob)
    this.alpha = 0.5; // (learning rate)
    this.discount = 0.9; // (discount rate) // maybe change to 1.0... 
    
   
    this.setQValue = function(state, value) {
        this.qValues.setValue(state, value);
    };
    
    this.getQValue = function(state, action) {
	//	    """
	//	      Returns Q(state,action)
	//	      Should return 0.0 if we never seen
	//	      a state or (state,action) tuple
	//	    """
	//	    "*** YOUR CODE HERE ***"
		//
	//	    return self.qValues[(state, action)]
    	

		var sa = makeSA(state, action);
		
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
    	// Action will never return 'None' since we will always be able to choose a note
//        if (actions.length == 0) {
//    		return "None"; // --fix what is none in js
//    	};
    	var value = Number.NEGATIVE_INFINITY; // -- fix ... does this work?
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
    		post("state:" + state + " Has best choice:" + choices[0]) + "\n";
    		return choices[0];
    	} else {
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
    	
    	var stateAction = '(' + state + ',' + action + ')';
    	post("this.getvalue "+ nextState + ":" + this.getValue(nextState) + "\n");
    	
    	var sample = (reward + (this.discount * this.getValue(nextState))) ;
    	var oldValue = this.getQValue(state, action);
    	var newValue = ( ( (1 - this.alpha) * oldValue) + (this.alpha * sample) );
    	
    	this.qValues.setValue(stateAction, newValue);
    	post("this.qValue["+stateAction+"]:"+this.qValues.getValue(stateAction)+"\n");
    	
    	
    };
    
    this.testItQ = function(state,action) {
    	post(makeSA(state,action));
    };
};

function setEpsilon(value) {
	this.QLearner.epsilon = value;
};

function setAlpha(value) {
	this.QLearner.alpha = value;
};

function setDiscount(value) {
	this.QLearner.discount = value;
};

function getPolicy(state) {
	outlet(0, ("/next-state " + this.QLearner.getPolicy(state)) );
};

function getAction(state) {
	outlet(0, ("/next-state " + this.QLearner.getAction(state)) );
};

function update(state, action, nextState, reward) {
	this.QLearner.update(state, action, nextState, reward);
};

function test(state,action) {
	this.QLearner.testItQ(state, action);
};

function getLegalActions(state) {
	var actions = new Array();
	stateNum = parseInt(state);
	actions[0] = "1";
	actions[1] = "2";
	actions[2] = "-1";
	actions[3] = "-2";
	return actions;
};


function setQValue(state, action, value) {
	var sa = '(' + state + ',' + action + ')';
	this.QLearner.setQValue(sa, value);

};

function getValue(state) {
	return this.QLearner.getValue(state);
}

// --------------------
// Util functions
// --------------------
// Maybe use DictCounter to store values, instead of its object
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
}

function flipCoin(p) {
	r = Math.random();
	return r < p;
	
}

function randomChoice(choices) {
	var randomnumber = Math.floor(Math.random()*choices.length );
	
	return choices[randomnumber];
}

function forEachIn(object, action) {
  for (var property in object) {
    if (Object.prototype.hasOwnProperty.call(object, property))
      action(property, object[property]);
  }
}

// ---------------------
// Feature vector code
// ---------------------

function BasicExtractor() {}

BasicExtractor.prototype.getFeatures() = function (state, action) {
    var features = new DictCounter();
    // Fill in feature computation here:
    features.setValue('bias', 1.0);

    // change in pitch
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
var AQ = new ApproxQAgent(basicEx);




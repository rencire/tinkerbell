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



var QLearner = new QLearner();
var state = "(60,60)";

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
        
        var stateAction = combine(state, action);
        post("this.getvalue "+ nextState + ":" + this.getValue(nextState) + "\n");
        
        var sample = (reward + (this.discount * this.getValue(nextState))) ;
        var oldValue = this.getQValue(state, action);
        var newValue = ( ( (1 - this.alpha) * oldValue) + (this.alpha * sample) );
        
        this.qValues.setValue(stateAction, newValue);
        post("this.qValue["+stateAction+"]:"+this.qValues.getValue(stateAction)+"\n");
        
        
    };
    
    this.testItQ = function(state,action) {
        post(combine(state,action));
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
	var action = this.QLearner.getPolicy(state);

	var newState = this.makeNextState(this.state, action);
	this.state = newState;
	
    outlet(0, "/policy", action );
};

function getAction() {
	var action = this.QLearner.getAction(this.state);
	
	var oldState = this.state;
	var lastNotes = this.breakIntoNotes(this.state);
	var newState = this.makeNextState(this.state, action);

	this.state = newState;
	
	post("oldState:" + oldState + "\n");
	post("action:" + action + "\n");
	post("newState:" + newState + "\n");
	post("this.state:" + this.state + "\n");
	outlet(0, "/action", lastNotes[0], lastNotes[1], action);

//    outlet(0, ("/action " + this.QLearner.getAction(state)) );
};

function update(state1, state2, action, nextState1, nextState2, reward) {
    post("statebeforeUpdate:", this.state);
	var state = this.combine(state1, state2);
	var nextState = this.combine(nextState1, nextState2);
    this.QLearner.update(this.state, action, this.nextState, reward);
    post("stateAfterUpdate:", this.state);
};

function test(state,action) {
    this.QLearner.testItQ(state, action);
};

function getLegalActions(state) {
    var actions = new Array();
    var stateNum = parseInt(state);
    actions[0] = "60";
    actions[1] = "61";
    actions[2] = "62";
    actions[3] = "63";
    actions[4] = "64";
    actions[5] = "65";
    actions[6] = "66";
    actions[7] = "67";
    actions[8] = "68";
    actions[9] = "69";
    actions[10] = "70";
    actions[11] = "71";
    return actions;
};


function setQValue(state, action, value) {
    var sa = this.combine(state, action);
    this.QLearner.setQValue(sa, value);

};

function getValue(state) {
    return this.QLearner.getValue(state);
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
	return ( '(' + a + ',' + b + ')' );
};

function makeNextState(oldState, action) {
	// look at commented out to simplfy
	var nextState = "(" + oldState.split(",")[1].split([")"])[0] + "," + action + ")";
	
//  nextState = "(";
//	nextState = this.state.split(",");
//	nextState = nextState[1].split(")");
//	nextState = nextState[0];
//  nextState = nextState + "," + action + ")";
	return nextState;
};

function breakIntoNotes(state) {
	var notes = [];
	var subString = state.split(",");
	notes[0]= subString[0].split("(")[1];
	notes[1] = subString[1].split(")")[0];
	
	post("note1:" + notes[0] + "\n");
	post("note2:" + notes[1] + "\n");
	
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

/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";

var main = function(
    CommonUI,
    GameClient,
    DPad,
    AnswerButton,
    Input,
    Misc,
    MobileHacks,
    Touch,
    AudioManager) {
  var g_client;
  var g_audioManager;
  var g_abutton = false;
  var globals = {
    debug: false,
  };
  Misc.applyUrlSettings(globals);
  MobileHacks.fixHeightHack();

  function $(id) {
    return document.getElementById(id);
  }

  g_client = new GameClient({
    gameId: "verifiedfacts",
  });

  function handleNewQuestion(msg) 
  {
  console.log("IT'S TIME FOR A NEW QUESTION!"); 
  console.log("Answers are: "+msg.answer);
  
  
  	for (var x = 0; x < fullButtons.length; ++x) 
 	{
  		fullButtons[x].text=""; //reset the text of the fullbuttons array
  		fullButtons[x].erase();
  	}
  	
  	buttons=fullButtons.slice(0); // clones fullButtons to set as buttons
  	
    console.log("fullButtons is"+fullButtons);
    console.log("buttons is"+buttons);
    
    for (var j = 0; j<fullButtons.length-msg.answer.length; ++j)
    {
    	buttons.pop(); //This makes the buttons array the same length as the answers array
    }
    
    console.log("fullButtons is"+fullButtons);
    console.log("buttons is"+buttons);
    
  	for (var i = 0; i < buttons.length; i++) 
  	{
  	
  		//RESET THE LOOK SETTINGS TO UNDO CHOSEN ANSWER
  		buttons[i].recolor();
  		buttons[i].fontColor="#FFF";
		
  		buttons[i].text=msg.answer[i];
  	
  		//THIS GETS THE LENGTH OF THE LONGEST BUTTON
  		longestButton=Math.max(buttons[i].getWidth(),longestButton);
  	}
    answerChosen=-1;
    handleResize();
  };

  function handleScore(msg) 
  {
  	//the score is sent back with the handleAnswerFeedback class.  This currently does nothing.
  };


  //This is what happen when the player class sends back whether or not the answer was correct
  function handleAnswerFeedback(msg)
  {
  	for (var i = 0; i < buttons.length; i++) 
  	{
  	
  		//Change all of the answers to neutral
  		buttons[i].fillColor1=btnNeutralFillColor;
  		buttons[i].fillColor2=btnNeutralFillColor;
  	}
  	
  	if (msg.answerType == "correct")
  	{
  		 //then change the one chosen to be green if correct
  		 buttons[answerChosen].fillColor1=btnCorrectFillColor;
  		 buttons[answerChosen].fillColor2=btnCorrectFillColor;
 	}
 	else 
 	{
 		//or red if incorrect 
 		buttons[answerChosen].fillColor1=btnIncorrectFillColor;
 		buttons[answerChosen].fillColor2=btnIncorrectFillColor;
 	}
 	this.score = msg.newScore; //also, record the score
 	handleResize(); //this will redraw everything
  }
  
  //THIS FUNCTION RESIZES BUTTONS WHEN THE SCREEN SIZE CHANGES
  function handleResize() 
  {
  	if (topMargin+btmMargin+btnHeight*buttons.length>document.documentElement.clientHeight ||
  	    longestButton+leftMargin+rightMargin>document.documentElement.clientWidth) //if there's not enough space for all of the buttons
  	{
  		shrink=Math.min(document.documentElement.clientHeight/(topMargin+btmMargin+btnHeight*buttons.length),document.documentElement.clientWidth/(longestButton+leftMargin+rightMargin)); 
  		//then we're going to shrink to make it fit based on the smaller ratio
  	} else {shrink=1;}

    for (var i = 0; i < buttons.length; i++) 
  	{
  		buttons[i].xPos=0;
  		buttons[i].yPos=i*document.documentElement.clientHeight/buttons.length;
  		//buttons[i].fontSize=btnFontSize*shrink;
  		//buttons[i].fontStyle=""+(btnFontSize*shrink)+"px Verdana";
  		buttons[i].btnWidth=document.documentElement.clientWidth;
  	    buttons[i].btnHeight=document.documentElement.clientHeight/buttons.length;
  		buttons[i].resize();
  	}

  };
  var longestButton=0; //This will have the px length of the longest button
  var answerChosen=0;  //-1 for none, 0=a, 1=b, 2=c, 3=d starts at 0 so you can't select anything
  var score=0; //reflects the host score, not the other way around.

  //EVENT LISTENERS
  g_client.addEventListener('score', handleScore);
  window.addEventListener('resize', handleResize);
  g_client.addEventListener('newQuestion', handleNewQuestion);
  g_client.addEventListener('answerFeedback', handleAnswerFeedback);
 
  //THESE CONTROL HOW YOUR CONTROLLERS LOOK
  //BUTTONS:
  var buttonBaseColors=[["#079700","#A6FA87"],["#1873BB","#53C8E9"],["#D415CA","#F27CEA"],["#FA6B16","#F5E333"],["#079700","#A6FA87"],["#1873BB","#53C8E9"]];
  var btnNeutralFillColor="#F9F4AB"; //Button look options
  var btnNeutralStrokeColor="#D9D367";
  var btnSelectedFillColor="#D3D3D3";
  var btnCorrectFillColor="#00FF00";
  var btnIncorrectFillColor="#FF0000";
  var btnStrokeWidth=6;
  var btnFontSize=44;
  var btnWidth=270;
  var btnHeight=70;
  var shrink=1; //This is for when the screen gets WAAY TOO SMALL. 1=full size, <1 shrunk somewhat
  //OTHER:
  var topMargin=150;
  var btmMargin=250;
  var leftMargin=75;
  var rightMargin=75;
  
  //THESE CONTROL THE BACKGROUND COLOR
  var color = "#FFF";
  g_client.sendCmd('setColor', { color: color }); //THIS SENDS YOUR BACKGROUND COLOR TO THE GAME
  document.body.style.backgroundColor = color;

  g_audioManager = new AudioManager();

  //THIS INITIALIZES YOUR BUTTONS
  var fullButtons = [
    new AnswerButton({element: $("answerA"), text: "Waiting For a Question"}),
    new AnswerButton({element: $("answerB"), text: ""}),
    new AnswerButton({element: $("answerC"), text: ""}),
    new AnswerButton({element: $("answerD"), text: ""}),
    new AnswerButton({element: $("answerE"), text: ""}),
    new AnswerButton({element: $("answerF"), text: ""}),
  ];
  
  var buttons=fullButtons.slice(0); //The contents of "buttons" is going to change depending on the number of answers
  
  for (var i = 0; i < buttons.length; i++) 
  {
  	
  	//THESE INITIALIZE THE LOOK SETTINGS
    buttons[i].fillColor=btnNeutralFillColor;
  	buttons[i].strokeColor=btnNeutralStrokeColor; 
  	buttons[i].strokeWidth=btnStrokeWidth;		
  	buttons[i].fontSize=btnFontSize;
  	buttons[i].fontStyle=""+btnFontSize+"px Verdana";
  	buttons[i].fontColor="#FFF";
  	buttons[i].xPos=(document.documentElement.clientWidth)/2-200;
  	buttons[i].yPos=topMargin+i*(btnHeight+btnStrokeWidth+3);
  	buttons[i].btnWidth=btnWidth;
  	buttons[i].btnHeight=btnHeight;
  	buttons[i].basecolor1=buttonBaseColors[i][0];
  	buttons[i].basecolor2=buttonBaseColors[i][1];
  	buttons[i].recolor();
  	
  	//THIS GETS THE LENGTH OF THE LONGEST BUTTOn
  	longestButton=Math.max(buttons[i].getWidth(),longestButton);
  }
  
  handleResize(); //REDRAW THE BUTTONS JUST TO BE SAFE
  
  
	var handlePress = function(e) 
	{
	  console.log("Handling press at "+e.x+", "+e.y);
	  if (answerChosen==-1)
	  {
	  	for (var i = 0; i < buttons.length; i++)
 	  	{
 	  	console.log("Button Xpos="+buttons[i].xPos);
 	  	console.log("Button Width="+buttons[i].getWidth());
 	  	
 	  		if (buttons[i].xPos<e.x && e.x<buttons[i].xPos+buttons[i].btnWidth && buttons[i].yPos<e.y && e.y<buttons[i].yPos+buttons[i].btnHeight)
 	  		{
 	  			answerChosen=i;
 	  			g_client.sendCmd('answer', {answer: buttons[i].text});
 	  			buttons[i].fillColor1=btnSelectedFillColor;
 	  			buttons[i].fillColor2=btnSelectedFillColor;
 	  			break;
 	  		}
 	 	}
 	 	handleResize();
 	 }
    };

  var sendPad = function(e) {
   /* if (globals.debug) {
      console.log("pad: " + e.pad + " dir: " + e.info.symbol + " (" + e.info.direction + ")");
    }
    buttons[e.pad].draw(e.info);
    g_client.sendCmd('pad', {pad: e.pad, dir: e.info.direction});
  };
  
  var handleAbutton = function(pressed) {
    g_abutton = pressed;
    g_client.sendCmd('abutton', {
        abutton: pressed,
    });
*/
    };

    CommonUI.setupStandardControllerUI(g_client, globals);
    var container = $("answerinput");
    Touch.setupButtons({
      inputElement: $("answers"),
      buttons: [
        { element: $("answers"), callback: function(e) { handlePress(e); }, },
      ],
    });
    
    
   
    Touch.setupVirtualDPads({
    inputElement: container,
    callback: sendPad,
    fixedCenter: true,
    pads: [
      {
        referenceElement: $("answerA"),
        offsetX: 2 / 2,
        offsetY: 2 / 2,
      },
      {
        referenceElement: $("answerB"),
        offsetX: 2 / 2,
        offsetY: 2 / 2,
      },
    ],
  });
  
  

};

// Start the main app logic.
requirejs([
    '../../../scripts/commonui',
    '../../../scripts/gameclient',
    '../../../scripts/misc/dpad',
    '../../../scripts/misc/answerbutton',
    '../../../scripts/misc/input',
    '../../../scripts/misc/misc',
    '../../../scripts/misc/mobilehacks',
    '../../../scripts/misc/touch',
    '../../scripts/audio',
  ],
  main
);


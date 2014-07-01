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
    gameId: "shootshoot",
  });

  function handleNewQuestion(msg) 
  {
  console.log("IT'S TIME FOR A NEW QUESTION!"); 
  console.log("Answers are: "+msg.answer);
  	for (var i = 0; i < buttons.length; i++) 
  	{
  	
  		//RESET THE LOOK SETTINGS TO UNDO CHOSEN ANSWER
  		buttons[i].fillColor=btnNeutralFillColor;
  		buttons[i].strokeColor=btnNeutralStrokeColor; 
  		buttons[i].fontColor="#000";
  		buttons[i].text=msg.answer[i];
  	
  		//THIS GETS THE LENGTH OF THE LONGEST BUTTON
  		longestButton=Math.max(buttons[i].getWidth(),longestButton);
  	}
    answerChosen=-1;
    handleResize();
  };

  function handleScore(msg) 
  {
  	document.body.style.backgroundColor = msg.abcdef;
  	console.log(msg.abcdef);
  };


  //This is what happen when the player class sends back whether or not the answer was correct
  function handleAnswerFeedback(msg)
  {
  	console.log(msg.answerType);
  	if (msg.answerType == "correct")
  	{
  		 buttons[answerChosen].fillColor=btnCorrectFillColor;
 	}
 	else 
 	{
 		buttons[answerChosen].fillColor=btnIncorrectFillColor;
 	}
 	this.score = msg.newScore;
 	handleResize();
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
  		buttons[i].xPos=(document.documentElement.clientWidth-longestButton*shrink)/2;
  		buttons[i].yPos=(topMargin+i*(btnHeight+btnStrokeWidth+3))*shrink;
  		buttons[i].fontSize=btnFontSize*shrink;
  		buttons[i].fontStyle=""+(btnFontSize*shrink)+"px Verdana";
  		buttons[i].btnWidth=btnWidth*shrink;
  	    buttons[i].btnHeight=btnHeight*shrink;
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
  var buttons = [
    new AnswerButton({element: $("answerA"), text: "Waiting For a Question"}),
    new AnswerButton({element: $("answerB"), text: ""}),
    new AnswerButton({element: $("answerC"), text: ""}),
    new AnswerButton({element: $("answerD"), text: ""}),
  ];
  for (var i = 0; i < buttons.length; i++) 
  {
  	
  	//THESE INITIALIZE THE LOOK SETTINGS
    buttons[i].fillColor=btnNeutralFillColor;
  	buttons[i].strokeColor=btnNeutralStrokeColor; 
  	buttons[i].strokeWidth=btnStrokeWidth;		
  	buttons[i].fontSize=btnFontSize;
  	buttons[i].fontStyle=""+btnFontSize+"px Verdana";
  	buttons[i].fontColor="#000";
  	buttons[i].xPos=(document.documentElement.clientWidth)/2-200;
  	buttons[i].yPos=topMargin+i*(btnHeight+btnStrokeWidth+3);
  	buttons[i].btnWidth=btnWidth;
  	buttons[i].btnHeight=btnHeight;
  	
  	//THIS GETS THE LENGTH OF THE LONGEST BUTTOn
  	console.log("buttonWidth="+buttons[i].getWidth);
  	longestButton=Math.max(buttons[i].getWidth(),longestButton);
  	console.log("longestButton="+longestButton);
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
 	  	
 	  		if (buttons[i].xPos<e.x && e.x<buttons[i].xPos+buttons[i].getWidth() && buttons[i].yPos<e.y && e.y<buttons[i].yPos+buttons[i].btnHeight)
 	  		{
 	  			answerChosen=i;
 	  			g_client.sendCmd('answer', {answer: buttons[i].text});
 	  			buttons[i].fillColor=btnSelectedFillColor;
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


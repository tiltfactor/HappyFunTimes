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

function $(id) {
  return document.getElementById(id);
}

var main = function(
    GameSupport,
    GameServer,
    LocalNetPlayer,
    Input,
    Misc,
    Speedup,
    AudioManager,
    EntitySystem,
    PlayerManager) {

  var g_debug = true;
  var g_services = {};

  var g_entitySystem = new EntitySystem();
  g_services.entitySystem = g_entitySystem;
  var g_drawSystem = new EntitySystem("draw");
  g_services.drawSystem = g_drawSystem;
  var g_playerManager = new PlayerManager(g_services);
  g_services.playerManager = g_playerManager;
  g_services.misc = Misc;
  g_services.speedup = Speedup;

  //var sounds = {
  //  fire: {
  //    filename: "assets/fire.ogg",
  //    samples: 8,
  //  },
  //  explosion: {
  //    filename: "assets/explosion.ogg",
  //    samples: 6,
  //  },
  //  hitshield: {
  //    filename: "assets/hitshield.ogg",
  //    samples: 6,
  //  },
  //  launch: {
  //    filename: "assets/launch.ogg",
  //    samples: 2,
  //  },
  //  gameover: {
  //    filename: "assets/gameover.ogg",
  //    samples: 1,
  //  },
  //  play: {
  //    filename: "assets/play.ogg",
  //    samples: 1,
  //  },
  //};
  var sounds = {
        tick: {
          filename: "assets/tick.ogg",
          samples: 1,
        },
        // buzz: {
         // filename: "assets/sound_fail.ogg",
        //  samples: 4,
       // },
        // bing: {
        //  filename: "assets/right.ogg",
        //  samples: 4,
       // },
      };
  var audioManager = new AudioManager(sounds);
  g_services.audioManager = audioManager;
  var stop = false;
  var questionStartTime = getGameTime();
  var questionNumber=0;
  var waitingStartTime=-1;

  // You can set these from the URL with
  // http://path/gameview.html?settings={name:value,name:value}
  var globals = {
    port: 8080,
    haveServer: true,
    numLocalPlayers: 2,  // num players when local (ie, debugging)
    force2d: false,
    debug: true,
    playerMoveSpeed: 192,
    playerShotRate: 0.25,
    maxShotsPerPlayer: 3,
    shotVelocity: 400,
    shotDuration: 3,
    questionDuration: 40, //total seconds that a question takes from start to end  
    questionCompleteTime: 5, //seconds for which the complete question is shown before moving on
    //maxScore: 100, //maximum number of points that can be rewarded for a correct answer
    //minScore: 20, //minimum number of points that can be rewarded for a correct answer
    scores: [20,15,10,5], //the array of scores that can be achieved.  0,1,2 can be gotten once each, 3 can be gotten by everyone
    currentScore: 0, //setting this does nothing! keeps track of the current open place
    scorePositions: [[820,405],[742,455],[900,488],[820,541],[720,541],[920,541],[620,541]], // the pixel positions at the tops of the podiums
  };

  function startLocalPlayers() {
    var localNetPlayers = [];
    for (var ii = 0; ii < globals.numLocalPlayers; ++ii) {
      var localNetPlayer = new LocalNetPlayer();
      var player = g_playerManager.startPlayer(localNetPlayer, "Player" + (ii + 1));
      localNetPlayers.push(localNetPlayer);
    }
    var localNetPlayer1 = localNetPlayers[0];

    Input.setupKeyboardDPadKeys(function(e) {
      localNetPlayer1.sendEvent('pad', {pad: e.pad, dir: e.info.direction});
    });
  }

  var resize = function(canvas) {
    Misc.resize(canvas);
    globals.width = canvas.clientWidth;
    globals.height = canvas.clientHeight;
  };

  Misc.applyUrlSettings(globals);

  g_services.globals = globals;
  var questions = [];
  var baseDuration = globals.questionDuration;
  var state="playing";
  
  
  
  
  
  
  					//Question text				correct ans			ans1           ans2          ans3            ans4  
  //questions[0] = ["In the presence of tetrahydrofuran, a compound of this element reduces alkenes in an anti-Markovnikov fashion. This element forms a compound with rhenium that can surpass the hardness of diamond, and its oxide is added to silica to produce a durable form of glass used in labware. It is the lightest element used in p-type doping, and its hydride is a Lewis acid. Identify this element with atomic number 5 and symbol B.","Boron","Boron","Barium","Bromine","Bismuth"];
  //questions[1] = ["Two of his former allies suspected him of being the “Holliday” figure. He sought the aid of those allies in tracking “The Roman”, whom he later shot in the head. He once tried to seduce Renee Montoya, until she fought back and was rescued by Batman. Poison Ivy attempted to kill him for running over a rare flower at the construction site of Stonegate Penitentiary, and Billy Dee Williams played him as DA Harvey Dent in one film. Name this dualistic villain played by Aaron Eckhart in “The Dark Knight”.","Two-Face","Vito Corleone","The Joker","James Worthington Gordon","Two-Face"];
 // questions[2] = ["Structures found within it include ones discovered by Cajal, which are thought to be involved in the modification of snRNPs. Alpha-solenoid and beta-pro peller folds can be found in the pores located on the double membrane envelope of this structure, which is continuous with the rough endoplasmic reticulum. Red blood cells lack this structure, which contains protein-DNA complexes called euchromatin and heterochromatin. Identify this organelle, which houses the cell's genetic information.","Nucleus","Nucleus","Mitochondria","DNA","Cell"];
  //questions[3] = ["One character in this novel infuriates the narrator when he calls during a funeral to request his tennis shoes. In addition to Ewing Klipspringer, this novel's character's include the coffee shop owner Michaelis, who reports that he saw his neighbor run out into the Valley of Ashes. The title character, the former protégé of Dan Cody, is murdered in his pool after Myrtle Wilson is run over by the drunken Daisy Buchanan. Name this novel in which Nick Carraway describes the downfall of Jay Gatz, written by F. Scott Fitzgerald.","The Great Gatsby","A Prayer for Owen Meany","The Great Gatsby","The Catcher in the Rye","Atlas Shrugged"];
  //questions[4] = ["This man defeated Frank Lowden to win his party's presidential nomination. As president, he signed the Norris-LaGuardia Act and created the Reconstruction Finance Corporation. The Secretary of Commerce for Warren Harding, he headed the American Food Administration in World War I, and this president chose to sign the Hawley-Smoot Tariff in response to the calamity that doomed his presidency. Name this president who lost the 1932 election to Franklin Roosevelt during the Great Depression.","Herbert Hoover","Franklin Roosevelt","Herbert Hoover","Woodrow Wilson ","Ronald Reagan"];
  //questions[5] = ["This famous scientist was the first to demonstrate chiral molecules. One of his greatest discoveries was made when his assistant, Charles Chamberland, went on vacation and failed to take care of his chickens. This scientist failed his medical school examinations three times before finally gaining admission to the École Normale Supérieure. Name this chemist and biologist whose legacy you can find in the jug of milk in your refrigerator.","Louis Pasteur","Louis Pasteur","Pierre Curie","Gregor Mendel","René Descartes"];
  //questions[6] = ["August Wilson's play The Piano Lesson mentions ghosts of a dog of this type. An old pair of this type considers dinner “a casual affair” in Gwendolyn Brooks' “The Bean Eaters.” This color describes a house owned by Henry Wimbush in an Aldous Huxley novel, while it also describes a town which Jack Potter brings his “bride” to in a Stephen Crane story. What is this color, which also appears on wallpaper that drives a woman insane in a short story by Charlotte Perkins Gilman. ","Yellow","Purple","Yellow","Blue","Mauve"];
  //questions[7] = ["One poem by this man includes the phrase “Knowledge overwhelming makes a God of me!” and refers to the title sun titan’s ascent to godhood. In addition to “Hyperion”, this poet wrote a poem which describes the courtship of Porphyro for Madeleineon the title night. Besides “The Eve of St. Agnes,” this poet asked “Ah, what can woe thee, wretched wight” in a poem about a woman who “takes [the speaker] to her elvin grot.” Name this poet of “La Belle Dame Sans Merci” who wrote“beauty is truth; truth beauty” in “Ode on a Grecian Urn.”","John Keats","John Keats","Dan Simmons","Lord Byron","E. E. Cummings"];
  //questions[8] = ["In an experiment by Bruce Alexander, these subjects chose to drink untainted water despite being addicted to morphine. Edward Tolman's experiments with these subjects led him to develop the theoryof cognitive maps. In the “kerplunk” experiment, these subjects were conditioned to run into a barrier. John Watson used loud noises to condition Little Albert to fear white ones. Often placed in mazes by researchers, name these rodents frequently used in psychological experiments. ","Rats","Rats","Mice","Undergraduates","Chimpanzees"];
  //questions[9] = ["Born in 1965 in Gloucestershire, England, this author has published a book under the pseudonym “Robert Galbraith.” This author has written both the fastest selling and the second-fastest selling books of all time. Despite the claims of some critics who feel her most famous books are anti-religious, she believe in God and an afterlife. Name this author who drew on her own experiences with clinical depression in her invention of the soul-sucking creatures The Dementors.","J.K. Rowling","J.K. Rowling","Jane Austen","J.R.R. Tolkien","Virginia Woolf"];
 
questions[0]=["This Nobel Prize-winning scientist studied agriculture as an undergraduate at Cornell University, and soon became fascinated by genetics while studying maize. Her most famous discovery was the transposition of chromosomes and their role in gene expression, which was so revolutionary in the 1940s and '50s that her findings only gained recognition in subsequent decades.","Barbara McClintock","Barbara McClintock","Thomas Cech","Rachel Carson","Francis Crick","answer5","answer6"];
questions[1]=["This famous computer scientist and mathematician said, Testing shows the presence, not the absence of bugs. Briefly considering a career in law, this Turing Award-winner instead chose to be a programmer back when programmer wasn't a recognized career. He wrote prolifically, preferring to write his thoughts out with a fountain pen rather than type, despite his interest in computers. His most famous contribution to computer science is a shortest path algorithm.","Edsger Dijkstra","Edsger Dijkstra","Grace Hopper","Gordon Moore","Alan Turing","answer5","answer6"];
questions[2]=["A member of the Australian Parliament announced a campaign to ban this substance internationally, but it was never successful. For children under 5, this substance  is the most common cause unintentional death.This substance may cause electrical failures, and is used as a fire retardant. With global warming, the global levels of this substance are expected to rise. This substance is forbidden by the TSA.This substance is commonly found in swimming pools, aquifers, and sewage treatment plants."
,"Dihydrogen Monoxide","Dihydrogen Monoxide","Carbon Monoxide","Methyl iodide","Pentaerythritol tetranitrate"];
questions[3]=["This person has both a Navy destroyer and a supercomputer named after them. They served in the United States Navy Reserve from 1943 to 1986, retiring with the rank of rear admiral. This person is better known, however, as a pioneer in the field of compilers and machine-independent programming languages. Their work laid the foundation for the development of COBOL, one of the most ubiquitous business languages to date. This person also is said to have popularized the term debugging, after they removed a moth stuck in a relay. Name this scientist, whose accomplishments and breadth of experience earned them the nickname Amazing _________.","Grace Hopper","Grace Hopper","Adele Goldstine","Mary Cartwright","Brendan Eich"];
questions[4]=["She liked to reach for the stars. KidSat, the program she developed, allowed children to request photographs to be taken from space. She was the youngest person on space. In 1983, she was the first woman in space aboard the Challenger.","Valentina Tereshkova","Valentina Tereshkova","Eileen Steel","Ryan Stone","Mae Jenison"];
questions[5]=["Designed by Chris Sanders this famous animated reptile made it to the big screen in 2010. This character's voice was constructed using the sounds of Elephant seals, horse and tigers. This well known lizard began from a series of books but took on a greater popularity after his big screen debut. Behaviors of this character were originally inspired by panthers. The character is first described as the Unholy offspring of lighting and death itself This fire breathing lizard is identified as the species Night Fury.","Toothless","Toothless","Smaug","Godzilla","Rango"];
questions[6]=["This man is considered one of the greatest polar explorers ever to have lived. Hailed as the first to journey to the southern magnetic pole by charting a route through the trans-Antarctic mountains, this man later decided his next great quest would be to travel Antarctica shore to shore. This journey is hailed as one of the most incredible Antarctic adventures ever to be documented. His ship HMS Endurance was trapped in an ice pack and crushed, stranding this man and his crew on Elephant Island, where they survived on seal, penguin, and whale meat for nearly a year. Using longboats to make an 800-mile northward trek, this man and his men landed on South Georgia Island and made camp at a whaling station. A year later they were rescued and brought home to England, where King Edward VII knighted him for his bravery.","Sir Ernest Shackleton","Sir Ernest Shackleton","Roald Amundsen","Robert Falcon Scott","Richard Evelyn Byrd"];
questions[7]=["This famous scientist developed the first compiler for a computer programming language. She popularized the idea of machine-independent programming languages, which led to the development of COBOL, one of the first modern programming languages. She is credited with popularizing the term debugging for fixing computer glitches. Name this computer scientist and United States Navy rear admiral.","Sally Kimball","Sally Kimball","Lara Croft","Grace Hopper","Ada Lovelace"];
questions[8]=["This is a fake question to see the size of the answers","C","A","a","B","b","C","c"];
questions[9]=["This is a fake question to see the size of the answers","C","A","a","B","b","C","c"];
  
  questions=randomizeArray(questions); //puts the questions in random order
  
  for (var ii=0; ii<questions.length; ++ii)
  {
  	questions[ii] = randomizeArray(questions[ii],2); //puts the answers in random order (indexes 2-end)
  }
  
  var server;
  
  if (globals.haveServer) 
  {
    server = new GameServer({gameId: "verifiedfacts",});
    g_services.server = server;
    server.addEventListener('playerconnect', g_playerManager.startPlayer.bind(g_playerManager));
  }
  GameSupport.init(server, globals);

  var canvas = $("canvas");
  var ctx = canvas.getContext("2d");

   

  // Add a 2 players if there is no communication
  if (!globals.haveServer) {
    startLocalPlayers();
  }

  function render() {
    g_entitySystem.processEntities();
    
	resize(canvas);
	
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	
    
    //THIS IS THE GAME ON SCORE SCREEN
    if (state == "score")
    {
    
    }
    
    //THIS IS THE GAME ON START SCREEN
    if (state == "start")
    {
    
    }
        
    //THIS IS THE GAME WAITING FOR PLAYERS
    if (state == "waiting")
    {
    
   		ctx.fillStyle = "#D3D3D3";
   		ctx.fillRect(100, 100, 600, 100);
   		ctx.fillStyle = "#000";
		ctx.font = "44px Verdana";
		ctx.fillText("Waiting For More Players",125,175);
   	
   		if (g_playerManager.players.length>1)
		{
			console.log("Changing from waiting to playing");
			state = "playing";
			console.log("old questionStartTime="+questionStartTime);
			questionStartTime += (getGameTime()-waitingStartTime);
			console.log("new questionStartTime="+questionStartTime);
		}
    	
    }
    
    //THIS IS THE GAME ACTUALLY RUNNING
    if (state == "playing")
    {
    	
    	//Check to see if all the players have answered
    	var allHaveAnswered = 1;
    	for (var ii = 0; ii<g_playerManager.players.length; ++ii)
    	{
    		allHaveAnswered = Math.min(allHaveAnswered, g_playerManager.players[ii].hasAnswered)
    		if (allHaveAnswered == 0) {break;}
    	}
    	if (allHaveAnswered == 1)  //If they all answered
    	{
    		if (getTimeLeft()>10000) //And there are more than ten seconds left
    		{
    			setTimeLeft(5000); //Jump to 5 seconds left
    		}
    	}
       
    
    	//Draw the score podium
		drawPodium(ctx,700,400,.65);
	
		ctx.fillStyle = "#FFF";
		ctx.font = "44px Verdana";
	
	
		//Draw the time left 
		if (getTimeLeft()<0) //If it's less than zero, count down from 5 and turn it red
		{
			removeRightAnswer(); //(Also make sure that no player can answer now);
			ctx.fillStyle = "#FF0000";
			ctx.fillText(5-Math.abs(Math.ceil(getTimeLeft()/1000)),50,50);
		}
		else //otherwise just draw the time
		{
			ctx.fillText(Math.ceil(getTimeLeft()/1000),50,50);
		}
	
		ctx.fillStyle = "#FFF";
		
		
		//Draw the actual question text
		drawQuestionText(questions[questionNumber][0],50,100,570,600);
	
		//Draw players' names and scores
		var namesAndScores="";
	
		for (var ii = 0; ii<g_playerManager.players.length; ++ii)
		{
			namesAndScores=(""+namesAndScores+g_playerManager.players[ii].name+": "+g_playerManager.players[ii].score+"   ");
		}
		ctx.fillText(namesAndScores,150,50);
	
		g_drawSystem.processEntities(ctx);
	
	
		
	
		//Highlights the correct answer
		for (var ii = 0; ii<justAnswers(questions[questionNumber]).length; ++ii)
		{
			if (getTimeLeft()<0 && justAnswers(questions[questionNumber])[ii]==correctAnswer(questions[questionNumber]))
			{
				ctx.fillStyle = "#00FF00";
			}
			else
			{
				ctx.fillStyle = "#FFF";
			}
		
			ctx.fillText(justAnswers(questions[questionNumber])[ii],700,100+ii*50);
		}
	
		//Send new questions if time is up!
		if (getGameTime()>questionStartTime+globals.questionDuration*1000+5000)
		{
			console.log("Question Duration is up!");
			questionStartTime = getGameTime();
			questionNumber++;
			sendNewQuestions();
		}
		
		  //If there aren't enough players, wait
   		if (g_playerManager.players.length<2)
		{
			console.log("Changing from playing to waiting");
			state = "waiting";
			waitingStartTime=getGameTime();
		}
    
    }//END PLAYING STATE
    
    ctx.fillStyle = "#FFF";
	ctx.font = "44px Verdana";
    
    //Draw the to join URL:
    ctx.fillText("To join go to "+document.URL.substr(0,document.URL.length-37),100,650);
    
  
    
  }
  GameSupport.run(globals, render);
  
  
  //THIS FUNCTION PREVENTS ANY PLAYER ANSWERING FOR THE REST OF THE ROUND
  function removeRightAnswer()
  {
  	for (var ii = 0; ii<g_playerManager.players.length; ++ii)
    {
 	 	g_playerManager.players[ii].correctAnswer = "";
    }
  }
  
  function sendNewQuestions ()
  {
  	globals.currentScore=0;
  	console.log("Calling sendNewQuestions");
  	var currentAnswers = justAnswers(questions[questionNumber]);
  	var rightAnswer = correctAnswer(questions[questionNumber]);
  	for (var ii = 0; ii<g_playerManager.players.length; ++ii)
    {
 	 	g_playerManager.players[ii].netPlayer.sendCmd('newQuestion', {answer: currentAnswers}); //send the CONTROLLER the answers for this question
 	 	g_playerManager.players[ii].correctAnswer = rightAnswer; //send the player object the correct answer
 	 	g_playerManager.players[ii].color = "#D3D3D3"; //reset the player avatar color
 	 	g_playerManager.players[ii].position = [600-100*ii,590]; //put the player avatar OFF of the podium
 	 	g_playerManager.players[ii].hasAnswered = 0; //so that we know they haven't answered yet.
    }
  }
  
  
  function drawQuestionText (questionText, xposition, yposition, boxWidth, boxHeight)
  {
  	ctx.fillStyle = "#FFF";
  	ctx.font = "26px Verdana";
  	var partialText = textByPercent(questionText,getTimeIn()/(globals.questionDuration*1000-globals.questionCompleteTime*1000));
  	var linesOfText = Math.ceil(ctx.measureText(questionText).width/boxWidth);
  	var firstSplitPoint = 0;
  	var secondSplitPoint = 0;
  	//console.log("There are "+linesOfText+" lines in this question");
  	
  	for (var ii = 1; ii<linesOfText+1; ++ii)
  	{
  		//console.log("Drawing question text line: "+ii);
  		secondSplitPoint = findNearestSpace(questionText, ii*Math.ceil(questionText.length/linesOfText));
  		ctx.fillText(partialText.slice(firstSplitPoint, Math.min(secondSplitPoint,partialText.length)).trim(),xposition,yposition+(30)*(ii-1));
  		firstSplitPoint=secondSplitPoint;
  	}
  }
  
  
  
  
  
  
 
  
  //returns time left in this question in milliseconds
  function getTimeLeft()
  {
  	return (globals.questionDuration*1000-(getGameTime()-questionStartTime));
  }
  
  //sets the time left in this question to the sent value (in milliseconds)
  //this will cause the timer to jump
  function setTimeLeft(newTimeLeft)
  {
  	questionStartTime = getGameTime()+newTimeLeft-globals.questionDuration*1000;
  }
  
  
   //FUNCTIONS BELOW THIS POINT ARE GENERIC DATA MANIPULATION
  
  
  //returns the index of the space nearest to a specified index. Returns last char if no spaces
  function findNearestSpace(someString, index)
  {
  	var nearestSpace = someString.length;
  	for (var jj = index; jj<someString.length; ++jj)
  	{
  		if(someString.charAt(jj) == " ")
  		{
  			nearestSpace=jj;
  			break;
  		}
  	}
  	for (var jj = index; jj>0; --jj)
  	{
  		if(someString.charAt(jj) == " ")
  		{
  			if(index-jj<nearestSpace-index)
  			{
  				return jj;
  			}
  			else
  			{
  				return nearestSpace;
  			}
  		}
  	}
  	return nearestSpace;
  }
  
  //returns time INTO the question in milliseconds
  function getTimeIn()
  {
  	return (getGameTime()-questionStartTime);
  }
  
  function getGameTime()
  {
		return (new Date()).getTime();
  }
  
  //Takes a string and a percent, returns a string that is the first X percent of the incoming string, by characters
  function textByPercent(fullString,percent)
  {
  	var fullLength = fullString.length;
  	return fullString.slice(0,Math.floor(fullLength*percent));
  }
  
  //returns and array of the possible answers to the question
  function justAnswers(fullQuestion)
  {
  		var answerList = [];
  		for (var ii = 0; ii<fullQuestion.length-2; ii++)
  		{
  			answerList[ii] = fullQuestion [ii+2];
  		}	
  		return answerList;
  }
  
  
  //returns only the correct answer
  function correctAnswer(fullQuestion)
  {
  		return fullQuestion[1];
  }
  
  //Randomizes the order of the lengthToRandomize units starting at the startIndex.  If neither, randomize whole thing.  If no lengthToRandomize, randomize all after the index
  function randomizeArray(arrayToRandomize, startIndex, lengthToRandomize)
  {
  var newArray=[];
  var randomIndex=0;
  		  if (!startIndex)
  		  {
  		  	 var start=0;
  		  }
  		  else
  		  {
  		  	var start=startIndex;
  		  }
  		  if (!lengthToRandomize)
  		  {
  		  	var units=arrayToRandomize.length-start;
  		  }
  		  else
  		  {
  		  	var units=lengthToRandomize;
  		  }

  		  for (var ii=0; ii<start; ++ii)
  		  {
  		    console.log("The first units");
  		  	newArray.push(arrayToRandomize.splice(0,1)[0]); //puts the first few elements at the start of the new array.
  		  }
  		  
  		  for (var ii=0; ii<units; ++ii)
  		  {
  		    console.log("The random units");
  		  	randomIndex=Math.floor(Math.random()*(units-ii));
  		  	newArray.push(arrayToRandomize.splice(randomIndex,1)[0]);
  		  }
  		  
  		  for (var ii=0; ii<arrayToRandomize.length; ++ii)
  		  {
  		    console.log("The trailing units");
  		  	newArray.push(arrayToRandomize.splice(0,1)[0]); //then all the later ones
  		  }
  		  
  return newArray;
  }


	function drawPodium(ctx,x,y,shrink) 
	{

      // scorePodium/namedview6
      ctx.save();

      // scorePodium/namedview6/
      ctx.save();

      // scorePodium/rect3981
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(304.9*shrink+x, 164.8*shrink+y);
      ctx.lineTo(301.3*shrink+x, 164.8*shrink+y);
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fill();

      // scorePodium/rect3981
      ctx.beginPath();
      ctx.moveTo(326.4*shrink+x, 164.8*shrink+y);
      ctx.lineTo(322.8*shrink+x, 164.8*shrink+y);
      ctx.fill();

      // scorePodium/path3986
      ctx.beginPath();
      ctx.moveTo(72.1*shrink+x, 111.0*shrink+y);
      ctx.lineTo(68.5*shrink+x, 111.0*shrink+y);
      ctx.fill();

      // scorePodium/Clip Group

      // scorePodium/Clip Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(370.3*shrink+x, 0.0*shrink+y);
      ctx.lineTo(12.5*shrink+x, 0.0*shrink+y);
      ctx.lineTo(12.5*shrink+x, 223.0*shrink+y);
      ctx.lineTo(370.3*shrink+x, 223.0*shrink+y);
      ctx.lineTo(370.3*shrink+x, 0.0*shrink+y);
      ctx.closePath();
      ctx.clip();

      // scorePodium/Clip Group/Group

      // scorePodium/Clip Group/Group/rect3981
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(283.4*shrink+x, 164.8*shrink+y);
      ctx.lineTo(261.9*shrink+x, 164.8*shrink+y);
      ctx.lineTo(261.9*shrink+x, 233.7*shrink+y);
      ctx.lineTo(367.6*shrink+x, 233.7*shrink+y);
      ctx.lineTo(367.6*shrink+x, 164.8*shrink+y);
      ctx.lineTo(344.3*shrink+x, 164.8*shrink+y);
      ctx.fill();

      // scorePodium/Clip Group/Group/path3984
      ctx.beginPath();
      ctx.moveTo(183.1*shrink+x, 39.4*shrink+y);
      ctx.lineTo(124.0*shrink+x, 39.4*shrink+y);
      ctx.lineTo(124.0*shrink+x, 233.7*shrink+y);
      ctx.lineTo(260.1*shrink+x, 233.7*shrink+y);
      ctx.lineTo(260.1*shrink+x, 39.4*shrink+y);
      ctx.lineTo(201.0*shrink+x, 39.4*shrink+y);
      ctx.fill();

      // scorePodium/Clip Group/Group/path3986
      ctx.beginPath();
      ctx.moveTo(50.6*shrink+x, 111.0*shrink+y);
      ctx.lineTo(16.6*shrink+x, 111.0*shrink+y);
      ctx.lineTo(16.6*shrink+x, 233.7*shrink+y);
      ctx.lineTo(122.2*shrink+x, 233.7*shrink+y);
      ctx.lineTo(122.2*shrink+x, 111.0*shrink+y);
      ctx.lineTo(90.0*shrink+x, 111.0*shrink+y);
      ctx.fill();

      // scorePodium/Clip Group/Group/path3988
      ctx.beginPath();
      ctx.moveTo(124.0*shrink+x, 37.6*shrink+y);
      ctx.lineTo(260.1*shrink+x, 37.6*shrink+y);
      ctx.lineTo(243.1*shrink+x, 19.7*shrink+y);
      ctx.lineTo(141.0*shrink+x, 19.7*shrink+y);
      ctx.lineTo(124.0*shrink+x, 37.6*shrink+y);
      ctx.closePath();
      ctx.fill();

      // scorePodium/Clip Group/Group/path3990
      ctx.beginPath();
      ctx.moveTo(16.6*shrink+x, 109.2*shrink+y);
      ctx.lineTo(122.2*shrink+x, 109.2*shrink+y);
      ctx.lineTo(122.2*shrink+x, 91.3*shrink+y);
      ctx.lineTo(33.3*shrink+x, 91.3*shrink+y);
      ctx.lineTo(16.6*shrink+x, 109.2*shrink+y);
      ctx.closePath();
      ctx.fill();

      // scorePodium/Clip Group/Group/path3992
      ctx.beginPath();
      ctx.moveTo(367.6*shrink+x, 163.0*shrink+y);
      ctx.lineTo(261.9*shrink+x, 163.0*shrink+y);
      ctx.lineTo(261.9*shrink+x, 145.1*shrink+y);
      ctx.lineTo(350.8*shrink+x, 145.1*shrink+y);
      ctx.lineTo(367.6*shrink+x, 163.0*shrink+y);
      ctx.closePath();
      ctx.fill();

      // scorePodium/20
      ctx.restore();
      ctx.restore();
      ctx.font = 43.0*shrink+"px 'Verdana'";
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillText("20", 163.9*shrink+x, 79.2*shrink+y);

      // scorePodium/15
      ctx.fillText("15", 38.5*shrink+x, 151.8*shrink+y);

      // scorePodium/10
      ctx.fillText("10", 286.5*shrink+x, 201.9*shrink+y);

      // scorePodium/Group

      // scorePodium/Group/path3988
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0.0*shrink+x, 242.7*shrink+y);
      ctx.lineTo(136.1*shrink+x, 242.7*shrink+y);
      ctx.lineTo(119.1*shrink+x, 224.8*shrink+y);
      ctx.lineTo(17.0*shrink+x, 224.8*shrink+y);
      ctx.lineTo(0.0*shrink+x, 242.7*shrink+y);
      ctx.closePath();
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fill();

      // scorePodium/Group/path3988
      ctx.beginPath();
      ctx.moveTo(248.0*shrink+x, 242.7*shrink+y);
      ctx.lineTo(384.1*shrink+x, 242.7*shrink+y);
      ctx.lineTo(367.1*shrink+x, 224.8*shrink+y);
      ctx.lineTo(265.1*shrink+x, 224.8*shrink+y);
      ctx.lineTo(248.0*shrink+x, 242.7*shrink+y);
      ctx.closePath();
      ctx.fill();

      // scorePodium/Group/Path
      ctx.beginPath();
      ctx.moveTo(285.6*shrink+x, 242.7*shrink+y);
      ctx.lineTo(55.8*shrink+x, 242.7*shrink+y);
      ctx.lineTo(55.8*shrink+x, 224.8*shrink+y);
      ctx.lineTo(285.6*shrink+x, 224.8*shrink+y);
      ctx.lineTo(285.6*shrink+x, 242.7*shrink+y);
      ctx.closePath();
      ctx.fill();

      // scorePodium/Path
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(384.1*shrink+x, 319.7*shrink+y);
      ctx.lineTo(0.0*shrink+x, 319.7*shrink+y);
      ctx.lineTo(0.0*shrink+x, 245.4*shrink+y);
      ctx.lineTo(384.1*shrink+x, 245.4*shrink+y);
      ctx.lineTo(384.1*shrink+x, 319.7*shrink+y);
      ctx.closePath();
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fill();

      // scorePodium/5
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillText("5", 178.4*shrink+x, 287.9*shrink+y);
      ctx.restore();
    }

  function getPPI(){
  // create an empty element
  var div = document.createElement("div");
  // give it an absolute size of one inch
  div.style.width="1in";
  // append it to the body
  var body = document.getElementsByTagName("body")[0];
  body.appendChild(div);
  // read the computed width
  var ppi = document.defaultView.getComputedStyle(div, null).getPropertyValue('width');
  // remove it again
  body.removeChild(div);
  // and return the value
  return parseFloat(ppi);
}

};

// Start the main app logic.
requirejs([
    '../../../scripts/gamesupport',
    '../../../scripts/gameserver',
    '../../../scripts/localnetplayer',
    '../../../scripts/misc/input',
    '../../../scripts/misc/misc',
    '../../../scripts/misc/speedup',
    '../../scripts/audio',
    '../../scripts/entitysystem',
    './playermanager',
  ],
  main
);



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

define(['../../scripts/2d', './shot',  '../../../scripts/misc/gamebutton'], function(M2D, Shot, GameButton) {
  /**
   * Player represnt a player in the game.
   * @constructor
   */
  var Player = (function() {

    return function(services, x, y, name, netPlayer) {
      this.services = services;

      services.entitySystem.addEntity(this);
      services.drawSystem.addEntity(this);

	  this.abutton = new GameButton(services.entitySystem);
      this.netPlayer = netPlayer;
      this.position = [x, y];
      this.color = "#D3D3D3";
      this.sizeW = 16;
      this.sizeH = 16;

      netPlayer.addEventListener('disconnect', Player.prototype.handleDisconnect.bind(this));
      netPlayer.addEventListener('pad', Player.prototype.handlePadMsg.bind(this));
      netPlayer.addEventListener('setName', Player.prototype.handleNameMsg.bind(this));
      netPlayer.addEventListener('setColor', Player.prototype.handleSetColorMsg.bind(this));
      netPlayer.addEventListener('busy', Player.prototype.handleBusyMsg.bind(this));
      netPlayer.addEventListener('abutton', Player.prototype.handleAButtonMsg.bind(this));
      netPlayer.addEventListener('answer', Player.prototype.handleAnswer.bind(this));

      this.name = name;
      this.pads = [-1, -1];
      this.score = 0;
      this.shootTimer = 0;
      this.shots = [];
      this.correctAnswer = "";
      this.hasAnswered=1; //1=yes, 0=no. This is used to check if all the players have answered. If so, we should speed up the countdown

      this.setState('color');
    };
  }());

  Player.prototype.setState = function(state) {
    this.state = state;
    this.process = this["state_" + state];
  }

  Player.prototype.removeFromGame = function() {
    this.services.entitySystem.removeEntity(this);
    this.services.drawSystem.removeEntity(this);
    this.services.playerManager.removePlayer(this);
  };

  Player.prototype.handleDisconnect = function() {
    this.removeFromGame();
  };

  Player.prototype.handleBusyMsg = function(msg) {
    // The busy message is send by PlayerNameHandler when the user is editing their name.
    // msg.busy = true means they are entering their name. false = they are not.
    // This can be used to make the player invicible for a moment remove then from play etc.
    // Of course that can be used to cheat by editing the name just before getting hit
    // So it's up the game to decide what if anything to do.
  };

  Player.prototype.handlePadMsg = function(msg) {
    this.pads[msg.pad] = msg.dir;
  };


  Player.prototype.handleAButtonMsg = function(msg) {
    this.abutton.setState(msg.abutton);
    //this.name=msg.abutton;
     this.sizeW *= 2;
     this.sizeH *= 2;
     this.netPlayer.sendCmd('score',{abcdef: "#FFFFFF"});
  };
  
  Player.prototype.handleAnswer = function(msg) 
  {
  this.hasAnswered=1;
  var globals = this.services.globals;
  console.log("Handling answer! Correct answer is: "+this.correctAnswer);
  	 if (this.correctAnswer == "") //if the correct answer is null, prevent the player from answering
  	 {
  	 	this.netPlayer.sendCmd('answerFeedback',{answerType: "notAllowed", newScore: this.score});
  	 }
     else if (msg.answer == this.correctAnswer) //else if their answer is correct, then cool!
     {
     	this.score+=globals.scores[Math.min(globals.currentScore, globals.scores.length-1)]; //Set your score to previous score plus the current place in the scores array
     																						  //if you're past the 4th person scoring, you get the last score
     	this.position = globals.scorePositions[Math.min(globals.currentScore,globals.scorePositions.length-1)];
     	this.color = "#00FF00";
     	globals.currentScore++; //increment the place in the scores array.
     	this.services.audioManager.playSound('bing');
     	this.netPlayer.sendCmd('answerFeedback',{answerType: "correct", newScore: this.score}); //alert the controller of the changes
     } 
     else //otherwise their answer is incorrect
     {
     	 this.color = "#FF0000";
     	 this.services.audioManager.playSound('buzz');
    	 this.netPlayer.sendCmd('answerFeedback',{answerType: "incorrect", newScore: this.score});
     }

  };

  Player.prototype.handleNameMsg = function(msg) {
    if (!msg.name) {
      this.sendCmd('setName', {
        name: this.name
      });
    } else {
   // if (msg.name=='test'){
   // this.name = 'Sukie';
   // } else {
      this.name = msg.name.replace(/[<>]/g, '');
      }
  };

  Player.prototype.handleSetColorMsg = function(msg) {
    this.color = msg.color;
  };

  Player.prototype.sendCmd = function(cmd, data) {
    this.netPlayer.sendCmd(cmd, data);
  };

  Player.prototype.updatePosition = function() {
    var globals = this.services.globals;
    var dir = this.pads[0];
    if (dir >= 0) {
      var angle = dir * Math.PI / 4;
      this.position[0] += Math.cos(angle) * globals.playerMoveSpeed * globals.elapsedTime;
      this.position[1] -= Math.sin(angle) * globals.playerMoveSpeed * globals.elapsedTime;
      this.position[0] = Math.max(0, Math.min(globals.width, this.position[0]));
      this.position[1] = Math.max(1, Math.min(globals.height, this.position[1]));
    }
  };

  Player.prototype.state_idle = function() {
    this.checkShoot();
    if (this.pads[0] >= 0) {
      this.setState('move');
      return;
    }
  };

  Player.prototype.state_move = function() {
    this.checkShoot();
    if (this.pads[0] < 0) {
      this.setState('idle');
      return;
    }
    this.updatePosition();
  };
  
  Player.prototype.state_color = function() 
  {
      this.setState('idle');
      return;
  };

  Player.prototype.shoot = function(direction) {
    var globals = this.services.globals;
    if (this.shots.length >= globals.maxShotsPerPlayer) {
      this.removeShot(this.shots[0]);
    }

    this.services.audioManager.playSound('fire');
    var angle = direction * Math.PI / 4;
    var shot = new Shot(
      this.services,
      this.position[0] + Math.cos(angle) * 15,
      this.position[1] - Math.sin(angle) * 15,
      angle, this);
    this.shots.push(shot);
  };

  Player.prototype.removeShot = function(shot) {
    var ndx = this.shots.indexOf(shot);
    this.shots.splice(ndx, 1);
    shot.destroy();
  };

  Player.prototype.checkShoot = function() {
    var globals = this.services.globals;
    if (this.pads[1] >= 0) {
      if (this.shootTimer <= 0) {
        this.shoot(this.pads[1]);
        this.shootTimer = globals.playerShotRate;
      } else {
        this.shootTimer -= globals.elapsedTime;
      }
    } else {
      this.shootTimer = 0;
    }
  };

  Player.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position[0], this.position[1], this.sizeW, this.sizeH);
    ctx.fillText(this.name, this.position[0] + 10, this.position[1] - 8);
  };

  return Player;
});


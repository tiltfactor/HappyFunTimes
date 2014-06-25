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

define(
  [ ], function() {

  var RIGHT = 0x1;
  var LEFT = 0x2;
  var UP = 0x4;
  var DOWN = 0x8;

  var dirToBits = [
    0,
    RIGHT,
    UP | RIGHT,
    UP,
    UP | LEFT,
    LEFT,
    DOWN |LEFT,
    DOWN,
    DOWN |RIGHT,
  ];


  // Renders a Rectangle Button
  var AnswerButton = function(options) 
  {
  	
  	this.fillColor="#FFF";		//Default look options
  	this.strokeColor="#000";	//These are overwritten by the look options in controller.js
  	this.strokeWidth=6;		
  	this.fontSize=44;
  	this.fontStyle=""+this.fontSize+"px Verdana";
  	this.fontColor="#000";
  	this.xPos=0;
  	this.yPos=0;
  	this.btnWidth=270;
  	this.btnHeight=70;
  	
    this.text = options.text;
    this.element = options.element;
    this.size = options.size;
    this.canvas = document.createElement("canvas");
    // We have to put this in the DOM before asking it's size.
    this.canvas.width=document.documentElement.clientWidth;
    this.canvas.height=document.documentElement.clientHeight;
    console.log("canvas width="+this.canvas.width);
    this.element.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.resize();
  };
  
  //THIS FUNCTION RETURNS THE WIDTH OF THE BUTTON
  AnswerButton.prototype.getWidth = function() 
  {
    var size = this.size;
    this.ctx.font=this.fontStyle 
    return this.ctx.measureText(this.text).width+100+this.strokeWidth*2;
  };
 
 AnswerButton.prototype.drawButton = function(data) 
 {
	if (this.text!="")
	{
    	var ctx = this.ctx;
    	ctx.font=this.fontStyle 
    	var textLength = ctx.measureText(this.text);
    	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    	ctx.save();
    	ctx.fillStyle = this.fillColor; //"#F9F4AB";
    	ctx.strokeStyle = this.strokeColor; //"#D9D367";
    	ctx.lineWidth = this.strokeWidth;
    	roundRect(ctx, this.xPos, this.yPos, textLength.width+100, this.btnHeight, 20, true, true);
    	ctx.fillStyle = this.fontColor;
    	ctx.textAlign = 'center';
    	ctx.fillText(this.text,this.xPos+textLength.width/2+50,this.yPos+(this.fontSize-10+this.btnHeight)/2);
    	console.log("document width"+document.documentElement.clientWidth);
   		ctx.restore();
    }
  };

  AnswerButton.prototype.draw = function(dirInfo) 
  {
    this.drawButton(dirInfo.bits);
  };

  AnswerButton.prototype.resize = function() 
  {
  	//if (typeof ctx != "undefined")
  		//{
  			this.canvas.width=document.documentElement.clientWidth;
    		this.canvas.height=document.documentElement.clientHeight;
    		this.drawButton(0);
    	//}
  };
  
  
  function roundRect(ctx, x, y, width, height, radius, fill, stroke) 
  {
  	if (typeof stroke == "undefined" ) 
  	{
   		stroke = true;
  	}
  	if (typeof radius === "undefined") 
  	{
    	radius = 5;
 	}
  	ctx.beginPath();
  	ctx.moveTo(x + radius, y);
 	ctx.lineTo(x + width - radius, y);
  	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  	ctx.lineTo(x + width, y + height - radius);
  	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  	ctx.lineTo(x + radius, y + height);
  	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  	ctx.lineTo(x, y + radius);
  	ctx.quadraticCurveTo(x, y, x + radius, y);
  	ctx.closePath();
  	if (stroke) 
  	{
    	ctx.stroke();
  	}
  	if (fill) 
  	{
    	ctx.fill();
  	}        
  }

  return AnswerButton;
});




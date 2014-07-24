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
  	
  	this.basecolor1="#1873BB";
  	this.basecolor2="#53C8E9";
  	this.fillColor1=this.basecolor1;		//Default look options
  	this.fillColor2=this.basecolor2;		//Most of these get overwritten in controller.js
  	this.fontSize=44;
  	this.fontStyle=""+this.fontSize+"px Verdana";
  	this.fontColor="#FFF";
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
    this.element.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.resize();
  };
  
  //THIS FUNCTION RETURNS THE WIDTH OF THE BUTTON
  AnswerButton.prototype.getWidth = function() 
  {
    this.ctx.font=this.fontStyle;
    return this.ctx.measureText(this.text).width;
  };
 
 AnswerButton.prototype.drawButton = function(data) 
 {
 
	this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	if (this.text!="")
	{
   		
   	  var gradient;


      this.ctx.save();
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.beginPath();
      this.ctx.moveTo(this.btnWidth+this.xPos, this.btnHeight+this.yPos);
      this.ctx.lineTo(0.0+this.xPos, this.btnHeight+this.yPos);
      this.ctx.lineTo(0.0+this.xPos, 0.0+this.yPos);
      this.ctx.lineTo(this.btnWidth+this.xPos, 0.0+this.yPos);
      this.ctx.lineTo(this.btnWidth+this.xPos, this.btnHeight+this.yPos);
      this.ctx.closePath();
      gradient = this.ctx.createLinearGradient(this.btnWidth/2+this.xPos, this.btnHeight+this.yPos, this.btnWidth/2+this.xPos, 0.0+this.yPos);
      gradient.addColorStop(0.00, this.fillColor1);
      gradient.addColorStop(1.00, this.fillColor2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.font=this.fontStyle;
      this.ctx.fillStyle = this.fontColor;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.text,this.xPos+this.btnWidth/2,this.yPos+this.btnHeight/2+this.fontSize*.72/2); 
      //The .72 here is my height conversion factor for Verdana. Verdana capital letters are ~72% of the font size high in pixels
      this.ctx.restore();
   		
    }
  };
  
  AnswerButton.prototype.recolor = function()
  {
  	this.fillColor1=this.basecolor1;
  	this.fillColor2=this.basecolor2;
  }
  
   AnswerButton.prototype.erase = function()
  {
  	this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
  
  


  return AnswerButton;
});




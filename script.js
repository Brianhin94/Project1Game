const LEFT_KEY = 37;
   const RIGHT_KEY = 39;
   const UP_KEY = 38;
   const DOWN_KEY = 40;


var gameBoard = {
	size: 50, 
	pointFood: {x:0,y:0},
	scoreNode: null,
	levelNode: null,
	init: function(){
		if(this.node==null)
			this.node = document.getElementById("gboard");
		
		this.scoreNode = document.getElementById("score");
		this.levelNode = document.getElementById("level");
		
		var elem, totalDivs=this.size*this.size;
		for(var i=0;i<totalDivs;i++){
			elem = document.createElement('div');
			this.node.appendChild(elem);
		}
	},
	// create snake using glow
	glowPoint: function(x,y){
		var elem = this.node.childNodes[(y*this.size)+x];
		elem.className = "glow";
	},
	hidePoint: function(x,y){
		var elem = this.node.childNodes[(y*this.size)+x];
		elem.className = "";
	},
	foodPoint: function(x,y){
		if(game.state==1 && this.pointFood.y && this.pointFood.x)
			this.node.childNodes[(this.pointFood.y * this.size)+this.pointFood.x].className = "glow";
		this.node.childNodes[(y*this.size)+x].className = "food";
		this.pointFood.x = x;
		this.pointFood.y = y;
	},
	//find new point for food on board
	newFoodPoint: function(){ 
		var x = Math.floor(Math.random() * this.size);
		var y = Math.floor(Math.random() * this.size);  
		var isPresent = snake.path.filter(function(pt){ 
			return x==pt.x && y==pt.y;
		});
		 // to do, check if all points are covered.
		if(isPresent.length > 0)
			this.newFoodPoint();
		else
			this.foodPoint(x,y);
	},
	clear: function(){
		for(var i=0;i<snake.path.length;i++){
			this.hidePoint(snake.path[i].x,snake.path[i].y);
		}
		this.hidePoint(this.pointFood.x,this.pointFood.y);
	}
};

// Snake Object
var snake = {
	path: [],
	direction: 0, //0=right,1=below,2=left,3=above 
	init: function(){
		this.direction=0;
		var x = (gameBoard.size/2)-5;
		var y = gameBoard.size/2;
		// start snake from middle of board with length 5
		this.path = [{x:x,y:y},{x:x+1,y:y},{x:x+2,y:y},{x:x+3,y:y},{x:x+4,y:y}]; 
		this.renderSnake();
	},
	// glow points lies in snake path
	renderSnake: function(){ 
		for(var i=0;i<this.path.length;i++){
			gameBoard.glowPoint(this.path[i].x,this.path[i].y);
		}
	},
	// find next point for snake movement
	nextPosition: function(){ 
		var currPoint = this.path[this.path.length-1];
		var nextPoint={};
		switch(this.direction){
			case 0: nextPoint.y = currPoint.y; nextPoint.x = currPoint.x+1; break;
			case 1: nextPoint.y = currPoint.y+1; nextPoint.x = currPoint.x; break;
			case 2: nextPoint.y = currPoint.y; nextPoint.x = currPoint.x-1; break;
			case 3: nextPoint.y = currPoint.y-1; nextPoint.x = currPoint.x; break;
		}
		return nextPoint;
	},
	// making snake grow after eating 
	moveSnake: function(nxtPt,isFood){ 
		if(!isFood){ 
			var tail = this.path.shift();
			gameBoard.hidePoint(tail.x,tail.y);
		}
		gameBoard.glowPoint(nxtPt.x,nxtPt.y);
		this.path.push(nxtPt);
	}
};
// game state starting speed, starting level, food,
var game = {
	speed: 200,
	level: 0,
	food: 0,
	intervalId: null,
	state: 0, 
	init: function(){
		this.speed=200;this.level=0;this.food=0;this.state=0;
		gameBoard.levelNode.innerHTML=0;gameBoard.scoreNode.innerHTML=0;
		snake.init();
		gameBoard.newFoodPoint();
		document.addEventListener("keydown",this.eventHandler); //listen for key down event for pressing each direction
		this.start();
	},
	on: function(){ // moving the snake
		var nextPt = snake.nextPosition();
		if(nextPt.x < 0 || nextPt.x >= gameBoard.size || nextPt.y < 0 || nextPt.y >= gameBoard.size){ // if snake going out of board this will trigger loss condition
			game.over();
			return;
		}else{
			var isPresent = snake.path.filter(function(pt){ 
				return nextPt.x==pt.x && nextPt.y==pt.y;
			});
			if(isPresent.length > 0) //check if tail is in way
				game.over();
			else{
				if(nextPt.x==gameBoard.pointFood.x && nextPt.y==gameBoard.pointFood.y){ // snake eats food, score updates, new food generates
					snake.moveSnake(nextPt,true);
					game.updateScore();
					gameBoard.newFoodPoint();
				}else
					snake.moveSnake(nextPt); // snake moves to next point
			}
		}
	},
	updateScore: function(){
		if(this.food > 9){ // after each 10th food level and speed up the game.
			this.level+=1;
			this.food = 0;
			this.speed -= 10;
			gameBoard.levelNode.innerHTML=this.level;
			clearInterval(this.intervalId);
			this.intervalId = setInterval(this.on,this.speed);
		}else{
			this.food+=1;
		}
		gameBoard.scoreNode.innerHTML=(this.level*1000) + (this.food*50);
	},
	over: function(){ // pause the game and score 
		clearInterval(this.intervalId);
		document.removeEventListener("keypress",this.eventHandler);
		var score = (this.level*1000) + (this.food*50);
		alert("You Lose you silly snake! Your Score is "+score);
		document.getElementById("startBtn").disabled = false;
		this.state=3;
	},
	pause: function(){
		clearInterval(this.intervalId);
		this.state=2;
	},
	start: function(){
		this.intervalId = setInterval(this.on,this.speed);
		this.state=1;
	},
	toggle: function(btn){ //toggle game state
		if(this.state == 0) return;
		
		if(this.state == 1){
			this.pause();
			btn.value = "Play";
		}else if(this.state == 2){
			this.start();
			btn.value = "Pause";
		}
	},
	eventHandler: function(e){ // event handler for arrow keys
		if(e.keyCode<38 && e.keyCode>40)
			return;
		
		if(snake.direction == 0 || snake.direction == 2){
			if(e.keyCode == UP_KEY)
				snake.direction=3;
			else if(e.keyCode == DOWN_KEY)	
				snake.direction=1;
		}else{
			if(e.keyCode == LEFT_KEY)
				snake.direction=2;
			else if(e.keyCode == RIGHT_KEY)	
				snake.direction=0;
		}
	}
};
// start button = clear board and game init
function start(btn){ 
	gameBoard.clear();
	game.init();
	btn.disabled = true;
}

gameBoard.init();
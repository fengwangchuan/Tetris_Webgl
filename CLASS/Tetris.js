var  WIDTH=15,HEIGTH=30;
var  offset_x,offset_y;
var  maps;
var  translate;
var  current;
var program;
var  draw_maps,draw_current,draw_color;
var  i,j,t;
var  colors;
var   color_index;
var   bufferId,colorId;
var vPosition,vColor;
var  cur_ofs_x,cur_ofs_y;
var  mode;
var x1,x2,y1,y2;
var  scores;
var  refresh,automove;
var  high_speed=100;
var  low_speed=200;
var   draw_lines;

window.onload = function init()
{

    document.onkeydown=keydown;
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    // Load the data into the GPU
    bufferId = gl.createBuffer();

    // Associate out shader variables with our data buffer
     vPosition = gl.getAttribLocation( program, "vPosition" );
     colorId=gl.createBuffer();
 //   gl.bindBuffer( gl.ARRAY_BUFFER, colorId );

     vColor = gl.getAttribLocation( program, "vColor" );

   maps=new Array(WIDTH);

    for (i = 0; i < WIDTH; i++) {
       maps[i] = new Array(HEIGTH);
       for(j=0;j<HEIGTH;j++)
           maps[i][j]=-1;
   }
   //colors[] use to storage the blocks color
   colors=[ [1,0,0,1],[1,0,1,1],[1,1,0,1],[0,1,0,1],[0,1,1,1],[0,0,1,1],[1,1,1,1] ];

   //translate  use to storage  the different blocks (7)  in 4*4board,
   //O 形方块
    translate=new Array(7);
    translate[0]=new Array(1);
    translate[0][0]=new Array(0,1,4,5);

    //I 形方块
    translate[1]=new Array(2);
    translate[1][0]=new Array(0,1,2,3);
    translate[1][1]=new Array(0,4,8,12);

    //S 形方块
    translate[2]=new Array(2);
    translate[2][0]=new Array(1,2,4,5);
    translate[2][1]=new Array(0,4,5,9);

    //Z 形
    translate[3]=new Array(2);
    translate[3][0]=new Array(0,1,5,6);
    translate[3][1]=new Array(1,4,5,8);

    //T 形
    translate[4]=new Array(4);
    translate[4][0]=new Array(0,1,2,5);
    translate[4][1]=new Array(1,4,5,9);
    translate[4][2]=new Array(1,4,5,6);
    translate[4][3]=new Array(1,5,6,9);

    //L 形
    translate[5]=new Array(4);
    translate[5][0]=new Array(0,4,8,9);
    translate[5][1]=new Array(0,4,1,2);
    translate[5][2]=new Array(0,1,5,9);
    translate[5][3]=new Array(2,4,5,6);

    //J 形
    translate[6]=new Array(4);
    translate[6][0]=new Array(1,5,8,9);
    translate[6][1]=new Array(0,4,5,6);
    translate[6][2]=new Array(1,2,5,9);
    translate[6][3]=new Array(0,1,2,6);

    refresh=null ;
    automove=null;
};


// Judge whether the current block can move in response to the parameters
function canmove(down,right,change_mode){
    var  newmode=(mode+change_mode)%translate[current].length;
    var   can_move=true;
    for(i=0;i<4;i++){
        cur_ofs_x = translate[current][newmode][i]%4;
        cur_ofs_y = parseInt(translate[current][newmode][i]/4);
        if(cur_ofs_x+offset_x+right<0||
            cur_ofs_x+offset_x+right>=WIDTH||
            cur_ofs_y+offset_y+down>=HEIGTH||
            cur_ofs_y+offset_y+down<0||
            maps[cur_ofs_x+offset_x+right][cur_ofs_y+offset_y+down]!=-1){
                    can_move=false;
                    break;
                }
        }
   return  can_move;
}

//  create the new block
 function   creatnewblock(){
     current = Math.floor(Math.random() * 7);
     offset_x = 7;
     offset_y = 0;
     mode = -1;
//   if the can't create the new block   game fail
    if(canmove(0,0,1)==false) {
        mode++;
        render();
        alert("lose the game");
        clearInterval(refresh);
        clearInterval(automove);
        refresh=null;
        automove=null;
    }
    else mode++;


}

// the block move down
function   movedown(){
    if(canmove(1,0,0)){
        offset_y++;
    }
    else {
       //   the current block is fixed in the maps
        for(i=0;i<4;i++) {
            cur_ofs_x = translate[current][mode][i] % 4;
            cur_ofs_y = parseInt(translate[current][mode][i] / 4);
            maps[offset_x+cur_ofs_x][offset_y+cur_ofs_y]=current;
        }
  // clear the block if one line is full
        while(clear());
 //  create the new block
       creatnewblock();
    }
}

function  moveleft(){
    if(canmove(0,-1,0)){
        offset_x--;
    }
}

function   moveright(){
    if(canmove(0,1,0)){
        offset_x++;
    }
}

//Rotate the current square
function changemode(){

    if(canmove(0,0,1)){
        mode=(mode+1)%translate[current].length;
    }
}



//Draw the game screen
function   render() {
    //  draw the maps
    gl.clear( gl.COLOR_BUFFER_BIT );
    draw_maps = [];
    draw_color =[];
    for (i = 0; i < WIDTH; i++)
        for (j = 0; j < HEIGTH; j++)
            if (maps[i][j] != -1) {
                color_index = maps[i][j];
                x1 =-1 + (i / WIDTH.toFixed(4)) * 2;
                y1 = 1 - (j / HEIGTH.toFixed(4)) * 2;
                x2 =-1 + ((i + 1) / WIDTH.toFixed(4)) * 2;
                y2 = 1 - ((j + 1) / HEIGTH.toFixed(4)) * 2;

                draw_maps.push(x1, y1, x2, y1, x1, y2, x2, y1, x1, y2, x2, y2);
                for (t = 0; t < 6; t++)
                    draw_color.push(colors[color_index]);
            }
    bufferdata(draw_maps,draw_color);
    gl.drawArrays(gl.TRIANGLES, 0, draw_maps.length/2);

    // draw the current block
    draw_current=[];
    draw_color=[];

    for (i = 0; i < 4; i++){
        cur_ofs_x = translate[current][mode][i]%4;
        cur_ofs_y = parseInt(translate[current][mode][i]/4);

        x1 =-1  + ((offset_x + cur_ofs_x    )/ WIDTH.toFixed(4)) * 2;
        y1 = 1  - ((offset_y + cur_ofs_y    )/ HEIGTH.toFixed(4)) * 2;
        x2 = -1 + ((offset_x + cur_ofs_x + 1) / WIDTH.toFixed(4)) * 2;
        y2 = 1  - ((offset_y + cur_ofs_y + 1) / HEIGTH.toFixed(4)) * 2;

        draw_current.push(x1, y1, x2, y1, x1, y2, x2, y1, x1, y2, x2, y2);
        for (j = 0; j < 6; j++)
            draw_color.push(colors[current]);
    }
    bufferdata(draw_current,draw_color);
    gl.drawArrays(gl.TRIANGLES, 0, draw_current.length/2);
    //  show the scores
     var  showscores=document.getElementById("scores").innerHTML=scores;
    //draw the lines the background
     drawlins();
}

//  put the array data into gpu
//array1 is about position   array2 is about color
function bufferdata (array1,array2){

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array1) ,gl.STATIC_DRAW);
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.bindBuffer(gl.ARRAY_BUFFER, colorId);

    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(array2.flat(2)), gl.STATIC_DRAW);
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

}

//  Handling keyboard events
function keydown(){
    var event = event || window.event;  // 标准化事件对象
    switch(event.keyCode) {             // 获取当前按下键盘键的编码
        case  40:  movedown(); break;
        case  38:  changemode();break;
        case  37:  moveleft();break;
        case  39:  moveright();break;
    }
}

//  Initialize the game
function  initi(){
    for(i=0;i<WIDTH;i++)
        for(j=0;j<HEIGTH;j++){
            maps[i][j]=-1;
        }

    current=1;
    offset_y=0;
    offset_x=5;
    scores=0;
    mode=0;

}

function clear() {
    var can_clear;
    for (j = HEIGTH - 1; j >= 0; j--) {
        can_clear = true;
        for (i = 0; i < WIDTH; i++) {
            if (maps[i][j] == -1)
                can_clear = false;
        }
        if (can_clear) break;
    }
    if(can_clear) {
        for (t = j; t >= 0; t--)
            for (i = 0; i < WIDTH; i++)
                maps[i][t] = maps[i][t - 1];

        for (i = 0; i < WIDTH; i++)
            maps[i][0] = -1;
        scores++;
    }
    return   can_clear;
}

//start the game
function  startgame(){
    initi();
    if(refresh==null){
        refresh         = setInterval(movedown,low_speed);
    }
    if(automove==null) {
        automove = setInterval(render, 30);
    }
}
//  The block falls at a high speed
function   highspeed() {
    if (automove == null) {
        refresh = setInterval(movedown, high_speed);
    }
    else {
        clearInterval(refresh);
        refresh=setInterval(movedown,high_speed);
        console.log("high");

    }
}
//The cube falls at a low speed
function   lowspeed() {
    if (automove == null) {
        refresh = setInterval(movedown, low_speed);
    }
    else {
        clearInterval(refresh);
        refresh=setInterval(movedown,low_speed);
        console.log("low");

    }
}

//  draw the background lines
function  drawlins(){
    draw_lines=[];
    draw_color=[];

    for(i=0;i<HEIGTH;i++){
        x1 = -1;
        y1 = 1 - ((i/HEIGTH).toFixed(4))*2;
        x2 = 1;
        y2 = y1;
        draw_lines.push(x1,y1,x2,y2);
        for(t=0;t<4;t++)  draw_color.push([1,1,1,1]);
    }
    for(j=0;j<WIDTH;j++){
        x1 = -1+((j/WIDTH).toFixed(4))*2;
        y1 =  1;
        x2 = x1;
        y2 = -1;
        draw_lines.push(x1,y1,x2,y2);
        for(t=0;t<4;t++)  draw_color.push([1,1,1,1]);

    }
    bufferdata(draw_lines,draw_color);
    gl.drawArrays(gl.LINES,0,draw_lines.length/2);
}

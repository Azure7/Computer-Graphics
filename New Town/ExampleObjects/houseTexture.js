/**
 * Created by Yusef.
 */

/**
 A Very Simple Textured Plane using native WebGL.

 Notice that it is possible to only use twgl for math.

 Also, due to security restrictions the image was encoded as a Base64 string.
 It is very simple to use somthing like this (http://dataurl.net/#dataurlmaker) to create one
 then its as simple as
     var image = new Image()
     image.src = <base64string>


 **/

var grobjects = grobjects || [];


(function() {
    "use strict";
    var houseNumber = 0;
    var number = 0;

    var vertexSource;
    var fragmentSource;

    var vPos = new Float32Array([-2,0,-2,  2,0,-2,  2, 2,-2,        -2, 2,-2,    // z = 0
                                 -2,0, 2,  2,0, 2,  2, 2, 2,         -2, 2, 2,    // z = 1
                                 -2,0,-2,  2,0,-2,  2,0, 2,        -2,0, 2,    // y = 0
                                 -2, 2,-2,  2, 2,-2,  2, 2, 2,     -2, 2, 2,    // y = 1
                                 -2,0,-2, -2, 2,-2, -2, 2, 2,       -2,0, 2,    // x = 0
                                 2,0,-2,  2, 2,-2,  2, 2, 2,        2,0, 2,     // x = 1
                                 -2,2,-2,   0,3,-2,  2,2,-2,       -2,2,2,   0,3,2,   2,2,2,
                                 -2,2,-2, 0,3,-2, 0,3,2, -2,2,2,
                                 2,2,-2, 0,3,-2, 0,3,2,            2,2,2]);
    var vNormal = new Float32Array([  0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1,
                                      0,0,1, 0,0,1, 0,0,1,         0,0,1,
                                      0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0,
                                      0,1,0, 0,1,0, 0,1,0,        0,1,0,
                                      -1,0,0, -1,0,0, -1,0,0,     -1,0,0,
                                      1,0,0, 1,0,0, 1,0,0,        1,0,0,
                                      0,0,-1,  0,0,-1, 0,0,-1, 0,0,1, 0,0,1,0,0,1,
                                      -1,-.5,-1,-1,-.5,-1,-1,-.5,-1,-1,-.5,-1,
                                      1,.5,1,1,.5,1,1,.5,1,1,.5,1]);
    var indices = new Uint8Array([
                0,1,2, 0,2,3,
                4,5,6, 4,6,7,
                8,9,10, 8,10,11,
                12,13,14,12,14,15,
                16,17,18,16,18,19,
                20,21,22,20,22,23,
                24,25,26,27,28,29,
                30,31,32,30,32,33,
                34,35,36,34,36,37
          ]);

    var aText = new Float32Array([0, 0,   1, 0,   1, 1,   0, 1,
                                  0, 0,   1, 0,   1, 1,   0, 1,
                                  0, 0,   1, 0,   1, 1,   0, 1,
                                  0, 0,   1, 0,   1, 1,   0, 1,
                                  1, 1,   1, 0,   0, 0,   0, 1,
                                  1, 1,   1, 0,   0, 0,   0, 1,
                                  1, 1,   1, 0,   1, 1,   1, 1,   1, 0,   1, 1,
                                  1, 1,   1, 0,   0, 0,   0, 1,
                                  1, 1,   1, 0,   0, 0,   0, 1]);

    //useful util function to simplify shader creation. type is either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    var createGLShader = function (gl, type, src) {
        var shader = gl.createShader(type)
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log("warning: shader failed to compile!")
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    //see above comment on how this works.
    var image1 = new Image();
    image1.src = "images/wood.png";
    //useful util function to return a glProgram from just vertex and fragment shader source.
    var createGLProgram = function (gl, vSrc, fSrc) {
        var program = gl.createProgram();
        var vShader = createGLShader(gl, gl.VERTEX_SHADER, vSrc);
        var fShader = createGLShader(gl, gl.FRAGMENT_SHADER, fSrc);
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);

        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
            console.log("warning: program failed to link");
            return null;

        }
        return program;
    }

    //draw a rectangle (used for drawing a bunch of rectangles for the human)
    function constructRectangle(xLower,xUpper,yLower,yUpper,zLower,zUpper){
      return new Float32Array([
      xLower,yLower,zLower,xUpper,yLower,zLower,xUpper,yUpper,zLower,xLower,yUpper,zLower,
      xLower,yLower,zUpper,xUpper,yLower,zUpper,xUpper,yUpper,zUpper,xLower,yUpper,zUpper,
      xLower,yLower,zLower,xUpper,yLower,zLower,xUpper,yLower,zUpper,xLower,yLower,zUpper,
      xLower,yUpper,zLower,xUpper,yUpper,zLower,xUpper,yUpper,zUpper,xLower,yUpper,zUpper,
      xLower,yLower,zLower,xLower,yUpper,zLower,xLower,yUpper,zUpper,xLower,yLower,zUpper,
      xUpper,yLower,zLower,xUpper,yUpper,zLower,xUpper,yUpper,zUpper,xUpper,yLower,zUpper]);
    }

    //creates a gl buffer and unbinds it when done.
    var createGLBuffer = function (gl, data, usage) {
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer;
    }

    var findAttribLocations = function (gl, program, attributes) {
        var out = {};
        for(var i = 0; i < attributes.length;i++){
            var attrib = attributes[i];
            out[attrib] = gl.getAttribLocation(program, attrib);
        }
        return out;
    }

    var findUniformLocations = function (gl, program, uniforms) {
        var out = {};
        for(var i = 0; i < uniforms.length;i++){
            var uniform = uniforms[i];
            out[uniform] = gl.getUniformLocation(program, uniform);
        }
        return out;
    }

    var enableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.enableVertexAttribArray(location);
        }
    }

    //always a good idea to clean up your attrib location bindings when done. You wont regret it later.
    var disableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.disableVertexAttribArray(location);
        }
    }

    //creates a gl texture from an image object. Sometiems the image is upside down so flipY is passed to optionally flip the data.
    //it's mostly going to be a try it once, flip if you need to.
    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

     var House = function (position, size) {
        this.program = null;
        this.scale = [1.0,1.0];
        this.attributes = null;
        this.uniforms = null;
        this.buffers = []
        this.texture = null;
        this.name = "house" + houseNumber++;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = new Float32Array([.27,.137,.035]);
    }

    House.prototype.init = function (drawingState) {
        var gl = drawingState.gl;
        vertexSource = document.getElementById("roundhouse-vs").text;
        fragmentSource = document.getElementById("roundhouse-fs").text;
        this.program = createGLProgram(gl, vertexSource, fragmentSource);
        this.attributes = findAttribLocations(gl, this.program, ["vnormal","vpos","aText"]);
        this.uniforms = findUniformLocations(gl, this.program, ["cubecolor","lightdir","proj", "view", "model", "texSampler", "lcolor"]);

        this.texture1 = createGLTexture(gl, image1, true);

        this.buffers[0] = createGLBuffer(gl, vPos, gl.STATIC_DRAW);
        this.buffers[1] = createGLBuffer(gl, vNormal, gl.STATIC_DRAW);
        this.buffers[2] = createGLBuffer(gl, aText, gl.STATIC_DRAW);
    }

    House.prototype.center = function () {
        return this.position;
    }

    House.prototype.draw = function (drawingState) {
        var gl = drawingState.gl;

        gl.useProgram(this.program);
        gl.disable(gl.CULL_FACE);

        enableLocations(gl, this.attributes);

        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position, modelM);
        var lightcolor = (drawingState.timeOfDay < 6 || drawingState.timeOfDay > 18)?[0.3,0.9,0.3]:[1.0,1.0,1.0];
        var direction = (drawingState.timeOfDay<6 || drawingState.timeOfDay > 18)?drawingState.brightestAurora:drawingState.sunDirection;
        gl.uniformMatrix4fv(this.uniforms.proj, gl.FALSE, drawingState.proj);
        gl.uniformMatrix4fv(this.uniforms.view, gl.FALSE, drawingState.view);
        gl.uniformMatrix4fv(this.uniforms.model, gl.FALSE, modelM);
        gl.uniform3fv(this.uniforms.lcolor,  new Float32Array(lightcolor));
        gl.uniform3fv(this.uniforms.lightdir, new Float32Array(direction));
        gl.uniform3fv(this.uniforms.cubecolor, this.color);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture1);
        gl.uniform1i(this.uniforms.uTexture, 0);

        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.vertexAttribPointer(this.attributes.vpos, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.vertexAttribPointer(this.attributes.vnormal, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
        gl.vertexAttribPointer(this.attributes.aText, 2, gl.FLOAT, false, 0, 0);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);

        disableLocations(gl, this.attributes);
    }


    grobjects.push(new House([-2.5,0.01,   -2.5]));
})();

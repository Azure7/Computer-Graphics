/**
 * Created by xu on 11/13/16.
 */
var grobjects = grobjects || [];
var m4 = twgl.m4;

(function(){
    "use restrict";
    var shaderProgram = undefined;
    var gl = undefined;

    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    };

    var calculateHalfCircle =  function(drawingState){
        gl = drawingState.gl;
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["roundhouse-vs", "roundhouse-fs"]);
        }

        this.image = new Image();
        this.image.src ="data:image/jpeg;base64,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";
        this.texture = createGLTexture(gl, this.image, true);

        // Caculate the half  circle
        var latitudeBands = 15;
        var longitudeBands =15;
        var radius = 1;

        this.vertexPositionData = [];
        this.normalData = [];
        this.textureCoordData = [];

		this.vertexPositionData = [];
		
		/*
		normal & vertex
        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber / latitudeBands*Math.PI/this.divideRatio;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                this.normalData.push(x);
                this.normalData.push(y);
                this.normalData.push(z);
                this.textureCoordData.push(u);
                this.textureCoordData.push(v);
                this.vertexPositionData.push(radius * x);
                this.vertexPositionData.push(radius * y);
                this.vertexPositionData.push(radius * z);
            }
        }
		*/
        // this.vertexPositionData = new Float32Array(this.vertexPositionData);
        // this.normalData = new Float32Array(this.normalData);

       /* 
	   index
	   this.indexData = [];
        for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (latitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                this.indexData.push(first);
                this.indexData.push(second);
                this.indexData.push(first + 1);

                this.indexData.push(second);
                this.indexData.push(second + 1);
                this.indexData.push(first + 1);
            }
        }
		*/

        var array = {
            vnormal:{numComponents:3, data:this.normalData},
            vpos:{numComponents:3, data:this.vertexPositionData},
            vTexCoor:{numComponents:2, data:this.textureCoordData},
            indices:this.indexData
        };

		/*
		color
        var vertexColor =[];
        for (var index =0; index < this.indexData.length*3; index++){
            if (index % 3 == 0) {
                vertexColor.push(1);
            } else {
                vertexColor.push(0);
            }
        }
	    */
        this.houseBuffer = twgl.createBufferInfoFromArrays(drawingState.gl,array);

    };


    function UFO(position, scalingRate, divideRatio) {

        this.position = position;// should be a vector
        this.scalingRate = scalingRate;
        this.divideRatio = divideRatio;
        this.vertexPositionData = [];
        this.normalData = [];
        this.textureCoordData = [];
        this.indexData = [];
        this.positionBuffer = undefined;
        this.normalData = undefined;
        this.indexData = undefined;
        this.color = [0.3,0.3,0.8];
        this.image = undefined;
        this.texture = undefined;
        this.houseBuffer = undefined;
        this.name = "UFO";
        this.lastTime = 0;
        this.totalAngle=0;

        this.draw = function(drawingState){

            // the matrix

            if (!this.lastTime) {
                this.lastTime = drawingState.realtime;
                drawingState.dynamiclight = this.position;
                return;
            }
            var delta = drawingState.realtime - this.lastTime;
            this.lastTime = drawingState.realtime;
            var theta = Math.PI/1500;
            this.totalAngle += theta* delta;

            this.position = [Math.sin(this.totalAngle)* 2-1,this.position[1], 2*2*Math.cos(this.totalAngle)];

            // Here I need to set the dyamiclighting for the drawing State
            drawingState.dynamiclight = this.position;

            var model = m4.multiply(m4.scaling([this.scalingRate, this.scalingRate, this.scalingRate]),
                m4.translation(this.position));
            drawingState.gl.useProgram(shaderProgram.program);
            drawingState.gl.bindTexture(gl.TEXTURE_2D, this.texture);
            twgl.setUniforms(shaderProgram,{
                view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
                cubecolor:this.color,
                model: model,
                dynamiclight:drawingState.dynamiclight});
            twgl.setBuffersAndAttributes(gl,shaderProgram,this.houseBuffer);
            twgl.drawBufferInfo(gl, gl.TRIANGLES, this.houseBuffer);
        };

        this.center = function(drawingState) {
            return position;
        }
    }
    UFO.prototype.init = calculateHalfCircle;
    var ufoPart1 = new UFO([2,2,2],1,3);
    //var ufoPart2 = new UFO([2,2.8,2],0.5,2);
    grobjects.push(ufoPart1);
    //grobjects.push(ufoPart2);
})();

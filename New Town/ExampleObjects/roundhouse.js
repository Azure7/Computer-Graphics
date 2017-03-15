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
    }
    var calculateHalfCircle =  function(drawingState){


        gl = drawingState.gl;
        this.gl = drawingState.gl;
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["roundhouse-vs", "roundhouse-fs"]);
        }

        // Caculate the half circle
        var latitudeBands = 15;
        var longitudeBands =15;
        var radius = 1;

        this.vertexPositionData = [];
        this.normalData = [];
        this.textureCoordData = [];

        // Set up image

        this.image = new Image();
        this.texture = createGLTexture(gl,this.image,true);

        //image.src = "https://farm6.staticflickr.com/5475/31145743145_862f2b93f0_m.jpg";
        //image.src = "https://farm6.staticflickr.com/5564/30725680942_e3bfe50e5e_b.jpg";

        /* function LoadTexture()
         {
         // I bet the twgl will do the binding for you.
         // sampler2D will read from the texture.
         gl.bindTexture(gl.TEXTURE_2D, this.texture);
         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

         // Option 1 : Use mipmap, select interpolation mode
         gl.generateMipmap(gl.TEXTURE_2D);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

         // Option 2: At least use linear filters
         //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
         //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

         // Optional ... if your shader & texture coordinates go outside the [0,1] range
         //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         }*/

        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber / latitudeBands*Math.PI/2;
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
        // this.vertexPositionData = new Float32Array(this.vertexPositionData);
        // this.normalData = new Float32Array(this.normalData);

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


        var array = {
            vnormal:{numComponents:3, data:this.normalData},
            vpos:{numComponents:3, data:this.vertexPositionData},
            vTexCoor:{numComponents:2, data:this.textureCoordData},
            indices:this.indexData

        };

        var vertexColor =[];
        for (var index =0; index < this.indexData.length*3; index++){
            if (index % 3 == 0) {
                vertexColor.push(1);
            } else {
                vertexColor.push(0);
            }
        }

        this.houseBuffer = twgl.createBufferInfoFromArrays(drawingState.gl,array);
    };

    function Roundhouse(position, scalingRate) {
        this.image = undefined;
        this.position = position;// should be a vector
        this.scalingRate = scalingRate;
        this.texture = undefined;
        this.vertexPositionData = [];
        this.normalData = [];
        this.textureCoordData = [];
        this.indexData = [];
        this.positionBuffer = undefined;
        this.normalData = undefined;
        this.indexData = undefined;
        this.color = [1.0,0.0,0.0];
        this.houseBuffer = undefined;
        this.name = "RoundHouse";
        this.gl = undefined;
        this.loadTexture =function()
        {
            // I bet the twgl will do the binding for you.
            // sampler2D will read from the texture.
            this.gl.bindTexture(gl.TEXTURE_2D, this.texture);
            this.gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

            // Option 1 : Use mipmap, select interpolation mode
            this.gl.generateMipmap(gl.TEXTURE_2D);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

            // Option 2: At least use linear filters
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            // Optional ... if your shader & texture coordinates go outside the [0,1] range
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }

        this.draw = function(drawingState){
            // the matrix
            var model = m4.multiply(m4.scaling([this.scalingRate, this.scalingRate, this.scalingRate]),
                m4.translation(this.position));
            model = m4.multiply(m4.axisRotation([0,1,0], Math.PI/180*90), model);

            drawingState.gl.useProgram(shaderProgram.program);
            drawingState.gl.bindTexture(gl.TEXTURE_2D, this.texture);
            twgl.setUniforms(shaderProgram,{
                view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
                cubecolor:this.color,
                model: model,
                dynamiclight:drawingState.dynamiclight });
            twgl.setBuffersAndAttributes(gl,shaderProgram,this.houseBuffer);
            twgl.drawBufferInfo(gl, gl.TRIANGLES, this.houseBuffer);
        };

        this.center = function(drawingState) {
            return position;
        }
    }

    Roundhouse.prototype.init = calculateHalfCircle;
 //   var roundhouse1 = new Roundhouse([0,0,0],1.3);
 //   var roundhouse2 = new Roundhouse([2,0,2], 0.7);
 //   var roundhouse3 = new Roundhouse([-2,0,2], 0.7);
 //   var roundhouse4 = new Roundhouse([-2,0,-2], 1);

 //   grobjects.push(roundhouse1);
 //   grobjects.push(roundhouse2);
 //   grobjects.push(roundhouse3);
 //   grobjects.push(roundhouse4);

})();
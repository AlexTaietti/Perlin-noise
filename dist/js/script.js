(function (universe) {
  ///////////////////////////////////////////////////////////////////////////////
  // HEAVILY INSPIRED BY: https://codepen.io/ImagineProgramming/full/LpOJzM    //
  //                                                                           //
  // HERE ARE SOME TRULY AMAZING RESOURCES I USED TO LEARN ABOUT PERLIN NOISE: //
  // https://www.scratchapixel.com/                                            //
  // http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf           //
  ///////////////////////////////////////////////////////////////////////////////
  function perlinSmooth(t) {
    return t * t * t * (10 + (6 * t - 15) * t);
  }

  function lerp(t, v0, v1) {
    return v0 * (1 - t) + v1 * t;
  }

  class Vec3D {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }

    dot(x, y, z) {
      return this.x * x + this.y * y + this.z * z;
    }

  }

  const Perlin3D = function () {
    //private constants
    const _scrambledIndexes = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
    const _gradients = [new Vec3D(1, 1, 0), new Vec3D(1, -1, 0), new Vec3D(-1, -1, 0), new Vec3D(-1, 1, 0), new Vec3D(1, 0, -1), new Vec3D(-1, 0, -1), new Vec3D(1, 0, 1), new Vec3D(-1, 0, 1), new Vec3D(0, 1, -1), new Vec3D(0, -1, -1), new Vec3D(0, 1, 1), new Vec3D(0, -1, 1)];

    const _permutationTable = new Array(512);

    for (let i = 0; i < 256; i++) {
      _permutationTable[i] = _permutationTable[i + 256] = _scrambledIndexes[i];
    }

    function noise(x, y, z) {
      //find the location of the cube the point we are considering sits in, in our imaginary lattice
      let X = Math.floor(x);
      let Y = Math.floor(y);
      let Z = Math.floor(z); //find the components of the vector describing the relative location of the point within the cube

      const tx = x - X;
      const ty = y - Y;
      const tz = z - Z; //wrap the coordinates of the cube if needed (just in case we are outside of the noise function's domain)

      X = X & 255;
      Y = Y & 255;
      Z = Z & 255; //find the index of a random gradient using an hash table

      const gradientIndex000 = _permutationTable[X + _permutationTable[Y + _permutationTable[Z]]] % _gradients.length;
      const gradientIndex001 = _permutationTable[X + _permutationTable[Y + _permutationTable[Z + 1]]] % _gradients.length;
      const gradientIndex010 = _permutationTable[X + _permutationTable[Y + 1 + _permutationTable[Z]]] % _gradients.length;
      const gradientIndex011 = _permutationTable[X + _permutationTable[Y + 1 + _permutationTable[Z + 1]]] % _gradients.length;
      const gradientIndex100 = _permutationTable[X + 1 + _permutationTable[Y + _permutationTable[Z]]] % _gradients.length;
      const gradientIndex101 = _permutationTable[X + 1 + _permutationTable[Y + _permutationTable[Z + 1]]] % _gradients.length;
      const gradientIndex110 = _permutationTable[X + 1 + _permutationTable[Y + 1 + _permutationTable[Z]]] % _gradients.length;
      const gradientIndex111 = _permutationTable[X + 1 + _permutationTable[Y + 1 + _permutationTable[Z + 1]]] % _gradients.length; //find the dot product between the gradients we just found and the initial point's relative position vector

      const dot000 = _gradients[gradientIndex000].dot(tx, ty, tz);

      const dot100 = _gradients[gradientIndex100].dot(tx - 1, ty, tz);

      const dot010 = _gradients[gradientIndex010].dot(tx, ty - 1, tz);

      const dot110 = _gradients[gradientIndex110].dot(tx - 1, ty - 1, tz);

      const dot001 = _gradients[gradientIndex001].dot(tx, ty, tz - 1);

      const dot101 = _gradients[gradientIndex101].dot(tx - 1, ty, tz - 1);

      const dot011 = _gradients[gradientIndex011].dot(tx, ty - 1, tz - 1);

      const dot111 = _gradients[gradientIndex111].dot(tx - 1, ty - 1, tz - 1); //remap the point's relative position vector's components using Perlin's fave polynomial function


      const smoothX = perlinSmooth(tx);
      const smoothY = perlinSmooth(ty);
      const smoothZ = perlinSmooth(tz); //start interpolating, one axis at a time

      const interpolX00 = lerp(smoothX, dot000, dot100);
      const interpolX01 = lerp(smoothX, dot001, dot101);
      const interpolX10 = lerp(smoothX, dot010, dot110);
      const interpolX11 = lerp(smoothX, dot011, dot111);
      const interpolXY0 = lerp(smoothY, interpolX00, interpolX10);
      const interpolXY1 = lerp(smoothY, interpolX01, interpolX11);
      const noise = lerp(smoothZ, interpolXY0, interpolXY1); //make some noise

      return noise;
    }

    return {
      noise
    };
  }();

  const particles = function () {
    //private variables
    let _x,
        _y,
        _hue = 0,
        _inFormation = false;

    let _RAINBOW = false;
    const _bounds = {
      x: undefined,
      y: undefined
    };
    const _particlesNumber = 8000;
    const _particleFields = 6; // <--- number of properties used to identify each particle, 4 regarding it's location and speed and two regarding any target it might be moving towards

    const _particleArrayTotalSize = _particlesNumber * _particleFields;

    const _particles = new Float32Array(_particleArrayTotalSize);

    const _speedMultiplier = 0.953;
    const _gridShrinkFactor = 190;
    const _zComponentShrink = 4000;
    const _perlin = Perlin3D;
    const _formationHampering = 0.0089;
    const _shapeSharpness = 19.8;
    const _formationNoiseIntensity = 1;
    const _noiseIntensity = 0.8;
    const random = Math.random;
    const PI2 = Math.PI * 2;
    const SIN = Math.sin;
    const COS = Math.cos;
    const NOW = Date.now;

    function init(worldWidth, worldHeight, rainbowMode = false) {
      updateBounds(worldWidth, worldHeight);

      for (let i = 0; i < _particleArrayTotalSize; i += _particleFields) {
        _particles[i] = random() * _bounds.x;
        _particles[i + 1] = random() * _bounds.y;
        _particles[i + 2] = 0;
        _particles[i + 3] = 0;
        _particles[i + 4] = -1;
        _particles[i + 5] = -1;
      }

      if (rainbowMode) _RAINBOW = true;
    }

    function initFormation(imageData) {
      const data = imageData.data;

      for (let i = 0, particleArrayPointer = ~~(random() * _particlesNumber), pixelIndex = undefined; i < data.length; i++) {
        if (data[i] > 0 && (i - 3) % 4 === 0) {
          pixelIndex = (i - 3) / 4;
          _particles[_particleFields * (particleArrayPointer % _particlesNumber) + 4] = pixelIndex % imageData.width;
          _particles[_particleFields * (particleArrayPointer++ % _particlesNumber) + 5] = pixelIndex / imageData.width;
        }
      }

      _inFormation = true;
    }

    function endFormation() {
      for (let i = 0; i < _particleArrayTotalSize; i += _particleFields) {
        _particles[i + 4] = -1;
        _particles[i + 5] = -1;
      }

      _inFormation = false;
    }

    function areInFormation() {
      return _inFormation;
    }

    function updateBounds(worldWidth, worldHeight) {
      _bounds.x = worldWidth;
      _bounds.y = worldHeight;
    }

    function animateParticles(context) {
      //draw background
      context.fillStyle = `hsl(0, 100%, 0%)`;
      context.fillRect(0, 0, _bounds.x, _bounds.y);
      context.fillStyle = _RAINBOW ? `hsl(${_hue += .4}, 100%, 50%)` : `hsl(0, 100%, 50%)`;

      for (let i = 0, noiseX, noiseY; i < _particleArrayTotalSize; i += _particleFields) {
        noiseX = _perlin.noise(_particles[i] / _gridShrinkFactor, _particles[i + 1] / _gridShrinkFactor, -NOW() / _zComponentShrink);
        noiseY = _perlin.noise(_particles[i] / _gridShrinkFactor, _particles[i + 1] / _gridShrinkFactor, NOW() / _zComponentShrink); //approach coordinates of target pixel if one has been assigned to this specific particle

        if (_particles[i + 4] > 0 && _particles[i + 5] > 0) {
          _particles[i + 2] += (_particles[i + 4] - _particles[i]) * _formationHampering + (random() / _shapeSharpness * COS(random() * PI2) + noiseX * _formationNoiseIntensity);
          _particles[i + 3] += (_particles[i + 5] - _particles[i + 1]) * _formationHampering + (random() / _shapeSharpness * SIN(random() * PI2) + noiseY * _formationNoiseIntensity);
        } else {
          //simply change velocity components based on noise
          _particles[i + 2] += random() / 4 * COS(random() * PI2) + noiseX * _noiseIntensity;
          _particles[i + 3] += random() / 4 * SIN(random() * PI2) + noiseY * _noiseIntensity;
        } //slow the current particle and move it around


        _x = _particles[i] += _particles[i + 2] *= _speedMultiplier;
        _y = _particles[i + 1] += _particles[i + 3] *= _speedMultiplier; //wrap particles around edges only if they have not been assigned a target pixel

        if (_particles[i + 4] < 0 && _particles[i + 5] < 0) {
          if (_x > _bounds.x) {
            _particles[i] = 0;
          } else if (_x < 0) {
            _particles[i] = _bounds.x;
          }

          if (_y > _bounds.y) {
            _particles[i + 1] = 0;
          } else if (_y < 0) {
            _particles[i + 1] = _bounds.y;
          }
        } //draw particles


        context.fillRect(_x, _y, 1, 1);
      }
    }

    return {
      init,
      animateParticles,
      initFormation,
      endFormation,
      updateBounds,
      areInFormation
    };
  }(); //set-up


  const canvas = document.getElementsByTagName('canvas')[0];
  const $ = canvas.getContext('2d');
  const mCanvas = document.createElement('canvas');
  const m$ = mCanvas.getContext('2d');
  let width = mCanvas.width = canvas.width = window.innerWidth;
  let height = mCanvas.height = canvas.height = window.innerHeight;
  m$.font = "100px sans-serif";
  m$.textAlign = "center";
  m$.textBaseline = "middle";
  particles.init(width, height, true); //Fell free to fork this pen and add anything you'd like to the array!

  const greetings = ['hello', 'ciao', 'salut', 'hola', 'हेलो', '你好', '今日は'];

  function write(string) {
    m$.fillText(string, width / 2, height / 2);
    particles.initFormation(m$.getImageData(0, 0, width, height));
  }

  function initialWrite() {
    write('hello');
    document.addEventListener('click', function () {
      if (!particles.areInFormation()) {
        write(pickRandom(greetings));
      } else {
        reset();
      }
    });
  }

  function reset() {
    particles.endFormation();
    m$.clearRect(0, 0, width, height);
  }

  function pickRandom(choises) {
    return choises[~~(Math.random() * choises.length)];
  }

  window.addEventListener('resize', function () {
    width = mCanvas.width = canvas.width = window.innerWidth;
    height = mCanvas.height = canvas.height = window.innerHeight;
    particles.updateBounds(width, height);
    if (particles.areInFormation()) particles.endFormation();
    m$.font = "100px sans-serif";
    m$.textAlign = "center";
    m$.textBaseline = "middle";
  });
  window.setTimeout(initialWrite, 2000, 'hello');

  (function awesome() {
    //do the thing...
    particles.animateParticles($); //repeat

    window.requestAnimationFrame(awesome);
  })(); //kick off awesomeness

})(window);
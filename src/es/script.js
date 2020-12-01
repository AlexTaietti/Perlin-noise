(function(universe){

  function perlinSmooth (t) { return t*t*t*(10+(6*t-15)*t); }

  function lerp (t, v0, v1){ return v0 * (1 - t) + v1 * t; }

  class Vec3D {

    constructor (x = 0, y = 0, z = 0){
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }

    dot(x, y, z){ return this.x * x + this.y * y + this.z * z; }

    add (other){
      this.x += other.x;
      this.y += other.y;
      this.z += other.z;
      return this;
    }

    mul (scalar) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      return this;
    }

    clone () { return new Vec3D(this.x, this.y, this.z); }

  }

  const Perlin3D = (function(){

    //private constants
    const _scrambledIndexes = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

    const _gradients = [
      new Vec3D(1, 1, 0),  new Vec3D(1, -1, 0),  new Vec3D(-1, -1, 0), new Vec3D(-1, 1, 0),
      new Vec3D(1, 0, -1), new Vec3D(-1, 0, -1), new Vec3D(1, 0, 1),   new Vec3D(-1, 0, 1),
      new Vec3D(0, 1, -1), new Vec3D(0, -1, -1), new Vec3D(0, 1, 1),   new Vec3D(0, -1, 1)
    ];

    const _permutationTable = new Array(512);

    for(let i=0; i < 256; i++){
      _permutationTable[i] = _permutationTable[i + 256] = _scrambledIndexes[i];
    }

    function noise(x, y, z){

      let X = Math.floor(x);
      let Y = Math.floor(y);
      let Z = Math.floor(z);

      const tx = x - X;
      const ty = y - Y;
      const tz = z - Z;

      X = X & 255;
      Y = Y & 255;
      Z = Z & 255;

      const gradientIndex000 = _permutationTable[X + _permutationTable[Y + _permutationTable[Z]]] % _gradients.length;
      const gradientIndex001 = _permutationTable[X + _permutationTable[Y + _permutationTable[Z + 1]]] % _gradients.length;
      const gradientIndex010 = _permutationTable[X + _permutationTable[Y + 1 + _permutationTable[Z]]] % _gradients.length;
      const gradientIndex011 = _permutationTable[X + _permutationTable[Y + 1 + _permutationTable[Z + 1]]] % _gradients.length;
      const gradientIndex100 = _permutationTable[X + 1 + _permutationTable[Y + _permutationTable[Z]]] % _gradients.length;
      const gradientIndex101 = _permutationTable[X + 1 + _permutationTable[Y + _permutationTable[Z + 1]]] % _gradients.length;
      const gradientIndex110 = _permutationTable[X + 1 + _permutationTable[Y + 1 + _permutationTable[Z]]] % _gradients.length;
      const gradientIndex111 = _permutationTable[X + 1 + _permutationTable[Y + 1 + _permutationTable[Z + 1]]] % _gradients.length;

      const gradient000 = _gradients[gradientIndex000].dot(tx, ty, tz);
      const gradient100 = _gradients[gradientIndex100].dot(tx - 1, ty, tz);
      const gradient010 = _gradients[gradientIndex010].dot(tx, ty - 1, tz);
      const gradient110 = _gradients[gradientIndex110].dot(tx - 1, ty - 1, tz);
      const gradient001 = _gradients[gradientIndex001].dot(tx, ty, tz - 1);
      const gradient101 = _gradients[gradientIndex101].dot(tx - 1, ty, tz - 1);
      const gradient011 = _gradients[gradientIndex011].dot(tx, ty - 1, tz - 1);
      const gradient111 = _gradients[gradientIndex111].dot(tx - 1, ty - 1, tz - 1);

      const smoothX = perlinSmooth(tx);
      const smoothY = perlinSmooth(ty);
      const smoothZ = perlinSmooth(tz);

      const interpolX00 = lerp(smoothX, gradient000, gradient100);
      const interpolX01 = lerp(smoothX, gradient001, gradient101);
      const interpolX10 = lerp(smoothX, gradient010, gradient110);
      const interpolX11 = lerp(smoothX, gradient011, gradient111);

      const interpolXY0 = lerp(smoothY, interpolX00, interpolX10);
      const interpolXY1 = lerp(smoothY, interpolX01, interpolX11);

      const noise = lerp(smoothZ, interpolXY0, interpolXY1);

      return noise;

    }

    return { noise };

  })();

  const particles = (function () {

    //private variables
    let _x, _y;

    const _bounds = { x: undefined, y: undefined };
    const _particlesNumber = 6000;
    const _particleFields = 6; // <--- number of properties used to identify each particle, 4 regarding it's location and speed and two regarding any target it might be moving towards
    const _particleArrayTotalSize = _particlesNumber * _particleFields;
    const _particles = new Float32Array(_particleArrayTotalSize);
    const _speedMultiplier = 0.94;
    const _gridShrinkFactor = 200;
    const _zComponentShrink = 4000;
    const _perlin = Perlin3D;
    const _formationHampering = 0.01;

    const random = Math.random;
    const PI2 = Math.PI * 2;
    const SIN = Math.sin;
    const COS = Math.cos;
    const NOW = Date.now;


    function init (worldWidth, worldHeight) {

      updateBounds(worldWidth, worldHeight);

      for (let i = 0; i < _particleArrayTotalSize; i+=_particleFields) {
        _particles[i] = random() * _bounds.x;
        _particles[i + 1] = random() * _bounds.y;
        _particles[i + 2] = 0;
        _particles[i + 3] = 0;
        _particles[i + 4] = -1;
        _particles[i + 5] = -1;
      }

    }


    function initFormation (imageData) {

      const data = imageData.data;

      for(let i=0, pixelIndex = undefined, n=0; i < data.length; i++){
        if(data[i] > 0 && (i - 3) % 4 === 0){
          pixelIndex = (i - 3) / 4;
          _particles[_particleFields * n + 4] = pixelIndex % imageData.width;
          _particles[_particleFields * (n++) + 5] = pixelIndex / imageData.width;
        }
      }

    }

    function endFormation () {
      for (let i = 0; i < _particleArrayTotalSize; i+=_particleFields) {
        _particles[i + 4] = -1;
        _particles[i + 5] = -1;
      }
    }

    function updateBounds (worldWidth, worldHeight) {
      _bounds.x = worldWidth;
      _bounds.y = worldHeight;
    }

    function animateParticles(context) {

      //draw background
      context.fillStyle = "rgb(0, 0, 0)";
      context.fillRect(0, 0, _bounds.x, _bounds.y);

      context.fillStyle = 'rgb(255, 255, 255)';

      for (let i = 0; i < _particleArrayTotalSize; i += _particleFields) {

        //change velocity components based on noise
        _particles[i + 2] += ( (random()/4) * COS(random()*(PI2)) + _perlin.noise(_particles[i]/_gridShrinkFactor, _particles[i + 1]/_gridShrinkFactor, -NOW()/_zComponentShrink) );
        _particles[i + 3] += ( (random()/4) * SIN(random()*(PI2)) + _perlin.noise(_particles[i]/_gridShrinkFactor, _particles[i + 1]/_gridShrinkFactor, NOW()/_zComponentShrink) );

        if(_particles[i + 4] > 0 && _particles[i + 5] > 0){
          _particles[i + 2] += ((_particles[i + 4] - _particles[i]) * _formationHampering);
          _particles[i + 3] += ((_particles[i + 5] - _particles[i + 1]) * _formationHampering);
        }

        //slow the current particle and move it around
        _x = _particles[i]     += (_particles[i + 2] *= _speedMultiplier);
        _y = _particles[i + 1] += (_particles[i + 3] *= _speedMultiplier);

        if(_particles[i + 4] < 0 && _particles[i + 5] < 0){
          //wrap particles around edges
          if (_x > _bounds.x) {
            _particles[i] = 0;
          } else if(_x < 0){
            _particles[i] = _bounds.x;
          }

          if (_y > _bounds.y) {
            _particles[i + 1] = 0;
          } else if(_y < 0){
            _particles[i + 1] = _bounds.y;
          }
        }

        //draw particles
        context.fillRect(_x, _y, 1, 1);

      }

    }

    return { init, animateParticles, initFormation, endFormation, updateBounds };

  })();


  //set-up
  const canvas = document.getElementsByTagName('canvas')[0];
  const $ = canvas.getContext('2d');

  const mCanvas = document.createElement('canvas');
  const m$ = mCanvas.getContext('2d');

  const w = mCanvas.width = canvas.width = window.innerWidth;
  const h = mCanvas.height = canvas.height = window.innerHeight;

  m$.font="130px sans-serif";
  m$.textAlign = "center";

  particles.init(w, h);

  (function awesome () {

    //do the thing...
    particles.animateParticles($);

    //repeat
    window.requestAnimationFrame(awesome);

  })(); //kick off awesomeness

  window.setTimeout(function(){

    m$.fillText("Hi!", m$.canvas.width/2, m$.canvas.height/2);
    particles.initFormation(m$.getImageData(0, 0, m$.canvas.width, m$.canvas.height));

    document.addEventListener('mousedown', particles.endFormation);

  }, 2500);


})(window);
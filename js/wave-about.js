// js/wave-about.js
// Статичная картинка. Эффект волны включается ТОЛЬКО под курсором.
// Убрана sRGB-текстура и любое "цветокорректирование", чтобы не было красного сдвига.

(function () {
  const canvas = document.getElementById('ripple');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) {
    console.warn('WebGL2 не поддерживается');
    return;
  }

  // ==== Канвас: размер под DPR ====
  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  function fit() {
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }
  fit();
  resize();
  window.addEventListener('resize', resize);

  // ==== Шейдеры ====
  const vs = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 a_pos;
  out vec2 v_uv;
  void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }`;

  const fs = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  out vec4 fragColor;

  uniform sampler2D u_tex;
  uniform vec2  u_resolution;
  uniform float u_time;
  uniform int   u_hasTex;

  // Управление эффектом
  uniform vec2  u_pointer;     // [0..1] в координатах UV
  uniform int   u_pointerOn;   // 0/1 — курсор "внутри" области
  uniform float u_radius;      // радиус воздействия (в долях ширины, UV)
  uniform float u_amp;         // амплитуда

  // Волнa активна только в окрестности курсора и когда u_pointerOn == 1
  vec2 warp(vec2 uv){
    if(u_pointerOn == 0) return uv;

    float dist = distance(uv, u_pointer);
    float k = smoothstep(1.0, 0.0, dist / u_radius); // 1 в центре -> 0 на границе
    float t = u_time * 0.8;

    // Малая деформация, чтобы не "ломать" цвета и пиксели
    float a = u_amp * k;
    float w1 = sin((uv.y + t) * 10.0) * 0.004 * a;
    float w2 = cos((uv.x - t) * 10.0) * 0.004 * a;

    // Радиальная "пульсация" от курсора
    float ring = sin(20.0 * dist - t * 6.28318) * 0.003 * a;
    return uv + vec2(w1 + ring * (uv.x - u_pointer.x), w2 + ring * (uv.y - u_pointer.y));
  }

  void main(){
    vec2 uv = v_uv;
    vec2 u = warp(uv);

    if(u_hasTex == 1){
      // Никаких цветовых фильтров — возвращаем текстуру как есть.
      fragColor = texture(u_tex, u);
    } else {
      // Фолбэк-градиент (если текстура не подгрузилась)
      vec3 c = vec3(uv, 0.5);
      fragColor = vec4(c, 1.0);
    }
  }`;

  // ==== Компиляция ====
  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error(log || 'Shader compile error');
    }
    return sh;
  }
  function program(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(p);
      gl.deleteProgram(p);
      throw new Error(log || 'Program link error');
    }
    return p;
  }
  const prog = program(vs, fs);
  gl.useProgram(prog);

  // ==== Геометрия (full-screen quad) ====
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1, -1,  1,
    -1,  1,  1, -1,  1,  1
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // ==== Юниформы ====
  const u_time       = gl.getUniformLocation(prog, 'u_time');
  const u_resolution = gl.getUniformLocation(prog, 'u_resolution');
  const u_hasTex     = gl.getUniformLocation(prog, 'u_hasTex');
  const u_tex        = gl.getUniformLocation(prog, 'u_tex');
  const u_pointer    = gl.getUniformLocation(prog, 'u_pointer');
  const u_pointerOn  = gl.getUniformLocation(prog, 'u_pointerOn');
  const u_radius     = gl.getUniformLocation(prog, 'u_radius');
  const u_amp        = gl.getUniformLocation(prog, 'u_amp');

  gl.uniform1i(u_tex, 0);

  // ==== Текстура без sRGB/гаммы (чтобы не «краснело») ====
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Важно: отключаем браузерную конверсию цветового пространства у HTMLImageElement
  // и не используем sRGB-внутренний формат.
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.disable(gl.BLEND);

  let hasTex = 0;

  function loadImageFromDom() {
    const imgEl = document.getElementById('srcImg');
    return new Promise((resolve, reject) => {
      if (!imgEl) { reject(new Error('img#srcImg не найден')); return; }
      if (imgEl.complete && imgEl.naturalWidth > 0) resolve(imgEl);
      else {
        imgEl.addEventListener('load', () => resolve(imgEl), { once: true });
        imgEl.addEventListener('error', () => reject(new Error('Ошибка загрузки изображения')), { once: true });
      }
    });
  }

  function uploadTexture(img) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // ВАЖНО: обычный RGBA8 (без sRGB), данные из HTMLImageElement
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, img);
    hasTex = 1;
  }

  // ==== Управление курсором ====
  let pointerOn = 0;                  // курсор внутри hero
  let pointerUV = [0.5, 0.5];         // координаты в UV
  const hero = document.getElementById('hero') || document.body;

  function toUV(ev) {
    const r = hero.getBoundingClientRect();
    const x = (ev.clientX - r.left) / Math.max(1, r.width);
    const y = (ev.clientY - r.top)  / Math.max(1, r.height);
    return [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))];
  }

  hero.addEventListener('pointerenter', (ev) => {
    pointerOn = 1;
    pointerUV = toUV(ev);
  });
  hero.addEventListener('pointerleave', () => {
    pointerOn = 0; // эффект выключен
  });
  hero.addEventListener('pointermove', (ev) => {
    pointerUV = toUV(ev);
  });

  // Параметры эффекта: радиус и амплитуда (можете подстроить)
  const EFFECT_RADIUS = 0.718;  // 18% ширины блока
  const EFFECT_AMP    = 1.0;   // 1 — базово; уменьшите если нужно ещё мягче

  // ==== Рендер ====
  loadImageFromDom()
    .then(uploadTexture)
    .catch((e) => {
      console.warn('[wave-about] Текстура не загружена:', e.message);
      hasTex = 0;
    })
    .finally(loop);

  let t0 = performance.now();
  function loop() {
    resize();

    const t = (performance.now() - t0) / 1000;
    gl.useProgram(prog);
    gl.uniform1f(u_time, t);
    gl.uniform2f(u_resolution, canvas.width, canvas.height);
    gl.uniform1i(u_hasTex, hasTex);

    // Курсор и сила эффекта
    gl.uniform2f(u_pointer, pointerUV[0], pointerUV[1]);
    gl.uniform1i(u_pointerOn, pointerOn);
    gl.uniform1f(u_radius, EFFECT_RADIUS);
    gl.uniform1f(u_amp, EFFECT_AMP);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(loop);
  }
})();

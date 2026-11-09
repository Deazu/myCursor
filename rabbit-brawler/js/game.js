(() => {
  "use strict";

  const W = 320;
  const H = 180;
  const GROUND_Y = 148;
  const SCREENS = 6;
  const ENEMIES_PER_SCREEN = 5;
  const TOTAL_ENEMIES = SCREENS * ENEMIES_PER_SCREEN;
  const PLAYER_MAX_HP = 3;
  const ENEMY_DAMAGE = 0.5;
  const PUNCH_DAMAGE = 2;
  const KICK_DAMAGE = 1;
  const PUNCH_RANGE = 22;
  const KICK_RANGE = 38;
  const ENEMY_HP = 2;

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const overlay = document.getElementById("overlay");
  const btnStart = document.getElementById("btn-start");
  const heartsEl = document.getElementById("hearts");
  const screenInfo = document.getElementById("screen-info");
  const killCount = document.getElementById("kill-count");

  const keys = Object.create(null);
  const touch = {
    left: false,
    right: false,
    up: false,
    down: false,
    punch: false,
    kick: false,
  };

  let state = "title"; // title | playing | clear | win | lose
  let message = "";
  let screenIndex = 0;
  let kills = 0;
  let cameraX = 0;
  let screenFlash = 0;
  let lettuceTimer = 0;
  let attackLock = null; // only one carrot attacks at a time
  let attackCooldown = 0; // frames before another carrot may start a strike cycle
  let screenGrace = 0; // spawn protection / no aggression yet

  const player = {
    x: 40,
    y: GROUND_Y - 28,
    w: 16,
    h: 28,
    vx: 0,
    vy: 0,
    facing: 1,
    hp: PLAYER_MAX_HP,
    invuln: 0,
    attack: null, // { type, frame, hit }
    anim: 0,
    walking: false,
  };

  let enemies = [];
  let lettuces = [];
  let particles = [];
  let floatTexts = [];

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function screenBounds() {
    const left = screenIndex * W;
    return { left, right: left + W };
  }

  function resetLevel() {
    screenIndex = 0;
    kills = 0;
    cameraX = 0;
    player.x = 40;
    player.y = GROUND_Y - player.h;
    player.vx = 0;
    player.vy = 0;
    player.facing = 1;
    player.hp = PLAYER_MAX_HP;
    player.invuln = 90;
    player.attack = null;
    lettuces = [];
    particles = [];
    floatTexts = [];
    attackLock = null;
    attackCooldown = 45;
    screenGrace = 90;
    lettuceTimer = 120;
    spawnScreenEnemies();
    updateHud();
  }

  function spawnScreenEnemies() {
    enemies = [];
    attackLock = null;
    attackCooldown = 30;
    const { left } = screenBounds();
    for (let i = 0; i < ENEMIES_PER_SCREEN; i++) {
      enemies.push({
        id: `${screenIndex}-${i}`,
        x: left + 170 + i * 26 + (i % 2) * 10,
        y: GROUND_Y - 24 - (i % 3) * 2,
        w: 14,
        h: 24,
        hp: ENEMY_HP,
        facing: -1,
        state: "idle", // idle | approach | windup | strike | hurt | dead
        timer: 40 + i * 18,
        anim: i * 3,
        hitFlash: 0,
      });
    }
  }

  function updateHud() {
    screenInfo.textContent = `PANTALLA ${Math.min(screenIndex + 1, SCREENS)}/${SCREENS}`;
    killCount.textContent = `${kills}/${TOTAL_ENEMIES}`;
    heartsEl.innerHTML = "";
    for (let i = 0; i < PLAYER_MAX_HP; i++) {
      const heart = document.createElement("div");
      heart.className = "heart";
      const remain = player.hp - i;
      if (remain <= 0) heart.classList.add("empty");
      else if (remain < 1) heart.classList.add("half");
      heartsEl.appendChild(heart);
    }
  }

  function spawnLettuce() {
    if (lettuces.length > 0 || player.hp >= PLAYER_MAX_HP) return;
    const { left, right } = screenBounds();
    lettuces.push({
      x: left + 40 + Math.random() * (W - 80),
      y: GROUND_Y - 40 - Math.random() * 20,
      w: 12,
      h: 10,
      bob: Math.random() * Math.PI * 2,
      life: 600,
    });
  }

  function addFloat(x, y, text, color) {
    floatTexts.push({ x, y, text, color, life: 40 });
  }

  function addParticles(x, y, color, n = 6) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2.4,
        vy: -Math.random() * 2.2 - 0.4,
        life: 18 + Math.random() * 12,
        color,
      });
    }
  }

  function startAttack(type) {
    if (state !== "playing" || player.attack) return;
    player.attack = { type, frame: 0, hit: false };
  }

  function attackHitbox() {
    if (!player.attack) return null;
    const isKick = player.attack.type === "kick";
    const range = isKick ? KICK_RANGE : PUNCH_RANGE;
    const height = isKick ? 14 : 12;
    const yOff = isKick ? 10 : 6;
    const x =
      player.facing === 1 ? player.x + player.w - 2 : player.x - range + 2;
    return {
      x,
      y: player.y + yOff,
      w: range,
      h: height,
      damage: isKick ? KICK_DAMAGE : PUNCH_DAMAGE,
    };
  }

  function damagePlayer(amount) {
    if (player.invuln > 0 || state !== "playing") return;
    player.hp = Math.max(0, +(player.hp - amount).toFixed(1));
    player.invuln = 90;
    const bounds = screenBounds();
    player.x = clamp(player.x - player.facing * 12, bounds.left + 8, bounds.right - player.w - 8);
    screenFlash = 8;
    attackCooldown = 50;
    addParticles(player.x + player.w / 2, player.y + 10, "#9b2b1f", 8);
    addFloat(player.x, player.y - 4, `-${amount}`, "#ff6b5a");
    updateHud();
    if (player.hp <= 0) {
      state = "lose";
      message = "¡GAME OVER!\nEl conejo cayó ante las zanahorias zombies.";
      showOverlay(true);
    }
  }

  function killEnemy(enemy) {
    enemy.state = "dead";
    enemy.timer = 18;
    kills += 1;
    addParticles(enemy.x + enemy.w / 2, enemy.y + 8, "#d66a1f", 10);
    addFloat(enemy.x, enemy.y - 6, "KO!", "#ffe07a");
    if (attackLock === enemy.id) attackLock = null;
    updateHud();
  }

  function maybeAdvanceScreen() {
    if (state !== "playing") return;

    const anyLiving = enemies.some((e) => e.state !== "dead");
    if (anyLiving) return;

    // keep corpses until their death animation ends
    enemies = enemies.filter((e) => e.timer > 0);
    if (enemies.length > 0) return;

    if (kills >= TOTAL_ENEMIES) {
      state = "win";
      message = "¡NIVEL COMPLETADO!\n30 zanahorias zombies eliminadas.";
      showOverlay(true);
      return;
    }

    state = "clear";
    message = `Pantalla ${screenIndex + 1} limpia.\nAvanza al bosque más profundo...`;
    showOverlay(true);
  }

  function goNextScreen() {
    screenIndex += 1;
    const { left } = screenBounds();
    cameraX = left;
    player.x = left + 36;
    player.y = GROUND_Y - player.h;
    player.attack = null;
    player.invuln = 75;
    lettuces = [];
    lettuceTimer = 160;
    screenGrace = 75;
    spawnScreenEnemies();
    state = "playing";
    showOverlay(false);
    updateHud();
  }

  function showOverlay(visible) {
    if (!visible) {
      overlay.classList.add("hidden");
      return;
    }
    const panel = overlay.querySelector(".panel");
    const lines = (message || "").split("\n");
    const isTitle = state === "title";
    panel.innerHTML = `
      <h1>${isTitle ? "CONEJO PULVERIZADOR" : state === "win" ? "¡VICTORIA!" : state === "lose" ? "GAME OVER" : "PANTALLA LIMPIA"}</h1>
      ${isTitle ? '<p class="tagline">Beat\'em up · demo 1 nivel · estilo NES</p>' : ""}
      ${lines.map((l) => `<p>${l}</p>`).join("")}
      ${
        isTitle
          ? `<ul class="tips">
              <li>Puño (Z / A): corto, derrota en 1 golpe</li>
              <li>Patada (X / B): más alcance, derrota en 2 golpes</li>
              <li>Come lechugas para recuperar vida</li>
              <li>5 zanahorias por pantalla · 6 pantallas</li>
            </ul>`
          : ""
      }
      <button id="btn-start" type="button">${
        state === "clear" ? "SIGUIENTE PANTALLA" : state === "playing" ? "CONTINUAR" : isTitle ? "EMPEZAR" : "REINTENTAR"
      }</button>
      <p class="hint desktop-hint">Teclado: ←→↑↓ / WASD · Z puño · X patada</p>
    `;
    overlay.classList.remove("hidden");
    document.getElementById("btn-start").addEventListener("click", onStartClick);
  }

  function onStartClick() {
    if (state === "clear") {
      goNextScreen();
      return;
    }
    resetLevel();
    state = "playing";
    showOverlay(false);
  }

  btnStart.addEventListener("click", onStartClick);

  // ---- Input ----
  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    if (state === "playing") {
      if (e.code === "KeyZ" || e.code === "KeyJ") startAttack("punch");
      if (e.code === "KeyX" || e.code === "KeyK") startAttack("kick");
    }
    if ((state === "title" || state === "lose" || state === "win" || state === "clear") && (e.code === "Enter" || e.code === "Space")) {
      onStartClick();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  function bindHold(el, on, off) {
    const start = (ev) => {
      ev.preventDefault();
      on();
      el.classList.add("active");
    };
    const end = (ev) => {
      ev.preventDefault();
      off();
      el.classList.remove("active");
    };
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointerleave", end);
    el.addEventListener("pointercancel", end);
  }

  document.querySelectorAll(".pad").forEach((btn) => {
    const dir = btn.dataset.dir;
    bindHold(
      btn,
      () => {
        touch[dir] = true;
      },
      () => {
        touch[dir] = false;
      }
    );
  });

  bindHold(
    document.getElementById("btn-punch"),
    () => {
      touch.punch = true;
      startAttack("punch");
    },
    () => {
      touch.punch = false;
    }
  );
  bindHold(
    document.getElementById("btn-kick"),
    () => {
      touch.kick = true;
      startAttack("kick");
    },
    () => {
      touch.kick = false;
    }
  );

  // ---- Update ----
  function updatePlayer() {
    if (player.invuln > 0) player.invuln -= 1;
    player.anim += 1;

    const left = keys.ArrowLeft || keys.KeyA || touch.left;
    const right = keys.ArrowRight || keys.KeyD || touch.right;
    const up = keys.ArrowUp || keys.KeyW || touch.up;
    const down = keys.ArrowDown || keys.KeyS || touch.down;

    let speed = 1.35;
    player.vx = 0;
    player.vy = 0;
    player.walking = false;

    if (!player.attack) {
      if (left) {
        player.vx = -speed;
        player.facing = -1;
        player.walking = true;
      }
      if (right) {
        player.vx = speed;
        player.facing = 1;
        player.walking = true;
      }
      if (up) {
        player.vy = -speed * 0.85;
        player.walking = true;
      }
      if (down) {
        player.vy = speed * 0.85;
        player.walking = true;
      }
    }

    const bounds = screenBounds();
    const minY = GROUND_Y - 52;
    const maxY = GROUND_Y - player.h;
    player.x = clamp(player.x + player.vx, bounds.left + 8, bounds.right - player.w - 8);
    player.y = clamp(player.y + player.vy, minY, maxY);

    // only allow advancing past mid-right when screen cleared — gated by overlay
    cameraX = bounds.left;

    if (player.attack) {
      player.attack.frame += 1;
      const maxFrame = player.attack.type === "kick" ? 14 : 10;
      if (!player.attack.hit && player.attack.frame >= 3 && player.attack.frame <= maxFrame - 3) {
        const hb = attackHitbox();
        for (const e of enemies) {
          if (e.state === "dead") continue;
          if (aabb(hb, e)) {
            player.attack.hit = true;
            e.hp -= hb.damage;
            e.hitFlash = 8;
            e.state = "hurt";
            e.timer = 10;
            e.x += player.facing * 6;
            addParticles(e.x + e.w / 2, e.y + 8, "#fff3c4", 5);
            addFloat(e.x, e.y, hb.damage >= 2 ? "PUÑO!" : "PATADA!", "#fff");
            if (e.hp <= 0) killEnemy(e);
            break;
          }
        }
      }
      if (player.attack.frame >= maxFrame) player.attack = null;
    }
  }

  function chooseAttacker() {
    if (screenGrace > 0 || attackCooldown > 0) return null;

    if (attackLock) {
      const still = enemies.find((e) => e.id === attackLock && e.state !== "dead");
      if (still) return still;
      attackLock = null;
    }
    const candidates = enemies
      .filter((e) => e.state !== "dead")
      .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x));
    if (!candidates.length) return null;
    attackLock = candidates[0].id;
    return candidates[0];
  }

  function updateEnemies() {
    if (screenGrace > 0) screenGrace -= 1;
    if (attackCooldown > 0) attackCooldown -= 1;

    const attacker = chooseAttacker();

    for (const e of enemies) {
      e.anim += 1;
      if (e.hitFlash > 0) e.hitFlash -= 1;

      if (e.state === "dead") {
        e.timer -= 1;
        continue;
      }

      const isAttacker = attacker && attacker.id === e.id;
      const dx = player.x - e.x;
      e.facing = dx >= 0 ? 1 : -1;

      // keep crowds from stacking on the player while waiting
      if (!isAttacker) {
        if (e.state === "windup" || e.state === "strike") e.state = "idle";
        e.x += Math.sin(e.anim * 0.05 + e.id.length) * 0.12;
        const minSep = 22;
        for (const other of enemies) {
          if (other === e || other.state === "dead") continue;
          const gap = other.x - e.x;
          if (Math.abs(gap) < minSep) e.x -= Math.sign(gap || 1) * 0.35;
        }
        // hold a bit away from the rabbit
        if (Math.abs(dx) < 36) e.x -= e.facing * 0.4;
        e.y = clamp(e.y, GROUND_Y - 50, GROUND_Y - e.h);
        continue;
      }

      if (e.state === "hurt") {
        e.timer -= 1;
        if (e.timer <= 0) e.state = "approach";
        continue;
      }

      if (e.state === "idle" || e.state === "approach") {
        e.state = "approach";
        const dist = Math.abs(dx);
        const desiredY = player.y + 2;
        if (Math.abs(e.y - desiredY) > 1) e.y += Math.sign(desiredY - e.y) * 0.65;
        if (dist > 22) {
          e.x += e.facing * 0.65;
        } else {
          e.state = "windup";
          e.timer = 26;
        }
        continue;
      }

      if (e.state === "windup") {
        e.timer -= 1;
        if (e.timer <= 0) {
          e.state = "strike";
          e.timer = 12;
        }
        continue;
      }

      if (e.state === "strike") {
        e.timer -= 1;
        if (e.timer === 7) {
          const hitbox = {
            x: e.facing === 1 ? e.x + e.w - 2 : e.x - 16,
            y: e.y + 6,
            w: 16,
            h: 14,
          };
          if (aabb(hitbox, player)) damagePlayer(ENEMY_DAMAGE);
        }
        if (e.timer <= 0) {
          e.state = "idle";
          attackLock = null;
          attackCooldown = 55;
        }
      }
    }

    maybeAdvanceScreen();
  }

  function updateLettuce() {
    lettuceTimer -= 1;
    if (lettuceTimer <= 0) {
      spawnLettuce();
      lettuceTimer = player.hp <= 1.5
        ? 160 + Math.floor(Math.random() * 120)
        : 260 + Math.floor(Math.random() * 200);
    }

    for (const leaf of lettuces) {
      leaf.bob += 0.08;
      leaf.life -= 1;
      if (aabb(player, leaf)) {
        player.hp = Math.min(PLAYER_MAX_HP, +(player.hp + 1).toFixed(1));
        addFloat(leaf.x, leaf.y - 6, "+1 VIDA", "#7dff7a");
        addParticles(leaf.x + 6, leaf.y + 4, "#5fbf45", 8);
        leaf.life = 0;
        updateHud();
      }
    }
    lettuces = lettuces.filter((l) => l.life > 0);
  }

  function updateFx() {
    if (screenFlash > 0) screenFlash -= 1;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life -= 1;
    }
    particles = particles.filter((p) => p.life > 0);
    for (const f of floatTexts) {
      f.y -= 0.5;
      f.life -= 1;
    }
    floatTexts = floatTexts.filter((f) => f.life > 0);
  }

  function update() {
    if (state !== "playing") return;
    updatePlayer();
    updateEnemies();
    updateLettuce();
    updateFx();
  }

  // ---- Draw (NES-like pixel art) ----
  function fillRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function drawBackground() {
    const parallax = cameraX * 0.3;
    // sky
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0b0f14");
    grad.addColorStop(0.55, "#141a12");
    grad.addColorStop(1, "#1a2214");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // moon
    fillRect(250 - (parallax % 40), 18, 18, 18, "#d9d2b0");
    fillRect(255 - (parallax % 40), 20, 8, 8, "#0b0f14");

    // distant trees
    for (let i = -1; i < 10; i++) {
      const tx = ((i * 42 - parallax * 0.5) % (W + 42)) - 20;
      drawDeadTree(tx, 40, 0.7, "#1a2618");
    }

    // fog bands
    ctx.globalAlpha = 0.15;
    fillRect(0, 70, W, 10, "#6a7f5a");
    fillRect(0, 100, W, 8, "#4a5a40");
    ctx.globalAlpha = 1;

    // ground strip
    fillRect(0, GROUND_Y - 8, W, H - (GROUND_Y - 8), "#1c2816");
    fillRect(0, GROUND_Y - 8, W, 3, "#2f3f24");
    for (let i = 0; i < 20; i++) {
      const gx = ((i * 24 - cameraX) % W + W) % W;
      fillRect(gx, GROUND_Y - 2, 3, 2, "#0f160e");
      fillRect(gx + 8, GROUND_Y + 10, 10, 2, "#24301c");
    }

    // near twisted trees framing
    drawDeadTree(-10 - (cameraX % 3), 20, 1.1, "#10180e");
    drawDeadTree(270 + (cameraX % 2), 24, 1.05, "#121a10");

    // screen index marker on ground
    for (let s = 0; s < SCREENS; s++) {
      const markerX = s * W + W - 28 - cameraX;
      if (markerX > -20 && markerX < W + 20) {
        fillRect(markerX, GROUND_Y - 18, 16, 4, s === screenIndex ? "#d66a1f" : "#3a4a30");
      }
    }
  }

  function drawDeadTree(x, y, scale, color) {
    const t = (v) => v * scale;
    fillRect(x + t(10), y + t(20), t(8), t(90), color);
    fillRect(x + t(2), y + t(30), t(14), t(5), color);
    fillRect(x + t(16), y + t(40), t(18), t(4), color);
    fillRect(x + t(0), y + t(48), t(12), t(4), color);
    // hanging moss
    fillRect(x + t(4), y + t(52), t(2), t(10), "#254020");
    fillRect(x + t(22), y + t(44), t(2), t(12), "#254020");
  }

  function drawRabbit(p) {
    const flicker = p.invuln > 0 && Math.floor(p.invuln / 2) % 2 === 0;
    if (flicker) return;

    const x = Math.round(p.x - cameraX);
    const y = Math.round(p.y);
    const f = p.facing;
    const walkFrame = p.walking ? Math.floor(p.anim / 6) % 2 : 0;

    // shadow
    fillRect(x + 2, GROUND_Y - 2, 12, 3, "rgba(0,0,0,0.35)");

    // legs
    if (walkFrame === 0) {
      fillRect(x + (f === 1 ? 3 : 9), y + 22, 4, 6, "#f2f2f2");
      fillRect(x + (f === 1 ? 9 : 3), y + 22, 4, 6, "#e8e8e8");
    } else {
      fillRect(x + (f === 1 ? 2 : 10), y + 22, 4, 6, "#f2f2f2");
      fillRect(x + (f === 1 ? 10 : 2), y + 23, 4, 5, "#e8e8e8");
    }

    // muscular body
    fillRect(x + 3, y + 10, 10, 13, "#f5f5f5");
    fillRect(x + 2, y + 12, 12, 8, "#ffffff"); // pecs / bulk
    fillRect(x + 4, y + 14, 3, 2, "#d0d0d0");
    fillRect(x + 9, y + 14, 3, 2, "#d0d0d0");

    // head
    fillRect(x + 4, y + 3, 8, 8, "#ffffff");
    // ears
    fillRect(x + 4, y - 6, 3, 10, "#ffffff");
    fillRect(x + 9, y - 6, 3, 10, "#ffffff");
    fillRect(x + 5, y - 4, 1, 6, "#f0a0b0");
    fillRect(x + 10, y - 4, 1, 6, "#f0a0b0");

    // face
    const eyeX = f === 1 ? x + 9 : x + 5;
    fillRect(eyeX, y + 5, 2, 2, "#1a1a1a");
    fillRect(f === 1 ? x + 8 : x + 6, y + 8, 2, 1, "#e07080");

    // arms / attack poses
    if (p.attack) {
      const progress = p.attack.frame;
      if (p.attack.type === "punch") {
        const reach = progress < 5 ? progress * 2 : Math.max(0, 10 - progress) * 2;
        const ax = f === 1 ? x + 12 : x - reach;
        fillRect(ax, y + 12, 4 + reach, 4, "#ffffff");
        fillRect(f === 1 ? ax + reach : ax, y + 11, 5, 6, "#f0f0f0"); // fist
      } else {
        const reach = progress < 7 ? progress * 2.2 : Math.max(0, 14 - progress) * 2.2;
        const ax = f === 1 ? x + 10 : x - reach;
        fillRect(ax, y + 16, 4 + reach, 4, "#ffffff");
        fillRect(f === 1 ? ax + reach - 2 : ax, y + 14, 6, 8, "#ececec"); // foot
      }
    } else {
      fillRect(x + (f === 1 ? 12 : 0), y + 12, 4, 8, "#ffffff");
      fillRect(x + (f === 1 ? 0 : 12), y + 12, 4, 8, "#f0f0f0");
    }

    // range guides while attacking (subtle)
    if (p.attack) {
      const hb = attackHitbox();
      if (hb) {
        ctx.globalAlpha = 0.2;
        fillRect(hb.x - cameraX, hb.y, hb.w, hb.h, p.attack.type === "kick" ? "#4aa3ff" : "#ff7a4a");
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawCarrot(e) {
    if (e.state === "dead" && e.timer <= 0) return;
    const x = Math.round(e.x - cameraX);
    const y = Math.round(e.y);
    const flash = e.hitFlash > 0;

    fillRect(x + 1, GROUND_Y - 2, 12, 3, "rgba(0,0,0,0.3)");

    if (e.state === "dead") {
      ctx.globalAlpha = Math.max(0, e.timer / 18);
    }

    // body
    fillRect(x + 3, y + 6, 8, 16, flash ? "#fff0c0" : "#e07020");
    fillRect(x + 4, y + 8, 6, 12, flash ? "#ffe080" : "#c45a12");
    // leafy top
    fillRect(x + 5, y + 1, 2, 6, "#3f8f2a");
    fillRect(x + 3, y + 2, 2, 4, "#2f6f1e");
    fillRect(x + 8, y + 2, 2, 4, "#4aa032");

    // zombie face
    fillRect(x + (e.facing === 1 ? 7 : 4), y + 10, 2, 2, "#1a3010");
    fillRect(x + (e.facing === 1 ? 4 : 7), y + 10, 2, 2, "#7dff4a");
    fillRect(x + 5, y + 14, 4, 2, "#3a2010");

    // arms
    if (e.state === "windup") {
      fillRect(x + (e.facing === 1 ? 10 : -2), y + 8, 6, 3, "#d66a1f");
    } else if (e.state === "strike") {
      fillRect(x + (e.facing === 1 ? 11 : -8), y + 10, 10, 3, "#d66a1f");
    } else {
      fillRect(x + 1, y + 12, 3, 5, "#d66a1f");
      fillRect(x + 10, y + 12, 3, 5, "#d66a1f");
    }

    // hp pips
    if (e.state !== "dead") {
      fillRect(x + 3, y - 4, 8, 2, "#3a2010");
      fillRect(x + 3, y - 4, Math.ceil(8 * (e.hp / ENEMY_HP)), 2, "#7dff4a");
    }

    ctx.globalAlpha = 1;
  }

  function drawLettuce(leaf) {
    const x = Math.round(leaf.x - cameraX);
    const y = Math.round(leaf.y + Math.sin(leaf.bob) * 2);
    fillRect(x + 2, y + 2, 8, 6, "#5fbf45");
    fillRect(x + 1, y + 3, 10, 4, "#4aa832");
    fillRect(x + 4, y + 1, 4, 2, "#7dff6a");
    fillRect(x + 5, y + 4, 2, 2, "#2f6f1e");
  }

  function drawUiBanner() {
    if (state !== "playing") return;
    const remaining = enemies.filter((e) => e.state !== "dead").length;
    ctx.fillStyle = "#c9d6b8";
    ctx.font = "8px monospace";
    ctx.fillText(`Restantes: ${remaining}`, 8, 12);
    if (remaining === 0) {
      ctx.fillStyle = "#ffe07a";
      ctx.fillText("¡Pantalla limpia!", 110, 12);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();

    // sort draw by y for simple depth
    const drawables = [
      ...lettuces.map((l) => ({ y: l.y, draw: () => drawLettuce(l) })),
      ...enemies.map((e) => ({ y: e.y, draw: () => drawCarrot(e) })),
      { y: player.y, draw: () => drawRabbit(player) },
    ].sort((a, b) => a.y - b.y);

    for (const d of drawables) d.draw();

    for (const p of particles) {
      fillRect(p.x - cameraX, p.y, 2, 2, p.color);
    }
    for (const f of floatTexts) {
      ctx.globalAlpha = Math.min(1, f.life / 20);
      ctx.fillStyle = f.color;
      ctx.font = "8px monospace";
      ctx.fillText(f.text, Math.round(f.x - cameraX), Math.round(f.y));
      ctx.globalAlpha = 1;
    }

    if (screenFlash > 0) {
      ctx.globalAlpha = 0.25;
      fillRect(0, 0, W, H, "#9b2b1f");
      ctx.globalAlpha = 1;
    }

    drawUiBanner();

    // scanline NES vibe
    ctx.globalAlpha = 0.06;
    for (let y = 0; y < H; y += 2) fillRect(0, y, W, 1, "#000");
    ctx.globalAlpha = 1;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // debug hook for automated tests
  window.__game = {
    getState: () => ({
      state,
      hp: player.hp,
      kills,
      screenIndex,
      invuln: player.invuln,
      screenGrace,
      enemies: enemies.map((e) => ({ id: e.id, state: e.state, x: e.x, hp: e.hp })),
    }),
    start: () => onStartClick(),
    punch: () => startAttack("punch"),
    kick: () => startAttack("kick"),
    holdRight: (v) => {
      touch.right = !!v;
    },
    clearScreen: () => {
      if (state !== "playing") return;
      for (const e of enemies) {
        if (e.state !== "dead") killEnemy(e);
      }
      enemies.forEach((e) => {
        e.timer = 0;
      });
      maybeAdvanceScreen();
    },
  };

  // boot
  updateHud();
  showOverlay(true);
  requestAnimationFrame(loop);
})();

(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== 音频 =====
  const bgMusic = $("#bgMusic");
  const musicBtn = $("#musicBtn");
  let isPlaying = false;
  musicBtn.onclick = (e) => {
    e.stopPropagation();
    if (isPlaying) { bgMusic.pause(); musicBtn.textContent = "🔇"; isPlaying = false; }
    else { bgMusic.play().then(() => { musicBtn.textContent = "🔊"; isPlaying = true; }).catch(() => {}); }
  };

  // ===== 加载配置 =====
  fetch("customize.json")
    .then((r) => r.json())
    .then((data) => {
      Object.keys(data).forEach((key) => {
        const el = document.querySelector(`[data-node-name*="${key}"]`);
        if (el && data[key]) el.innerText = data[key];
      });
      init();
    });

  // ===== 许愿 =====
  const wishOverlay = $("#wishOverlay");
  const wishInput = $("#wishInput");
  const submitWishBtn = $("#submitWish");
  const wishConfirm = $("#wishConfirm");

  function submitWish() {
    const val = wishInput.value.trim();
    if (!val) { wishInput.focus(); return; }
    // 偷偷存储
    fetch("/api/wish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wish: val, time: new Date().toISOString() })
    }).catch(() => {});
    wishInput.style.display = "none";
    submitWishBtn.style.display = "none";
    wishConfirm.style.display = "flex";
    setTimeout(() => showStep(6), 1500);
  }

  submitWishBtn.onclick = (e) => { e.stopPropagation(); submitWish(); };
  wishInput.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); submitWish(); } };

  // ===== 步骤控制 =====
  let currentStep = 0;
  let timer = null;

  function clearTimers() { if (timer) clearTimeout(timer); }

  function showStep(n) {
    clearTimers();
    // 隐藏所有步骤
    $$(".step").forEach((el) => el.classList.remove("visible"));
    currentStep = n;

    if (n === 1) {
      const el = $("#step1");
      el.classList.add("visible");
      el.querySelector(".title").classList.add("anim-fadeInUp");
      timer = setTimeout(() => showStep(2), 4000);
    } else if (n === 2) {
      const el = $("#step2");
      el.classList.add("visible");
      el.querySelector(".big-text").classList.add("anim-scaleIn");
      timer = setTimeout(() => showStep(3), 3500);
    } else if (n === 3) {
      const el = $("#step3");
      el.classList.add("visible");
      el.querySelector(".chat-bubble").classList.add("anim-scaleIn");
      // 逐字显示
      const text = el.querySelector(".chat-text");
      const chars = text.innerText.split("");
      text.innerHTML = chars.map((c, i) => `<span class="char" style="animation-delay:${i * 0.04}s">${c}</span>`).join("");
      timer = setTimeout(() => showStep(4), chars.length * 40 + 1500);
    } else if (n === 4) {
      const el = $("#step4");
      el.classList.add("visible");
      const thinks = el.querySelectorAll(".think");
      thinks.forEach((t, i) => {
        t.style.opacity = "0";
        setTimeout(() => {
          t.classList.add("anim-fadeInUp");
          t.style.opacity = "1";
        }, i * 1500);
      });
      // 等所有思考显示完 + 大字动画
      timer = setTimeout(() => showStep(5), thinks.length * 1500 + 3000);
    } else if (n === 5) {
      const el = $("#step5");
      el.classList.add("visible");
      el.querySelector(".wish-hbd").classList.add("anim-scaleIn");
      el.querySelector(".wish-text").classList.add("anim-fadeIn");
      // 气球
      const balloons = $("#balloons");
      balloons.classList.add("visible");
      const imgs = balloons.querySelectorAll("img");
      imgs.forEach((img, i) => {
        img.style.left = `${5 + (i % 8) * 12}%`;
        img.style.animation = `floatUp ${5 + Math.random() * 3}s linear ${i * 0.2}s forwards`;
      });
      timer = setTimeout(() => showWish(), 5000);
    } else if (n === 6) {
      const el = $("#step6");
      el.classList.add("visible");
      el.querySelectorAll("p").forEach((p, i) => {
        p.style.opacity = "0";
        setTimeout(() => p.classList.add("anim-fadeInUp"), i * 400);
      });
    }
  }

  function showWish() {
    $$(".step").forEach((el) => el.classList.remove("visible"));
    $("#balloons").classList.remove("visible");
    wishOverlay.classList.add("visible");
    wishInput.focus();
  }

  // 重播
  $("#replay").onclick = (e) => {
    e.stopPropagation();
    wishOverlay.classList.remove("visible");
    wishInput.style.display = "";
    submitWishBtn.style.display = "";
    wishConfirm.style.display = "none";
    $("#balloons").classList.remove("visible");
    showStep(1);
  };

  // ===== 启动 =====
  function init() {
    showStep(1);
  }
})();

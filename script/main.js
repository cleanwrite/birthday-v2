(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // 修复移动端 100vh
  function setVH() {
    document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
  }
  setVH();
  window.addEventListener("resize", setVH);

  // ===== Worker API =====
  const API_BASE = "https://birthday-v2.ss20211111705.workers.dev";

  // ===== 音乐 =====
  const bgMusic = $("#bgMusic");
  const musicBtn = $("#musicBtn");
  const musicHint = $("#musicHint");
  let isPlaying = false;

  musicBtn.onclick = (e) => {
    e.stopPropagation();
    if (musicHint) musicHint.style.display = "none";
    if (isPlaying) {
      bgMusic.pause();
      musicBtn.textContent = "🔇";
      isPlaying = false;
    } else {
      bgMusic.play().then(() => {
        musicBtn.textContent = "🔊";
        isPlaying = true;
      }).catch(() => {});
    }
  };

  // ===== 生日校验门 =====
  const TARGET_MONTH = 11;
  const TARGET_DAY = 22;
  const monthWheel = $("#monthWheel");
  const dayWheel = $("#dayWheel");
  const gateBtn = $("#gateBtn");
  const gateError = $("#gateError");
  const birthdayGate = $("#birthdayGate");
  const ITEM_H = 40;

  function buildWheel(wheel, count) {
    const inner = document.createElement("div");
    inner.className = "wheel-inner";
    for (let i = 1; i <= count; i++) {
      const div = document.createElement("div");
      div.className = "wheel-item";
      div.textContent = i;
      div.dataset.value = i;
      inner.appendChild(div);
    }
    wheel.innerHTML = "";
    wheel.appendChild(inner);
    return inner;
  }

  const monthInner = buildWheel(monthWheel, 12);
  const dayInner = buildWheel(dayWheel, 31);

  function createWheelLogic(wheel, inner, count) {
    let current = 0;
    let lastFire = 0;
    const items = inner.querySelectorAll(".wheel-item");

    function clamp(idx) { return Math.max(0, Math.min(count - 1, idx)); }

    function applyTransform(animate) {
      inner.style.transition = animate ? "transform 0.25s cubic-bezier(.25,.75,.35,1)" : "none";
      inner.style.transform = "translateY(" + (-current * ITEM_H) + "px)";
      for (let i = 0; i < items.length; i++) {
        const dist = Math.abs(i - current);
        items[i].classList.toggle("active", i === current);
        items[i].style.opacity = dist > 3 ? 0 : 1 - dist * 0.25;
      }
    }

    wheel.addEventListener("wheel", (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastFire < 60) return;
      lastFire = now;
      current = clamp(current + (e.deltaY > 0 ? 1 : -1));
      applyTransform(true);
    }, { passive: false });

    let touchStartY = 0;
    wheel.addEventListener("touchstart", (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
    wheel.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) > 12) {
        current = clamp(current + (dy > 0 ? 1 : -1));
        applyTransform(true);
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: false });

    inner.addEventListener("click", (e) => {
      const item = e.target.closest(".wheel-item");
      if (item) {
        current = parseInt(item.dataset.value) - 1;
        applyTransform(true);
      }
      e.stopPropagation();
    });

    return {
      getValue: () => current + 1,
      init: () => { current = 0; applyTransform(false); }
    };
  }

  const monthLogic = createWheelLogic(monthWheel, monthInner, 12);
  const dayLogic = createWheelLogic(dayWheel, dayInner, 31);
  monthLogic.init();
  dayLogic.init();

  gateBtn.addEventListener("click", () => {
    if (monthLogic.getValue() === TARGET_MONTH && dayLogic.getValue() === TARGET_DAY) {
      birthdayGate.classList.add("hidden");
      setTimeout(() => {
        birthdayGate.style.display = "none";
        startApp();
      }, 400);
    } else {
      gateError.textContent = "看样子在等的人不是你呢~";
    }
  });

  let tl;

  const showMusicHint = () => {
    if (musicHint) {
      musicHint.textContent = "🎵 点击右上角开启音乐";
      musicHint.style.display = "block";
      setTimeout(() => {
        musicHint.style.transition = "opacity 1s";
        musicHint.style.opacity = "0";
        setTimeout(() => { musicHint.style.display = "none"; }, 1000);
      }, 3000);
    }
  };

  function startApp() {
    fetch("customize.json?v=20261031d")
      .then((r) => r.json())
      .then((data) => {
        Object.keys(data).forEach((key) => {
          const el = document.querySelector('[data-node-name*="' + key + '"]');
          if (el && data[key]) el.innerText = data[key];
        });
        init();
        showMusicHint();
      })
      .catch(() => { init(); showMusicHint(); });
  }

  function init() {
    // 拆字符前先保存原始文本
    const chatEl = $(".hbd-chatbox");
    const hbdEl = $(".wish-hbd");
    const chatText = chatEl.textContent;
    const hbdText = hbdEl.textContent;

    // 拆成字符 span
    chatEl.innerHTML = chatText.split("").map(c => '<span style="display:inline-block;visibility:hidden">' + c + "</span>").join("");
    hbdEl.innerHTML = hbdText.split("").map(c => '<span style="display:inline-block">' + c + "</span>").join("");

    const $chatSpan = $$(".hbd-chatbox span");
    const $wishSpan = $$(".wish-hbd span");

    // 隐藏所有元素
    $$(".scene").forEach(el => { el.style.opacity = "0"; el.style.pointerEvents = "none"; });
    // 气泡内的文字和按钮（需要单独隐藏，因为 .four 容器 opacity:0 会隐藏子元素）
    $$(".four .text-box > *").forEach(el => { el.style.opacity = "0"; });
    // 思考序列的子元素
    $$(".scene-thinking p").forEach(el => { el.style.opacity = "0"; });
    $$(".scene-thinking p strong").forEach(el => { el.style.opacity = "0"; });
    // 祝福 span
    $wishSpan.forEach(el => { el.style.opacity = "0"; });
    // 结尾
    $$(".nine p, #replay").forEach(el => { el.style.opacity = "0"; });
    // 气球
    $$(".baloons img").forEach(el => { el.style.opacity = "0"; });
    // 粒子
    $$(".eight svg").forEach(el => { el.style.visibility = "hidden"; });
    // 结尾容器
    $(".nine").style.display = "none";
    // 显示主容器
    $(".container").style.visibility = "visible";

    // 创建 GSAP 时间轴
    tl = gsap.timeline({ paused: true });

    // ===== 1. 开场问候 =====
    tl.to(".one", { opacity: 1, duration: 0.6, ease: "power2.out" })
      .to(".two", { opacity: 1, duration: 0.4, ease: "power2.out" })
      .to({}, { duration: 2 })
      .to(".one", { opacity: 0, duration: 0.5 })
      .to(".two", { opacity: 0, duration: 0.5 }, "-=0.3")

      // ===== 2. 生日宣言 =====
      .to(".three", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to({}, { duration: 1.5 })
      .to(".three", { opacity: 0, duration: 0.4 })

      // ===== 3. 对话气泡 =====
      // 先显示容器和子元素
      .to(".four", { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" })
      .to(".four .text-box > *", { opacity: 1, duration: 0.3 }, "-=0.5")
      // 隐藏所有字，然后逐字显示
      .set($chatSpan, { visibility: "hidden" }, "-=0.3")
      .to($chatSpan, { visibility: "visible", duration: 0.04, stagger: 0.04 })
      .to({}, { duration: 0.5 })
      .to(".four", { opacity: 0, scale: 0.3, duration: 0.4 })

      // ===== 4. 思考序列 =====
      .to(".idea-1", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to({}, { duration: 1 })
      .to(".idea-1", { opacity: 0, duration: 0.4 })

      .to(".idea-2", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to({}, { duration: 1 })
      .to(".idea-2", { opacity: 0, duration: 0.4 })

      .to(".idea-3", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to(".idea-3 strong", { scale: 1.1, backgroundColor: "rgb(21,161,237)", color: "#fff", duration: 0.3, ease: "power2.out" })
      .to({}, { duration: 1 })
      .to(".idea-3", { opacity: 0, duration: 0.4 })

      .to(".idea-4", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to({}, { duration: 1 })
      .to(".idea-4", { opacity: 0, duration: 0.4 })

      .to(".idea-5", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to(".smiley", { rotate: 15, scale: 1.15, duration: 0.4, ease: "back.out(2)" }, "+=0.2")
      .to({}, { duration: 1.2 })
      .to(".idea-5", { opacity: 0, duration: 0.4 })

      // ===== 5. 生日大字 =====
      .to(".idea-6 span", { opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: "expo.out", stagger: 0.1 })
      .to({}, { duration: 0.8 })
      .to(".idea-6 span", { opacity: 0, scale: 2, duration: 0.5, ease: "power2.in" })

      // ===== 6. 气球 =====
      .to($baloons, {
        opacity: 0.9,
        y: -600,
        duration: 3.5,
        stagger: { each: 0.1, from: "random" },
        ease: "power1.out"
      })

      // ===== 7. 生日祝福 =====
      .set(".six", { opacity: 1, pointerEvents: "auto" })
      .set(".wish", { opacity: 1, scale: 1 })
      .to(".wish-hbd span", { opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.5)", stagger: 0.06 }, "-=1.5")
      .to(".wish-hbd span", { color: "#ff69b4", duration: 0.5, ease: "expo.out", stagger: 0.05 }, "-=0.3")
      .to(".wish h5", { opacity: 1, duration: 0.3 }, "-=0.2")

      // ===== 8. 粒子 =====
      .set($$(".eight svg"), { visibility: "visible", opacity: 0.3 })
      .to($$(".eight svg"), { opacity: 0, scale: 15, duration: 0.8, stagger: 0.15, ease: "power1.in" })

      // ===== 9. 许愿弹窗 =====
      .add(() => {
        gsap.set(".wish-overlay", { display: "flex", opacity: 0 });
        gsap.to(".wish-overlay", { opacity: 1, duration: 0.3, pointerEvents: "auto" });
        gsap.set(".wish-dialog", { opacity: 0, scale: 0.9, y: 20 });
        gsap.to(".wish-dialog", { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out" });
        setTimeout(() => $("#wishInput").focus(), 200);
      })
      .addPause()

      // ===== 10. 结尾 =====
      .to(".wish-overlay", { opacity: 0, pointerEvents: "none", duration: 0.3 })
      .set(".wish-overlay", { display: "none" })
      .set(".six", { opacity: 0 })
      .set(".nine", { display: "flex", opacity: 1 })
      .to(".nine .end-1", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to(".nine .end-2", { opacity: 1, duration: 0.5, ease: "power2.out" }, "+=0.3")
      .to(".nine .end-3", { opacity: 1, duration: 0.5, ease: "power2.out" }, "+=0.3")
      .to(".nine .end-wish", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.2 }, "+=0.4")
      .to(".nine .end-final", { opacity: 1, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, "+=0.3")
      .to(".nine .last-smile", { opacity: 1, duration: 0.4 }, "+=0.2")
      .to("#replay", { opacity: 1, duration: 0.3 }, "+=0.2");

    tl.play();

    // ===== 许愿提交 =====
    const submitWish = () => {
      const input = $("#wishInput");
      const val = input.value.trim();
      if (!val) { input.focus(); return; }
      fetch(API_BASE + "/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wish: val, time: new Date().toISOString() })
      }).catch(() => {});
      input.style.display = "none";
      $("#submitWish").style.display = "none";
      $("#wishConfirm").style.display = "flex";
      gsap.from("#wishConfirm", { opacity: 0, scale: 0.7, duration: 0.4, ease: "back.out" });
      setTimeout(() => tl.resume(), 1500);
    };

    $("#submitWish").onclick = (e) => { e.stopPropagation(); submitWish(); };
    $("#wishInput").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); submitWish(); } };

    // ===== 重播 =====
    $("#replay").onclick = (e) => {
      e.stopPropagation();
      $("#wishInput").style.display = "";
      $("#submitWish").style.display = "";
      $("#wishConfirm").style.display = "none";
      gsap.set(".wish-overlay", { display: "none", opacity: 0, pointerEvents: "none" });
      gsap.set(".scene", { clearProps: "opacity,pointer-events" });
      gsap.set(".scene-thinking p", { clearProps: "opacity" });
      gsap.set(".scene-thinking span", { clearProps: "opacity,color,scale,backgroundColor,transform" });
      gsap.set(".wish span", { clearProps: "opacity,color,transform" });
      gsap.set(".baloons img", { clearProps: "opacity,transform" });
      gsap.set(".eight svg", { clearProps: "visibility,opacity,transform,scale" });
      gsap.set(".nine", { clearProps: "all" });
      gsap.set(".nine p", { clearProps: "opacity" });
      gsap.set("#replay", { clearProps: "opacity" });
      tl.restart();
      return false;
    };
  }
})();

(function () {
  const $ = (sel) => document.querySelector(sel);

  // 修复移动端 100vh
  function setVH() {
    document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
  }
  setVH();
  window.addEventListener("resize", setVH);

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

  // ===== 应用启动 =====
  let tl;

  const showMusicHint = () => {
    if (musicHint) {
      musicHint.textContent = "🎵 点击右上角开启音乐";
      musicHint.style.display = "block";
      musicHint.style.opacity = "1";
      setTimeout(() => {
        musicHint.style.transition = "opacity 1s";
        musicHint.style.opacity = "0";
        setTimeout(() => { musicHint.style.display = "none"; }, 1000);
      }, 3000);
    }
  };

  function startApp() {
    fetch("customize.json?v=20261004f")
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
    const chat = $(".hbd-chatbox");
    const hbd = $(".wish-hbd");
    const splitChars = (el) => {
      el.innerHTML = el.innerHTML.split("").map((c) => "<span>" + c + "</span>").join("");
    };
    splitChars(chat);
    splitChars(hbd);

    // 缓存引用
    const $one = $(".one");
    const $two = $(".two");
    const $three = $(".three");
    const $four = $(".four");
    const $fakeBtn = $(".fake-btn");
    const $chatSpan = $(".hbd-chatbox span");
    const $idea1 = $(".idea-1");
    const $idea2 = $(".idea-2");
    const $idea3 = $(".idea-3");
    const $idea3Strong = $(".idea-3 strong");
    const $idea4 = $(".idea-4");
    const $idea5 = $(".idea-5");
    const $smiley = $(".smiley");
    const $idea6Span = $(".idea-6 span");
    const $baloons = $(".baloons img");
    const $six = $(".six");
    const $wish = $(".wish");
    const $wishSpan = $(".wish-hbd span");
    const $wishH5 = $(".wish h5");
    const $eightSvg = $(".eight svg");
    const $nine = $(".nine");

    const ideaIn = { opacity: 0, y: -20, rotateX: 5, skewX: "15deg" };
    const ideaOut = { opacity: 0, y: 20, rotateY: 5, skewX: "-15deg" };

    tl = gsap.timeline({ paused: true });

    tl
      // 1. 开场问候
      .to(".container", { duration: 0.1, visibility: "visible" })
      .from($one, { duration: 0.6, opacity: 0, y: 10 })
      .from($two, { duration: 0.4, opacity: 0, y: 10 })
      .to($one, { duration: 0.6, opacity: 0, y: 10 }, "+=2")
      .to($two, { duration: 0.6, opacity: 0, y: 10 }, "-=0.8")

      // 2. 生日宣言
      .from($three, { duration: 0.6, opacity: 0, y: 10 })
      .to($three, { duration: 0.6, opacity: 0, y: 10 }, "+=1.5")

      // 3. 对话气泡
      .from($four, { duration: 0.6, scale: 0.3, opacity: 0, ease: "back.out" })
      .from($fakeBtn, { duration: 0.3, scale: 0.3, opacity: 0 })
      .to($chatSpan, { duration: 0.04, visibility: "visible", stagger: 0.04 })
      .to($fakeBtn, { duration: 0.1, backgroundColor: "rgb(127, 206, 248)" })
      .to($four, { duration: 0.4, scale: 0.3, opacity: 0, y: -100 }, "+=0.5")

      // 4. 思考序列
      .from($idea1, { duration: 0.6, ...ideaIn })
      .to($idea1, { duration: 0.6, ...ideaOut }, "+=1.2")
      .from($idea2, { duration: 0.6, ...ideaIn })
      .to($idea2, { duration: 0.6, ...ideaOut }, "+=1.2")
      .from($idea3, { duration: 0.6, ...ideaIn })
      .to($idea3Strong, { duration: 0.4, scale: 1.08, backgroundColor: "rgb(21, 161, 237)", color: "#fff", ease: "power2.out" })
      .to($idea3, { duration: 0.6, ...ideaOut }, "+=1.2")
      .from($idea4, { duration: 0.6, ...ideaIn })
      .to($idea4, { duration: 0.6, ...ideaOut }, "+=1.2")
      .from($idea5, { duration: 0.6, rotateX: 15, rotateZ: -10, skewY: "-5deg", y: 30, opacity: 0 }, "+=0.4")
      .to($smiley, { duration: 0.5, rotate: 15, scale: 1.15, ease: "back.out(2)" }, "+=0.3")
      .to($idea5, { duration: 0.6, scale: 0.2, opacity: 0 }, "+=1.5")

      // 5. 生日大字
      .from($idea6Span, { duration: 0.7, scale: 2.5, opacity: 0, rotate: 12, ease: "expo.out", stagger: 0.12 })
      .to($idea6Span, { duration: 0.6, scale: 2.5, opacity: 0, ease: "power2.in", stagger: 0 }, "+=1")

      // 6. 气球升空（绝对定位，逐行上浮）
      .to($baloons, {
        duration: 4,
        opacity: 0.9,
        y: -800,
        stagger: { each: 0.12, from: "random" },
        ease: "power1.out"
      })

      // 7. 生日祝福
      .set($six, { opacity: 1, visibility: "visible" })
      .from($wish, { duration: 0.4, scale: 2, opacity: 0, rotateZ: -10 }, "-=2")
      .from($wishSpan, { duration: 0.6, opacity: 0, y: -40, rotate: 120, skewX: "20deg", ease: "elastic.out(1, 0.5)", stagger: 0.08 })
      .addLabel("party")
      .to($wishSpan, { duration: 0.6, rotateY: 0, color: "#ff69b4", ease: "expo.out", stagger: 0.06 }, "party")
      .from($wishH5, { duration: 0.4, opacity: 0, y: 8 }, "party+=0.2")

      // 8. 粒子爆炸
      .set($eightSvg, { visibility: "visible", opacity: 0.3 })
      .to($eightSvg, { opacity: 0, scale: 20, duration: 1, stagger: 0.2, ease: "power1.in" })

      // 9. 许愿弹窗
      .add(() => {
        gsap.set(".wish-overlay", { display: "flex" });
        gsap.to(".wish-overlay", { duration: 0.3, opacity: 1, pointerEvents: "auto" });
        gsap.from(".wish-dialog", { duration: 0.5, opacity: 0, scale: 0.9, y: 20, ease: "back.out", delay: 0.1 });
        setTimeout(() => $("#wishInput").focus(), 300);
      })
      .addPause()

      // ===== 结尾 =====
      .to(".wish-overlay", { duration: 0.3, opacity: 0, pointerEvents: "none" })
      .set(".wish-overlay", { display: "none" })
      .to($six, { duration: 0.4, opacity: 0, y: 20 })
      .set($nine, { display: "flex" })
      .from(".end-1", { duration: 0.6, opacity: 0, y: 20 })
      .from(".end-2", { duration: 0.6, opacity: 0, y: 20 }, "+=0.4")
      .from(".end-3", { duration: 0.6, opacity: 0, y: 20 }, "+=0.4")
      .from(".end-wish", { duration: 0.5, opacity: 0, scale: 0.7, ease: "back.out(2)", stagger: 0.3 }, "+=0.5")
      .from(".end-final", { duration: 0.8, opacity: 0, scale: 2, ease: "elastic.out(1, 0.5)" }, "+=0.4")
      .from(".last-smile", { duration: 0.6, opacity: 0, y: 10 }, "+=0.2")
      .from("#replay", { duration: 0.4, opacity: 0 }, "+=0.3");

    tl.play();

    // ===== 许愿提交 =====
    const submitWish = () => {
      const input = $("#wishInput");
      const val = input.value.trim();
      if (!val) { input.focus(); return; }
      fetch("https://birthday-v2.ss20211111705.workers.dev/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wish: val, time: new Date().toISOString() })
      }).catch(() => {});
      input.style.display = "none";
      $("#submitWish").style.display = "none";
      $("#wishConfirm").style.display = "flex";
      gsap.from("#wishConfirm", { duration: 0.4, opacity: 0, scale: 0.7, ease: "back.out" });
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
      gsap.set($nine, { display: "none" });
      tl.restart();
      return false;
    };
  }
})();

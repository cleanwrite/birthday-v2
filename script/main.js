(function () {
  const $ = (sel) => document.querySelector(sel);

  // ===== Worker API（许愿存储） =====
  const API_BASE = ""; // 同域请求，自动适配 workers.dev 或自定义域名

  // ===== 音频 =====
  const bgMusic = $("#bgMusic");
  const musicBtn = $("#musicBtn");
  const musicHint = $("#musicHint");
  let isPlaying = false;
  if (musicBtn) musicBtn.onclick = (e) => {
    e.stopPropagation();
    if (musicHint) musicHint.style.display = "none";
    if (isPlaying) { bgMusic.pause(); musicBtn.textContent = "🔇"; isPlaying = false; }
    else { bgMusic.play().then(() => { musicBtn.textContent = "🔊"; isPlaying = true; }).catch(() => {}); }
  };

  // ===== 生日校验门 =====
  const TARGET_MONTH = 11;
  const TARGET_DAY = 22;
  const monthWheel = $("#monthWheel");
  const dayWheel = $("#dayWheel");
  const gateBtn = $("#gateBtn");
  const gateError = $("#gateError");
  const birthdayGate = $("#birthdayGate");
  if (!monthWheel || !dayWheel || !gateBtn || !birthdayGate) return;
  const ITEM_H = 40;

  function buildWheel(wheel, count) {
    const inner = document.createElement("div");
    inner.className = "wheel-inner";
    for (let i = 1; i <= count; i++) {
      const d = document.createElement("div");
      d.className = "wheel-item";
      d.textContent = i;
      inner.appendChild(d);
    }
    wheel.innerHTML = "";
    wheel.appendChild(inner);
    return inner;
  }

  function makeWheel(inner, count) {
    let cur = 0, last = 0;
    function render(anim) {
      inner.style.transition = anim ? "transform 0.25s ease" : "none";
      inner.style.transform = "translateY(" + (-cur * ITEM_H) + "px)";
      [...inner.children].forEach((el, i) => {
        el.classList.toggle("active", i === cur);
        el.style.opacity = Math.abs(i - cur) > 3 ? "0" : 1 - Math.abs(i - cur) * 0.25;
      });
    }
    inner.parentElement.addEventListener("wheel", e => {
      e.preventDefault();
      if (Date.now() - last < 60) return;
      last = Date.now();
      cur = Math.max(0, Math.min(count - 1, cur + (e.deltaY > 0 ? 1 : -1)));
      render(true);
    }, { passive: false });
    let ty = 0;
    inner.parentElement.addEventListener("touchstart", e => { ty = e.touches[0].clientY; }, { passive: true });
    inner.parentElement.addEventListener("touchmove", e => {
      e.preventDefault();
      const dy = ty - e.touches[0].clientY;
      if (Math.abs(dy) > 12) {
        cur = Math.max(0, Math.min(count - 1, cur + (dy > 0 ? 1 : -1)));
        render(true);
        ty = e.touches[0].clientY;
      }
    }, { passive: false });
    inner.addEventListener("click", e => {
      const item = e.target.closest(".wheel-item");
      if (item) { cur = parseInt(item.textContent) - 1; render(true); }
      e.stopPropagation();
    });
    return { val: () => cur + 1, reset: () => { cur = 0; render(false); } };
  }

  const mw = makeWheel(buildWheel(monthWheel, 12), 12);
  const dw = makeWheel(buildWheel(dayWheel, 31), 31);
  mw.reset(); dw.reset();

  gateBtn.addEventListener("click", () => {
    if (mw.val() === TARGET_MONTH && dw.val() === TARGET_DAY) {
      birthdayGate.classList.add("hidden");
      setTimeout(() => {
        birthdayGate.style.display = "none";
        startApp();
      }, 400);
    } else {
      gateError.textContent = "看样子在等的人不是你呢~";
    }
  });

  // ===== 内联配置（避免 fetch 延迟） =====
  const CUSTOMIZE = {
    "greeting": "嘿",
    "name": "朋友",
    "greetingText": "恭喜你又活了一年！",
    "text1": "今天是你的生日！！！🎉",
    "textInChatBox": "祝你生日快乐！愿你每一天都充满阳光与欢笑，所有的梦想都能成真！🎉",
    "sendButtonLabel": "发送",
    "text2": "我没什么可以送给你的",
    "text3": "这是一个小礼物",
    "text4": "这个网站将作为礼物送给你",
    "text4Adjective": "它将永远属于你",
    "text5Entry": "每年你的生日我都会更新这个网站",
    "text5Content": "这样始终有人陪你过生日",
    "smiley": "😎",
    "bigTextPart1": "生",
    "bigTextPart2": "日",
    "wishHeading": "生日快乐！",
    "wishText": "愿你被这个世界温柔以待，所有的美好都如期而至 ✨",
    "endIntro1": "愿望已经偷偷收好啦 ✨",
    "endIntro2": "不管它会不会实现",
    "endIntro3": "我都希望你——",
    "endWish1": "天天开心 🌸",
    "endWish2": "万事顺意 🌟",
    "endWish3": "永远被爱 💕",
    "endFinal": "生日快乐！",
    "outroSmiley": "也感谢你的倾听（冷知识，背景音乐是我在弹😎",
    "replayText": "点击这里再看一遍 🔄"
  };

  // ===== 加载配置 =====
  function startApp() {
    Object.keys(CUSTOMIZE).forEach((key) => {
      const el = document.querySelector('[data-node-name*="' + key + '"]');
      if (el && CUSTOMIZE[key]) el.innerText = CUSTOMIZE[key];
    });
    init();
  }

  // 校验门关闭后显示音乐提示
  function showMusicHint() {
    if (musicHint) {
      musicHint.textContent = "🎵 点击右上角开启音乐";
      musicHint.style.display = "block";
      setTimeout(() => {
        musicHint.style.transition = "opacity 1s";
        musicHint.style.opacity = "0";
        setTimeout(() => { musicHint.style.display = "none"; }, 1000);
      }, 3000);
    }
  }

  let tl;

  function init() {
    // 拆字符（逐字动画用）
    const chat = $(".hbd-chatbox");
    const hbd = $(".wish-hbd");
    if (!chat || !hbd) return;
    const splitChars = (el) => {
      el.innerHTML = el.innerHTML.split("").map((c) => `<span>${c}</span>`).join("");
    };
    splitChars(chat);
    splitChars(hbd);

    // ===== 动画时间轴（GSAP 3） =====
    const ideaIn = { opacity: 0, y: -20, rotateX: 5, skewX: "15deg" };
    const ideaOut = { opacity: 0, y: 20, rotateY: 5, skewX: "-15deg" };

    tl = gsap.timeline({ paused: true });

    tl
      // 1. 开场问候
      .to(".container", { duration: 0.1, visibility: "visible" })
      .from(".one", { duration: 0.7, opacity: 0, y: 10 })
      .from(".two", { duration: 0.4, opacity: 0, y: 10 })
      .to(".one", { duration: 0.7, opacity: 0, y: 10 }, "+=2.5")
      .to(".two", { duration: 0.7, opacity: 0, y: 10 }, "-=1")

      // 2. 生日宣言
      .from(".three", { duration: 0.7, opacity: 0, y: 10 })
      .to(".three", { duration: 0.7, opacity: 0, y: 10 }, "+=2")

      // 3. 对话气泡
      .from(".four", { duration: 0.7, scale: 0.2, opacity: 0, ease: "back.out" })
      .from(".fake-btn", { duration: 0.3, scale: 0.2, opacity: 0 })
      .to(".hbd-chatbox span", { duration: 0.05, visibility: "visible", stagger: 0.045 })
      .to(".fake-btn", { duration: 0.1, backgroundColor: "rgb(127, 206, 248)" })
      .to(".four", { duration: 0.5, scale: 0.2, opacity: 0, y: -150 }, "+=0.7")

      // 4. 思考序列
      .from(".idea-1", { duration: 0.7, ...ideaIn })
      .to(".idea-1", { duration: 0.7, ...ideaOut }, "+=1.5")
      .from(".idea-2", { duration: 0.7, ...ideaIn })
      .to(".idea-2", { duration: 0.7, ...ideaOut }, "+=1.5")
      .from(".idea-3", { duration: 0.7, ...ideaIn })
      .to(".idea-3 strong", { duration: 0.5, scale: 1.2, x: 10, backgroundColor: "rgb(21, 161, 237)", color: "#fff" })
      .to(".idea-3", { duration: 0.7, ...ideaOut }, "+=1.5")
      .from(".idea-4", { duration: 0.7, ...ideaIn })
      .to(".idea-4", { duration: 0.7, ...ideaOut }, "+=1.5")
      .from(".idea-5", { duration: 0.7, rotateX: 15, rotateZ: -10, skewY: "-5deg", y: 50, z: 10, opacity: 0 }, "+=0.5")
      .to(".idea-5 .smiley", { duration: 0.7, rotate: 90, x: 8 }, "+=0.4")
      .to(".idea-5", { duration: 0.7, scale: 0.2, opacity: 0 }, "+=2")

      // 5. 生日大字
      .from(".idea-6 span", { duration: 0.8, scale: 3, opacity: 0, rotate: 15, ease: "expo.out", stagger: 0.2 })
      .to(".idea-6 span", { duration: 0.8, scale: 3, opacity: 0, rotate: -15, ease: "expo.out", stagger: 0.2 }, "+=1")

      // 6. 气球升空
      .fromTo(".baloons img",
        { opacity: 0.9, y: 1400 },
        { opacity: 1, y: -1000, duration: 2.5, stagger: 0.2 })

      // 7. 生日祝福
      .set(".six", { opacity: 1, y: 0 })
      .from(".wish", { duration: 0.5, scale: 2.5, opacity: 0, rotateZ: -15 }, "-=2")
      .from(".wish-hbd span", { duration: 0.7, opacity: 0, y: -50, rotate: 150, skewX: "30deg", ease: "elastic.out(1, 0.5)", stagger: 0.1 })
      .to(".wish-hbd span", { duration: 0.7, scale: 1, rotateY: 0, color: "#ff69b4", ease: "expo.out", stagger: 0.1 }, "party")
      .from(".wish h5", { duration: 0.5, opacity: 0, y: 10, skewX: "-15deg" }, "party")

      // 8. 粒子爆炸
      .to(".eight svg", { visibility: "visible", opacity: 0, scale: 80, repeat: 1, repeatDelay: 1.2, duration: 1.5, stagger: 0.3 })

      // 9. 许愿弹窗（暂停等待提交）
      .add(() => {
        gsap.set(".wish-overlay", { display: "flex", pointerEvents: "auto" });
        gsap.to(".wish-overlay", { duration: 0.4, opacity: 1 });
        gsap.from(".wish-dialog", { duration: 0.6, opacity: 0, scale: 0.85, y: 30, ease: "back.out", delay: 0.15 });
        setTimeout(() => $("#wishInput").focus(), 400);
      })
      .addPause()

      // ===== 许愿后的完整结尾 =====
      .to(".wish-overlay", { duration: 0.4, opacity: 0, ease: "power2.in", pointerEvents: "none" })
      .set(".wish-overlay", { display: "none" })
      .to(".six", { duration: 0.5, opacity: 0, y: 30 })
      .set(".nine", { display: "flex" })
      .from(".end-1", { duration: 0.8, opacity: 0, y: 25 })
      .from(".end-2", { duration: 0.8, opacity: 0, y: 25 }, "+=0.6")
      .from(".end-3", { duration: 0.8, opacity: 0, y: 25 }, "+=0.6")
      .from(".end-wish", { duration: 0.6, opacity: 0, scale: 0.5, ease: "back.out", stagger: 0.5 }, "+=0.8")
      .from(".end-final", { duration: 1, opacity: 0, scale: 3, ease: "elastic.out(1, 0.4)" }, "+=0.6")
      .from(".last-smile", { duration: 0.5, opacity: 0, scale: 0 }, "+=0.3")
      .to(".last-smile", { duration: 0.5, rotate: 360 }, "+=0.5")
      .from("#replay", { duration: 0.6, opacity: 0 }, "+=0.5");

    // ===== 开始播放 =====
    tl.play();
    showMusicHint();

    // ===== 许愿提交 =====
    const submitWish = () => {
      const input = $("#wishInput");
      const val = input.value.trim();
      if (!val) { input.focus(); return; }
      // 偷偷存储（用户无感知）
      fetch(API_BASE + "/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wish: val, time: new Date().toISOString() })
      }).catch(() => {});
      // UI 反馈
      input.style.display = "none";
      $("#submitWish").style.display = "none";
      $("#wishConfirm").style.display = "flex";
      gsap.from("#wishConfirm", { duration: 0.5, opacity: 0, scale: 0.5, ease: "back.out" });
      // 1.8 秒后继续动画
      setTimeout(() => tl.resume(), 1800);
    };

    $("#submitWish").onclick = (e) => { e.stopPropagation(); submitWish(); };
    $("#wishInput").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); submitWish(); } };

    // ===== 重播 =====
    $("#replay").onclick = (e) => {
      e.stopPropagation();
      // 重置许愿弹窗状态
      $("#wishInput").style.display = "";
      $("#submitWish").style.display = "";
      $("#wishConfirm").style.display = "none";
      gsap.set(".wish-overlay", { display: "none", opacity: 0, pointerEvents: "none" });
      gsap.set(".nine", { display: "none" });
      tl.restart();
      return false;
    };
  }
})();

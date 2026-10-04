(function () {
  const $ = (sel) => document.querySelector(sel);

  // ===== Worker API（许愿存储） =====
  const API_BASE = "https://birthday-v2.ss20211111705.workers.dev";

  // ===== 音频 =====
  const bgMusic = $("#bgMusic");
  const musicBtn = $("#musicBtn");
  let isPlaying = false;
  musicBtn.onclick = (e) => {
    e.stopPropagation();
    if (isPlaying) { bgMusic.pause(); musicBtn.textContent = "🔇"; isPlaying = false; }
    else { bgMusic.play().then(() => { musicBtn.textContent = "🔊"; isPlaying = true; }).catch(() => {}); }
  };

  // ===== 加载配置（失败时降级：直接用 HTML 默认文案启动） =====
  fetch("customize.json")
    .then((r) => r.json())
    .then((data) => {
      Object.keys(data).forEach((key) => {
        const el = document.querySelector(`[data-node-name*="${key}"]`);
        if (el && data[key]) el.innerText = data[key];
      });
      init();
    })
    .catch(() => init());

  let tl;

  function init() {
    // 拆字符（逐字动画用）
    const chat = $(".hbd-chatbox");
    const hbd = $(".wish-hbd");
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
      .to(".idea-3 strong", { duration: 0.5, scale: 1.08, backgroundColor: "rgb(21, 161, 237)", color: "#fff", ease: "power2.out" })
      .to(".idea-3", { duration: 0.7, ...ideaOut }, "+=1.5")
      .from(".idea-4", { duration: 0.7, ...ideaIn })
      .to(".idea-4", { duration: 0.7, ...ideaOut }, "+=1.5")
      .from(".idea-5", { duration: 0.7, rotateX: 15, rotateZ: -10, skewY: "-5deg", y: 50, z: 10, opacity: 0 }, "+=0.5")
      .to(".idea-5 .smiley", { duration: 0.6, rotate: 15, scale: 1.15, ease: "back.out(2)" }, "+=0.4")
      .to(".idea-5", { duration: 0.7, scale: 0.2, opacity: 0 }, "+=2")

      // 5. 生日大字（入场轻微交错，退场全同步防错位）
      .from(".idea-6 span", { duration: 0.8, scale: 2.5, opacity: 0, rotate: 12, ease: "expo.out", stagger: 0.15 })
      .to(".idea-6 span", { duration: 0.7, scale: 2.5, opacity: 0, ease: "power2.in", stagger: 0 }, "+=1.2")

      // 6. 气球升空（减速：4.5s 缓慢飘升）
      .fromTo(".baloons img",
        { opacity: 0, y: 1400 },
        { opacity: 0.95, y: -1100, duration: 4.5, stagger: 0.18, ease: "none" })

      // 7. 生日祝福
      .set(".six", { opacity: 1, y: 0 })
      .from(".wish", { duration: 0.5, scale: 2.5, opacity: 0, rotateZ: -15 }, "-=2")
      .from(".wish-hbd span", { duration: 0.7, opacity: 0, y: -50, rotate: 150, skewX: "30deg", ease: "elastic.out(1, 0.5)", stagger: 0.1 })
      .addLabel("party")
      .to(".wish-hbd span", { duration: 0.7, rotateY: 0, color: "#ff69b4", ease: "expo.out", stagger: 0.08 }, "party")
      .from(".wish h5", { duration: 0.5, opacity: 0, y: 10, skewX: "-15deg" }, "party+=0.3")

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
      .from(".end-wish", { duration: 0.6, opacity: 0, scale: 0.5, ease: "back.out(2)", stagger: 0.5 }, "+=0.8")
      .from(".end-final", { duration: 1, opacity: 0, scale: 2, ease: "elastic.out(1, 0.5)" }, "+=0.6")
      .from(".last-smile", { duration: 0.6, opacity: 0, scale: 0, ease: "back.out(2)" }, "+=0.2")
      .to(".last-smile", { duration: 0.45, rotate: 12, yoyo: true, repeat: 1, ease: "sine.inOut" }, "+=0.3")
      .from("#replay", { duration: 0.6, opacity: 0 }, "+=0.5");

    // ===== 开始播放 =====
    tl.play();

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

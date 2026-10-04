(function () {
  // ===== 音频 =====
  const bgMusic = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");
  let isPlaying = false;
  musicBtn.onclick = (e) => {
    e.stopPropagation();
    if (isPlaying) { bgMusic.pause(); musicBtn.textContent = "🔇"; isPlaying = false; }
    else { bgMusic.play().then(() => { musicBtn.textContent = "🔊"; isPlaying = true; }).catch(() => {}); }
  };

  // ===== 许愿 API =====
  const submitWish = () => {
    const input = document.getElementById("wishInput");
    const val = input.value.trim();
    if (!val) { input.focus(); return; }
    fetch("/api/wish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wish: val, time: new Date().toISOString() })
    }).catch(() => {});
    input.style.display = "none";
    document.getElementById("submitWish").style.display = "none";
    document.getElementById("wishConfirm").style.display = "block";
    gsap.from("#wishConfirm", { duration: 0.5, opacity: 0, scale: 0.5, ease: "back.out" });
    setTimeout(() => window["__resumeTimeline"](), 1500);
  };

  document.getElementById("submitWish").onclick = (e) => { e.stopPropagation(); submitWish(); };
  document.getElementById("wishInput").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); submitWish(); } };

  // ===== 重播 =====
  document.getElementById("replay").onclick = (e) => {
    e.stopPropagation();
    document.getElementById("wishInput").style.display = "";
    document.getElementById("submitWish").style.display = "";
    document.getElementById("wishConfirm").style.display = "none";
    tl.restart();
    return false;
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

  let tl;

  function init() {
    // 拆字符
    const chat = document.querySelector(".hbd-chatbox");
    const hbd = document.querySelector(".wish-hbd");
    chat.innerHTML = chat.innerHTML.split("").map((c) => `<span>${c}</span>`).join("");
    hbd.innerHTML = hbd.innerHTML.split("").map((c) => `<span>${c}</span>`).join("");

    // ===== GSAP 3.x 时间轴 =====
    const ideaIn = { opacity: 0, y: -20, rotateX: 5, skewX: "15deg" };
    const ideaOut = { opacity: 0, y: 20, rotateY: 5, skewX: "-15deg" };

    tl = gsap.timeline({ paused: true, onComplete: () => {} });

    // 1. 标题
    tl.set(".container", { visibility: "visible" })
      .set(".one", { opacity: 1, pointerEvents: "auto" })
      .from(".one", { duration: 0.8, opacity: 0, y: 30 })
      .from(".two", { duration: 0.5, opacity: 0, y: 15 }, "+=0.2")
      .to(".one", { duration: 0.6, opacity: 0, pointerEvents: "none" }, "+=2.5")
      .to(".two", { duration: 0.4, opacity: 0 }, "-=0.4")

      // 2. 生日宣言
      .set(".three", { opacity: 1, pointerEvents: "auto" })
      .from(".three", { duration: 0.8, opacity: 0, scale: 0.5, ease: "back.out" })
      .to(".three", { duration: 0.5, opacity: 0, pointerEvents: "none" }, "+=2.5")

      // 3. 对话气泡
      .set(".four", { opacity: 1, pointerEvents: "auto" })
      .from(".four", { duration: 0.7, scale: 0.2, opacity: 0, ease: "back.out" })
      .from(".fake-btn", { duration: 0.3, scale: 0, opacity: 0 })
      .to(".hbd-chatbox span", { duration: 0.05, visibility: "visible", stagger: 0.04 })
      .to(".fake-btn", { duration: 0.15, backgroundColor: "rgb(127,206,248)" })
      .to(".four", { duration: 0.5, scale: 0, opacity: 0, pointerEvents: "none" }, "+=0.7")

      // 4. 思考序列
      .set(".idea-1", { opacity: 1, pointerEvents: "auto" }).from(".idea-1", { duration: 0.7, ...ideaIn }).to(".idea-1", { duration: 0.7, ...ideaOut, pointerEvents: "none" }, "+=1.5")
      .set(".idea-2", { opacity: 1, pointerEvents: "auto" }).from(".idea-2", { duration: 0.7, ...ideaIn }).to(".idea-2", { duration: 0.7, ...ideaOut, pointerEvents: "none" }, "+=1.5")
      .set(".idea-3", { opacity: 1, pointerEvents: "auto" }).from(".idea-3", { duration: 0.7, ...ideaIn }).to(".idea-3 strong", { duration: 0.5, scale: 1.3, x: 10, backgroundColor: "rgb(21,161,237)", color: "#fff" }).to(".idea-3", { duration: 0.7, ...ideaOut, pointerEvents: "none" }, "+=1.5")
      .set(".idea-4", { opacity: 1, pointerEvents: "auto" }).from(".idea-4", { duration: 0.7, ...ideaIn }).to(".idea-4", { duration: 0.7, ...ideaOut, pointerEvents: "none" }, "+=1.5")
      .set(".idea-5", { opacity: 1, pointerEvents: "auto" }).from(".idea-5", { duration: 0.7, rotateX: 15, rotateZ: -10, skewY: "-5deg", y: 50, z: 10, opacity: 0 }, "+=0.5").to(".idea-5 .smiley", { duration: 0.7, rotate: 90, x: 8 }, "+=0.4").to(".idea-5", { duration: 0.7, scale: 0, opacity: 0, pointerEvents: "none" }, "+=2")

      // 5. SO 大字
      .set(".idea-6", { opacity: 1, pointerEvents: "auto" })
      .from(".idea-6 span", { duration: 0.8, scale: 3, opacity: 0, rotate: 15, ease: "expo.out", stagger: 0.2 })
      .to(".idea-6 span", { duration: 0.8, scale: 3, opacity: 0, rotate: -15, ease: "expo.out", stagger: 0.2 }, "+=1")
      .set(".idea-6", { opacity: 0, pointerEvents: "none" })

      // 6. 气球 + 祝福
      .to(".baloons img", { duration: 2.5, opacity: 1, y: -1000, stagger: 0.2, ease: "none" })
      .set(".six", { opacity: 1, pointerEvents: "auto" })
      .from(".wish", { duration: 0.6, scale: 3, opacity: 0, rotateZ: -15, ease: "none" }, "-=2")
      .from(".wish-hbd span", { duration: 0.7, opacity: 0, y: -50, rotate: 150, skewX: "30deg", ease: "elastic.out(1,0.5)", stagger: 0.1 })
      .to(".wish-hbd span", { duration: 0.7, scale: 1, rotateY: 0, color: "#ff69b4", ease: "expo.out", stagger: 0.1 }, "party")
      .from(".wish h5", { duration: 0.5, opacity: 0, y: 10, skewX: "-15deg" }, "party")
      .to(".eight svg", { duration: 1.5, visibility: "visible", opacity: 0, scale: 80, repeat: 3, repeatDelay: 1.4, stagger: 0.3 })
      .set(".six", { opacity: 0, pointerEvents: "none" })

      // 7. 许愿弹窗
      .add(() => {
        document.getElementById("wishOverlay").style.display = "flex";
        gsap.from(".wish-dialog", { duration: 0.6, opacity: 0, scale: 0.85, y: 30, ease: "back.out" });
        document.getElementById("wishInput").focus();
      })
      .addPause() // GSAP 3 支持 addPause

      // 8. 许愿后结尾
      .to(".wish-overlay", { duration: 0.4, opacity: 0, ease: "power2.in" })
      .set("#wishOverlay", { display: "none", opacity: 1 })
      .set(".nine", { opacity: 1, pointerEvents: "auto" })
      .from(".nine p", { duration: 1, ...ideaIn, stagger: 1.2 })
      .to(".last-smile", { duration: 0.5, rotate: 90 }, "+=1");

    // 开始播放
    tl.play();
  }

  // 许愿提交后恢复动画
  window["__resumeTimeline"] = function () {
    if (tl) tl.resume();
  };
})();

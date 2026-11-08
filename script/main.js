(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const API = "https://birthday-v2.ss20211111705.workers.dev";

  // VH fix
  function setVH() { document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px"); }
  setVH();
  window.addEventListener("resize", setVH);

  // ===== 音乐 =====
  let isPlaying = false;
  $("#musicBtn").onclick = (e) => {
    e.stopPropagation();
    $("#musicHint").style.display = "none";
    if (isPlaying) { $("#bgMusic").pause(); $("#musicBtn").textContent = "🔇"; isPlaying = false; }
    else { $("#bgMusic").play().then(() => { $("#musicBtn").textContent = "🔊"; isPlaying = true; }).catch(() => {}); }
  };

  // ===== 校验门 =====
  const monthWheel = $("#monthWheel");
  const dayWheel = $("#dayWheel");
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

  $("#gateBtn").onclick = () => {
    if (mw.val() === 11 && dw.val() === 22) {
      $("#birthdayGate").classList.add("hidden");
      setTimeout(() => { $("#birthdayGate").style.display = "none"; startApp(); }, 400);
    } else {
      $("#gateError").textContent = "看样子在等的人不是你呢~";
    }
  };

  // ===== 启动 =====
  let tl;

  function startApp() {
    fetch("customize.json?v=20261031f")
      .then(r => r.json())
      .then(data => {
        Object.keys(data).forEach(k => {
          const el = document.querySelector('[data-node-name*="' + k + '"]');
          if (el && data[k]) el.innerText = data[k];
        });
        init();
      })
      .catch(() => init());
  }

  function init() {
    // 拆字
    const chatEl = $(".hbd-chatbox");
    const hbdEl = $(".wish-hbd");
    chatEl.innerHTML = chatEl.textContent.split("").map(c => '<span style="visibility:hidden">' + c + "</span>").join("");
    hbdEl.innerHTML = hbdEl.textContent.split("").map(c => "<span>" + c + "</span>").join("");

    // 隐藏所有场景容器
    [...$$(".scene")].forEach(el => { el.style.display = "none"; });
    $(".scene-thinking").style.display = "none";
    [...$$(".baloons img")].forEach(el => { el.style.opacity = "0"; });
    [...$$(".eight svg")].forEach(el => { el.style.visibility = "hidden"; });
    $(".container").style.visibility = "visible";

    // 缓存
    const $chatSpan = $$(".hbd-chatbox span");
    const $wishSpan = $$(".wish-hbd span");
    const $baloons = $$(".baloons img");
    const $eightSvg = $$(".eight svg");

    // 创建时间轴
    tl = gsap.timeline({ paused: true });

    // ===== 1. 开场问候 =====
    tl.set(".one", { display: "flex", opacity: 0 })
      .to(".one", { opacity: 1, duration: 0.6, ease: "power2.out" })
      .to({}, { duration: 2 })
      .to(".one", { opacity: 0, duration: 0.5 })
      .set(".one", { display: "none" })

      // ===== 2. 生日宣言 =====
      .set(".three", { display: "flex", opacity: 0 })
      .to(".three", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to({}, { duration: 1.5 })
      .to(".three", { opacity: 0, duration: 0.4 })
      .set(".three", { display: "none" })

      // ===== 3. 对话气泡 =====
      .set(".four", { display: "flex", opacity: 0, scale: 0.3 })
      .to(".four", { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" })
      .set($chatSpan, { visibility: "visible", duration: 0.04, stagger: 0.04 })
      .to({}, { duration: 0.5 })
      .to(".four", { opacity: 0, scale: 0.3, duration: 0.4 })
      .set(".four", { display: "none" })

      // ===== 4. 思考序列 =====
      .set(".scene-thinking", { display: "flex" })
      .set([".idea-1", ".idea-2", ".idea-3", ".idea-4", ".idea-5", ".idea-6"], { opacity: 0 })
      .set(".idea-6 span", { opacity: 0 })

      .to(".idea-1", { opacity: 1, duration: 0.5 })
      .to({}, { duration: 1 })
      .to(".idea-1", { opacity: 0, duration: 0.4 })

      .to(".idea-2", { opacity: 1, duration: 0.5 })
      .to({}, { duration: 1 })
      .to(".idea-2", { opacity: 0, duration: 0.4 })

      .to(".idea-3", { opacity: 1, duration: 0.5 })
      .to(".idea-3 strong", { scale: 1.1, backgroundColor: "rgb(21,161,237)", color: "#fff", duration: 0.3 })
      .to({}, { duration: 1 })
      .to(".idea-3", { opacity: 0, duration: 0.4 })

      .to(".idea-4", { opacity: 1, duration: 0.5 })
      .to({}, { duration: 1 })
      .to(".idea-4", { opacity: 0, duration: 0.4 })

      .to(".idea-5", { opacity: 1, duration: 0.5 })
      .to(".smiley", { rotate: 15, scale: 1.15, duration: 0.4, ease: "back.out(2)" }, "+=0.2")
      .to({}, { duration: 1.2 })
      .to(".idea-5", { opacity: 0, duration: 0.4 })

      .to(".idea-6 span", { opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.1 })
      .to({}, { duration: 0.8 })
      .to(".idea-6 span", { opacity: 0, duration: 0.5 })
      .set(".scene-thinking", { display: "none" })

      // ===== 5. 气球 =====
      .set(".seven", { display: "block" })
      .to($baloons, { opacity: 0.9, y: -600, duration: 3.5, stagger: { each: 0.1, from: "random" }, ease: "power1.out" })

      // ===== 6. 生日祝福 =====
      .set(".six", { display: "flex" })
      .set(".wish-hbd span", { opacity: 0 })
      .to(".wish-hbd span", { opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.5)", stagger: 0.06 }, "-=1.5")
      .to(".wish-hbd span", { color: "#ff69b4", duration: 0.5, ease: "expo.out", stagger: 0.05 }, "-=0.3")
      .set(".wish h5", { opacity: 0 })
      .to(".wish h5", { opacity: 1, duration: 0.3 }, "-=0.2")

      // ===== 7. 粒子 =====
      .set($eightSvg, { visibility: "visible", opacity: 0.3 })
      .to($eightSvg, { opacity: 0, scale: 15, duration: 0.8, stagger: 0.15, ease: "power1.in" })

      // ===== 8. 许愿弹窗 =====
      .add(() => {
        gsap.set(".wish-overlay", { display: "flex", opacity: 0 });
        gsap.to(".wish-overlay", { opacity: 1, duration: 0.3, pointerEvents: "auto" });
        gsap.set(".wish-dialog", { opacity: 0, scale: 0.9, y: 20 });
        gsap.to(".wish-dialog", { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out" });
        setTimeout(() => $("#wishInput").focus(), 200);
      })
      .addPause()

      // ===== 9. 结尾 =====
      .to(".wish-overlay", { opacity: 0, pointerEvents: "none", duration: 0.3 })
      .set(".wish-overlay", { display: "none" })
      .to(".six", { opacity: 0, duration: 0.3 })
      .set(".six", { display: "none" })
      .set(".nine", { display: "flex" })
      .set([".end-1", ".end-2", ".end-3", ".end-wish", ".end-final", ".last-smile", "#replay"], { opacity: 0 })
      .to(".end-1", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to(".end-2", { opacity: 1, duration: 0.5, ease: "power2.out" }, "+=0.3")
      .to(".end-3", { opacity: 1, duration: 0.5, ease: "power2.out" }, "+=0.3")
      .to(".end-wish", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.2 }, "+=0.4")
      .to(".end-final", { opacity: 1, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, "+=0.3")
      .to(".last-smile", { opacity: 1, duration: 0.4 }, "+=0.2")
      .to("#replay", { opacity: 1, duration: 0.3 }, "+=0.2");

    tl.play();

    // 许愿提交
    $("#submitWish").onclick = () => {
      const val = $("#wishInput").value.trim();
      if (!val) { $("#wishInput").focus(); return; }
      fetch(API + "/api/wish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wish: val }) }).catch(() => {});
      $("#wishInput").style.display = "none";
      $("#submitWish").style.display = "none";
      $("#wishConfirm").style.display = "flex";
      gsap.from("#wishConfirm", { opacity: 0, scale: 0.7, duration: 0.4, ease: "back.out" });
      setTimeout(() => tl.resume(), 1500);
    };
    $("#wishInput").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); $("#submitWish").onclick(); } };

    // 重播
    $("#replay").onclick = () => {
      $("#wishInput").style.display = "";
      $("#submitWish").style.display = "";
      $("#wishConfirm").style.display = "none";
      gsap.set(".wish-overlay", { display: "none", opacity: 0, pointerEvents: "none" });
      gsap.globalTimeline.clear();
      // 重新拆字（因为 init 会重新拆分）
      init();
      return false;
    };
  }
})();

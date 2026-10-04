const fetchData = () => {
  fetch("customize.json")
    .then(r => r.json())
    .then(data => {
      Object.keys(data).forEach(key => {
        const el = document.querySelector(`[data-node-name*="${key}"]`);
        if (el && data[key] !== "") {
          if (key === "imagePath") el.setAttribute("src", data[key]);
          else el.innerText = data[key];
        }
      });
      start();
    });
};

function start() {
  const chat = document.querySelector(".hbd-chatbox");
  const hbd = document.querySelector(".wish-hbd");
  chat.innerHTML = chat.innerHTML.split("").map(c => `<span>${c}</span>`).join("");
  hbd.innerHTML = hbd.innerHTML.split("").map(c => `<span>${c}</span>`).join("");

  const show = (sel) => TweenMax.set(sel, { opacity: 1, pointerEvents: "auto" });
  const hide = (sel) => TweenMax.set(sel, { opacity: 0, pointerEvents: "none" });

  const tl = new TimelineMax();

  // 1. Hey 标题
  tl.set(".container", { visibility: "visible" })
    .set(".one", { opacity: 1, pointerEvents: "auto" })
    .from(".one", 0.8, { opacity: 0, y: 20 })
    .from(".two", 0.5, { opacity: 0, y: 10 })
    .to(".one", 0.6, { opacity: 0, pointerEvents: "none" }, "+=2.5")
    .to(".two", 0.4, { opacity: 0 }, "-=0.4")

    // 2. 生日宣言
    .set(".three", { opacity: 1, pointerEvents: "auto" })
    .from(".three", 0.7, { opacity: 0, scale: 0.5 })
    .to(".three", 0.5, { opacity: 0, pointerEvents: "none" }, "+=2")

    // 3. 对话气泡
    .set(".four", { opacity: 1, pointerEvents: "auto" })
    .from(".four", 0.7, { scale: 0.3, opacity: 0 })
    .from(".fake-btn", 0.3, { scale: 0, opacity: 0 })
    .staggerTo(".hbd-chatbox span", 0.5, { visibility: "visible" }, 0.04)
    .to(".fake-btn", 0.15, { backgroundColor: "rgb(127,206,248)" })
    .to(".four", 0.5, { scale: 0, opacity: 0, pointerEvents: "none" }, "+=0.7")

    // 4. 思考序列
    .set(".idea-1", { opacity: 1, pointerEvents: "auto" })
    .from(".idea-1", 0.7, { opacity: 0, y: -20, rotationX: 5, skewX: "15deg" })
    .to(".idea-1", 0.7, { opacity: 0, pointerEvents: "none", y: 20 }, "+=1.5")

    .set(".idea-2", { opacity: 1, pointerEvents: "auto" })
    .from(".idea-2", 0.7, { opacity: 0, y: -20, rotationX: 5, skewX: "15deg" })
    .to(".idea-2", 0.7, { opacity: 0, pointerEvents: "none", y: 20 }, "+=1.5")

    .set(".idea-3", { opacity: 1, pointerEvents: "auto" })
    .from(".idea-3", 0.7, { opacity: 0, y: -20, rotationX: 5, skewX: "15deg" })
    .to(".idea-3 strong", 0.5, { scale: 1.3, x: 10, backgroundColor: "rgb(21,161,237)", color: "#fff" })
    .to(".idea-3", 0.7, { opacity: 0, pointerEvents: "none", y: 20 }, "+=1.5")

    .set(".idea-4", { opacity: 1, pointerEvents: "auto" })
    .from(".idea-4", 0.7, { opacity: 0, y: -20, rotationX: 5, skewX: "15deg" })
    .to(".idea-4", 0.7, { opacity: 0, pointerEvents: "none", y: 20 }, "+=1.5")

    .set(".idea-5", { opacity: 1, pointerEvents: "auto" })
    .from(".idea-5", 0.7, { rotationX: 15, rotationZ: -10, skewY: "-5deg", y: 50, z: 10, opacity: 0 }, "+=0.5")
    .to(".idea-5 .smiley", 0.7, { rotation: 90, x: 8 }, "+=0.4")
    .to(".idea-5", 0.7, { scale: 0, opacity: 0, pointerEvents: "none" }, "+=2")

    // 5. SO 大字
    .set(".idea-6", { opacity: 1, pointerEvents: "auto" })
    .staggerFrom(".idea-6 span", 0.8, { scale: 3, opacity: 0, rotation: 15, ease: Expo.easeOut }, 0.2)
    .staggerTo(".idea-6 span", 0.8, { scale: 3, opacity: 0, rotation: -15, ease: Expo.easeOut }, 0.2, "+=1")
    .set(".idea-6", { pointerEvents: "none" })

    // 6. 气球 + 祝福
    .staggerFromTo(".baloons img", 2.5, { opacity: 0.9, y: 1400 }, { opacity: 1, y: -1000 }, 0.2)
    .set(".six", { opacity: 1, pointerEvents: "auto" })
    .from(".wish", 0.6, { scale: 3, opacity: 0, rotationZ: -15 }, "-=2")
    .staggerFrom(".wish-hbd span", 0.7, { opacity: 0, y: -50, rotation: 150, skewX: "30deg", ease: Elastic.easeOut.config(1, 0.5) }, 0.1)
    .staggerFromTo(".wish-hbd span", 0.7, { scale: 1.4, rotationY: 150 }, { scale: 1, rotationY: 0, color: "#ff69b4", ease: Expo.easeOut }, 0.1, "party")
    .from(".wish h5", 0.5, { opacity: 0, y: 10, skewX: "-15deg" }, "party")
    .staggerTo(".eight svg", 1.5, { visibility: "visible", opacity: 0, scale: 80, repeat: 3, repeatDelay: 1.4 }, 0.3)

    // 7. 许愿
    .set(".six", { opacity: 0, pointerEvents: "none" })
    .set("#wishSection", { display: "flex" })
    .from(".wish-card", 0.8, { opacity: 0, scale: 0.8, ease: Back.easeOut })
    .add(() => {
      const submitBtn = document.getElementById("submitWish");
      const wishInput = document.getElementById("wishInput");
      const wishConfirm = document.getElementById("wishConfirm");

      function onSubmit() {
        const val = wishInput.value.trim();
        if (!val) { wishInput.focus(); return; }
        fetch("https://birthday-wishlist.xxx.workers.dev/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wish: val, time: new Date().toISOString() })
        }).catch(() => {});
        wishInput.style.display = "none";
        submitBtn.style.display = "none";
        wishConfirm.style.display = "block";
        TweenMax.from(wishConfirm, 0.5, { opacity: 0, scale: 0.5, ease: Back.easeOut });
        setTimeout(() => tl.resume(), 1500);
      }

      submitBtn.onclick = onSubmit;
      wishInput.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } };
      wishInput.focus();
      tl.pause();
    })
    .to(".wish-card-overlay", 0.4, { opacity: 0 })
    .set("#wishSection", { display: "none", opacity: 1 })

    // 8. 结尾
    .set(".nine", { opacity: 1, pointerEvents: "auto" })
    .staggerFrom(".nine p", 1, { opacity: 0, y: -20, rotationX: 5, skewX: "15deg" }, 1.2)
    .to(".last-smile", 0.5, { rotation: 90 }, "+=1");

  // 重播
  document.getElementById("replay").onclick = function() {
    document.getElementById("wishInput").style.display = "";
    document.getElementById("submitWish").style.display = "";
    document.getElementById("wishConfirm").style.display = "none";
    tl.restart();
    return false;
  };
}

fetchData();

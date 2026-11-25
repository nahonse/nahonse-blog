// 글 화면 다듬기. 원고는 그대로 두고 보이는 모양만 바꾼다. 스크립트가 안 돌면 예전 모양(다 펼쳐짐) 그대로.
(function () {
  var c = document.querySelector(".post-content"); if (!c) return;
  // 출처 목록 접기(2026-11-25 사용자: "궁금한 사람만 볼 텐데 있으면 글만 어려워 보여"). 기준일 안내(blockquote)는 그대로 보임
  c.querySelectorAll("h2").forEach(function (h) {
    if (h.textContent.trim() !== "출처") return;
    var ls = [], n = 0;
    for (var e = h.nextElementSibling; e && !/^(H2|BLOCKQUOTE|HR)$/.test(e.tagName); e = e.nextElementSibling)
      if (e.tagName === "UL" || e.tagName === "OL") { ls.push(e); n += e.children.length; }
    if (!ls.length) return;
    var sp = document.createElement("span"); sp.className = "src-fold-btn"; h.appendChild(sp);
    h.classList.add("src-fold"); h.setAttribute("role", "button"); h.tabIndex = 0;
    var set = function (open) { ls.forEach(function (l) { l.hidden = !open; }); h.setAttribute("aria-expanded", open); sp.textContent = n + "개 · " + (open ? "접기 ▴" : "펼치기 ▾"); };
    var hit = function () { return decodeURIComponent(location.hash.slice(1)) === h.id; };
    set(hit()); // 목차에서 "출처"를 눌러 들어오면 펼친 채로
    var t = function () { set(h.getAttribute("aria-expanded") !== "true"); };
    h.addEventListener("click", t);
    h.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); t(); } });
    window.addEventListener("hashchange", function () { if (hit()) set(true); });
  });
})();

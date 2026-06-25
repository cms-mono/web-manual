/* ============================================================
   매뉴얼 셀 — TW Agent × KT 양방향서비스
   ------------------------------------------------------------
   이 한 건이 "TW Agent으로 KT 양방향서비스 연동하는 절차" 매뉴얼이다.
   실제 내용을 채울 때는 아래 steps(또는 features)를 직접 편집한다.
   - 지금은 공용 더미(HUB_TPL)를 호출하는 상태(= 미작성).
   - 명시적으로 쓰려면 T.apiSteps("양방향") 부분을 steps 배열로 교체:
       steps: [
         { title: "...", body: "...", note: "...", list: ["..."],
           shot: { url: "...", label: "..." } },
       ]
   선택 필드: intro(섹션 설명 문구), download.meta / download.title 덮어쓰기
   ============================================================ */
(function () {
  "use strict";
  var T = window.HUB_TPL;
  var C = (window.HUB_CONTENT = window.HUB_CONTENT || {});
  var A = (C["tw"] = C["tw"] || {});

  A["twoway"] = {
    // intro: "...",                 // (선택) 섹션 상단 설명 덮어쓰기
    // download: { meta: "PDF · 2026-00-00" },  // (선택)
    steps: T.apiSteps("양방향"),  // API 연동 더미
  };
})();

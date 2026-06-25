/* ============================================================
   매뉴얼 셀 — 서비스 API × KT RCS
   ------------------------------------------------------------
   이 한 건이 "서비스 API으로 KT RCS 연동하는 절차" 매뉴얼이다.
   실제 내용을 채울 때는 아래 steps(또는 features)를 직접 편집한다.
   - 지금은 공용 더미(HUB_TPL)를 호출하는 상태(= 미작성).
   - 명시적으로 쓰려면 T.apiSteps("RCS") 부분을 steps 배열로 교체:
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
  var A = (C["openapi"] = C["openapi"] || {});

  A["rcs"] = {
    // 본문 미작성 — 공사중 표기(준비되면 features/steps를 실제 내용으로 교체)
    features: [
      { id: "send", name: "발송 연동", construction: true,
        intro: "스마트메시지 RCS API 연동 가이드는 준비 중입니다. 곧 업데이트될 예정입니다." },
    ],
  };
})();

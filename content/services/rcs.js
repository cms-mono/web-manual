/* ============================================================
   서비스 콘텐츠 셀 — KT 스마트메시지 RCS
   ------------------------------------------------------------
   서비스 상세 페이지의 '서비스 이용 방법' 플로우(사전 준비 · 발송 · 결과 조회).
   step 형태는 에이전트 콘텐츠 셀과 동일하여 CapStep으로 렌더된다.
   ※ RCS API/Hermes 세부 규격 일부는 확인 필요 표기.
   ============================================================ */
(function () {
  "use strict";
  var S = (window.HUB_SVC = window.HUB_SVC || {});

  S["rcs"] = {
    flow: [
      /* ───────── 1. 사전 준비 (RCS Biz Center) ───────── */
      {
        id: "signup",
        title: "사전 준비 — RCS Biz Center 등록",
        body: "RCS 발송 전, <b>RCS Biz Center(RBC)</b>에서 회원가입 후 브랜드·대화방을 등록하고 <b>KT에 운영 권한을 부여</b>해야 합니다.",
        list: [
          "<b>① 회원가입</b> — RCS Biz Center(<code>rcsbizcenter.com</code>) 가입",
          "<b>② 브랜드 등록</b> — 발송에 사용할 RCS 브랜드 등록",
          "<b>③ 대화방 등록</b> — 브랜드의 대화방(채널) 등록",
          "<b>④ 운영 권한 부여</b> — <b>브랜드 운영 관리 → 대행사 운영권한 부여</b>에서 <b>케이티(<code>ktbizrcs</code>)</b>에게 <b>운영권한(관리)</b>을 부여",
        ],
        note: "<b>④ 운영권한(<code>ktbizrcs</code>) 부여가 누락되면 KT를 통한 발송이 되지 않습니다.</b> 구체 화면·등록 항목은 RBC 안내를 따릅니다. <i>(세부 절차는 확인 필요)</i>",
      },

      /* ───────── 2. 발송 방법 (웹 / API / Agent) ───────── */
      {
        id: "send",
        title: "발송 방법",
        body: "KT RCS는 <b>웹 발송 · API 발송 · Agent 발송</b> 세 가지 방법으로 보낼 수 있습니다.",
        tables: [
          {
            label: "발송 방법 비교",
            cols: ["방법", "설명", "적합 환경"],
            colWidths: ["22%", "44%", "34%"],
            rows: [
              ["웹 발송 (KT 헤르메스)", "헤르메스 포털에서 직접 작성·발송", "소량·수동 발송, 개발 없이"],
              ["API 발송", "REST API로 발송 요청", "시스템 연동·발송 자동화"],
              ["Agent 발송", "MCS / X_MCS Agent(RCS 버전)로 DB 기반 발송", "기존 스마트메시지 Agent 환경·대량"],
            ],
          },
        ],
        list: [
          "<b>웹 발송</b> — <b>KT 헤르메스</b>(<code>rcs.hermes.kt.com</code>) 로그인 후 발송",
          "<b>API 발송</b> — REST API로 발송 요청 <i>(API 포털·규격은 확인 필요)</i>",
          "<b>Agent 발송</b> — <b>MCS &amp; X_MCS Agent(RCS 버전)</b>로 발송. 기존 <code>SDK_SMS/MMS_SEND</code> 테이블에 <code>RCS_*</code> 컬럼을 채워 발송",
        ],
        note: "상세 연동은 우측 <b>연동 방법</b>에서 방식을 선택해 매뉴얼에서 확인하세요. Agent 방식은 ‘RCS 버전’ 매뉴얼을, 웹 발송은 헤르메스 포털을 참고합니다.",
        cta: { href: "#/agent/mcs?sec=sec-rcs", label: "Agent 연동 매뉴얼 보기 (RCS 버전)", icon: "cpu" },
      },

      /* ───────── 3. 결과 조회 ───────── */
      {
        id: "result",
        title: "결과 조회",
        body: "발송 결과(전송 성공/실패)는 아래 방법으로 확인합니다.",
        list: [
          "<b>API 조회</b> — 결과 조회 API를 호출해 전송 결과를 확인",
          "<b>Webhook(콜백)</b> — 결과를 받을 URL을 등록해 두면 KT가 결과를 해당 URL로 전달(푸시)",
          "<b>Agent 발송 시</b> — <code>SDK_*MS_REPORT_DETAIL</code> 의 <code>RCS_ERROR_CODE</code> 등 <code>RCS_*</code> 결과 컬럼으로 확인 (‘RCS 버전’ 매뉴얼 참조)",
        ],
        note: "API 조회·Webhook의 세부 규격(요청·응답 포맷, 등록 방법)은 <i>확인 필요</i>. Agent 방식 결과 컬럼은 RCS 버전 매뉴얼의 ‘결과 · 응답코드’를 참고하세요.",
      },
    ],
  };
})();

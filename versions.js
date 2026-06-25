/* ============================================================
   문서 버전 이력 (단일 출처)
   ------------------------------------------------------------
   웹 매뉴얼의 각 항목이 어떤 원본 매뉴얼(버전)을 기준으로 작성되었는지
   관리한다. 최신 매뉴얼 입수 시 아래를 갱신한다.

   [갱신 방법]
   1) sources[] 에서 해당 문서의 ver / docDate / agentVer / change 수정
   2) 본문 가이드 반영 후 status: "done" + reflected: "YYYY-MM-DD" 기록
   3) changelog[] 맨 위에 작업 한 줄 추가, 상단 updated 날짜 갱신

   status: "done"(반영 완료) | "pending"(반영 대기) | "planned"(작성 예정)
   ============================================================ */
(function () {
  "use strict";
  window.HUB_VERSIONS = {
    updated: "2026-06-23",
    note: "원본은 <b>McsAgent(레거시 · 1·2센터)</b> 매뉴얼 기준입니다. <b>차세대(X_McsAgent)</b> 매뉴얼은 별도 버전이 있으나 절차가 동일하여 같은 항목에 통합 표기합니다(센터·접속 IP만 차이). <b>스마트메시지 Biz</b>(문자·음성·팩스)와 <b>스마트메시지 RCS</b> 버전 매뉴얼을 모두 포함합니다. (발행: ㈜다이얼로그스페이스)",

    // ── 항목별 기준 원본 매뉴얼 ──────────────────────────────
    sources: [
      // ── MCS Agent (레거시) · 스마트메시지 Biz ──
      { agent: "mcs", file: "MCS_Agent_Manual_설치가이드.pdf", ver: "1.4", docDate: "2023-07-19", agentVer: "4.3.0", target: "1. 설치 가이드", status: "done", reflected: "2026-06-04", change: "설치 가능 DBMS·RESERVED 맞춤 설정" },
      { agent: "mcs", file: "MCS_Agent_Manual_문자메시지.pdf", ver: "1.4", docDate: "2022-03-16", agentVer: "4.2.5", target: "2. 문자(SMS)", status: "done", reflected: "2026-06-04", change: "RESERVED7~9 · STATUS_TEXT" },
      { agent: "mcs", file: "MCS_Agent_Manual_멀티미디어메시지.pdf", ver: "1.6", docDate: "2022-06-27", agentVer: "4.2.5", target: "3. 멀티메시지(LMS·MMS)", status: "done", reflected: "2026-06-04", change: "MMS 사이즈 정보 변경" },
      { agent: "mcs", file: "MCS_Agent_Manual_음성메시지.pdf", ver: "1.5", docDate: "2022-03-16", agentVer: "4.2.5", target: "4. 음성(VMS)", status: "done", reflected: "2026-06-04", change: "음성 규격 · MSTG · TTS Tag" },
      { agent: "mcs", file: "MCS_Agent_Manual_팩스메시지.pdf", ver: "1.4", docDate: "2022-03-16", agentVer: "4.2.5", target: "5. 팩스(FMS)", status: "done", reflected: "2026-06-04", change: "Agent 최신버전 반영" },

      // ── X_MCS Agent (차세대) · 스마트메시지 Biz ── (레거시와 버전·절차 동일, 센터·IP만 차이)
      { agent: "xmcs", file: "X_MCS_Agent_Manual_설치가이드.pdf", ver: "1.4", docDate: "2023-07-19", agentVer: "4.3.0", target: "1. 설치 가이드", status: "done", reflected: "2026-06-04", change: "레거시(MCS)와 동일 — 차세대" },
      { agent: "xmcs", file: "X_MCS_Agent_Manual_문자메시지.pdf", ver: "1.4", docDate: "2022-03-16", agentVer: "4.2.5", target: "2. 문자(SMS)", status: "done", reflected: "2026-06-04", change: "레거시(MCS)와 동일 — 차세대" },
      { agent: "xmcs", file: "X_MCS_Agent_Manual_멀티미디어메시지.pdf", ver: "1.6", docDate: "2022-06-27", agentVer: "4.2.5", target: "3. 멀티메시지(LMS·MMS)", status: "done", reflected: "2026-06-04", change: "레거시(MCS)와 동일 — 차세대" },
      { agent: "xmcs", file: "X_MCS_Agent_Manual_음성메시지.pdf", ver: "1.5", docDate: "2021-11-05", agentVer: "4.2.5", target: "4. 음성(VMS)", status: "done", reflected: "2026-06-04", change: "레거시(MCS)와 동일 — 차세대" },
      { agent: "xmcs", file: "X_MCS_Agent_Manual_팩스메시지.pdf", ver: "1.4", docDate: "2021-11-05", agentVer: "4.2.5", target: "5. 팩스(FMS)", status: "done", reflected: "2026-06-04", change: "레거시(MCS)와 동일 — 차세대" },

      // ── MCS Agent-rcs (레거시) · 스마트메시지 RCS ──
      { agent: "mcs-rcs", file: "rcs버전/mcs/MCS_Agent_Manual_설치가이드_RCS.pdf", ver: "1.6", docDate: "2023-07-04", agentVer: "4.3.2", target: "1. 설치·RCS 계정 설정", status: "done", reflected: "2026-06-19", change: "RCS 계정·Agency Key, RESERVED 맞춤 설정" },
      { agent: "mcs-rcs", file: "rcs버전/mcs/MCS_Agent_Manual_문자메시지_RCS.pdf", ver: "1.6", docDate: "2023-07-04", agentVer: "4.3.2", target: "3. 문자형 RCS(RCSSMS)", status: "done", reflected: "2026-06-19", change: "RCS 발송(RCSSMS)·BrandKey·버튼 규격" },
      { agent: "mcs-rcs", file: "rcs버전/mcs/MCS_Agent_Manual_멀티미디어메시지_RCS.pdf", ver: "1.8", docDate: "2023-07-04", agentVer: "4.3.2", target: "4. 멀티미디어형 RCS", status: "done", reflected: "2026-06-19", change: "RCSLMS·RCSMMS(카드/캐러셀)·RCSTMPL·첨부·BrandKey" },
      { agent: "mcs-rcs", file: "rcs버전/mcs/MCS_Agent_Manual_음성메시지.pdf", ver: "1.5", docDate: "2022-03-16", agentVer: "4.2.5", target: "(음성 VMS — RCS 변형 없음)", status: "done", reflected: "2026-06-19", change: "표준 매뉴얼과 동일 (공용)" },
      { agent: "mcs-rcs", file: "rcs버전/mcs/MCS_Agent_Manual_팩스메시지.pdf", ver: "1.4", docDate: "2022-03-16", agentVer: "4.2.5", target: "(팩스 FMS — RCS 변형 없음)", status: "done", reflected: "2026-06-19", change: "표준 매뉴얼과 동일 (공용)" },

      // ── X_MCS Agent-rcs (차세대) · 스마트메시지 RCS ── (레거시 RCS와 버전·절차 동일)
      { agent: "xmcs-rcs", file: "rcs버전/xmcs/X_MCS_Agent_Manual_설치가이드_RCS.pdf", ver: "1.6", docDate: "2023-07-04", agentVer: "4.3.2", target: "1. 설치·RCS 계정 설정", status: "done", reflected: "2026-06-19", change: "레거시 RCS와 동일 — 차세대" },
      { agent: "xmcs-rcs", file: "rcs버전/xmcs/X_MCS_Agent_Manual_문자메시지_RCS.pdf", ver: "1.6", docDate: "2023-07-04", agentVer: "4.3.2", target: "3. 문자형 RCS(RCSSMS)", status: "done", reflected: "2026-06-19", change: "레거시 RCS와 동일 — 차세대" },
      { agent: "xmcs-rcs", file: "rcs버전/xmcs/X_MCS_Agent_Manual_멀티미디어메시지_RCS.pdf", ver: "1.8", docDate: "2023-07-04", agentVer: "4.3.2", target: "4. 멀티미디어형 RCS", status: "done", reflected: "2026-06-19", change: "레거시 RCS와 동일 — 차세대" },
      { agent: "xmcs-rcs", file: "rcs버전/xmcs/X_MCS_Agent_Manual_음성메시지.pdf", ver: "1.5", docDate: "2021-11-05", agentVer: "4.2.5", target: "(음성 VMS — RCS 변형 없음)", status: "done", reflected: "2026-06-19", change: "표준 매뉴얼과 동일 (공용)" },
      { agent: "xmcs-rcs", file: "rcs버전/xmcs/X_MCS_Agent_Manual_팩스메시지.pdf", ver: "1.4", docDate: "2021-11-05", agentVer: "4.2.5", target: "(팩스 FMS — RCS 변형 없음)", status: "done", reflected: "2026-06-19", change: "표준 매뉴얼과 동일 (공용)" },

      // ── 공통 참고 자료 (에이전트 공용 보조 문서) ──
      { agent: "common", file: "Xroshot VMS 시나리오 설명서(1.1).pdf", ver: "1.1", docDate: "—", agentVer: "", target: "음성(VMS) › 다단계 시나리오(MSTG)", status: "done", reflected: "2026-06-10", change: "NODE_TYPE 시나리오·DTMF·답변 녹음·상담원 연결 규격" },
      { agent: "common", file: "TTS 고객 작성법 Tag설명서", ver: "—", docDate: "—", agentVer: "", target: "음성(VMS) › TTS 작성법(DioTTS)", status: "done", reflected: "2026-06-10", change: "TTS 발음·억양 태그(speed·volume·pause·date·money 등)" },
    ],

    // 출처 매뉴얼 그룹(에이전트) 정의 — 출처 표를 에이전트별로 접어서 표시
    sourceAgents: [
      { id: "mcs", name: "MCS Agent", sub: "레거시 · 1·2센터 · 스마트메시지 Biz" },
      { id: "xmcs", name: "X_MCS Agent", sub: "차세대 센터 · 스마트메시지 Biz" },
      { id: "mcs-rcs", name: "MCS Agent-rcs", sub: "레거시 · 스마트메시지 RCS" },
      { id: "xmcs-rcs", name: "X_MCS Agent-rcs", sub: "차세대 · 스마트메시지 RCS" },
      { id: "common", name: "공통 참고 자료", sub: "VMS 시나리오 · TTS 등 (에이전트 공용 보조 문서)" },
    ],

    // ── 웹 매뉴얼 업데이트 내역 (최신이 위) ──────────────────────
    //   { date, area: 변경한 페이지/영역, items: [고객 친화적 작업 내용] }
    changelog: [
      { date: "2026-06-23", area: "openAPI · SDK 다운로드 · 적용", items: [
        "openAPI 매뉴얼에 ‘SDK 다운로드 · 적용’ 탭 신설 (첫 번째 대분류)",
        "Java·Node.js·PHP(공식 포털) / Python(별도 링크) SDK 다운로드 링크 제공",
        "공통 적용 흐름 + 언어별(Java/Node/PHP/Python) 적용 방법 안내 추가",
      ] },
      { date: "2026-06-23", area: "API 연동 구조 정리", items: [
        "‘서비스 API’ → ‘openAPI’ 로 명칭 변경, openAPI는 스마트메시지 Biz 전용으로 정리",
        "Communis · RCS · 양방향 API를 각각 별도 항목으로 분리",
        "openAPI 매뉴얼 상단 버튼을 다운로드 대신 openAPI 사이트 바로가기로 교체",
      ] },
      { date: "2026-06-23", area: "openAPI (크로샷 BIZ API) · 스마트메시지 Biz", items: [
        "openAPI 연동 매뉴얼 신규 공개 — 인증(HMAC-SHA256)·메시지 발송·결과 조회·예약 취소·결과 코드 정리",
        "SMS 발송 테스트 코드 추가(Python · cURL · Node.js) + 결과 조회 코드(Python)",
        "발송 Body 필드·MessageSubType·동보/대량 구조·응답 규격을 표로 정리",
      ] },
      { date: "2026-06-22", area: "스마트메시지 RCS 서비스 페이지", items: [
        "사전 준비(RCS Biz Center 가입 → 브랜드·대화방 등록 → KT(ktbizrcs) 운영권한 부여) 안내 추가",
        "발송 방법 3종(웹·헤르메스 / API / Agent) 비교와 결과 조회(API·Webhook) 안내 추가",
      ] },
      { date: "2026-06-22", area: "스마트메시지 Biz 서비스 페이지", items: [
        "서비스 페이지에 ‘관련 사이트’ 바로가기 버튼과 ‘서비스 이용 방법’(가입 · 발송 · 사이트 이용) 안내 추가",
        "발송 방법에 에이전트·OpenAPI 두 방식의 발송/리포트 흐름과 비교표 추가",
        "우측 고정 패널에서 연동 방식(에이전트·API)을 골라 해당 매뉴얼로 바로 이동",
      ] },
      { date: "2026-06-22", area: "문서 이력 · 참고 매뉴얼", items: [
        "참고한 원본 매뉴얼을 에이전트별(MCS / X_MCS / MCS-rcs / X_MCS-rcs)로 나누고, 누르면 실제 사용한 PDF 파일·버전 목록이 펼쳐지도록 정리",
        "RCS 버전 매뉴얼(설치 v1.6 · 문자 v1.6 · 멀티미디어 v1.8)과 차세대(X_MCS) 매뉴얼을 출처 목록에 추가",
        "VMS에서 참고한 ‘Xroshot VMS 시나리오 설명서’·‘TTS 고객 작성법 Tag 설명서’를 ‘공통 참고 자료’로 추가",
      ] },
      { date: "2026-06-22", area: "메인 화면 · Odyssey", items: [
        "‘오딧세이’ 표기를 ‘Odyssey’(영문)로 변경",
        "Odyssey 카드를 누르면 별도 매뉴얼 사이트로 바로 이동",
        "종료된 ‘Odyssey Air’ 항목 삭제",
      ] },
      { date: "2026-06-22", area: "전체 (모든 매뉴얼)", items: [
        "소제목을 클릭하면 해당 섹션 링크가 복사되어, 고객 안내 시 그 위치로 바로 보낼 수 있음",
        "검색으로 이동할 때 키워드가 화면 중앙에 오도록 위치 개선",
      ] },
      { date: "2026-06-22", area: "멀티메시지(LMS·MMS)", items: [
        "제목 길이 규격(스마트메시지 공통 64byte) 표 추가",
        "본문 최대 2,000byte 표기 명확화",
      ] },
      { date: "2026-06-22", area: "음성(VMS) · 팩스(FMS)", items: [
        "첨부 파일 규격을 별도 ‘발송 파일 규격’ 섹션으로 분리해 샘플 쿼리 바로 앞에 배치",
      ] },
      { date: "2026-06-19", area: "RCS (RCS 버전 Agent)", items: [
        "RCS 발송 매뉴얼 신규 작성 — 설치·RCS 계정 설정 / 공통 규격 / 문자형 / 멀티미디어형(카드·캐러셀·템플릿) / 결과·응답코드 5개 탭",
      ] },
      { date: "2026-06-19", area: "문자 · 멀티 · 음성 · 팩스", items: [
        "여러 표의 간격과 열 정렬을 통일해 보기 편하게 정리",
        "샘플 INSERT 쿼리 화면에 ‘발송 쿼리 생성기’ 바로가기 버튼 추가",
      ] },
      { date: "2026-06-19", area: "멀티메시지(LMS·MMS)", items: [
        "첨부 컨텐츠·사이즈 표 정렬을 정리하고 이미지 해상도 제한을 강조 표기",
      ] },
      { date: "2026-06-19", area: "문자 · 멀티 · 음성 · 팩스", items: [
        "각 탭 목차를 ‘발송하기 / DB 테이블 규격 / 결과 확인’ 3그룹으로 구분",
        "표 항목을 ‘발송 요청 (SDK_VMS_SEND)’처럼 업무명과 함께 표기해 이해하기 쉽게 개선",
      ] },
      { date: "2026-06-19", area: "음성(VMS)", items: [
        "‘서버 파일’ 발송 샘플의 발송타입 값을 규격에 맞게 정정",
      ] },
      { date: "2026-06-19", area: "음성(VMS) · 팩스(FMS)", items: [
        "채널별 응답코드는 자주 쓰는 코드만 발췌하고, 전체 코드는 ‘응답코드’ 탭 한 곳에서 보도록 정리",
        "‘전체 응답코드 보기’ 버튼 추가",
      ] },
      { date: "2026-06-19", area: "전체 (좌측 목차)", items: [
        "긴 소제목이 목차에서 줄바꿈되던 문제 개선 — 목차는 핵심만 짧게 표시(마우스를 올리면 전체 제목 표시)",
      ] },
      { date: "2026-06-19", area: "음성(VMS)", items: [
        "사용 가능한 파일을 ‘.pcm(음성) · .mstg(다단계)’ 두 가지로 명확화",
        "샘플의 .wav 예시를 .pcm으로 정정",
      ] },
      { date: "2026-06-18", area: "전체 (상단 메뉴)", items: [
        "홈을 거치지 않고 에이전트·서비스·결과코드·문서이력으로 바로 이동하는 상단 메뉴 추가",
      ] },
      { date: "2026-06-18", area: "에이전트 매뉴얼 (좌측 메뉴)", items: [
        "좌측 대제목을 에이전트 이름(MCS & X_MCS Agent)으로 표기",
      ] },
      { date: "2026-06-18", area: "결과코드 · 응답코드", items: [
        "내부용 안내 문구를 ‘모노커뮤니케이션즈 문의’로 정리",
        "음성·팩스 응답코드를 코드별로 분리",
        "‘응답코드(TCS_RESULT)’ 섹션 신설",
      ] },
      { date: "2026-06-18", area: "검색", items: [
        "검색 결과로 이동 시 키워드를 강조하고 해당 위치로 스크롤",
        "결과코드(숫자) 검색은 ‘결과코드’ 페이지로 바로 이동",
        "검색 후에도 검색어를 유지해 이어서 검색 가능",
      ] },
      { date: "2026-06-18", area: "전체 (코드 블록)", items: [
        "복사가 필요한 예제/쿼리와 설명용 코드를 구분",
        "긴 INSERT 쿼리를 DBMS·발송타입별 탭으로 분리",
      ] },
      { date: "2026-06-18", area: "결과코드 · RCS", items: [
        "공식 KT RCS 에러코드(v2.83) 전 범위 반영(총 647건)",
      ] },
      { date: "2026-06-18", area: "결과코드", items: [
        "서비스별 결과코드를 한곳에서 조회·검색하는 ‘결과코드’ 페이지 신설",
      ] },
      { date: "2026-06-10", area: "음성(VMS) · 전체", items: [
        "음성(VMS)에 다단계 시나리오·TTS 작성법 추가",
        "설치 준비사항·방화벽 표를 이미지로 저장하는 기능 추가",
        "코드 박스 복사 버튼·검색 색인 개선",
      ] },
      { date: "2026-06-04", area: "음성(VMS) · 팩스(FMS)", items: [
        "음성·팩스 탭 신규 작성 (테이블·발송 옵션·통계·샘플·응답코드)",
      ] },
      { date: "2026-06-04", area: "멀티메시지(LMS·MMS)", items: [
        "멀티메시지 탭 신규 작성",
      ] },
      { date: "2026-06-04", area: "문서 이력", items: [
        "문서 버전 이력 페이지 신설",
      ] },
      { date: "2026-06-04", area: "문자(SMS)", items: [
        "문자 탭 신규 작성 (테이블 4종·통계·샘플·응답코드)",
      ] },
      { date: "2026-06-04", area: "설치 가이드", items: [
        "설치 가이드 보강 (DBMS 지원·로그 설명·다중 Agent·발송 쿼리 생성기)",
      ] },
    ],
  };
})();

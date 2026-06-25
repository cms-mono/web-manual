/* ============================================================
   통합 매뉴얼 허브 — 공용 더미 생성기 (HUB_TPL)
   ------------------------------------------------------------
   각 셀(content/<agent>/<service>.js)이 실제 내용을 채우기 전까지
   임시로 호출하는 공통 스텝 생성기다. 실제 매뉴얼을 작성할 때는
   셀 파일에서 이 함수 호출 대신 명시적 steps 배열을 직접 쓰면 된다.

   step 형태:  { title, body, note?, list?, shot? }
   shot 형태:  { url, label }
   ============================================================ */
(function () {
  "use strict";
  const H = window.HUB;

  /* shot 플레이스홀더 헬퍼 */
  const shot = (url, label) => ({ url, label });

  /* API(openAPI / M2X 계열) 연동 공통 흐름 */
  function apiSteps(svcLabel, opts) {
    opts = opts || {};
    return [
      {
        title: "발송 키 발급 받기",
        body:
          "관리 콘솔의 <code>설정 › 연동 관리</code>에서 API Key와 Secret을 발급받습니다. 발급된 키는 외부에 노출되지 않도록 안전하게 보관하세요.",
        note: "키는 서비스·프로젝트 단위로 발급되며, 재발급 시 기존 키는 즉시 만료됩니다.",
        shot: shot("console.example.com/keys", "API Key 발급 화면"),
      },
      {
        title: "엔드포인트 · 인증 헤더 설정",
        body:
          "발송 요청은 REST 엔드포인트로 전송합니다. 모든 요청 헤더에 발급키 기반 인증 토큰을 포함해야 합니다.",
        list: [
          "Base URL: <code>https://api.example.com/v1</code>",
          "인증: <code>Authorization: Bearer {AccessToken}</code>",
          "콘텐츠 타입: <code>application/json; charset=UTF-8</code>",
        ],
      },
      {
        title: `${svcLabel} 발송 요청`,
        body:
          `발신번호·수신번호·메시지 본문을 담아 <code>POST /messages</code>를 호출합니다. ${
            opts.extra || ""
          }`,
        note: "발신번호는 사전에 사전등록(발신번호 등록)이 완료된 번호만 사용할 수 있습니다.",
        shot: shot("api.example.com/v1/messages", `${svcLabel} 발송 요청 / 응답 예시`),
      },
      {
        title: "발송 결과 · 리포트 확인",
        body:
          "발송 요청의 즉시 응답(messageId)과 별도로, 통신사 처리 결과는 Webhook 또는 <code>GET /reports</code> 폴링으로 수신합니다.",
        list: ["성공/실패 코드 매핑 확인", "Webhook 수신 URL 등록(권장)", "재발송 정책 설정"],
      },
    ];
  }

  /* TCP 소켓 엔진(McsAgent / X_McsAgent) 공통 흐름 */
  function socketSteps(svcLabel, center) {
    const c = center ? H.CENTERS[center] : null;
    return [
      {
        title: "엔진 설치 및 라이선스 등록",
        body:
          "제공된 설치 패키지를 연동 서버에 설치하고 라이선스 파일을 등록합니다. 엔진은 데몬(서비스) 형태로 상주합니다.",
        note: "지원 OS·JVM 버전 등 사전 요구사항을 설치 가이드에서 먼저 확인하세요.",
        shot: shot("$ ./mcsagent install", "엔진 설치 콘솔"),
      },
      {
        title: "센터 접속 정보 설정",
        body: c
          ? `<b>${c.name} 센터</b>(${c.desc}) 접속을 위한 호스트·포트·인증 계정을 환경 설정 파일에 입력합니다.`
          : "연동 센터의 호스트·포트·인증 계정을 환경 설정 파일에 입력합니다.",
        list: [
          "<code>center.host</code> / <code>center.port</code> 입력",
          "소켓 계정(ID/PW) 등록",
          "TLS 사용 여부 설정",
        ],
        note: c
          ? `이 엔진은 ${c.name}(${c.desc})에 연동됩니다. 센터 구분은 KT 스마트메시지 연동에만 해당합니다.`
          : null,
      },
      {
        title: "소켓 세션 연결 테스트",
        body:
          "엔진을 기동하고 센터와의 TCP 세션이 정상 수립되는지 헬스체크 로그로 확인합니다. Keep-Alive 핑이 주기적으로 교환되어야 합니다.",
        shot: shot("logs/session.log", "세션 연결 로그 (CONNECTED)"),
      },
      {
        title: `${svcLabel} 발송 연동`,
        body:
          "애플리케이션은 엔진이 제공하는 연동 인터페이스(파일/소켓/DB 큐)로 발송 요청을 전달하고, 엔진이 센터로 중계합니다. 결과 리포트는 동일 인터페이스로 회신됩니다.",
        list: ["발송 요청 전문(packet) 구성", "결과 리포트 수신 핸들러 구현", "장애 시 재접속·재전송 정책 확인"],
      },
    ];
  }

  /* 카카오 알림톡 — 발신프로필 등록 가이드 기반 상세 본문 */
  const kakaoSteps = [
    {
      title: "카카오 비즈니스 로그인",
      body:
        "<code>business.kakao.com</code>에 접속해 카카오 계정으로 로그인합니다. 계정이 없다면 회원가입 후 안내를 따릅니다.",
      shot: shot("business.kakao.com", "카카오 비즈니스 로그인 화면"),
    },
    {
      title: "새 채널 만들기 — 유형 선택",
      body:
        "좌측 하단 <code>+ 새 채널 만들기</code>를 클릭하고 채널 유형을 선택합니다.",
      list: [
        "기본 채널형 — 카카오톡 프로필 채널(채팅·메시지·소식·쿠폰)",
        "오프라인 매장형 — 카카오맵 매장 등록까지 포함",
      ],
      shot: shot("business.kakao.com/new", "채널 유형 선택"),
    },
    {
      title: "사업자 정보 · 기본 정보 입력",
      body:
        "사업자등록증 정보와 채널 기본 정보(이름·검색용 아이디·카테고리)를 입력합니다. 입력한 검색용 ID는 이후 발신프로필 등록에 사용됩니다.",
      note: "검색용 ID는 등록 후 변경이 어렵습니다. 신중히 입력하세요.",
    },
    {
      title: "비즈니스 심사 신청 및 승인",
      body:
        "비즈니스 채널로 전환하기 위해 비즈니스 인증을 신청합니다. 카카오 심사가 승인되면 알림톡 발송 자격이 부여됩니다.",
      note:
        "카카오 측 심사 영역은 KT / Communis / Mono의 직접 지원 범위가 아닙니다. 심사 기준·반려 사유는 카카오 비즈니스 고객센터로 문의하세요.",
      shot: shot("business.kakao.com/review", "비즈니스 심사 신청"),
    },
    {
      title: "Communis 발신프로필 메뉴 이동",
      body:
        "Communis 콘솔에서 <code>카카오 비즈메시지 › 발신프로필 관리</code> 메뉴로 이동한 뒤 <code>발신프로필 등록</code>을 클릭합니다.",
      shot: shot("communis.example.com/kakao", "발신프로필 관리 화면"),
    },
    {
      title: "발신프로필 폼 입력 + 토큰 인증",
      body:
        "검색용 ID와 채널 관리자 휴대폰 번호를 입력하고 토큰을 요청합니다. 관리자 카카오톡으로 수신된 인증 토큰을 입력해 본인 인증을 완료합니다.",
      note: "토큰은 채널 관리자로 초대된 사람의 카카오톡으로 전송됩니다.",
    },
    {
      title: "발신 키 발급 완료",
      body:
        "인증이 완료되면 발신 키(SenderKey)가 발급됩니다. 이 키로 알림톡/친구톡 발송 API를 호출할 수 있습니다.",
      shot: shot("communis.example.com/senderkey", "발신 키 발급 완료"),
    },
  ];

  /* Communis 기능별 콘텐츠(문자/RCS/알림톡/국제SMS) 기본 구성 */
  function communisFeatures() {
    return [
      {
        id: "sms",
        name: "문자",
        dot: "#0e9488",
        intro: "Communis를 통한 문자(SMS/LMS/MMS) 발송 연동입니다. 내부적으로 KT 스마트메시지로 발송됩니다.",
        steps: apiSteps("문자", { extra: "장문(LMS)·포토(MMS)는 본문 길이와 첨부 규격을 확인하세요." }),
      },
      {
        id: "rcs",
        name: "RCS",
        dot: "#4f46e5",
        intro: "Communis를 통한 KT RCS 발송 연동입니다. 리치카드·캐러셀 템플릿을 사용할 수 있습니다.",
        steps: apiSteps("RCS", { extra: "리치카드 템플릿은 사전 검수가 필요합니다." }),
      },
      {
        id: "kakao",
        name: "카카오 알림톡",
        dot: "#fbbf24",
        intro:
          "카카오 알림톡/친구톡을 발송하려면 카카오 발신프로필 등록이 선행되어야 합니다. Part A(카카오 채널 준비)와 Part B(Communis 발신프로필 등록) 두 단계로 진행됩니다.",
        steps: kakaoSteps,
        flow: [
          { tag: "A-1", txt: "카카오 비즈니스 로그인" },
          { tag: "A-2", txt: "채널 생성 (유형/사업자)" },
          { tag: "A-3", txt: "비즈니스 심사 신청" },
          { tag: "A-4", txt: "심사 승인 + ID 확인" },
          { tag: "B-1", txt: "Communis 메뉴 이동" },
          { tag: "B-2", txt: "발신프로필 입력" },
          { tag: "B-3", txt: "토큰 인증" },
          { tag: "B-4", txt: "발신 키 발급" },
        ],
      },
      {
        id: "intl",
        name: "국제 SMS",
        dot: "#0e7490",
        intro: "해외 수신번호로 발송하는 국제 SMS 연동입니다. 국가 코드·발송 가능 국가 정책을 확인하세요.",
        steps: apiSteps("국제 SMS", { extra: "수신번호는 E.164 형식(+국가코드)으로 입력합니다." }),
      },
    ];
  }

  /* 셀 등록용 전역 컨테이너 + 공용 생성기 노출 */
  window.HUB_CONTENT = window.HUB_CONTENT || {};
  window.HUB_TPL = {
    shot,
    apiSteps,
    socketSteps,
    kakaoSteps,
    communisFeatures,
  };
})();

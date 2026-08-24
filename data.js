/* ============================================================
   통합 매뉴얼 허브 — 데이터 모델
   서비스 / Agent / 매핑(2.3) 기준. 데이터 기반(반복형) 설계.
   신규 Agent는 AGENTS 배열에 한 줄(객체) 추가 + supports 매핑만
   채우면 양방향 네비게이션에 자동 반영된다.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 서비스 (4종) ---------------- */
  const SERVICES = [
    {
      id: "smart",
      name: "KT 스마트메시지 Biz",
      short: "스마트메시지",
      tagline: "문자 · 음성 · 팩스를 발송하는 KT 대표 메시징 서비스 (구 크로샷).",
      features: ["문자(SMS/LMS/MMS)", "음성(보이스)", "팩스"],
      hasCenter: true,
      icon: "message",
      sites: [
        { kind: "관리자 포털", title: "MSP (레거시)", url: "https://msp.kttcs.com", desc: "발송·과금·세션·통계 조회 (1·2센터)", manualUrl: "https://cms.mono.co.kr/messaging-api/v1/bd/system/file/link/download?link=MTAyMV4xNzQ2" },
        { kind: "관리자 포털", title: "MSP (차세대)", url: "https://msp.xroshot.com", desc: "발송·과금·세션·통계 조회 (차세대 센터)", manualUrl: "https://cms.mono.co.kr/messaging-api/v1/bd/system/file/link/download?link=MTAyMl4xNzQ2" },
        { kind: "발신번호 관리", title: "발신번호 관리 (CRS)", url: "https://crs.kttcs.com/", desc: "발신번호 조회·삭제 (번호 변작 관리 시스템)", manualUrl: "https://cms.mono.co.kr/messaging-api/v1/bd/system/file/link/download?link=MTAyM14xNzQ2" },
        { kind: "Open API", title: "크로샷 Open API", url: "https://openapi.xroshot.com/", desc: "BIZ API 가이드, SDK 다운로드, API 테스트 (HMAC+IP 인증)" },
      ],
    },
    {
      id: "communis",
      name: "KT Communis",
      short: "Communis",
      tagline: "문자 · RCS · 카카오 알림톡 · 국제 SMS를 하나로 묶은 통합 메시징 서비스.",
      features: ["통합 API", "문자", "RCS", "카카오 알림톡", "메일·앱푸쉬", "국제 SMS", "2FA"],
      hasCenter: false,
      integrated: true,
      // 홈 카드 '지원 Agent 수' 표시용 오버라이드 — M2X ONE·Odyssey 2종이 지원(추후 문서화 예정).
      // 실제 노출/연결 전까지는 이 숫자로만 안내한다.
      agentCount: 2,
      // 이 서비스의 이용가이드(가이드 콘텐츠를 보유한 에이전트). 지정 시
      // /service/communis 경로에서 이 가이드를 바로 렌더한다(별도 에이전트 페이지 없음).
      guideAgentId: "communis_api",
      icon: "layers",
      sites: [
        { kind: "서비스 소개", title: "KT Communis", url: "https://communis.kt.co.kr/main/index.do", desc: "통합 메시징 API 플랫폼 · 요금 · 콘솔 로그인" },
        { kind: "이용 가이드", title: "Communis API 가이드", url: "https://communis.kt.co.kr/guide/guide.do", desc: "KT 공식 연동 규격 · API 가이드" },
      ],
    },
    {
      id: "rcs",
      name: "KT 스마트메시지 RCS",
      short: "RCS",
      tagline: "브랜드 카드 · 캐러셀 · 리치 콘텐츠를 발송하는 RCS 전용 서비스.",
      features: ["RCS 단문/장문", "리치카드", "캐러셀"],
      hasCenter: false,
      icon: "sparkle",
      sites: [
        { kind: "Biz Center", title: "RCS Biz Center", url: "https://www.rcsbizcenter.com/main", desc: "RCS 브랜드, 에이전트 등록 및 메시지 관리", manualUrl: "https://docs.rcsbizcenter.com/" },
        { kind: "발송 연동", title: "KT RCS Hermes", url: "https://rcs.hermes.kt.com/", desc: "RCS 발송 연동 게이트웨이, 운영 포털 (KT 관리)", manualUrl: "https://cms.mono.co.kr/messaging-api/v1/bd/system/file/link/download?link=MTAyNF4xNzQ3" },
      ],
    },
    {
      id: "twoway",
      name: "KT 양방향서비스",
      short: "양방향",
      tagline: "고객 회신을 수신하고 대화형 시나리오를 운영하는 양방향 송수신 서비스.",
      features: ["양방향 발송", "수신(인바운드)", "키워드 응답"],
      hasCenter: false,
      icon: "exchange",
      sites: [],
    },
  ];

  /* ---------------- Agent (접근 방식) ----------------
     provider: "service" | "KT" | "Mono"
     transport: "API" | "TCP_SOCKET"
     center: "legacy" | "next_gen" | null   (KT 스마트메시지 연동 엔진만)
     supports: [serviceId...]               (매핑표 2.3)
     status: "live" | "soon"
  */
  const AGENTS = [
    {
      id: "openapi",
      name: "openAPI",
      label: "API",
      provider: "service",
      transport: "API",
      center: null,
      desc: "KT 스마트메시지 Biz(크로샷)의 표준 REST API. 별도 엔진 설치 없이 HMAC 인증으로 SMS·LMS·MMS·VMS·FMS를 직접 발송한다.",
      kind: "api",
      aliases: ["openAPI", "open API", "REST API", "크로샷 API", "xroshot"],
      versions: [],
      supports: ["smart"],
      siteUrl: "https://openapi.xroshot.com/",
      siteLabel: "openAPI 사이트 바로가기",
      status: "live",
    },
    {
      id: "communis_api",
      name: "KT Communis API",
      label: "API",
      // 홈 카드에서 바로 API 공통 규격으로 진입시킨다(가이드 첫 페이지 대신).
      homeAnchor: "step-communis-common-1",
      provider: "service",
      transport: "API",
      center: null,
      desc: "Communis 통합 메시징 이용·연동 가이드 — 회원가입·발송 준비부터 웹 발송·REST API 연동까지.",
      kind: "api",
      aliases: ["communis api", "커뮤니즈 api", "communis 이용가이드", "커뮤니즈 이용가이드", "커뮤니즈 웹발송", "communis web"],
      versions: [],
      supports: ["communis"],
      // Communis는 서비스(통합 메시징)이며 별도 '에이전트'가 아니다. 이 항목은 서비스의
      // 이용가이드일 뿐이므로 홈 '에이전트별' 목록·상단 에이전트 메뉴에서는 감춘다.
      // (서비스 상세 페이지의 '연동 방법' 칩과 검색·직접 URL로는 계속 접근 가능)
      serviceGuide: true,
      // 한 페이지가 서비스 소개와 연동 방법을 겸하므로, 상단 메뉴 활성 표시를 구간별로 나눈다.
      // 아래 그룹을 보는 동안은 '서비스', 그 밖(웹 발송·API 연동)은 '이용 · 연동 방법'으로 표시.
      serviceScopeGroups: ["개요", "시작하기"],
      // 상세 페이지 상단 버튼 — 다운로드 대신 커뮤니즈 공식 사이트/가이드로 연결
      links: [
        { url: "https://communis.kt.co.kr/main/index.do", label: "커뮤니즈 사이트", icon: "external" },
        { url: "https://communis.kt.co.kr/guide/guide.do", label: "커뮤니즈 API 가이드", icon: "book" },
      ],
      status: "live",
    },
    {
      id: "rbc",
      name: "RCS Biz Center (RBC)",
      label: "사전 준비",
      provider: "service",
      transport: "API",
      center: null,
      desc: "RCS 발송 전 브랜드·대화방(발신번호)을 등록하는 이동통신 3사 공동 포털(rcsbizcenter.com) 사용 가이드.",
      cardSub: "rcsbizcenter.com · 브랜드·발신번호 등록",
      // 발송 방법이 아니라 '발송 전 준비' 절차라 홈에서 [기타 · 부록] 그룹에 둔다.
      kind: "etc",
      aliases: ["rbc", "rcs biz center", "알씨에스 비즈센터", "브랜드 등록", "대화방 등록", "발신번호 등록", "rcsbizcenter"],
      versions: [],
      supports: ["rcs"],
      links: [
        { url: "https://www.rcsbizcenter.com/", label: "RCS Biz Center", icon: "external" },
      ],
      status: "live",
    },
    {
      id: "kakao_biz",
      name: "카카오 비즈니스 채널",
      label: "사전 준비",
      provider: "service",
      transport: "API",
      center: null,
      desc: "알림톡·브랜드메시지 발송에 필요한 카카오톡 채널 생성과 커뮤니즈 발신프로필(발신키) 등록 가이드.",
      cardSub: "business.kakao.com · 채널·발신프로필",
      // 발송 방법이 아니라 '발송 전 준비' 절차라 홈에서 [기타 · 부록] 그룹에 둔다.
      kind: "etc",
      aliases: ["카카오 채널", "카카오 비즈니스", "발신프로필", "발신키", "senderkey", "kakaoSenderKey", "검색용 아이디", "알림톡 준비", "business.kakao.com"],
      versions: [],
      supports: ["communis"],
      links: [
        { url: "https://business.kakao.com/", label: "카카오 비즈니스", icon: "external" },
        { url: "https://center-pf.kakao.com/", label: "카카오 채널 관리자센터", icon: "external" },
      ],
      status: "live",
    },
    {
      id: "rcs_api",
      name: "RCS API",
      label: "API",
      provider: "service",
      transport: "API",
      center: null,
      desc: "KT 스마트메시지 RCS의 REST API 연동 방식.",
      kind: "api",
      aliases: ["rcs api"],
      versions: [],
      supports: ["rcs"],
      status: "live",
    },
    {
      id: "twoway_api",
      name: "양방향 API",
      label: "API",
      provider: "service",
      transport: "API",
      center: null,
      desc: "KT 양방향서비스의 REST API 연동 방식.",
      kind: "api",
      aliases: ["양방향 api", "twoway api"],
      versions: [],
      supports: ["twoway"],
      status: "live",
    },
    {
      id: "mcs",
      name: "KT MCS & X_MCS Agent",
      label: "엔진",
      provider: "KT",
      transport: "TCP_SOCKET",
      center: null, // 레거시·차세대 모두 포함(단일 센터 아님) — 차이는 본문에서 표기
      desc: "KT가 직접 제공하는 TCP 소켓 통신 엔진. 레거시(McsAgent)와 차세대(X_McsAgent)를 합친 연동 방식.",
      kind: "agent",
      cardSub: "KT 제공 · TCP 소켓 · 레거시 + 차세대", // 카드 보조 텍스트

      // 상세 페이지 헤더에 문단(불릿)으로 표시 — 카드/검색에는 위 desc 사용
      detailIntro: [
        "KT가 직접 제공하는 <b>TCP 소켓 통신 엔진</b>입니다.",
        "연동 센터에 따라 <b>레거시(McsAgent · 1·2센터)</b>와 <b>차세대(X_McsAgent · 차세대 센터)</b>로 나뉩니다.",
        "두 방식의 구성은 거의 동일하며, <b>일부 설정 값</b>만 다릅니다. (다른 부분은 본문에 따로 표기)",
        "<b>스마트메시지 Biz</b>(문자 · 음성 · 팩스)와 <b>스마트메시지 RCS</b>(브랜드 카드 · 캐러셀) 발송을 모두 지원합니다.",
        "단, <b>스마트메시지 RCS</b> 발송은 <b>RCS 전용 Agent</b>(<code>McsAgent-rcs</code> / <code>X_McsAgent-rcs</code>)가 별도로 제공됩니다. <b>스마트메시지 Biz</b>용과는 다른 설치 패키지입니다.",
      ],
      versions: ["스마트메시지 Biz", "스마트메시지 RCS"],
      supports: ["smart", "rcs"],
      status: "live",
    },
    {
      id: "m2x_one",
      name: "M2X ONE",
      label: "API 연동",
      provider: "Mono",
      transport: "API",
      center: null,
      kind: "agent",
      desc: "여러 서비스를 단일 연동 포인트로 통합한 Mono Agent. 스마트메시지·Communis·RCS를 함께 지원한다.",
      hidden: true, // 모노 제공 — 전체 공개하지 않고 특정 고객에게만 별도 안내(비공개)
      versions: [],
      supports: ["smart", "communis", "rcs"],
      status: "live",
    },
    {
      id: "tw",
      name: "TW Agent",
      label: "API 연동",
      provider: "Mono",
      transport: "API",
      center: null,
      kind: "agent",
      desc: "양방향 송수신 전용 Mono Agent. 인바운드 수신과 대화형 시나리오 연동을 담당한다.",
      hidden: true, // 모노 제공 — 전체 공개하지 않고 특정 고객에게만 별도 안내(비공개)
      versions: [],
      supports: ["twoway"],
      status: "live",
    },
    {
      id: "odyssey",
      name: "Odyssey",
      label: "API 연동",
      provider: "Mono",
      transport: "API",
      center: null,
      kind: "agent",
      desc: "M2X 계열을 리브랜딩한 차세대 Mono 통합 Agent. 매뉴얼은 별도 사이트에서 제공됩니다.",
      hidden: true, // 모노 제공 — 전체 공개하지 않고 특정 고객에게만 별도 안내(비공개)
      versions: [],
      supports: [],
      status: "live",
      externalUrl: "https://mono-communications.github.io/odyssey-manual/",
    },
  ];

  /* ---------------- 센터 구분 (스마트메시지 전용) ---------------- */
  const CENTERS = {
    legacy: { id: "legacy", name: "레거시", desc: "1·2센터", engine: "KT McsAgent" },
    next_gen: { id: "next_gen", name: "차세대", desc: "차세대 센터", engine: "KT X_McsAgent" },
  };

  /* ---------------- provider 메타 ---------------- */
  const PROVIDERS = {
    service: { key: "service", name: "서비스 자체", cls: "svc", av: "av-svc" },
    KT: { key: "KT", name: "KT 제공", cls: "kt", av: "av-kt" },
    Mono: { key: "Mono", name: "Mono 제공", cls: "mono", av: "av-mono" },
  };

  /* ---------------- 파생 헬퍼 ---------------- */
  const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
  const SERVICE_MAP = byId(SERVICES);
  const AGENT_MAP = byId(AGENTS);

  // 특정 서비스를 지원하는 Agent 목록 (status 무관 — soon이면 '추가 예정' 표기)
  function agentsForService(serviceId) {
    return AGENTS.filter(
      (a) => a.supports.includes(serviceId) || a.status === "soon"
    );
  }
  // 실제 지원(live)하는 Agent만 (hidden=비공개 제외)
  function liveAgentsForService(serviceId) {
    return AGENTS.filter((a) => !a.hidden && a.supports.includes(serviceId));
  }
  // 공개 노출 대상 Agent (hidden·serviceGuide 제외) — 홈 '에이전트별' 목록용.
  // serviceGuide(예: Communis 이용가이드)는 서비스 소속 가이드라 에이전트 목록에서 뺀다.
  function visibleAgents() {
    return AGENTS.filter((a) => !a.hidden && !a.serviceGuide);
  }
  /* 홈 '웹' 그룹 카드 — 콘솔(웹 화면)에서 직접 발송하는 방법으로 가는 바로가기.
     Agent/API처럼 별도 매뉴얼 주체가 아니라 기존 가이드의 '웹 발송' 구간으로 보내는
     내비게이션 카드이므로, AGENTS(검색·본문 생성 대상)에 넣지 않고 홈 전용으로 둔다. */
  const HOME_WEB_CARDS = [
    {
      id: "communis_web",
      name: "KT Communis 웹",
      serviceId: "communis",   // 카드 색상(서비스별 통일) 기준
      sub: "커뮤니즈 콘솔 · WEB발송",
      desc: "문자·알림톡·RCS를 코딩 없이 커뮤니즈 콘솔에서 직접 발송합니다.",
      icon: "layers",
      rowLabel: "웹 발송 가이드",
      goto: { name: "service", id: "communis", anchor: "step-communis-webIntro-1" },
      status: "live",
    },
    {
      id: "rcs_web",
      name: "KT RCS 웹 (Hermes)",
      serviceId: "rcs",        // 카드 색상(서비스별 통일) 기준
      sub: "Hermes · RCS 웹 발송",
      desc: "Hermes에서 RCS 브랜드 메시지를 웹으로 발송합니다.",
      icon: "sparkle",
      rowLabel: "웹 발송 가이드",
      goto: null,          // 매뉴얼 준비 후 연결
      status: "soon",
    },
  ];
  // 홈 'Agent & API' 섹션용 카드 목록 — hidden만 제외한다.
  // 상단 '에이전트' 드롭다운(visibleAgents)과 달리, 서비스 가이드 성격의 API 카드
  // (예: Communis)도 API 그룹에 함께 노출한다.
  function homeAgentApiCards() {
    return AGENTS.filter((a) => !a.hidden);
  }
  // 카드 분류: "agent"(설치형 엔진) / "api"(REST 직접 연동). 미지정 시 transport로 추론.
  function agentKind(a) {
    return a.kind || (a.transport === "TCP_SOCKET" ? "agent" : "api");
  }
  // Agent가 지원하는 서비스 목록 (본문 섹션 순서 = SERVICES 순서)
  function servicesForAgent(agentId) {
    const a = AGENT_MAP[agentId];
    if (!a) return [];
    return SERVICES.filter((s) => a.supports.includes(s.id));
  }
  // 이 Agent에 센터 배지를 노출할지 (스마트메시지 연동 엔진만)
  function showsCenter(agent) {
    return !!agent.center && agent.supports.includes("smart");
  }

  // 문맥(서비스)에 따른 Agent 표시명.
  // openAPI는 KT 스마트메시지(크로샷)에서만 'openAPI'로 불리고,
  // 다른 서비스에서는 각 서비스의 자체 API로 표현된다.
  function agentDisplayName(agent, serviceId) {
    // 각 에이전트(openAPI / Communis API / RCS API / 양방향 API …)는 고유 이름을 그대로 사용
    return agent ? agent.name : "";
  }

  /* ---------------- 버튼 활성화(클릭 가능) 제어 ----------------
     홈에는 모든 서비스·Agent 카드가 그대로 보이되, 아래 목록의 id만
     '클릭 가능(활성)'하고 나머지는 비활성(회색)으로 잠긴다.
     검색·직접 URL 접근도 활성 항목으로 제한된다.
     ▶ 매뉴얼이 준비되면 해당 id를 배열에 추가해 버튼을 활성화한다.   */
  const PUBLISHED_AGENTS = ["mcs", "openapi", "communis_api", "rbc", "kakao_biz"];    // 클릭 활성 Agent
  const PUBLISHED_SERVICES = ["smart", "rcs", "communis"];    // 클릭 활성 서비스
  function isAgentPublished(id) { return PUBLISHED_AGENTS.indexOf(id) >= 0; }
  function isServicePublished(id) { return PUBLISHED_SERVICES.indexOf(id) >= 0; }
  function publishedAgents() { return AGENTS.filter((a) => isAgentPublished(a.id) && !a.serviceGuide); }
  function publishedServices() { return SERVICES.filter((s) => isServicePublished(s.id)); }

  // 전역 검색 인덱스 빌드 (서비스 / Agent / 문서) — 게시된 항목만 색인
  function buildSearchIndex(manuals) {
    const idx = [];
    SERVICES.filter((s) => isServicePublished(s.id)).forEach((s) =>
      idx.push({
        type: "service",
        id: s.id,
        title: s.name,
        keywords: [s.short, ...s.features, ...((s.sites || []).map((x) => x.title))],
        body: s.tagline,
        route: { name: "service", id: s.id },
      })
    );
    AGENTS.filter((a) => isAgentPublished(a.id) && !a.serviceGuide).forEach((a) =>
      idx.push({
        type: "agent",
        id: a.id,
        title: a.name,
        keywords: [
          PROVIDERS[a.provider].name,
          a.transport === "API" ? "API" : "소켓",
          a.label,
          ...(a.aliases || []),
        ],
        body: a.desc,
        route: { name: "agent", id: a.id },
      })
    );
    if (manuals && manuals.documents) {
      manuals.documents.filter((d) => isAgentPublished(d.agentId)).forEach((d) =>
        idx.push({
          type: "document",
          id: d.id,
          title: d.title,
          keywords: d.keywords || [],
          body: d.body || "",
          search: d.search || "",
          agentId: d.agentId,
          serviceId: d.serviceId,
          feature: d.feature || null,
          route: d.route || { name: "agent", id: d.agentId, anchor: "sec-" + d.serviceId },
        })
      );
    }
    return idx;
  }

  window.HUB = {
    SERVICES,
    AGENTS,
    CENTERS,
    PROVIDERS,
    SERVICE_MAP,
    AGENT_MAP,
    agentsForService,
    liveAgentsForService,
    visibleAgents,
    HOME_WEB_CARDS,
    homeAgentApiCards,
    agentKind,
    servicesForAgent,
    showsCenter,
    agentDisplayName,
    buildSearchIndex,
    isAgentPublished,
    isServicePublished,
    publishedAgents,
    publishedServices,
    // 매뉴얼·에이전트 다운로드 페이지
    DOWNLOADS: "https://cms.mono.co.kr/downloads",
    // 우측 네비 바로가기
    QUICKLINKS: [
      { label: "CMS (모노 고객지원)", url: "https://cms.mono.co.kr" },
      { label: "MSP 바로가기 (레거시)", url: "https://msp.kttcs.com/" },
      { label: "MSP 바로가기 (차세대)", url: "https://msp.xroshot.com/" },
      { label: "KT OpenAPI (크로샷)", url: "https://openapi.xroshot.com/" },
      { label: "KT RCS (Hermes)", url: "https://rcs.hermes.kt.com/" },
      { label: "RBC (RCS Biz Center)", url: "https://www.rcsbizcenter.com/main" },
      { label: "커뮤니즈", url: "https://communis.kt.co.kr/" },
    ],

    /* 검색 동의어·별칭 사전 — 한 그룹의 표기는 서로 호환 검색됨.
       (한글↔영문 표기는 이 사전이, 같은 표기의 단순 오탈자는 편집거리가 처리)
       새 표기 추가 시 해당 그룹에 한 줄만 더하면 됨. 모두 소문자로 비교됨. */
    SYNONYMS: [
      ["communis", "커뮤니스", "커뮤니즈", "코뮤니스", "코뮤니즈", "꼬뮤니스"],
      ["odyssey", "오디세이", "오딧세이", "오디쎄이", "오딧쎄이"],
      ["xroshot", "크로샷", "크로셧", "크로삿", "크로샤"],
      ["m2x one", "m2x원", "엠투엑스원", "엠투엑스 원"],
      ["mcs", "엠씨에스", "mcsagent", "x_mcs", "맥스에이전트"],
      ["hermes", "헤르메스", "허메스"],
      ["rcs", "알씨에스", "리치메시지", "리치커뮤니케이션"],
      ["alimtalk", "알림톡", "알림 톡"],
      ["친구톡", "친구 톡", "친구톡"],
      ["twoway", "양방향", "투웨이", "two way"],
      ["sms", "단문", "문자", "문자메시지"],
      ["mms", "lms", "멀티메시지", "멀티미디어", "장문", "엠엠에스"],
      ["vms", "음성", "음성메시지", "보이스", "voice"],
      ["fms", "팩스", "팩스메시지", "fax"],
      ["callback", "회신번호", "콜백", "발신번호"],
      ["dest_info", "수신자", "수신번호", "착신자", "수신자정보"],
      ["openapi", "open api", "오픈api", "오픈 api", "오픈에이피아이"],
    ],
  };
})();

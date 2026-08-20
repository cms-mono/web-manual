/* ============================================================
   매뉴얼 셀 — Communis API × Communis
   ------------------------------------------------------------
   Communis 통합 메시징 REST API 연동 매뉴얼.
   좌측 탭을 그룹(f.group)으로 묶는다:
   시작하기(공통) / 웹 발송(추후) / API 연동·핵심 / API 연동·부록.
   ※ 발송 준비(발신번호·발신프로필·템플릿)는 웹·API 공통이라 시작하기에 둠.

   진행: 회원가입·서비스신청·공통규격·문자 탭 작성 완료(규격서 v3.0.29 기준).
     나머지 탭은 construction:true(🚧) — 순차 작성.

   내용 채우는 법: 해당 feature의 construction 제거 후 steps:[] 작성.
     steps 필드 렌더 순서: body→list→table→tables[]→code/codeTabs→note
     shot: { img:"assets/communis/..", url:"..(브라우저바)", label:".." }
       — img 있으면 실제 이미지, 없으면 목업 프레임(Shot: components.jsx)
   ============================================================ */
(function () {
  "use strict";
  var C = (window.HUB_CONTENT = window.HUB_CONTENT || {});
  var A = (C["communis_api"] = C["communis_api"] || {});

  /* ── 발송 테스트 코드 (SMS 1건) — 언어/포맷 탭 ───────────── */
  var SMS_PY = `import base64, json, requests

API_ID = "발급받은_API-ID"
API_PW = "발급받은_API-PW"
BASE   = "https://api.communis.kt.com/cpaas/v2.0"

# API-ID:API-PW 를 Base64 인코딩 → Basic 인증
auth = base64.b64encode(f"{API_ID}:{API_PW}".encode()).decode()
headers = {
    "Content-Type": "application/json; charset=UTF-8",
    "Authorization": f"Basic {auth}",
    # "SubKey": "과금분리키",   # 과금분리(MASTER/SUB) 전환 시에만 사용 (영업 협의 필요)
}
body = {
    "receiveList": [
        {"receiveNum": "01011112222",
         "customMessageId": "msg-0001",
         "param": {"name": "홍길동"}}
    ],
    "messageInfo": {
        "msgKind": "I",                 # I:정보성 / A:광고성
        "content": "테스트 메시지입니다.",
        "callbackNum": "0212345678"     # 회신번호
    }
}
res = requests.post(BASE + "/CPaaS_sendSMS",
                    data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                    headers=headers)
print(res.status_code, res.text)`;

  var SMS_REQ = `{
  "receiveList": [
    {
      "receiveNum": "01011112222",
      "customMessageId": "msg-0001",
      "param": { "name": "홍길동" }
    }
  ],
  "messageInfo": {
    "msgKind": "I",
    "content": "테스트 메시지입니다.",
    "callbackNum": "0212345678"
  }
}`;

  var SMS_RES = `{
  "transactionid": "184584a3-a8ce-4856-9ddb-47453eb908bc",
  "returncode": "1",
  "returndescription": "Success",
  "data": {
    "totalCnt": "1",
    "successCnt": "1",
    "failCnt": "0",
    "failReceiveList": [],
    "trackingList": [
      { "trackingId": "KTUMS231031165054_a9aa5a98_000001",
        "customMessageId": "msg-0001" }
    ],
    "wrkId": "KTUMS231031165054_a9aa5a98"
  }
}`;

  /* ── 알림톡 발송 테스트 코드 ───────────────────────────── */
  var ALIM_PY = `import base64, json, requests

API_ID = "발급받은_API-ID"
API_PW = "발급받은_API-PW"
BASE   = "https://api.communis.kt.com/cpaas/v2.0"

auth = base64.b64encode(f"{API_ID}:{API_PW}".encode()).decode()
headers = {"Content-Type": "application/json; charset=UTF-8",
           "Authorization": f"Basic {auth}"}
body = {
    "kakaoSenderKey": "엠앤와이즈_발신프로필키",   # 발신프로필 키
    "templateId": "CPS_TML_...",                # 승인된 알림톡 템플릿ID
    "receiveList": [
        {"receiveNum": "01011112222",
         "customMessageId": "msg-0001",
         "param": {"name": "홍길동", "code": "1234"}}   # 템플릿 치환 변수
    ]
}
res = requests.post(BASE + "/CPaaS_sendAlimtalk",
                    data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                    headers=headers)
print(res.status_code, res.text)`;

  var ALIM_REQ = `{
  "kakaoSenderKey": "7f5e1f19aca70a67a18b64282171136cd3120319",
  "templateId": "CPS_TML_20230609142748433",
  "receiveList": [
    {
      "receiveNum": "01011112222",
      "customMessageId": "msg-0001",
      "param": { "name": "홍길동", "code": "1234" }
    }
  ]
}`;

  /* ── RCS 발송(비승인형 SMS) 테스트 코드 ─────────────────── */
  var RCS_PY = `import base64, json, requests

API_ID = "발급받은_API-ID"
API_PW = "발급받은_API-PW"
BASE   = "https://api.communis.kt.com/cpaas/v2.0"

auth = base64.b64encode(f"{API_ID}:{API_PW}".encode()).decode()
headers = {"Content-Type": "application/json; charset=UTF-8",
           "Authorization": f"Basic {auth}"}

# buttons는 GSMA RCC.07 suggestions 규격 → JSON 문자열로 전송
buttons = [{"suggestions": [{"action": {
    "urlAction": {"openUrl": {"url": "https://www.kt.com"}},
    "displayText": "자세히 보기",
    "postback": {"data": "open_url"}}}]}]

body = {
    "headerExtraInfo": {
        "chatbotId": "발신챗봇ID",   # RBC 등록 챗봇 ID (필수)
        "brandId": "브랜드ID",       # chatbotId 검증용
        "msgKind": "I"              # A:광고 / I:정보
    },
    "rcsInfo": {                     # 새 메시지(templateId와 택1)
        "body": {
            "description": "테스트 RCS 메시지입니다.",   # 본문 100자
            "buttons": json.dumps(buttons, ensure_ascii=False)
        }
    },
    "receiveList": [
        {"receiveNum": "01011112222", "customMessageId": "msg-0001"}
    ]
}
res = requests.post(BASE + "/CPaaS_rcsSendUnappdSms",
                    data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                    headers=headers)
print(res.status_code, res.text)`;

  /* ── 결과 조회(UMS REPORT) 테스트 코드 ─────────────────── */
  var REPORT_PY = `import base64, json, requests

API_ID = "발급받은_API-ID"
API_PW = "발급받은_API-PW"
BASE   = "https://api.communis.kt.com/cpaas/v2.0"

auth = base64.b64encode(f"{API_ID}:{API_PW}".encode()).decode()
headers = {"Content-Type": "application/json; charset=UTF-8",
           "Authorization": f"Basic {auth}"}
body = {
    # 발송 응답에서 받은 trackingId (최대 1,000건)
    "trackingIdList": ["KTUMS230824111933_57adedde_000001"],
    "getUtxData": "Y"    # 상세 트랜잭션 데이터 수령 (Y/N)
}
res = requests.post(BASE + "/CPaaS_umsReport",
                    data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                    headers=headers)
print(res.status_code, res.text)`;

  var REPORT_RES = `{
  "returncode": "1",
  "returndescription": "SUCCESS",
  "data": {
    "reportDataCount": 1,
    "reportDataList": [
      {
        "trackingId": "KTUMS230824111933_57adedde_000001",
        "receiveNum": "01011110001",
        "channel": "SMS",
        "status": "S",
        "dealer": "XROSHOT",
        "utxData": [
          {
            "utxId": "KTUMS230824111933_57adedde_000001_SMS",
            "utxChannel": "SMS",
            "utxStatus": "S",
            "resultCode": "10000",
            "jobId": "1234567890",
            "submitDate": "231001100100",
            "resultDate": "231001100200"
          }
        ]
      }
    ]
  }
}`;

  A["communis"] = {
    navName: "Communis 이용가이드",
    intro:
      "Communis 통합 메시징 REST API 연동 가이드입니다. " +
      "왼쪽 그룹에서 항목을 선택하세요. (규격서 v3.0.29 기준 · 순차 작성 중)",
    download: { title: "Communis API 연동 규격서", meta: "api.communis.kt.com · v3.0.29 · 제공 KT" },
    features: [
      /* ── [개요] 가이드 한눈에 보기 (랜딩 · 그룹 카드 + 링크) ── */
      { id: "overview", group: "개요", name: "한눈에 보기",
        intro: "Communis로 무엇을, 어떻게 할 수 있는지 한눈에 정리했습니다. 각 항목을 클릭하면 해당 설명으로 이동합니다.",
        mapGroups: [
          { title: "시작하기", icon: "bolt", desc: "가입부터 발송 준비까지 순서대로",
            items: [
              { label: "① 회원가입", sub: "법인 가입 · 필요 서류", href: "#/service/communis?sec=step-communis-signup-1" },
              { label: "② 서비스 신청 · 설정", sub: "청구계정 · API KEY 발급", href: "#/service/communis?sec=step-communis-setup-1" },
              { label: "③ 발신정보", sub: "발신번호 · 카카오/RCS 발신프로필", href: "#/service/communis?sec=step-communis-sender-1" },
              { label: "④ 템플릿", sub: "등록 · 검수", href: "#/service/communis?sec=step-communis-template-1" },
            ] },
          { title: "웹 콘솔로 발송", icon: "message", desc: "코딩 없이 콘솔에서 직접 발송",
            items: [
              { label: "웹 문자", sub: "SMS · LMS · MMS", href: "#/service/communis?sec=step-communis-webSms-1" },
              { label: "웹 카카오", sub: "알림톡 · 브랜드 메시지", href: "#/service/communis?sec=step-communis-webKakao-1" },
              { label: "웹 RCS", sub: "템플릿 · 공통포맷", href: "#/service/communis?sec=step-communis-webRcs-1" },
              { label: "주소록 · 결과 · 통계", sub: "수신자 관리 · 발송 통계", href: "#/service/communis?sec=step-communis-webResult-1" },
            ] },
          { title: "API로 연동", icon: "api", desc: "REST API로 시스템 자동 · 대량 발송",
            items: [
              { label: "공통 규격", sub: "인증 · 헤더 · 응답 · 제한", href: "#/service/communis?sec=step-communis-common-1" },
              { label: "문자", sub: "SMS · LMS · MMS", href: "#/service/communis?sec=step-communis-sms-1" },
              { label: "카카오 알림톡", sub: "정보성 템플릿", href: "#/service/communis?sec=step-communis-alimtalk-1" },
              { label: "RCS", sub: "비승인 · 승인 · 통합", href: "#/service/communis?sec=step-communis-rcs-1" },
              { label: "결과 수신", sub: "UMS REPORT", href: "#/service/communis?sec=step-communis-report-1" },
              { label: "그 외 (부록)", sub: "국제SMS · 2FA · 메일 · 앱푸시 · WhatsApp · 대체발송 · 통계 · 에러코드 · 080 · Agent", href: "#/service/communis?sec=step-communis-brand-1" },
            ] },
          { title: "지원 서비스 · 채널", icon: "layers", desc: "하나의 API로 보내는 메시지 채널",
            items: [
              { label: "문자 (SMS/LMS/MMS)", href: "#/service/communis?sec=step-communis-sms-1" },
              { label: "카카오 알림톡 · 브랜드", href: "#/service/communis?sec=step-communis-alimtalk-1" },
              { label: "RCS", href: "#/service/communis?sec=step-communis-rcs-1" },
              { label: "국제 SMS", href: "#/service/communis?sec=step-communis-global-1" },
              { label: "메일", href: "#/service/communis?sec=step-communis-mail-1" },
              { label: "앱푸시", href: "#/service/communis?sec=step-communis-push-1" },
              { label: "2FA 인증", href: "#/service/communis?sec=step-communis-twofa-1" },
              { label: "WhatsApp", href: "#/service/communis?sec=step-communis-whatsapp-1" },
            ] },
        ],
      },

      /* ── [시작하기] ─────────────────────────────── */
      { id: "signup", group: "시작하기", name: "① 회원가입",
        intro: "커뮤니즈 회원가입 절차입니다. 접속 → 회원 유형 선택 → 약관 동의 → 기본정보 → 사업자정보 → 멤버(팀) 등록 순으로 진행하며, 가입 신청 후 운영팀 승인으로 완료됩니다.",
        steps: [
          {
            title: "회원가입 — 접속 & 회원 유형 선택",
            body: "커뮤니즈 포탈 <code>communis.kt.co.kr</code> 접속 후 <b>회원가입</b>을 클릭하고, 6가지 회원 유형 중 <b>법인사업자</b>를 선택합니다.",
            list: [
              "회원 유형 6종: 개인사업자 · 법인사업자 · 특부가 법인사업자 · 공공기관 · 재판매사 · 전문협력사",
              "법인사업자 준비 서류: <b>사업자등록증 · 법인 인감증명서 · 위임장 · 담당자 신분증</b>",
            ],
            shot: { img: "assets/communis/signup-1-type.png", url: "communis.kt.co.kr/member/join", label: "회원가입 — 회원 유형 선택(법인사업자)" },
            note: "가입 신청 후 <b>커뮤니즈 운영팀 검토·승인</b>을 거쳐 최종 가입이 완료됩니다.",
          },
          {
            title: "약관 동의",
            body: "회원가입을 위해 <b>모든 약관 확인 및 필수 항목 전체 동의</b> 후 다음으로 이동합니다. 동의하지 않으면 가입할 수 없습니다.",
            shot: { img: "assets/communis/signup-2-terms.png", url: "communis.kt.co.kr/member/terms", label: "약관 전체 동의" },
          },
          {
            title: "기본정보 등록 (로그인 계정)",
            body: "로그인에 사용할 기본 정보를 등록합니다. 로그인 계정 정보이므로 정확히 입력하세요.",
            list: [
              "<b>이메일</b> — 로그인 ID. 입력 후 [메일 인증] → 수신한 인증코드로 [인증확인]",
              "<b>비밀번호</b> — 설정 규칙에 맞게 생성",
              "<b>이름 · 휴대폰</b> — 실명 필수(비밀번호 찾기 등에 사용), 휴대폰 인증 필요",
            ],
            shot: { img: "assets/communis/signup-3-info.png", url: "communis.kt.co.kr/member/join?step=info", label: "기본정보 등록 — 이메일·휴대폰 인증" },
          },
          {
            title: "사업자 정보 등록",
            body: "사업자등록증에 있는 정보를 정확히 등록합니다.",
            shot: { img: "assets/communis/signup-4-biz.png", url: "communis.kt.co.kr/member/join?step=biz", label: "사업자 정보 등록" },
            note: "신규 가입이라면 <b>멤버등록정보는 [선택안함]</b>을 선택합니다. [조회] 버튼은 기존 사업자에 멤버로 합류할 때만 사용합니다.",
          },
          {
            title: "멤버(팀) 정보 등록",
            body: "커뮤니즈는 팀 구성 기능을 제공합니다 (현재 개인/법인사업자 계정만 팀 생성 가능, 전문협력사/재판매사는 예정).",
            table: {
              cols: ["멤버 유형", "설명"],
              colWidths: ["22%", "78%"],
              rows: [
                ["선택안함", "팀원이 필요 없을 때"],
                ["일반멤버", "일반 팀원. 사업자번호 조회 후 [일반멤버] 선택"],
                ["관리자멤버", "관리자 권한 팀원(법인사업자 계정만). 사업자번호 조회 후 [관리자멤버] 선택"],
              ],
            },
            shot: { img: "assets/communis/signup-5-member.png", url: "communis.kt.co.kr/member/join?step=member", label: "멤버 정보 등록" },
            note: "일반/관리자 멤버 <b>승인자 = 해당 사업자번호로 가장 먼저 가입한 회원(법인사업자)</b>입니다.",
          },
        ],
      },
      { id: "setup", group: "시작하기", name: "② 서비스 신청 · 설정",
        intro: "회원가입 후 로그인하여 대시보드에서 진행하는 단계입니다. 청구계정 등록 → 서비스 신청 → 서비스 등록정보 조회 → 발송 전 사전 준비 순으로 진행합니다.",
        steps: [
          {
            title: "청구계정 등록 (서비스 신청 선행 필수)",
            body: "서비스를 신청하려면 <b>청구계정</b>이 먼저 등록돼 있어야 합니다. 로그인 후 <b>서비스 관리 &gt; 결제 서비스 &gt; 청구계정 정보</b>에서 등록합니다.",
            list: [
              "① <b>청구고객</b>을 먼저 등록 — <b>결제 서비스 &gt; 청구고객 정보</b> 화면에서 [청구고객 등록]",
              "② <b>청구계정 정보</b> 화면에서 [청구계정 등록]으로 신규 등록",
              "③ 수정·해지는 등록 목록의 <b>관리 &gt; [수정] / [해지]</b> 버튼",
            ],
            shot: { img: "assets/communis/svc-3-billing.png", url: "communis.kt.co.kr/pay/account", label: "결제 서비스 — 청구계정 정보" },
          },
          {
            title: "서비스 신청",
            body: "<b>대시보드 &gt; 서비스 관리 &gt; 서비스 신청하기</b>에서 사용할 API를 신청합니다.",
            list: [
              "<b>서비스명</b> — 신청 API 용도에 맞게 입력",
              "<b>API Key</b> — 서비스 생성 후 API 호출 인증에 사용. <b>외부 노출 금지</b>(보안 주의)",
              "<b>청구정보</b> — 선불 또는 후불 선택",
              "<b>API 선택</b> — 사용할 채널 선택(아래 사전조건 확인)",
            ],
            table: {
              cols: ["채널", "신청 시 사전 조건"],
              colWidths: ["30%", "70%"],
              rows: [
                ["SMS/LMS/MMS", "이용약관 동의 + <b>발신번호 사전 등록</b> 후 선택"],
                ["국제 SMS", "이용약관 동의"],
                ["2FA(2차인증)", "<b>발신번호 사전 등록</b> 필요"],
                ["카카오 비즈메시지", "이용약관 동의 (발신프로필·템플릿은 별도 준비)"],
                ["이메일", "추가 등록정보 없이 사용 가능"],
                ["RCS", "이용약관 동의 (RBC 브랜드·대화방은 별도 준비)"],
                ["APP PUSH", "추가 등록정보 없이 사용 가능"],
              ],
            },
            shot: { img: "assets/communis/svc-1-select.png", url: "communis.kt.co.kr/service/apply", label: "서비스 신청 — API 선택" },
          },
          {
            title: "서비스 등록 정보 조회",
            body: "신청 완료 후 <b>서비스 관리</b>에서 등록된 서비스와 <b>API Key</b> 등 인증 정보를 조회할 수 있습니다. 여기서 확인한 API-ID/PW로 연동합니다 (→ <b>공통 규격</b> 탭).",
            shot: { img: "assets/communis/svc-2-apikey.png", url: "communis.kt.co.kr/service/list", label: "서비스 등록 정보 조회" },
          },
          {
            title: "발송 전 사전 준비 (채널별) & 문의처",
            body: "채널마다 발송 전 준비가 다릅니다. 상세 절차는 각 채널 탭을 참고하세요.",
            table: {
              cols: ["채널", "발송 전 준비"],
              colWidths: ["24%", "76%"],
              rows: [
                ["문자(SMS/LMS/MMS)", "발신번호 등록 → <b>승인 완료</b> 후 발송 가능"],
                ["카카오 알림톡", "카카오톡 채널 생성 → 발신프로필 키 등록 → 템플릿 등록·검수"],
                ["RCS", "RCS BIZ CENTER(RBC)에서 브랜드·대화방 등록, 대행사 '케이티' 지정"],
              ],
            },
            note: "문의처 — 전화 <code>02-333-7223</code>(내선 1) · <code>communis@kt.com</code>(API 문의) / <code>cms@mono.co.kr</code>(모노 지원)",
          },
        ],
      },

      /* ── [시작하기] ③ 발신정보 · ④ 템플릿 (웹·API 공통 준비) ── */
      { id: "sender", group: "시작하기", name: "③ 발신정보 (발신번호·발신프로필)",
        intro: "발송에 사용할 발신번호·발신프로필을 등록·관리하는 콘솔 메뉴입니다. 채널마다 등록 대상이 다릅니다. (웹·API 공통 준비)",
        steps: [
          {
            title: "발신정보 메뉴 구성",
            body: "콘솔 <b>발신정보</b> 메뉴에서 채널별 발신 자원을 등록합니다.",
            table: {
              cols: ["메뉴", "용도"],
              colWidths: ["30%", "70%"],
              rows: [
                ["문자 발신번호", "SMS/LMS/MMS·2FA 발신에 쓸 번호 등록·승인"],
                ["RCS 발신번호", "RCS 발신(챗봇) 번호 — RBC 브랜드·대화방과 연동"],
                ["카카오 발신프로필", "알림톡·브랜드 발신프로필 키 등록(채널 인증)"],
                ["카카오 발신프로필 그룹", "여러 발신프로필을 그룹으로 묶어 관리(senderKeyType=G)"],
                ["080 수신거부", "광고 수신거부용 080 번호 청약·관리"],
                ["국제SMS 웹훅", "국제 SMS 발송결과를 받을 웹훅 URL 등록"],
              ],
            },
          },
          {
            title: "문자 발신번호 등록",
            body: "문자(SMS/LMS/MMS)·2FA는 <b>승인된 발신번호</b>만 발송에 사용할 수 있습니다. <b>발신정보 &gt; 문자 발신번호</b>에서 등록합니다.",
            list: [
              "<b>발신번호 사전등록신청서</b>(KT 양식) + <b>통신가입증명원</b>(회선 통신사 발급) 작성·업로드",
              "통신가입증명원은 <b>발신번호별</b>로 제출 (번호 10개면 증명원 10개)",
              "등록 후 <b>승인 절차</b>를 거쳐 → 승인 완료된 번호만 발송 가능",
            ],
            shot: { img: "assets/communis/sender-sms.png", url: "communis.kt.co.kr/sender/sms", label: "발신정보 — 문자 발신번호 등록" },
            note: "국제 SMS·이메일·앱푸시는 별도 발신번호 등록이 필요 없습니다.",
          },
          {
            title: "RCS 발신번호 (RBC 설정)",
            body: "RCS 발신번호는 <b>RBC(RCS Biz Center)</b>에서 브랜드·대화방을 등록하고 KT를 대행사로 지정해야 사용할 수 있습니다. RBC 회원가입 후 아래 순서로 진행합니다.",
            tables: [
              {
                label: "RBC 설정 순서",
                cols: ["단계", "내용"],
                colWidths: ["24%", "76%"],
                rows: [
                  ["① 브랜드 등록", "로그인 → 브랜드 개설 → 정보 입력 → 퀵메뉴/탭설정 → <b>브랜드 승인 요청</b>. (브랜드명 = 모바일에서 검색 시 노출되는 이름)"],
                  ["② 대화방 등록", "승인된 브랜드 대시보드 → 대화방 등록 → 대화방 명·유형 입력 → <b>통신가입증명원 등록</b> → 승인 요청. (대화방 = 미저장 시 발신번호 대신 표시되는 이름)"],
                  ["③ 대행사 권한 부여", "브랜드 <b>운영관리</b> 탭 → 대행사 운영권한 부여 → 대행사 검색·초대: <b>‘케이티’(필수)</b>. <b>‘모노커뮤니케이션즈’</b>는 선택 — 초대 시 모노가 브랜드·발송 운영을 관리 지원"],
                ],
              },
            ],
            shot: { img: "assets/communis/sender-rcs.png", url: "communis.kt.co.kr/sender/rcs", label: "발신정보 — RCS 발신번호" },
            note: "대행사 권한 부여 후 <b>서버 동기화 약 3~4시간</b> 뒤 헤르메스(발송)에서 브랜드·대화방이 확인됩니다. 상세: 브랜드 <code>docs.rcsbizcenter.com/policy/brand</code> · 대화방 <code>/policy/chatbot</code>. 진행 문의 02-333-7223(내선 1).",
          },
          {
            title: "카카오 발신프로필 ① 카카오 채널 준비 (Part A)",
            body: "알림톡·브랜드 메시지는 먼저 <b>카카오 비즈니스(business.kakao.com)</b>에서 채널을 만들고 <b>비즈니스 심사</b>를 받아야 합니다. (카카오 영역은 KT·커뮤니즈 지원 범위 밖 — 심사 문의는 카카오 비즈니스 고객센터)",
            list: [
              "① <b>로그인</b> — business.kakao.com 카카오 계정 로그인",
              "② <b>새 채널 만들기</b> — 유형 <b>기본 채널형</b> 선택 (알림톡/친구톡은 기본형으로 충분)",
              "③ <b>사업자 정보</b> — 사업자등록번호 입력 (심사 필수)",
              "④ <b>채널 기본정보</b> — 프로필(640×640)·채널명(20자)·카테고리·<b>검색용 ID(15자, 변경 불가)</b>",
              "⑤ <b>비즈니스 심사 신청</b> — 채널 &gt; 비즈니스 심사 &gt; 심사 신청하기 (서류: 사업자등록증·전자증명서용 휴대폰·(해당시)인허가·(대행사)계약서)",
              "⑥ <b>승인 후 검색용 아이디 확인</b> — 채널 &gt; 채널 정보에서 검색용 아이디 복사 (커뮤니즈엔 앞에 <b>@</b>를 붙여 등록)",
            ],
            shot: { img: "assets/communis/kakao-channel.png", url: "business.kakao.com", label: "카카오 비즈니스 — 채널 생성" },
            note: "⚠ <b>검색용 ID는 변경 불가</b>합니다 — 운영에 쓸 최종 아이디로 입력하세요. 서류 내용(상호·업종)과 채널 정보(채널명·프로필)가 일치해야 심사 반려를 피할 수 있습니다.",
          },
          {
            title: "카카오 발신프로필 ② 커뮤니즈 발신키 발급 (Part B)",
            body: "채널 심사가 승인되면 커뮤니즈에 <b>@검색용아이디</b>를 등록하고 <b>발신키</b>를 발급받습니다.",
            list: [
              "① <b>메뉴 이동</b> — 커뮤니즈 로그인 → 상단 <b>대시보드</b> 진입 → 좌측 <b>발신정보 &gt; 카카오 발신프로필</b> (로그인만 하면 좌측 메뉴가 안 보임)",
              "② <b>등록 입력</b> — 카카오 채널 ID <b>@검색용아이디</b>(반드시 @ 포함), <b>관리자 연락처</b>(채널 관리자 휴대폰), 사업자 카테고리 → [토큰 요청]",
              "③ <b>토큰 인증</b> — 관리자 카카오톡으로 온 <b>6자리 인증 토큰</b>을 목록 우측 [인증]에서 입력·확인 (초기 상태: 발신프로필 차단·발신키 미인증)",
              "④ <b>발신키 발급</b> — 발급된 발신프로필키가 발송 API의 <code>kakaoSenderKey</code>입니다",
            ],
            shot: { img: "assets/communis/alim-1-senderprofile.png", url: "communis.kt.co.kr/kakao/senderprofile", label: "발신정보 — 카카오 발신프로필 등록" },
            note: "⚠ <b>관리자 연락처는 카카오 채널 관리자로 등록된 사람</b>의 번호여야 토큰이 수신됩니다. 발송하려면 <b>발신프로필 상태·카카오톡 채널 상태가 모두 ‘정상’</b>이어야 합니다(카카오 인증은 즉시, 커뮤니즈 내부 추가 승인 필요). 등록 초기 <b>일별 1,000건</b> 제한(운영 실적에 따라 상향).",
          },
          {
            title: "카카오 발신프로필 그룹",
            body: "여러 발신프로필을 <b>그룹</b>으로 묶어 하나의 승인 템플릿을 공유합니다. 발송 시 <code>senderKeyType=G</code>로 지정합니다.",
            list: [
              "그룹으로 심사 승인된 템플릿은 그룹 내 모든 발신프로필에서 사용 가능",
              "동일 템플릿을 여러 발신프로필에서 쓸 때 유용",
              "제약: 채널 추가형(AD)/복합형(MI) 유형 사용 불가, 그룹 간 동일 템플릿 코드·이름 불가, 발신프로필 최대 5,000개",
            ],
            shot: { img: "assets/communis/sender-kakao-group.png", url: "communis.kt.co.kr/kakao/senderprofile-group", label: "발신정보 — 카카오 발신프로필 그룹 등록" },
            note: "발신프로필 그룹 추가는 <b>3~4일</b> 소요됩니다(영업일 기준).",
          },
          {
            title: "국제SMS 웹훅",
            body: "국제 SMS 발송결과를 수신할 <b>웹훅 URL</b>을 등록합니다. <b>발신정보 &gt; 국제SMS 웹훅</b>에서 등록합니다.",
            shot: { img: "assets/communis/sender-intlsms-webhook.png", url: "communis.kt.co.kr/sender/intlsms-webhook", label: "발신정보 — 국제SMS 웹훅 등록" },
            note: "웹훅 URL 등록 후 승인에는 <b>방화벽 작업</b>이 필요합니다.",
          },
          {
            title: "080 수신거부",
            body: "광고 발송 시 수신거부 처리에 쓰는 <b>080 번호</b>를 청약·관리합니다.",
            note: "080 번호 청약/해지·수신거부 고객 관리 API는 <b>부록 &gt; 080 수신거부</b> 탭을 참고하세요.",
          },
        ],
      },
      { id: "template", group: "시작하기", name: "④ 템플릿 (등록·검수)",
        intro: "정형 메시지를 템플릿으로 등록해 재사용합니다. 채널별로 관리하며, 카카오(알림톡·브랜드)는 검수 승인이 필요합니다.",
        steps: [
          {
            title: "템플릿 종류",
            body: "콘솔 <b>템플릿</b> 메뉴에서 채널별 템플릿을 등록합니다.",
            table: {
              cols: ["템플릿", "용도", "검수"],
              colWidths: ["20%", "56%", "24%"],
              rows: [
                ["문자", "SMS/LMS/MMS 정형 문구(치환변수 포함)", "불필요"],
                ["RCS", "RCS 승인형/비승인형 템플릿", "승인형: KT-UMS 승인"],
                ["알림톡", "카카오 알림톡 정보성 템플릿", "카카오 검수 필수"],
                ["브랜드 메시지", "카카오 브랜드(구 친구톡) 광고성 템플릿", "카카오 검수 필수"],
                ["카카오 이미지", "알림톡·브랜드용 이미지 업로드·관리", "-"],
              ],
            },
            note: "발송 API에서 <code>templateId</code>로 템플릿을 지정합니다. 치환변수(<code>param</code>)의 key는 템플릿 변수명과 일치해야 합니다.",
          },
          {
            title: "문자 · RCS 템플릿",
            list: [
              "<b>문자 템플릿</b> — 자주 쓰는 SMS/LMS/MMS 문구를 등록(별도 검수 없음)",
              "<b>RCS 템플릿</b> — <b>비승인형</b>(자유 양식)과 <b>승인형</b>(KT-UMS 브랜드별 승인)으로 구분",
            ],
            note: "RCS 승인형 템플릿은 브랜드별로 승인이 필요합니다 (→ RCS 탭).",
          },
          {
            title: "알림톡 · 브랜드 메시지 템플릿 (검수)",
            body: "카카오 채널 메시지는 <b>템플릿 등록 → 검수 요청 → 카카오 승인</b> 후 발송할 수 있습니다.",
            list: [
              "<b>템플릿 &gt; 알림톡 / 브랜드 메시지</b>에서 본문·버튼·치환변수 구성",
              "<b>검수 요청</b> → 카카오 검수 → <b>승인</b> 시 발송 가능",
              "이미지가 필요하면 <b>카카오 이미지</b>에서 업로드 후 템플릿에 연결",
            ],
            note: "알림톡=정보성, 브랜드 메시지=광고성입니다. 광고성은 발송 가능 시간 제한이 있습니다.",
          },
        ],
      },

      /* ── [웹 발송] (콘솔 WEB발송 메뉴) ── */
      { id: "webIntro", group: "웹 발송", name: "웹 발송 개요",
        intro: "커뮤니즈 콘솔의 WEB발송 메뉴에서 코딩 없이 직접 메시지를 보내는 방법입니다. 채널·발송 방식과 공통 발송 흐름을 먼저 정리합니다.",
        steps: [
          {
            title: "WEB발송 메뉴 구성",
            body: "콘솔 좌측 <b>WEB발송</b> 메뉴에서 채널을 고른 뒤, 채널별 방식으로 발송합니다.",
            table: {
              cols: ["채널", "발송 방식"],
              colWidths: ["26%", "74%"],
              rows: [
                ["문자", "<b>템플릿 발송</b> · <b>신규 발송</b>(직접 작성) — SMS/LMS/MMS"],
                ["RCS", "<b>템플릿 발송</b>(승인 템플릿) · <b>공통포맷 발송</b>(자유 작성)"],
                ["알림톡", "<b>승인된 템플릿을 선택</b>해 발송 (자유 작성 불가)"],
                ["브랜드 메시지", "<b>템플릿 발송</b> · <b>신규 발송</b> (광고성)"],
              ],
            },
            note: "발송 이력·통계는 <b>통계</b> 메뉴, 수신자 관리는 <b>주소록</b> 메뉴에서 합니다(→ 주소록·발송 결과·통계 탭).",
          },
          {
            title: "공통 발송 흐름 (신규 발송)",
            body: "직접 작성(신규) 발송은 한 화면에서 <b>4단계</b>로 진행합니다.",
            list: [
              "<b>① 메시지 작성</b> — 종류 선택(SMS/LMS/MMS 등)·내용 작성·치환변수 <code>#{변수}</code> 삽입·광고성 여부 체크",
              "<b>② 발송대상 고객</b> — [발송대상 추가하기]로 수신자 추가(직접 입력·주소록 불러오기), 총 인원 확인",
              "<b>③ 발신정보</b> — 등록·승인된 발신번호 선택",
              "<b>④ 발송옵션</b> — 즉시 발송 / 예약 발송",
            ],
            shot: { url: "communis.kt.co.kr/ums/user/send/message/sendNew.do", label: "신규 발송 4단계(메시지 작성·발송대상·발신정보·발송옵션)" },
            note: "작성 중 <b>[테스트 발송]</b>으로 담당자 번호에 먼저 보내 확인하고, <b>[미리보기]</b>·우측 실시간 미리보기로 실제 표시를 확인할 수 있습니다.",
          },
          {
            title: "광고성 메시지 처리",
            body: "광고성 메시지는 작성 시 <b>광고성 메시지</b>를 체크하고 <b>무료수신거부 번호</b>를 입력합니다.",
            list: [
              "체크 시 본문에 <code>(광고)</code> 접두 + <code>무료수신거부:(번호)</code>가 자동 추가",
              "광고 발송 가능 시간: 정보통신망법상 <b>08:00~21:00</b> (→ 공통 규격 탭)",
            ],
            note: "발신번호·발신프로필·템플릿 준비는 <b>시작하기 &gt; 발신정보·템플릿</b> 탭을 참고하세요.",
          },
        ],
      },
      { id: "webSms", group: "웹 발송", name: "웹 문자 발송",
        intro: "콘솔 WEB발송 > 문자에서 SMS/LMS/MMS를 직접 발송하는 방법입니다. 템플릿 발송과 신규 발송(직접 작성) 중 선택합니다.",
        steps: [
          {
            title: "발송 방식 선택",
            body: "<b>WEB발송 &gt; 문자</b> 진입 후 발송 방식을 선택합니다.",
            list: [
              "<b>템플릿 발송하기</b> — 미리 등록한 문자 템플릿을 불러와 발송",
              "<b>신규로 발송하기</b> — 원하는 내용을 직접 작성해 발송",
            ],
            shot: { url: "communis.kt.co.kr/ums/user/send/message/choice.do", label: "문자 발송 방법 선택(템플릿 / 신규)" },
          },
          {
            title: "① 메시지 작성",
            body: "메시지 종류와 내용을 작성합니다.",
            list: [
              "<b>메시지 종류</b> — <b>SMS</b>(단문) / <b>LMS</b>(장문) / <b>MMS</b>(이미지 첨부)",
              "<b>내용</b> — 본문 입력. 치환변수는 <code>#{변수명}</code>으로 삽입 (예 <code>#{name}</code>)",
              "<b>템플릿 불러오기</b> — 등록된 문자 템플릿을 선택해 본문 자동 채움",
              "<b>광고성 메시지</b> 체크 시 무료수신거부 번호 입력",
            ],
            shot: { url: "communis.kt.co.kr/ums/user/send/message/sendNew.do", label: "① 메시지 작성(종류·내용·광고성)" },
            note: "우측 실시간 미리보기로 (광고)·무료수신거부 표기를 확인할 수 있습니다. 종류(SMS/LMS/MMS)별 글자수·첨부 규격은 <b>API 연동 &gt; 문자</b> 탭과 동일합니다.",
          },
          {
            title: "② 발송대상 고객",
            body: "<b>[+ 발송대상 추가하기]</b>로 수신자를 추가합니다. 추가된 <b>총 인원</b>이 표시되며 <b>[전체삭제]</b>로 초기화합니다.",
            list: [
              "<b>직접 입력</b> — 수신번호를 직접 입력",
              "<b>주소록 불러오기</b> — [주소록](개인/공용)에 저장한 수신자를 선택",
            ],
            note: "치환변수를 쓰는 경우 수신자별 변수값이 함께 매핑되어야 합니다.",
          },
          {
            title: "③ 발신정보 · ④ 발송옵션",
            body: "발신번호를 선택하고 발송 시점을 정합니다.",
            list: [
              "<b>③ 발신정보</b> — 등록·승인된 <b>발신번호</b>를 드롭다운에서 선택",
              "<b>④ 발송옵션</b> — <b>즉시 발송</b> 또는 <b>예약 발송</b>(예약 일시 지정)",
            ],
            shot: { url: "communis.kt.co.kr/ums/user/send/message/sendNew.do", label: "발신번호 선택 · 발송옵션(즉시/예약)" },
            note: "<b>[테스트 발송]</b>으로 담당자 번호에 먼저 보내 확인한 뒤 <b>[보내기]</b>로 실제 발송합니다.",
          },
        ],
      },
      { id: "webKakao", group: "웹 발송", name: "웹 카카오 발송",
        intro: "콘솔에서 카카오 알림톡·브랜드 메시지를 발송하는 방법입니다. 발신프로필과 승인 템플릿이 준비돼 있어야 합니다.",
        steps: [
          {
            title: "사전 준비",
            body: "카카오 발송은 <b>발신프로필 등록</b>과 <b>승인된 템플릿</b>이 선행되어야 합니다.",
            note: "카카오 채널 생성 → 발신프로필 키 등록 → 템플릿 등록·검수는 <b>시작하기 &gt; 발신정보·템플릿</b> 탭을 참고하세요.",
          },
          {
            title: "알림톡 발송 (승인 템플릿 선택)",
            body: "<b>WEB발송 &gt; 알림톡</b>은 <b>승인된 템플릿을 선택</b>해 발송합니다(자유 작성 불가).",
            list: [
              "템플릿 목록에서 발송할 <b>승인 템플릿</b> 선택 (유형: 강조표기형·아이템리스트형·리스트형 등)",
              "치환변수(<code>#{변수}</code>) 값 입력",
              "발송대상 추가 → 발송옵션(즉시/예약) → 보내기",
            ],
            shot: { url: "communis.kt.co.kr/ums/user/send/alimtalk/templateList.do", label: "알림톡 — 승인 템플릿 목록에서 선택" },
            note: "알림톡 = 정보성. 템플릿은 카카오 검수 승인 후에만 목록에 나타납니다.",
          },
          {
            title: "브랜드 메시지 발송",
            body: "<b>WEB발송 &gt; 브랜드 메시지</b>는 문자와 동일하게 <b>템플릿 발송 / 신규 발송</b>을 선택합니다.",
            list: [
              "브랜드 메시지 = <b>광고성</b> (발신프로필 필요)",
              "광고 발송 가능 시간: 정보통신망법상 <b>08:00~21:00</b>",
            ],
            note: "발신프로필·브랜드 메시지 템플릿 준비는 <b>시작하기 &gt; 발신정보·템플릿</b> 탭을 참고하세요.",
          },
        ],
      },
      { id: "webRcs", group: "웹 발송", name: "웹 RCS 발송",
        intro: "콘솔에서 RCS를 발송하는 방법입니다. 승인 템플릿 기반의 템플릿 발송과 자유 작성 공통포맷 발송 두 가지가 있습니다.",
        steps: [
          {
            title: "사전 준비",
            body: "RCS 발송은 <b>RBC 브랜드·대화방 등록</b>과 대행사 지정이 선행되어야 합니다.",
            note: "RBC 브랜드·대화방, 대행사 ‘케이티’ 지정은 <b>시작하기 &gt; 발신정보</b> 탭을 참고하세요.",
          },
          {
            title: "템플릿 발송 vs 공통포맷 발송",
            body: "<b>WEB발송 &gt; RCS</b>에는 두 가지 발송 방식이 있습니다.",
            table: {
              cols: ["방식", "설명"],
              colWidths: ["26%", "74%"],
              rows: [
                ["템플릿 발송", "사전 <b>승인된 RCS 템플릿</b>을 선택해 발송"],
                ["공통포맷 발송", "RCS 타입을 고르고 <b>직접 작성</b>(자유 양식)"],
              ],
            },
          },
          {
            title: "공통포맷 발송 (직접 작성)",
            body: "<b>WEB발송 &gt; RCS &gt; 공통포맷 발송</b>에서 자유 양식으로 작성합니다.",
            list: [
              "<b>RCS 타입</b> — SMS/LMS/MMS + 표시 형식(Standalone 등) 선택",
              "<b>내용</b> — 본문 작성(RCS SMS 100자), 치환변수 <code>#{변수}</code>",
              "<b>RCS 버튼</b> — [+ RCS 버튼 추가] (RCS SMS 최대 1개)",
              "<b>광고성</b> 체크 시 무료수신거부 입력",
              "발송대상 → 발신정보 → 보내기",
            ],
            shot: { url: "communis.kt.co.kr/ums/user/send/rcs/sendNew.do", label: "RCS 공통포맷 — RCS 타입·내용·버튼" },
            note: "RCS 미지원 단말 대체발송(통합 RCS)·필드 상세 규격은 <b>API 연동 &gt; RCS</b> 탭을 참고하세요.",
          },
        ],
      },
      { id: "webResult", group: "웹 발송", name: "주소록 · 발송 결과·통계",
        intro: "발송 대상 관리(주소록)와 발송 결과·통계 조회 메뉴입니다.",
        steps: [
          {
            title: "주소록",
            body: "자주 보내는 수신자를 <b>주소록</b>에 저장해 발송 시 불러옵니다.",
            table: {
              cols: ["구분", "설명"],
              colWidths: ["26%", "74%"],
              rows: [
                ["개인 주소록", "개인 계정용 수신자 목록"],
                ["공용 주소록", "조직(팀) 공용 수신자 목록"],
              ],
            },
            note: "발송 화면의 <b>[발송대상 추가하기]</b>에서 주소록을 선택해 수신자를 불러옵니다.",
          },
          {
            title: "발송 통계",
            body: "<b>통계</b> 메뉴에서 발송량과 성공/실패를 조회합니다.",
            table: {
              cols: ["메뉴", "내용"],
              colWidths: ["30%", "70%"],
              rows: [
                ["발송통계", "기간별 발송량·성공·실패 (채널별)"],
                ["발송통계 상세", "건별 상세 내역"],
                ["국제SMS 발송통계", "국제 SMS 전용 통계"],
              ],
            },
            shot: { url: "communis.kt.co.kr/ums/admin/statistics/send/list.do", label: "발송통계 — 기간·채널별 발송량/성공·실패" },
            note: "대시보드 상단에서도 전체 발송량(성공/실패)과 최근 3개월 발송량 추이를 볼 수 있습니다.",
          },
          {
            title: "API 발송 결과 조회",
            body: "API로 발송한 결과는 <code>trackingId</code>로 조회합니다.",
            note: "상세는 <b>API 연동 &gt; 결과 수신(UMS REPORT)</b> 탭을 참고하세요. 콘솔 <b>API 테스트</b>에서도 결과를 확인할 수 있습니다.",
          },
        ],
      },

      /* ── [API 연동 · 핵심] (필수 + 사용 빈도 높음) ──────── */
      { id: "common", group: "API 연동 · 핵심", name: "공통 규격 (인증·헤더·응답)",
        intro: "모든 Communis API의 공통 기반입니다. Basic 인증 → 공통 헤더 → 공통 응답값 → 엔드포인트 규칙 → 발송 제한 순으로 확인하세요. (규격서 v3.0.29 §1)",
        steps: [
          {
            title: "개요 · 기본 정보",
            body: "Communis는 <b>하나의 REST API로 문자·카카오·RCS·메일·앱푸시·국제SMS·WhatsApp을 발송</b>하는 KT 통합 메시징(CPaaS)입니다. 모든 요청은 <b>HTTPS POST + Basic 인증</b>으로 처리합니다.",
            table: {
              cols: ["항목", "값"],
              colWidths: ["26%", "74%"],
              rows: [
                ["규격서 버전", "<code>v3.0.29</code>"],
                ["API 도메인 (외부)", "<code>https://api.communis.kt.com</code>"],
                ["API 도메인 (내부)", "<code>https://api-in.communis.kt.com</code> (KT 내부망 연동용)"],
                ["인증 방식", "Basic — <code>Authorization: Basic {base64(APIID:APIPW)}</code>"],
                ["포탈 / 문의", "<code>communis.kt.co.kr</code> 포탈 Q&amp;A 또는 <code>communis@kt.com</code>"],
              ],
            },
            note: "API-ID·API-PW는 Communis 콘솔에서 발급합니다. 접속 IP 등록 등 사전 절차가 필요할 수 있습니다.",
          },
          {
            title: "공통 헤더",
            body: "모든 API 요청에 공통으로 들어가는 헤더입니다.",
            table: {
              schema: true,
              cols: ["헤더", "필수", "설명"],
              colWidths: ["20%", "10%", "70%"],
              rows: [
                ["Content-Type", "필수", "<code>application/json; charset=UTF-8</code>"],
                ["Authorization", "필수", "<code>Basic {base64(APIID:APIPW)}</code> — 콘솔 발급 API-ID/PW를 <code>ID:PW</code>로 이어 Base64 인코딩"],
                ["SubKey", "선택", "<b>과금 분리</b>용(MASTER/SUB 구조). 기본 미사용 — 커뮤니즈에 <b>별도 요청·영업 협의</b> 후 전환. 발송 시 넣으면 해당 SubKey <b>청구계정으로 과금</b>"],
              ],
            },
          },
          {
            title: "공통 응답값",
            body: "응답은 <b>KT CPaaS 플랫폼이 생성하는 공통 응답값</b>과 <b>API Provider(발송 처리) 응답</b>이 합쳐져 전달됩니다. 공통 응답값으로 플랫폼 연동 성공 여부를, Provider 응답으로 실제 발송 처리 결과를 판단합니다.",
            table: {
              schema: true,
              cols: ["필드", "필수", "설명"],
              colWidths: ["24%", "10%", "66%"],
              rows: [
                ["transactionid", "필수", "시스템 발급 일련번호(UUID). VOC 응대용"],
                ["returncode", "필수", "<code>0</code>: Fail / <code>1</code>: Success"],
                ["returndescription", "필수", "Success 또는 Fail"],
                ["errorcode", "선택", "실패 시. <code>200001</code>(연동/인증/규격) · <code>200002</code>(유효성) 등"],
                ["errordescription", "선택", "에러 상세 설명"],
              ],
            },
            note: "⚠ 일부 API(<b>카카오 비즈메시지·국제 SMS</b>)는 공통 응답값의 일부/전체가 없을 수 있습니다. 이 경우 Provider 연동 실패 시에만 공통 응답값이 리턴되므로 별도 처리가 필요합니다.",
          },
          {
            title: "엔드포인트 규칙",
            body: "URL은 <code>{도메인}/{서비스}/{버전}/{API명}</code> 구조이며, <b>경로 버전은 API 버전에 따라 다릅니다</b>.",
            table: {
              cols: ["채널", "경로 예시"],
              colWidths: ["30%", "70%"],
              rows: [
                ["문자 (SMS/MMS)", "<code>/cpaas/v2.0/CPaaS_sendSMS</code>"],
                ["WhatsApp", "<code>/cpaas/v1.0/CPaaS_sendWhatsAppTemplatesAuth</code>"],
                ["기업통화 (별도 제품)", "<code>/voice/v1.0/reqUserList</code>"],
              ],
            },
            note: "외부 연동은 <code>api.communis.kt.com</code>, KT 내부망은 <code>api-in.communis.kt.com</code>을 사용합니다.",
          },
          {
            title: "발송 제한 정책",
            table: {
              cols: ["항목", "제한"],
              colWidths: ["46%", "54%"],
              rows: [
                ["동보 발송 (receiveList)", "최대 5,000건"],
                ["동보 발송 (receiveExcel)", "최대 10,000건 (Base64 업로드)"],
                ["광고 발송 가능 시간", "08:00 ~ 21:00 (정보통신망법 기준)"],
                ["customMessageId 크기", "최대 100자"],
                ["param 전체 크기", "JSON 문자열 9,900byte 이하"],
              ],
            },
            note: "광고 발송은 <b>정보통신망법상 08:00~21:00</b> 가능합니다. 커뮤니즈는 별도 발송금지 시간을 두지 않으며(하드 차단 없음), 통상 21시 발송을 피해 <b>20:50</b>까지 발송하도록 가이드합니다(RCS <b>웹 발송</b>만 프론트에서 차단). 야간 광고 수신 동의 고객은 21시 이후 발송이 허용되는 경우가 있습니다. 광고성(msgKind=A)은 본문에 <code>(광고)</code> 접두 + <code>무료수신거부:(번호)</code> 접미가 자동 추가됩니다.",
          },
        ],
      },
      { id: "sms", group: "API 연동 · 핵심", name: "문자 (SMS/LMS/MMS)",
        intro: "문자 발송 API입니다. SMS는 CPaaS_sendSMS, LMS/MMS는 CPaaS_sendMMS를 사용합니다. (규격서 v3.0.29 §2)",
        steps: [
          {
            title: "엔드포인트",
            body: "메시지 종류에 따라 API가 나뉩니다. 전송방식은 <b>HTTPS / POST</b>.",
            table: {
              cols: ["종류", "API", "URL (외부도메인)"],
              colWidths: ["14%", "26%", "60%"],
              rows: [
                ["SMS", "CPaaS_sendSMS", "<code>https://api.communis.kt.com/cpaas/v2.0/CPaaS_sendSMS</code>"],
                ["LMS / MMS", "CPaaS_sendMMS", "<code>https://api.communis.kt.com/cpaas/v2.0/CPaaS_sendMMS</code>"],
              ],
            },
            note: "헤더는 <b>공통 규격</b> 탭 참고(Content-Type · Authorization · SubKey).",
          },
          {
            title: "요청 Body — 공통 필드 (SMS)",
            body: "Content-Type: <code>application/json; charset=UTF-8</code>. <code>receiveExcel</code>/<code>receiveList</code>, <code>templateId</code>/<code>messageInfo</code>는 각각 <b>둘 중 하나만</b> 사용합니다.",
            table: {
              schema: true,
              cols: ["필드", "타입", "필수", "설명"],
              colWidths: ["21%", "10%", "9%", "60%"],
              rows: [
                ["agentCode", "String", "", "전문협력사 Agent 코드"],
                ["notificationTags", "Array", "", "고객사 관리 태그 (최대 500)"],
                ["reserveTime", "String", "", "예약시간 <code>yyMMddHHmmss</code> (없으면 실시간 발송)"],
                ["expireTime", "String", "", "만료시간 <code>yyMMddHHmmss</code> (경과 후 미발송)"],
                ["receiveExcel", "String", "△", "수신자 Excel(Base64). 최대 10,000건"],
                ["receiveList", "Array", "△", "수신자 정보 배열. 최대 5,000건 (receiveExcel과 택1)"],
                ["└ receiveNum", "String", "필수", "수신번호 (숫자만, 3~16자리)"],
                ["└ customMessageId", "String", "", "수신번호별 지정 트랜잭션ID (최대 100자)"],
                ["└ param", "Object", "", "치환 <code>{key:value}</code> Map (전체 9,900byte 이하)"],
                ["templateId", "String", "△", "기존 SMS 템플릿 사용 시 필수 (messageInfo와 택1)"],
                ["messageInfo", "Object", "△", "새 메시지 작성 시 필수 (templateId와 택1)"],
                ["└ msgKind", "String", "필수", "<code>A</code>:광고성 / <code>I</code>:정보성"],
                ["└ content", "String", "필수", "본문. <b>SMS 90byte</b> (한글 2byte)"],
                ["└ callbackNum", "String", "필수", "회신번호 (숫자만, 3~16자리)"],
                ["└ kisaOrigCode", "String", "△", "최초 발신 사업자코드(9자리). SMS/LMS/MMS 필수화 예정"],
                ["└ unsubscribeNum", "String", "△", "수신거부번호. 광고성(A) 필수 / 정보성(I)은 null"],
              ],
            },
          },
          {
            title: "LMS / MMS 추가 필드 (CPaaS_sendMMS)",
            body: "LMS·MMS는 위 공통 필드에 아래가 추가됩니다. <b>LMS</b>는 첨부 없이 장문, <b>MMS</b>는 이미지 첨부.",
            table: {
              schema: true,
              cols: ["필드", "타입", "필수", "설명"],
              colWidths: ["18%", "11%", "13%", "58%"],
              rows: [
                ["subject", "String", "", "제목 (최대 64byte)"],
                ["content", "String", "필수", "본문 (최대 <b>4,000byte</b>)"],
                ["fileList", "Array", "MMS 필수", "첨부 이미지(jpg). 최대 3개 · 총 1MB · width 1500px 이하"],
                ["└ fileNo", "String", "필수", "첨부 번호(1자리)"],
                ["└ fileName", "String", "필수", "파일명(확장자 포함, 최대 300자)"],
                ["└ file", "String", "필수", "파일 Base64 인코딩"],
              ],
            },
            note: "MMS는 <code>fileList</code> 필수입니다. 첨부 없이 장문만 보내면 LMS로 처리됩니다.",
          },
          {
            title: "응답 (Response)",
            table: {
              schema: true,
              cols: ["필드", "필수", "설명"],
              colWidths: ["30%", "12%", "58%"],
              rows: [
                ["returncode", "필수", "<code>0</code>:Fail / <code>1</code>:Success"],
                ["returndescription", "필수", "Success / Fail"],
                ["data", "성공시", "세부 데이터(아래)"],
                ["└ wrkId", "필수", "발송작업ID (결과조회 키)"],
                ["└ totalCnt / successCnt / failCnt", "필수", "전체 / 성공 / 실패 수신번호 수"],
                ["└ trackingList", "필수", "트래킹 리스트 (trackingId · customMessageId)"],
                ["  · trackingId", "필수", "<code>[발송작업ID]_[seq]</code>"],
                ["└ failReceiveList", "△", "실패 번호 리스트 (failCnt≠0 시 필수)"],
              ],
            },
            note: "발송작업ID(<code>wrkId</code>)와 <code>trackingId</code>로 이후 발송 결과를 조회합니다.",
          },
          {
            title: "발송 테스트 코드 (SMS 1건)",
            body: "Basic 인증으로 SMS를 발송하는 최소 예제입니다.",
            codeTabs: [
              { name: "Python", code: SMS_PY },
              { name: "Request (JSON)", code: SMS_REQ },
              { name: "Response (JSON)", code: SMS_RES },
            ],
            note: "실제 값(API-ID/PW·회신번호·수신번호)으로 바꿔 실행하세요. 응답의 <code>wrkId</code>로 결과를 조회합니다.",
          },
        ],
      },
      { id: "alimtalk", group: "API 연동 · 핵심", name: "카카오 알림톡",
        intro: "카카오 알림톡(정보성 메시지) 발송 API입니다. 발신프로필 키·승인 템플릿이 필수이며, 사전 준비(채널→발신프로필→템플릿)가 선행됩니다. (규격서 v3.0.29 §3)",
        steps: [
          {
            title: "개요",
            body: "알림톡은 카카오톡 채널로 보내는 <b>정보성 메시지</b>입니다. 발송에는 <b>발신프로필키(kakaoSenderKey)</b>와 <b>승인된 템플릿ID(templateId)</b>가 필수입니다.",
            note: "사전 준비(카카오 채널 생성 → 발신프로필 키 등록 → 템플릿 등록·검수)는 <b>시작하기 &gt; 발신정보 · 템플릿</b> 탭을 참고하세요.",
          },
          {
            title: "엔드포인트",
            body: "전송방식은 <b>HTTPS / POST</b>.",
            table: {
              cols: ["구분", "API", "URL (외부도메인)"],
              colWidths: ["16%", "30%", "54%"],
              rows: [
                ["기본 발송", "CPaaS_sendAlimtalk", "<code>https://api.communis.kt.com/cpaas/v2.0/CPaaS_sendAlimtalk</code>"],
              ],
            },
            note: "대체발송(알림톡 실패 → SMS/LMS 전환)은 <code>CPaaS_sendAlimtalkUms</code>(v2.1)를 사용합니다 → <b>대체발송(UMS 전환)</b> 탭 참고. 미들웨어 연동은 <code>CPaaS_sendAlimtalkMw</code>가 별도 제공됩니다.",
          },
          {
            title: "요청 Body",
            body: "Content-Type: <code>application/json; charset=UTF-8</code>. <code>receiveExcel</code>/<code>receiveList</code>는 둘 중 하나만 사용합니다.",
            table: {
              schema: true,
              cols: ["필드", "타입", "필수", "설명"],
              colWidths: ["22%", "10%", "9%", "59%"],
              rows: [
                ["kakaoSenderKey", "String", "필수", "발신프로필 키 (엠앤와이즈 발급, 40byte)"],
                ["senderKeyType", "String", "", "<code>S</code>:발신프로필(기본) / <code>G</code>:그룹"],
                ["templateId", "String", "필수", "승인된 알림톡 템플릿ID (예 <code>CPS_TML_...</code>)"],
                ["notificationTags", "Array", "", "고객사 관리 태그"],
                ["reserveTime / expireTime", "String", "", "예약/만료 <code>yyMMddHHmmss</code>"],
                ["receiveExcel", "String", "△", "수신자 Excel(Base64). 최대 10,000건"],
                ["receiveList", "Array", "△", "수신자 배열. 최대 5,000건 (receiveExcel과 택1)"],
                ["└ receiveNum", "String", "필수", "수신번호 (숫자만, 3~16자리)"],
                ["└ customMessageId", "String", "", "수신번호별 트랜잭션ID"],
                ["└ param", "Object", "", "템플릿 치환 <code>{key:value}</code> (전체 9,900byte 이하)"],
                ["buttonExtraInfo", "Array", "", "버튼 추가정보(순서 일치): 봇전환 <code>chat_extra/chat_event</code>, 외부브라우저 <code>target=\"out\"</code>"],
                ["quickReplyExtraInfo", "Array", "", "바로연결 추가정보(순서 일치): <code>chat_extra/chat_event</code>"],
              ],
            },
            note: "치환 변수(<code>param</code>)의 key는 <b>템플릿에 등록된 변수명</b>과 일치해야 합니다. 버튼/바로연결은 템플릿에 등록된 <b>순서대로</b> 배열 인덱스를 맞춥니다.",
          },
          {
            title: "응답 (Response)",
            body: "응답 구조는 <b>문자(SMS)와 동일</b>합니다.",
            note: "<code>returncode</code>(0/1) + <code>data</code>{ <code>wrkId</code> · <code>totalCnt/successCnt/failCnt</code> · <code>trackingList</code>(trackingId) · <code>failReceiveList</code> }. 발송작업ID(<code>wrkId</code>)와 <code>trackingId</code>로 결과를 조회합니다. (상세: <b>문자</b> 탭)",
          },
          {
            title: "발송 테스트 코드 (알림톡 1건)",
            body: "Basic 인증으로 알림톡을 발송하는 최소 예제입니다.",
            codeTabs: [
              { name: "Python", code: ALIM_PY },
              { name: "Request (JSON)", code: ALIM_REQ },
            ],
            note: "<code>kakaoSenderKey</code>·<code>templateId</code>는 사전 준비에서 발급/승인받은 값으로 바꿔 실행하세요. <code>param</code>의 key는 템플릿 변수명과 일치해야 합니다.",
          },
        ],
      },
      { id: "rcs", group: "API 연동 · 핵심", name: "RCS",
        intro: "RCS 발송 API입니다. 발송 전 RBC 브랜드·대화방(챗봇) 등록과 대행사 지정이 필요합니다(→ 시작하기 > 발신정보). 비승인형/승인형/통합RCS를 지원합니다. (규격서 v3.0.29 §6)",
        steps: [
          {
            title: "개요 — RCS 종류",
            body: "RCS는 브랜드 카드·버튼 등 <b>리치 메시지</b>입니다. 발송에는 <b>chatbotId(챗봇 ID)</b>가 필수이며, RBC 사전작업(브랜드·대화방·대행사)이 선행됩니다.",
            table: {
              cols: ["종류", "설명"],
              colWidths: ["26%", "74%"],
              rows: [
                ["비승인형(Unapproved)", "자유 양식으로 즉시 발송. 브랜드 인증만 필요. SMS/LMS/MMS"],
                ["승인형(Approved)", "사전 <b>승인된 템플릿</b> 기반 발송(templateId 필수). 텍스트/이미지/LMS"],
                ["통합 RCS(iRCS)", "RCS 미지원 단말은 문자로 자동 대체까지 포함한 통합 발송"],
              ],
            },
            note: "RBC 브랜드·대화방 등록, 대행사 '케이티' 지정은 <b>시작하기 &gt; 발신정보</b> 탭을 참고하세요. <code>brandId</code>·<code>brandKey</code>는 <code>chatbotId</code> 검증용입니다.",
          },
          {
            title: "엔드포인트",
            body: "전송방식 <b>HTTPS / POST</b>. 종류별로 API가 나뉩니다.",
            tables: [
              {
                label: "비승인형",
                cols: ["종류", "API"],
                colWidths: ["30%", "70%"],
                rows: [
                  ["SMS", "<code>CPaaS_rcsSendUnappdSms</code>"],
                  ["LMS", "<code>CPaaS_rcsSendUnappdLms</code>"],
                  ["MMS", "<code>CPaaS_rcsSendUnappdMms</code>"],
                ],
              },
              {
                label: "승인형",
                cols: ["종류", "API"],
                colWidths: ["30%", "70%"],
                rows: [
                  ["텍스트", "<code>CPaaS_rcsSendAppdMmsText</code>"],
                  ["이미지", "<code>CPaaS_rcsSendAppdMmsImg</code>"],
                  ["LMS", "<code>CPaaS_rcsSendAppdLms</code>"],
                ],
              },
              {
                label: "통합 RCS(iRCS)",
                cols: ["종류", "API"],
                colWidths: ["30%", "70%"],
                rows: [
                  ["SMS/LMS/MMS", "<code>CPaaS_ircsSendSms / Lms / Mms</code>"],
                  ["템플릿", "<code>CPaaS_ircsSendTemplateText / TemplateImage</code>"],
                ],
              },
            ],
            note: "모든 URL은 <code>https://api.communis.kt.com/cpaas/v2.0/{API명}</code> 형식입니다.",
          },
          {
            title: "요청 Body — 비승인형 SMS 기준",
            body: "<code>headerExtraInfo</code>(RCS 헤더)와 <code>rcsInfo</code>(메시지 내용)로 구성됩니다. <code>templateId</code>와 <code>rcsInfo</code>는 둘 중 하나만 사용합니다.",
            table: {
              schema: true,
              cols: ["필드", "타입", "필수", "설명"],
              colWidths: ["24%", "11%", "9%", "56%"],
              rows: [
                ["templateId", "String", "△", "KT-UMS 등록 비승인형 템플릿ID (rcsInfo와 택1)"],
                ["headerExtraInfo", "Object", "필수", "RCS 헤더 정보"],
                ["└ chatbotId", "String", "필수", "발신 챗봇 ID (RBC 등록)"],
                ["└ agencyId / agencyKey", "String", "", "대행사 ID/Key"],
                ["└ brandId / brandKey", "String", "", "브랜드 ID/Key (chatbotId 검증용)"],
                ["└ msgKind", "String", "필수", "<code>A</code>:광고 / <code>I</code>:정보"],
                ["└ footer", "String", "△", "수신거부번호 (광고성 필수)"],
                ["└ copyAllowed", "String", "", "메시지 복사 허용 <code>Y</code>(기본)/<code>N</code>"],
                ["└ groupId", "String", "", "발송 그룹ID (고객반응 통계 조회 시 필수)"],
                ["rcsInfo", "Object", "△", "메시지 내용 (templateId와 택1)"],
                ["└ body.description", "String", "필수", "본문 (100자 제한)"],
                ["└ body.buttons", "String", "", "버튼 — GSMA RCC.07 suggestions 규격 JSON 문자열 (RCS SMS 최대 1개)"],
                ["receiveList / receiveExcel", "Array/String", "△", "수신자 (택1). receiveNum·customMessageId·param"],
              ],
            },
            note: "LMS/MMS·승인형은 필드가 추가·변경됩니다. buttons는 JSON을 문자열로 인코딩해 전송합니다.",
          },
          {
            title: "승인형 vs 비승인형",
            table: {
              cols: ["항목", "비승인형", "승인형"],
              colWidths: ["22%", "39%", "39%"],
              rows: [
                ["메시지", "rcsInfo로 자유 작성", "사전 승인된 템플릿(templateId 필수)"],
                ["사전 승인", "불필요(브랜드 인증만)", "KT-UMS 브랜드별 템플릿 승인 필요"],
                ["용도", "즉시성·유연", "정형 메시지·심사 안정성"],
              ],
            },
          },
          {
            title: "응답 (Response)",
            body: "응답 구조는 <b>문자와 동일</b>합니다.",
            note: "<code>returncode</code> + <code>data</code>{ <code>wrkId</code> · <code>totalCnt/successCnt/failCnt</code> · <code>trackingList</code> · <code>failReceiveList</code> }. 최종 발송 결과는 <b>결과 수신</b> 탭(UMS REPORT)에서 <code>trackingId</code>로 조회합니다.",
          },
          {
            title: "발송 테스트 코드 (RCS 비승인형 SMS)",
            body: "chatbotId·brandId는 RBC에서 발급받은 값으로 바꿔 실행하세요.",
            codeTabs: [
              { name: "Python", code: RCS_PY },
            ],
            note: "광고성(msgKind=A) 발송 시 <code>footer</code>(수신거부번호)가 필수입니다.",
          },
        ],
      },
      { id: "report", group: "API 연동 · 핵심", name: "결과 수신 (발송 결과 조회)",
        intro: "발송 시 받은 trackingId로 최종 발송 결과를 조회하는 UMS REPORT API입니다. 문자·알림톡·RCS 모든 채널 공통. (규격서 v3.0.29 §10.2)",
        steps: [
          {
            title: "개요 & 엔드포인트",
            body: "발송 응답에서 받은 <code>trackingId</code> 리스트로 최종 결과를 조회합니다. 전송방식 <b>HTTPS / POST</b>.",
            table: {
              cols: ["API", "URL (외부도메인)"],
              colWidths: ["26%", "74%"],
              rows: [
                ["CPaaS_umsReport", "<code>https://api.communis.kt.com/cpaas/v2.0/CPaaS_umsReport</code>"],
              ],
            },
            note: "한 번에 최대 <b>1,000건</b>의 trackingId를 조회할 수 있습니다.",
          },
          {
            title: "요청 Body",
            table: {
              schema: true,
              cols: ["필드", "타입", "필수", "설명"],
              colWidths: ["22%", "12%", "9%", "57%"],
              rows: [
                ["trackingIdList", "Array", "필수", "조회할 trackingId 리스트 (최대 1,000)"],
                ["getUtxData", "String", "필수", "<code>Y</code>: 상세 트랜잭션 데이터 수령 / <code>N</code>: 미수령"],
              ],
            },
          },
          {
            title: "응답 (Response)",
            table: {
              schema: true,
              cols: ["필드", "필수", "설명"],
              colWidths: ["26%", "10%", "64%"],
              rows: [
                ["data.reportDataCount", "필수", "조회 데이터 개수 (최대 1,000)"],
                ["reportDataList", "△", "조회 결과 배열"],
                ["└ trackingId", "필수", "<code>[발송작업ID]_[seq]</code>"],
                ["└ receiveNum", "필수", "수신 전화번호"],
                ["└ channel", "선택", "최종 발송 채널 (SMS/LMS/MMS/KAKAO/RCS)"],
                ["└ status", "필수", "최종 발송 상태 코드 (아래 표)"],
                ["└ dealer", "선택", "최종 채널 딜러사 (XROSHOT/MNWISE/KTRCS)"],
                ["└ utxData[]", "선택", "getUtxData=Y 시 상세 (utxChannel·utxStatus·resultCode·jobId·submitDate·resultDate)"],
              ],
            },
            note: "대체발송(UMS)의 경우 최종 <code>status</code>와 개별 채널 <code>utxStatus</code>가 다를 수 있습니다.",
          },
          {
            title: "발송 상태 코드 (status / utxStatus)",
            table: {
              cols: ["코드", "의미"],
              colWidths: ["18%", "82%"],
              rows: [
                ["N", "발송전"],
                ["P", "발송중"],
                ["S", "전송완료"],
                ["F", "전송실패"],
                ["C", "발송취소"],
                ["E", "만료취소"],
              ],
            },
          },
          {
            title: "조회 테스트 코드",
            codeTabs: [
              { name: "Python", code: REPORT_PY },
              { name: "Response (JSON)", code: REPORT_RES },
            ],
            note: "발송 API 응답의 <code>trackingId</code>를 모아 조회합니다. 재조회 간격은 과도하지 않게 두세요.",
          },
        ],
      },

      /* ── [API 연동 · 부록] (비주류 · 참조/FAQ) ────────── */
      { id: "brand", group: "API 연동 · 부록", name: "카카오 브랜드메시지 (구 친구톡)",
        intro: "카카오 브랜드 메시지(구 친구톡) 발송 API입니다. 알림톡과 구조가 유사하나 <b>광고성</b> 메시지입니다. (규격서 v3.0.29 §3.2)",
        steps: [
          {
            title: "개요 & 엔드포인트",
            body: "발송에 <b>발신프로필 키(kakaoSenderKey)</b>가 필수이며, 브랜드 메시지 템플릿을 사용합니다.",
            table: {
              cols: ["구분", "API"],
              colWidths: ["32%", "68%"],
              rows: [
                ["기본 발송", "<code>CPaaS_sendFriendtalk</code> (/cpaas/v2.0/)"],
                ["대체발송(UMS)", "<code>CPaaS_sendFriendtalkUms</code> (v2.1)"],
                ["템플릿 등록", "<code>CPaaS_friendTalkTemplate</code> 등"],
              ],
            },
            note: "브랜드 메시지는 <b>광고성만</b> 가능하며, 광고 발송은 <b>정보통신망법상 08:00~21:00</b>입니다(발송시간 정책은 <b>공통 규격</b> 탭 참고). (v3.0.25 '친구톡'→'브랜드 메시지' 개명, API명 유지) 요청 Body는 알림톡과 유사 — 상세는 규격서 §3.2. 발신프로필·템플릿 준비는 <b>시작하기 &gt; 발신정보·템플릿</b> 참고.",
          },
        ],
      },
      { id: "global", group: "API 연동 · 부록", name: "국제 SMS",
        intro: "해외 수신자에게 SMS를 발송하는 국제 SMS API입니다. (규격서 v3.0.29 §4)",
        steps: [
          {
            title: "개요 & 엔드포인트",
            body: "국내 문자와 별개 API이며 <b>응답 구조가 다릅니다</b>(공통 응답값 없이 messages 배열 반환).",
            table: {
              cols: ["API", "URL"],
              colWidths: ["30%", "70%"],
              rows: [
                ["CPaaS_globalSms", "<code>https://api.communis.kt.com/cpaas/v1.0/CPaaS_globalSms</code>"],
              ],
            },
            note: "국가별 발송 단가는 별도입니다(251개국, 매월 공지 기준). ⚠ 국제 SMS는 공통 응답값이 없어 실패 시에만 공통 응답값이 리턴됩니다(공통 규격 탭 참고). 발신번호 등록은 불필요.",
          },
          {
            title: "요청 Body",
            table: {
              schema: true,
              cols: ["필드", "필수", "설명"],
              colWidths: ["14%", "10%", "76%"],
              rows: [
                ["from", "필수", "발신 이름 또는 번호 (예 <code>821011111111</code>)"],
                ["to", "필수", "수신 국제번호 (예 <code>821012345678</code>)"],
                ["text", "필수", "메시지 본문"],
                ["type", "선택", "<code>text</code> / <code>unicode</code> (기본 text). 한글은 unicode"],
                ["ttl", "선택", "전송 유효시간(ms). 20000~604800000, 기본 259200000"],
              ],
            },
            note: "응답: <code>messages[]</code>(to·message-id·status·network) + message-count.",
          },
        ],
      },
      { id: "twofa", group: "API 연동 · 부록", name: "2FA (2차 인증)",
        intro: "OTP(1회용 비밀번호)를 발송하고 검증하는 2단계 인증 API입니다. 문자·RCS·알림톡 매체로 OTP를 보낼 수 있습니다. (규격서 v3.0.29 §11)",
        steps: [
          {
            title: "엔드포인트 (발송 → 검증)",
            table: {
              cols: ["단계", "API"],
              colWidths: ["26%", "74%"],
              rows: [
                ["① OTP 발송", "<code>CPaaS_send2fa</code> (/cpaas/v2.0/)"],
                ["② OTP 검증", "<code>CPaaS_auth2fa</code> (/cpaas/v2.0/)"],
              ],
            },
            note: "인증 헤더는 <code>authorization</code>(CPaaS 발급 토큰)을 사용합니다. 2FA는 발신번호 사전 등록이 필요합니다.",
          },
          {
            title: "OTP 발송 (send2fa)",
            table: {
              schema: true,
              cols: ["필드", "필수", "설명"],
              colWidths: ["30%", "10%", "60%"],
              rows: [
                ["receiveInfo.receiveNum", "필수", "수신번호 (1개만)"],
                ["2FaChannelInfo.sendChannel", "필수", "<code>MESSAGE</code> / <code>RCS</code> / <code>KAKAO_ALIM</code>"],
                ["2FaChannelInfo.expireTime", "선택", "OTP 폐기시간(초). 미지정 180초"],
                ["2FaChannelInfo.pinLength", "선택", "OTP 길이(최대 6, 기본 6)"],
                ["2FaChannelInfo.pinKey", "선택", "본문 OTP 치환키. SMS/KAKAO <code>#{pin}</code>, RCS <code>{{pin}}</code>"],
                ["ums…Info", "△", "매체별: <code>umsMessageInfo</code>(문자)/<code>umsKakaoAlimInfo</code>(알림톡)/<code>umsRcsInfo</code>(RCS)"],
              ],
            },
          },
          {
            title: "OTP 검증 (auth2fa)",
            body: "사용자가 입력한 OTP를 검증합니다.",
            table: {
              schema: true,
              cols: ["필드", "필수", "설명"],
              colWidths: ["30%", "12%", "58%"],
              rows: [
                ["2FaAuthInfo.receiveNum", "필수", "PIN 발급된 착신번호"],
                ["2FaAuthInfo.pin", "필수", "단말에서 수신한 PIN"],
              ],
            },
            note: "returncode 1이면 인증 성공입니다.",
          },
        ],
      },
      { id: "failover", group: "API 연동 · 부록", name: "대체발송 (UMS 전환)",
        intro: "발송 실패 시 다른 채널로 자동 전환하는 대체발송입니다. 알림톡 failOver(단순)과 RCS umsChannelInfo(다단계) 두 방식이 있습니다. (규격서 §3·§6)",
        steps: [
          {
            title: "① 알림톡 failOver (알림톡 → SMS/LMS)",
            body: "알림톡 UMS 발송 API(<code>_Ums_v2.1</code> 버전)에서 지원. 알림톡 실패 시 SMS/LMS로 <b>1단계 전환</b>.",
            table: {
              schema: true,
              cols: ["파라미터", "필수", "설명"],
              colWidths: ["28%", "12%", "60%"],
              rows: [
                ["failOver", "필수", "<code>Y</code> 사용 / <code>N</code> 미사용"],
                ["failOverType", "△", "<code>SMS</code> / <code>LMS</code> (90byte 초과 시 자동 LMS)"],
                ["failOverCallbackNum", "△", "대체 발송 회신번호 (failOver=Y 시 필수)"],
                ["failOverContent", "선택", "대체 본문 (없으면 알림톡 본문 사용)"],
              ],
            },
          },
          {
            title: "② RCS umsChannelInfo (RCS → 다단계 전환)",
            body: "RCS 발송 API 요청에 <code>umsChannelInfo</code> 오브젝트를 추가. <b>다단계 전환</b> 가능.",
            table: {
              cols: ["오브젝트", "설명"],
              colWidths: ["30%", "70%"],
              rows: [
                ["channelOrder", "전환 순서 배열: <code>MESSAGE</code> / <code>KAKAO_ALIM</code> / <code>RCS</code>"],
                ["umsMessageInfo", "SMS/LMS 전환 시 (channel·msgKind·content·callbackNum)"],
                ["umsKakaoAlimInfo", "알림톡 전환 시 (kakaoSenderKey·templateId)"],
              ],
            },
            note: "예: RCS 부달 → 알림톡 → LMS = channelOrder <code>[\"KAKAO_ALIM\",\"MESSAGE\"]</code>. 최종 결과는 <b>결과 수신</b> 탭에서 채널별 utxStatus로 확인.",
          },
        ],
      },
      { id: "stat", group: "API 연동 · 부록", name: "통계 API",
        intro: "발송 이력 통계를 조회하는 마케팅 통계 API 3종입니다. (v2.0)",
        steps: [
          {
            title: "API 3종",
            table: {
              cols: ["API", "조회 단위", "svcId / chargeGroups"],
              colWidths: ["34%", "32%", "34%"],
              rows: [
                ["CPaaS_getDailyStatList", "전체(사업자번호) 일별", "svcId 불필요 / chargeGroups 선택"],
                ["CPaaS_getSvcStatInfo", "서비스ID별 합계", "svcId 필수 / 페이징 없음"],
                ["CPaaS_getSvcStatDetail", "서비스ID+과금그룹 상세", "svcId·chargeGroups 필수"],
              ],
            },
            note: "인증 헤더 <code>authorization</code> 사용. 공통 요청: schStDt·schEdDt(YYYY-MM-DD)·bizNo(10자리)·pageNo.",
          },
          {
            title: "과금그룹(chargeGroups) 코드",
            table: {
              cols: ["코드", "채널", "코드", "채널"],
              colWidths: ["14%", "36%", "14%", "36%"],
              rows: [
                ["1_1/1_2/1_3", "SMS / LMS / MMS", "4_1 / 4_2", "알림톡 / 브랜드"],
                ["2", "국제 SMS", "5", "이메일"],
                ["3", "2FA", "10", "APP Push"],
                ["8_1~8_6", "RCS (비승인/승인)", "13", "FMS"],
              ],
            },
            note: "응답: totalSndCnt·succCnt·succRate·failCnt·altSuccCnt(대체발송 성공) 등. 상세는 KB 마케팅통계 규격.",
          },
        ],
      },
      { id: "error", group: "API 연동 · 부록", name: "에러코드",
        intro: "발송/조회 응답의 errorcode 해석 참조입니다. (에러코드 정의서 v0.94 기준)",
        steps: [
          {
            title: "에러코드 체계",
            body: "코드 앞자리로 오류 영역을 구분합니다.",
            table: {
              cols: ["범주", "영역", "범주", "영역"],
              colWidths: ["12%", "38%", "12%", "38%"],
              rows: [
                ["E001xx", "파라미터 공통", "E010xx", "RCS 발송(footer·BizCenter)"],
                ["E002xx", "템플릿 공통", "E011xx", "UMS 발송"],
                ["E003xx", "카카오 템플릿/발신프로필", "E012xx", "조회(날짜·trackingID)"],
                ["E004xx", "알림톡 발송등록", "E013xx", "080"],
                ["E005xx", "첨부파일", "E018xx", "대체발송"],
                ["E007xx", "발송 시간(광고·예약)", "E020xx", "2FA 인증"],
                ["E008xx", "수신자(없음·초과)", "E022xx", "PUSH 발송"],
                ["E009xx", "RCS 템플릿(승인상태)", "E101xx", "DB"],
              ],
            },
          },
          {
            title: "자주 발생하는 코드",
            table: {
              cols: ["코드", "의미"],
              colWidths: ["18%", "82%"],
              rows: [
                ["E00101", "필수 파라미터 null/규격 미달"],
                ["E00102", "유효하지 않은 JSON"],
                ["E00201", "템플릿 없음 / 발신프로필키 오류"],
                ["E00313", "알림톡 템플릿 미승인"],
                ["E00702", "광고 발송 불가 시간대"],
                ["E00804", "수신자 수 제한 초과"],
                ["E00906", "brandId / brandKey 오류"],
                ["E01001", "광고 메시지에 수신거부번호(footer) 누락"],
              ],
            },
            note: "전체 코드는 KB 에러코드 레퍼런스 참고. 자체 오류는 공통 응답값 <code>200001</code>(연동/인증/규격)·<code>200002</code>(유효성).",
          },
        ],
      },
      { id: "block080", group: "API 연동 · 부록", name: "080 수신거부",
        intro: "광고 수신거부용 080 번호를 청약·관리하는 API 13종입니다. (규격서 v3.0.29 §12, v3.0.25 신규)",
        steps: [
          {
            title: "API 목록",
            tables: [
              {
                label: "번호 관리",
                cols: ["API", "설명"],
                colWidths: ["46%", "54%"],
                rows: [
                  ["CPaaS_080GetNumbers", "가용한 080번호 조회"],
                  ["CPaaS_080RegNumber / DelNumber", "080번호 청약 / 해지"],
                  ["CPaaS_080GetCallback / ModCallback", "연동 발신번호 조회 / 변경"],
                  ["CPaaS_080GetInfo / InitArsMent", "번호 정보 조회 / ARS 멘트 초기화"],
                ],
              },
              {
                label: "수신거부 고객 · 설정",
                cols: ["API", "설명"],
                colWidths: ["46%", "54%"],
                rows: [
                  ["CPaaS_080GetBlockCustomerNumbers", "수신거부 고객번호 조회"],
                  ["CPaaS_080RegBlockCustomerNumbers", "수신거부 고객번호 대량 등록"],
                  ["CPaaS_080DelBlockCustomerNumber", "수신거부 고객번호 삭제"],
                  ["CPaaS_080ModArsMent / ModMode", "ARS 멘트 변경 / 수집모드 변경"],
                  ["CPaaS_080ModWebhookUrl", "웹훅 URL 변경"],
                ],
              },
            ],
            note: "수집모드: 0(발신 시 수집) / 1(DTMF '1' 입력 시 수집). 080 번호 등록은 <b>시작하기 &gt; 발신정보</b>에서도 안내됩니다.",
          },
        ],
      },
      { id: "mail", group: "API 연동 · 부록", name: "메일",
        intro: "대량 이메일 발송 API입니다. (규격서 v3.0.29 §5)",
        steps: [
          {
            title: "개요 & 엔드포인트",
            table: {
              cols: ["구분", "API"],
              colWidths: ["30%", "70%"],
              rows: [
                ["발송", "<code>CPaaS_sendEmail</code> (/cpaas/v2.0/)"],
                ["결과조회 / 취소", "<code>CPaaS_resultEmail</code> / <code>CPaaS_deleteEmail</code>"],
              ],
            },
            note: "receiveList 최대 <b>1,000건</b>. 광고성(msgKind=A)은 정보통신망법상 <b>08:00~21:00</b> 발송(공통 규격 탭 참고).",
          },
          {
            title: "요청 Body (핵심)",
            table: {
              schema: true,
              cols: ["필드", "필수", "설명"],
              colWidths: ["26%", "10%", "64%"],
              rows: [
                ["receiveList", "△", "수신자(receiveName·receiveEmail). 최대 1,000 (receiveExcel과 택1)"],
                ["templateId / emailInfo", "△", "기존 템플릿 / 새 메일 (택1)"],
                ["emailInfo.msgKind", "필수", "<code>A</code>광고 / <code>I</code>정보"],
                ["emailInfo.subject", "필수", "제목 (최대 100자)"],
                ["emailInfo.content", "필수", "본문"],
                ["emailInfo.sendName / sendEmail", "필수", "발신자명 / 발신 이메일"],
                ["fileList", "선택", "첨부파일 <b>1건만</b> (fileName·Base64)"],
                ["addfield", "선택", "머지 변수 <code>$:name:$값</code> 형식"],
              ],
            },
            note: "읽음확인 웹훅은 <code>readFlag=Y</code>로 수신합니다.",
          },
        ],
      },
      { id: "push", group: "API 연동 · 부록", name: "앱푸시",
        intro: "안드로이드/iOS 앱에 푸시를 발송하는 API입니다. 앱 사전 등록이 필요합니다. (규격서 v3.0.29 §9)",
        steps: [
          {
            title: "개요 & 엔드포인트",
            table: {
              cols: ["API", "URL"],
              colWidths: ["28%", "72%"],
              rows: [
                ["CPaaS_sendPush", "<code>https://api.communis.kt.com/cpaas/v2.0/CPaaS_sendPush</code>"],
              ],
            },
            note: "receiveList 최대 5,000건. 앱(appId)·토큰 등록이 선행되어야 합니다.",
          },
          {
            title: "요청 Body (핵심)",
            table: {
              schema: true,
              cols: ["필드", "필수", "설명"],
              colWidths: ["26%", "10%", "64%"],
              rows: [
                ["msgKind", "필수", "<code>A</code>광고 / <code>I</code>정보"],
                ["receiveList.publicToken", "필수", "수신 단말 앱 Public Token"],
                ["receiveList.osTp", "필수", "<code>1</code>:AOS / <code>2</code>:IOS"],
                ["pushInfo.appId", "필수", "앱 ID (4자리)"],
                ["pushInfo.notiMsg", "필수", "알림 메시지 내용 (최대 1000)"],
                ["pushInfo.notiMsgTitle", "선택", "알림 제목"],
                ["pushInfo.notiImgUrl", "선택", "상단 이미지 URL (공용망 오픈 필요)"],
              ],
            },
          },
        ],
      },
      { id: "whatsapp", group: "API 연동 · 부록", name: "WhatsApp",
        intro: "WhatsApp 템플릿 메시지 발송 API입니다. 템플릿 용도별로 4종의 발송 API가 있습니다. (규격서 v3.0.29 §13)",
        steps: [
          {
            title: "발송 API (템플릿 용도별 4종)",
            table: {
              cols: ["용도", "API"],
              colWidths: ["26%", "74%"],
              rows: [
                ["인증(Auth)", "<code>CPaaS_sendWhatsAppTemplatesAuth</code>"],
                ["마케팅(Marketing)", "<code>CPaaS_sendWhatsAppTemplatesMark</code>"],
                ["유틸리티(Utility)", "<code>CPaaS_sendWhatsAppTemplatesUtil</code>"],
                ["프리(Free)", "<code>CPaaS_sendWhatsAppTemplatesFree</code>"],
              ],
            },
            note: "모두 <code>/cpaas/v1.0/</code>. 인증 헤더 <code>authorization</code> 사용. 발송 결과는 <b>Webhook</b>으로 수신합니다.",
          },
          {
            title: "요청 Body (핵심)",
            table: {
              schema: true,
              cols: ["필드", "필수", "설명"],
              colWidths: ["28%", "10%", "62%"],
              rows: [
                ["messages.from", "필수", "WhatsApp 발신번호"],
                ["messages.to", "선택", "수신자 국제번호"],
                ["content.templateName", "선택", "등록된 템플릿 이름"],
                ["content.templateData.body", "필수", "템플릿 본문 정보"],
                ["content.templateData.buttons", "△", "버튼 정보(있을 경우 / 인증 템플릿은 URL type 필수)"],
                ["content.language", "필수", "템플릿 언어 코드 (예 <code>ko</code>)"],
              ],
            },
            note: "템플릿 Object(body/header/buttons/carousel/orderStatus) 상세는 규격서 §13.6. WhatsApp 발신번호·템플릿은 사전 등록이 필요합니다.",
          },
        ],
      },
      { id: "agent", group: "API 연동 · 부록", name: "DB + Agent 연동 방식",
        intro: "REST API 직접 개발 대신, 모노 설치형 Agent + DB INSERT로 발송하는 방식입니다. DB 방식을 선호하는 고객사에 적합합니다.",
        steps: [
          {
            title: "개요",
            body: "커뮤니즈 연동은 <b>① REST API 직접 개발</b>과 <b>② DB+Agent</b> 두 가지가 있습니다. Agent 방식은 고객사 DB에 발송 데이터를 INSERT하면 모노 Agent가 이를 읽어 커뮤니즈로 발송합니다.",
            table: {
              cols: ["방식", "특징", "적합 대상"],
              colWidths: ["20%", "48%", "32%"],
              rows: [
                ["REST API", "가입 후 API KEY로 직접 개발", "개발 역량 있는 고객사"],
                ["DB + Agent", "모노 Agent 설치 + DB INSERT", "DB 방식 선호 고객사"],
              ],
            },
            note: "Agent 설치파일은 <b>모노에 요청</b>합니다. 한 서비스에서 API형+Agent형을 함께 쓰면 API KEY를 2개 생성합니다.",
          },
          {
            title: "적용 절차",
            list: [
              "① 커뮤니즈 가입·서비스 신청 → API KEY 발급",
              "② 모노에 Agent 설치파일 요청 → 설치·설정(API KEY 세팅)",
              "③ 고객사 DB 발송 테이블에 INSERT → Agent가 발송",
            ],
            note: "샘플·설치파일·상세 설정은 모노(<code>cms@mono.co.kr</code>)에 문의하세요.",
          },
        ],
      },
    ],
  };
})();

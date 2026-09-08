/* ============================================================
   매뉴얼 셀 — 카카오 비즈니스 채널 × KT Communis
   ------------------------------------------------------------
   알림톡·브랜드메시지를 보내려면 먼저 카카오 비즈니스에서 채널을 만들고
   비즈니스 심사를 받은 뒤, 커뮤니즈에 발신프로필(발신키)을 등록해야 한다.
   발송 방법이 아니라 '발송 전 준비'라 [기타 · 부록] 그룹에 둔다.

   Part A(카카오 영역)는 KT·Communis·모노의 지원 범위 밖 — 심사 문의는 카카오 고객센터.

   출처: KB 커뮤니즈 카카오 발신프로필 등록 가이드 (2026-04-24, 실화면 캡쳐 기반)
   ============================================================ */
(function () {
  "use strict";
  var C = (window.HUB_CONTENT = window.HUB_CONTENT || {});
  var A = (C["kakao_biz"] = C["kakao_biz"] || {});

  A["communis"] = {
    navName: "카카오 비즈니스 채널 · 발신프로필",
    intro:
      "카카오 알림톡·브랜드메시지 발송에 필요한 카카오톡 채널 생성부터 커뮤니즈 발신프로필(발신키) 발급까지의 절차입니다. " +
      "실입력은 약 15분이며, 카카오 심사 대기 시간이 별도로 소요됩니다.",
    download: { title: "카카오 발신프로필 등록 가이드", meta: "business.kakao.com · 실화면 캡쳐 기반 · 2026-04-24" },
    features: [
      /* ── [시작하기] ───────────────────────────── */
      { id: "overview", group: "시작하기", name: "전체 흐름 · 사전 준비물",
        intro: "카카오 측 채널 준비(Part A)와 커뮤니즈 측 발신프로필 등록(Part B) 두 단계로 진행됩니다.",
        steps: [
          {
            title: "전체 진행 흐름",
            body: "커뮤니즈에서 <b>알림톡·브랜드메시지</b>를 발송하려면 <b>카카오톡 발신프로필 등록</b>이 선행되어야 합니다.",
            list: [
              "<b>Part A · 카카오 비즈니스</b> — ①로그인 → ②채널 생성(유형·사업자·정보) → ③비즈니스 심사 신청 → ④승인 후 검색용 ID 확인",
              "<b>Part B · 커뮤니즈</b> — ①메뉴 이동 → ②등록 시작 → ③정보 입력 → ④토큰 요청 → ⑤6자리 인증 → ⑥발신키 발급 완료",
            ],
            note: "⚠ <b>Part A(카카오 영역)는 KT·Communis·모노의 직접 지원 범위가 아닙니다.</b> 심사 소요 시간·반려 사유 등 카카오 정책 문의는 <b>카카오 비즈니스 고객센터</b>(<a class=\"exref\" href=\"https://center-pf.kakao.com\" target=\"_blank\" rel=\"noopener noreferrer\">center-pf.kakao.com</a>)로 하세요.",
          },
          {
            title: "사전 준비물",
            body: "시작하기 전에 아래 항목을 준비하세요.",
            list: [
              "<b>카카오 계정</b> (이메일 또는 카카오톡 계정)",
              "<b>사업자등록증</b> 또는 고유번호증",
              "<b>카카오톡 전자증명서 제출이 가능한 휴대폰</b> (심사용)",
              "(해당 시) 업종별 <b>인허가 서류</b>",
              "(대행사인 경우) <b>업무 대행 계약서</b> · 대행사 사업자등록증",
              "<b>채널 관리자로 초대된 사람의 카카오톡 연락처</b> (토큰 인증 수신용)",
              "커뮤니즈 계정 및 <b>카카오 비즈메시지 서비스 신청 완료</b> 상태",
            ],
            note: "커뮤니즈 서비스 신청은 <b>KT Communis API &gt; 시작하기 &gt; 서비스 신청·설정</b> 탭을 참고하세요.",
          },
        ],
      },

      /* ── [Part A · 카카오 비즈니스] ─────────────── */
      { id: "a-create", group: "Part A · 카카오 비즈니스", name: "채널 만들기 (로그인 · 유형 · 사업자)",
        intro: "카카오 비즈니스(business.kakao.com)에서 새 채널을 생성합니다.",
        steps: [
          {
            title: "① 카카오 비즈니스 로그인",
            body: "<code>https://business.kakao.com</code> 에 접속해 카카오 계정으로 로그인합니다. 계정이 없다면 회원가입 후 안내를 따릅니다.",
            shot: { img: "assets/kakao/a1-login.png", url: "business.kakao.com", label: "카카오 비즈니스 로그인" },
          },
          {
            title: "② 새 채널 만들기 — 유형 선택",
            body: "좌측 하단 <b>[+ 새 채널 만들기]</b>를 클릭하고 채널 유형을 선택한 뒤 다음으로 넘어갑니다.",
            table: {
              cols: ["유형", "포함 항목", "설명"],
              colWidths: ["26%", "24%", "50%"],
              rows: [
                ["<b>유형 1. 기본 채널형</b>", "카카오톡 채널", "카카오톡 프로필 채널 — 채팅·메시지·소식·쿠폰"],
                ["유형 2. 오프라인 매장형", "카카오톡 채널 + 카카오맵 매장", "매장 등록·후기 관리·맵 광고까지 포함"],
              ],
            },
            shot: { img: "assets/kakao/a2-type.png", url: "business.kakao.com", label: "채널 유형 선택" },
            note: "알림톡·브랜드메시지 목적이라면 <b>유형 1. 기본 채널형</b>으로 충분합니다.",
          },
          {
            title: "③ 사업자 정보 입력",
            body: "<b>‘네, 지금 입력할게요’</b>를 선택하고 <b>사업자등록번호(또는 고유번호)</b>를 입력한 뒤 다음을 클릭합니다.",
            shot: { img: "assets/kakao/a3-bizinfo.png", url: "business.kakao.com", label: "사업자 정보 입력" },
            note: "비즈니스 심사를 받으려면 <b>사업자 정보 입력이 필수</b>입니다.",
          },
        ],
      },
      { id: "a-info", group: "Part A · 카카오 비즈니스", name: "채널 기본 정보 · 검색용 ID",
        intro: "채널 프로필·이름·카테고리와 검색용 ID를 입력합니다. 검색용 ID는 한 번 정하면 바꿀 수 없습니다.",
        steps: [
          {
            title: "④ 채널 기본 정보 입력",
            body: "채널 프로필 사진, 이름, 카테고리, <b>검색용 ID</b>를 입력합니다.",
            table: {
              schema: true,
              cols: ["항목", "입력 가이드"],
              colWidths: ["24%", "76%"],
              rows: [
                ["프로필", "권장 <b>640×640</b>, JPG·JPEG·PNG, 최대 10MB"],
                ["채널 이름", "한글·영문·숫자 <b>20자 이내</b> (친구 100명 이하일 때 1회 변경 가능)"],
                ["카테고리", "사업 업종에 맞는 대분류/소분류 선택"],
                ["검색용 ID", "한글·영문·숫자 <b>15자 이내</b> — <b>한 번 정하면 변경 불가</b>"],
              ],
            },
            shot: { img: "assets/kakao/a4-basic.png", url: "business.kakao.com", label: "채널 기본 정보 입력" },
            note: "⚠ <b>검색용 ID는 변경할 수 없습니다.</b> 오타·임시값을 넣지 말고 실제 발송 운영에 쓸 최종 아이디로 입력하세요. 이 값은 나중에 커뮤니즈에 <code>@검색용ID</code> 형태로 등록합니다.",
          },
          {
            title: "⑤ 비즈니스 심사 신청",
            body: "채널을 만든 직후에는 아직 <b>일반 채널</b> 상태입니다. 발신프로필을 발급받으려면 <b>비즈니스 채널</b>로 전환해야 하고, 그 수단이 <b>비즈니스 심사</b>입니다.",
            list: [
              "좌측 메뉴 <b>채널 &gt; 비즈니스 심사</b> 이동",
              "우측 상단 <b>[심사 신청하기]</b> 클릭",
              "요구 서류 업로드 후 제출",
            ],
            shot: { img: "assets/kakao/a5-review.png", url: "business.kakao.com", label: "비즈니스 심사 신청" },
            note: "필요 서류 — 사업자등록증 · 전자증명서 제출용 휴대폰 · (해당 시) 인허가 서류 · (대행사) 계약서·사업자등록증. <b>TIP</b> 서류의 상호·업종이 채널 정보(채널명·소개글·프로필 사진)와 <b>일치</b>해야 반려를 피할 수 있습니다. 심사 소요 시간·반려 사유는 카카오 정책에 따라 수시로 바뀌므로 <a class=\"exref\" href=\"https://center-pf.kakao.com\" target=\"_blank\" rel=\"noopener noreferrer\">center-pf.kakao.com</a> 공지사항을 확인하세요.",
          },
          {
            title: "⑥ 심사 승인 후 — 검색용 아이디 확인",
            body: "심사가 승인되면 <b>채널 &gt; 채널 정보</b>로 이동해 <b>검색용 아이디</b> 값을 복사합니다.",
            shot: { img: "assets/kakao/a6-searchid.png", url: "business.kakao.com", label: "채널 정보 — 검색용 아이디 확인" },
            note: "복사한 값은 커뮤니즈 등록 시 앞에 <b><code>@</code></b>를 붙여 사용합니다. (예: 검색용 아이디가 <code>모노테스트122</code>이면 → <code>@모노테스트122</code>)",
          },
        ],
      },

      /* ── [Part B · 커뮤니즈] ───────────────────── */
      { id: "b-register", group: "Part B · 커뮤니즈", name: "발신프로필 등록 · 토큰 인증",
        intro: "카카오 채널이 승인되면 커뮤니즈에 @검색용아이디를 등록하고 발신키를 발급받습니다.",
        steps: [
          {
            title: "① 커뮤니즈 로그인 및 메뉴 이동",
            body: "<a class=\"exref\" href=\"https://communis.kt.co.kr\" target=\"_blank\" rel=\"noopener noreferrer\">communis.kt.co.kr</a> 로그인 후 상단 <b>대시보드</b> 버튼을 클릭하고, 좌측 메뉴에서 <b>발신정보 &gt; 카카오 발신프로필</b>로 이동합니다.",
            shot: { img: "assets/kakao/b1-menu.png", url: "communis.kt.co.kr/kakao/senderprofile", label: "발신정보 &gt; 카카오 발신프로필" },
            note: "⚠ 로그인만 한 상태(메인 페이지)에서는 <b>좌측 메뉴가 보이지 않습니다.</b> 반드시 상단 <b>대시보드</b>로 먼저 진입해야 좌측 메뉴가 나타납니다.",
          },
          {
            title: "② 발신 프로필 등록 시작",
            body: "카카오 발신프로필 목록에서 상단 <b>안내사항</b>을 확인한 뒤, 우측 <b>[+ 발신 프로필 등록]</b> 버튼을 클릭합니다.",
            shot: { img: "assets/kakao/b2-list.png", url: "communis.kt.co.kr/kakao/senderprofile", label: "카카오 발신프로필 목록 — 발신 프로필 등록" },
          },
          {
            title: "③ 등록 정보 입력",
            body: "아래 세 항목을 정확히 입력한 뒤 <b>[토큰 요청]</b>을 클릭합니다.",
            table: {
              schema: true,
              cols: ["항목", "입력 값"],
              colWidths: ["24%", "76%"],
              rows: [
                ["카카오 채널 ID", "<code>@검색용아이디</code> 형식 (예: <code>@모노테스트122</code>) — <b>반드시 @를 앞에 붙일 것</b>"],
                ["관리자 연락처", "해당 카카오 채널의 <b>관리자로 초대된 사람</b>의 휴대폰 번호 — 이 번호로 인증 토큰이 전송됨"],
                ["사업자 카테고리", "대분류 → 중분류 → 소분류를 순서대로 선택"],
              ],
            },
            shot: { img: "assets/kakao/b3-form.png", url: "communis.kt.co.kr/kakao/senderprofile", label: "발신 프로필 등록 입력" },
            note: "⚠ <b>관리자 연락처는 카카오 채널 관리자로 등록된 사람</b>의 번호여야 합니다. 관리자가 아닌 번호를 넣으면 인증 토큰 발송이 실패합니다.",
          },
          {
            title: "④ 토큰 요청 — 등록 직후 상태",
            body: "<b>[토큰 요청]</b>을 클릭하면 관리자 연락처로 <b>카카오 알림톡</b>을 통해 <b>6자리 인증 토큰</b>이 전송됩니다.",
            shot: { img: "assets/kakao/b4-status.png", url: "communis.kt.co.kr/kakao/senderprofile", label: "초기 상태 — 발신프로필 차단 · 발신키 미인증" },
            note: "등록 직후 초기 상태는 <b>발신프로필 차단 · 발신키 미인증</b>입니다. 목록 우측 <b>[인증]</b> 버튼을 눌러 다음 단계로 진행하세요.",
          },
          {
            title: "⑤ 6자리 토큰 인증",
            body: "목록에서 해당 프로필 우측 <b>[인증]</b>을 클릭하고, 카카오톡으로 받은 <b>6자리 숫자</b>를 입력한 뒤 확인합니다.",
            shot: { img: "assets/kakao/b5-token.png", url: "communis.kt.co.kr/kakao/senderprofile", label: "6자리 인증 토큰 입력" },
          },
          {
            title: "⑥ 발신 키 발급 완료",
            body: "카카오 인증이 완료되면 <b>발신키(발신 프로필 키)</b>가 발급됩니다. 단, 아래 <b>두 상태가 모두 ‘정상’</b>이어야 실제 발송에 사용할 수 있습니다.",
            table: {
              cols: ["상태 컬럼", "의미", "정상 값"],
              colWidths: ["28%", "48%", "24%"],
              rows: [
                ["발신프로필 상태", "커뮤니즈 내부 승인 상태", "<b>정상</b>"],
                ["카카오톡 채널 상태", "카카오 측 채널 승인 상태", "<b>정상</b>"],
              ],
            },
            shot: { img: "assets/kakao/b6-done.png", url: "communis.kt.co.kr/kakao/senderprofile", label: "발신키 발급 완료 — 정상 / 정상" },
            note: "⚠ <b>카카오 토큰 인증은 즉시 승인되지만, 커뮤니즈 내부 추가 승인이 끝나야</b> 발신프로필 키를 실제 발송에 쓸 수 있습니다. 등록 직후 발송이 안 되면 상태를 확인하세요. 또한 등록 직후에는 <b>일별 최대 발송량이 1,000건으로 제한</b>되며, 이후 운영 실적에 따라 상향됩니다.",
          },
          {
            title: "발급받은 발신키 사용하기",
            body: "발급된 <b>발신프로필 키</b>가 발송 API의 <code>kakaoSenderKey</code> 값입니다.",
            note: "API 발송은 <b>KT Communis API &gt; 카카오 알림톡</b> 탭, 웹 발송은 <b>웹 카카오 발송</b> 탭을 참고하세요. 여러 발신프로필을 묶어 하나의 승인 템플릿을 공유하려면 <b>카카오 발신프로필 그룹</b>(<code>senderKeyType=G</code>)을 사용합니다.",
          },
        ],
      },
    ],
  };
})();

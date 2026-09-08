/* ============================================================
   매뉴얼 셀 — RCS Biz Center (RBC) × KT 스마트메시지 RCS
   ------------------------------------------------------------
   RBC는 이동통신 3사 공동 포털(rcsbizcenter.com)로, RCS 발송 '전에'
   브랜드·대화방(발신번호)을 등록하는 사전 준비 단계다.
   발송 자체(API·웹)가 아니라 준비 절차라서 [기타·부록] 그룹에 둔다.

   출처: RBC 매뉴얼 v2.4 (2025.10)
   화면 캡처: 원본 PDF 내장 이미지(워터마크·고객정보 없음) 추출본
   ============================================================ */
(function () {
  "use strict";
  var C = (window.HUB_CONTENT = window.HUB_CONTENT || {});
  var A = (C["rbc"] = C["rbc"] || {});

  A["rcs"] = {
    navName: "RCS Biz Center (RBC) 가이드",
    intro:
      "RCS 발송 전에 브랜드와 대화방(발신번호)을 등록하는 RCS Biz Center(RBC) 사용 안내입니다. " +
      "RBC는 이동통신 3사 공동 포털(rcsbizcenter.com)이며, 여기서 승인을 받아야 KT로 RCS를 발송할 수 있습니다. (RBC 매뉴얼 v2.4 기준)",
    download: { title: "RBC 매뉴얼", meta: "rcsbizcenter.com · v2.4 (2025.10) · 제공 RCS Biz Center" },
    features: [
      /* ── [시작하기] ───────────────────────────── */
      { id: "overview", group: "시작하기", name: "RBC 개요 · 계정 권한",
        intro: "RBC가 무엇인지와 계정 권한(마스터/매니저/대행사)의 차이를 먼저 확인하세요.",
        steps: [
          {
            title: "RBC란 & 전체 흐름",
            body: "<b>RCS Biz Center(RBC)</b>는 이동통신 3사가 공동 운영하는 RCS 기업메시지 관리 포털(<a class=\"exref\" href=\"https://www.rcsbizcenter.com\" target=\"_blank\" rel=\"noopener noreferrer\">www.rcsbizcenter.com</a>)입니다. RCS를 발송하려면 <b>RBC에서 브랜드와 대화방(발신번호)을 먼저 등록·승인</b>받아야 합니다.",
            list: [
              "① <b>RBC 가입</b> — 기업담당자(마스터/매니저) 회원가입",
              "② <b>브랜드 개설</b> — 브랜드 정보·홈 설정 후 승인 요청",
              "③ <b>대화방(발신번호) 등록</b> — 통신서비스가입증명원 첨부 후 승인 요청",
              "④ <b>대행사 운영권한 부여</b> — ‘케이티’ 지정 (발송 대행에 필수)",
              "⑤ 이후 KT 쪽에서 발송(API·웹)",
            ],
            note: "④까지 끝나야 KT를 통한 RCS 발송이 가능합니다. KT 발송 연동은 <b>KT 스마트메시지 RCS</b> 서비스의 API·Agent 매뉴얼을 참고하세요.",
          },
          {
            title: "계정 권한 — 마스터 / 매니저",
            body: "RBC 기업 계정은 제출 서류에 따라 권한이 나뉩니다.",
            table: {
              cols: ["권한", "설명", "제출 서류"],
              colWidths: ["16%", "54%", "30%"],
              rows: [
                ["마스터", "브랜드를 <b>생성</b>하고 운영할 수 있음", "<b>사업자등록증 필요</b>"],
                ["매니저", "다른 사용자가 생성한 브랜드의 <b>운영만</b> 가능", "추가 서류 없음"],
              ],
            },
            note: "브랜드를 직접 만들려면 <b>마스터</b>로 가입해야 합니다. 매니저는 브랜드 운영 권한을 받으면 브랜드 수정·발신번호 등록 등이 가능합니다.",
          },
          {
            title: "대행사 계정의 권한 범위",
            body: "대행사 계정이 브랜드 운영 권한을 받은 경우 가능한 작업입니다.",
            table: {
              cols: ["구분", "등록", "수정", "삭제"],
              colWidths: ["34%", "22%", "22%", "22%"],
              rows: [
                ["브랜드", "브랜드 개설 신청이 되면 등록 가능", "O", "X"],
                ["대화방", "O", "O", "O"],
                ["대화방 메뉴", "O", "O", "O"],
                ["템플릿", "O", "O", "O"],
                ["자동응답메시지", "O", "O", "O"],
                ["브랜드 소식", "O", "O", "O"],
              ],
            },
            note: "대행사는 <b>1개 아이디를 여러 운영자가 공유</b>하며 대표자 제외 최대 30명까지 추가할 수 있습니다. 브랜드 운영 대행 권한이 있어야 RCS 기업메시지 대행 발송이 가능합니다.",
          },
        ],
      },
      { id: "signup", group: "시작하기", name: "마스터 · 매니저 가입",
        intro: "rcsbizcenter.com에서 기업담당자로 회원가입하는 절차입니다.",
        steps: [
          {
            title: "① 회원가입 — 기업담당자",
            body: "<a class=\"exref\" href=\"https://www.rcsbizcenter.com\" target=\"_blank\" rel=\"noopener noreferrer\">www.rcsbizcenter.com</a> 접속 후 <b>회원가입 &gt; 기업담당자 회원가입</b>을 클릭합니다.",
            list: [
              "<b>마스터 신청</b>(브랜드 등록 희망) — <b>사업자등록증</b> 필요",
              "대표자 본인 신청 — 본인 신분증 (휴대폰 본인인증으로 대체 가능)",
              "직원이 신청 — <b>재직증명서</b>",
            ],
            shot: { img: "assets/rbc/acct-1-signup.png", url: "www.rcsbizcenter.com", label: "기업담당자 회원가입" },
          },
          {
            title: "② 약관 동의 · 비즈니스 정보 입력",
            body: "약관에 동의하고 비즈니스(사업자) 정보를 입력합니다.",
            list: [
              "<b>마스터</b> — 사업자등록증을 제출하면 마스터로 등록, <b>브랜드 생성 가능</b>",
              "<b>매니저</b> — 사업자등록증 미제출 시 매니저로 등록, 브랜드 운영 권한을 받으면 브랜드 수정·발신번호 등록 가능",
            ],
            shot: { img: "assets/rbc/acct-2-bizinfo.png", url: "rcsbizcenter.com/join", label: "비즈니스 정보 입력" },
          },
          {
            title: "③ 담당자 정보 입력 · 신청",
            body: "담당자 정보를 입력하고 <b>휴대폰 본인인증</b> 후 신청합니다.",
            list: [
              "재직증명서 제출 시 <b>주민등록번호 뒷 7자리 마스킹</b> 처리",
              "재직증명서 제출 시 <b>주소 마스킹</b> 처리",
            ],
            shot: { img: "assets/rbc/acct-3-manager.png", url: "rcsbizcenter.com/join", label: "담당자 정보 입력 · 신청" },
            note: "본인인증 FAQ — <b>법인폰</b>은 통신사에 ‘법인폰 본인확인서비스’를 신청하면 인증 가능. <b>타인 명의 휴대전화</b>는 통신사에 실사용자 등록을 하면 가능합니다.",
          },
        ],
      },
      { id: "invite", group: "시작하기", name: "브랜드 운영자 초대 · 매니저 등록",
        intro: "브랜드를 함께 운영할 담당자(기업 매니저)를 초대하고 등록하는 절차입니다.",
        steps: [
          {
            title: "기존 회원 초대",
            body: "<b>기업 대시보드 &gt; 브랜드 클릭 &gt; 내 브랜드 관리 &gt; 브랜드 운영 관리 &gt; 운영자 초대</b>에서 이름으로 검색해 초대합니다.",
            shot: { img: "assets/rbc/invite-1-operator.png", url: "rcsbizcenter.com/brand/manage", label: "브랜드 운영 관리 — 운영자 초대" },
          },
          {
            title: "신규 회원 초대",
            body: "아직 RBC 회원이 아닌 담당자는 <b>운영자 초대 &gt; 신규 회원 초대</b>에서 브랜드를 선택하고 <b>고객사 이메일 주소</b>를 적어 초대합니다.",
            shot: { img: "assets/rbc/invite-2-newmember.png", url: "rcsbizcenter.com/brand/manage", label: "신규 회원 초대" },
          },
          {
            title: "초대받은 담당자의 등록",
            body: "초대한 이메일로 <b>RCS Biz Center 브랜드 초대장</b>이 전달됩니다. <b>[브랜드 운영자로 등록하기]</b>를 클릭한 뒤 기업담당자 회원가입 → 약관 동의 → 담당자 정보 입력 → 신청 순으로 진행합니다.",
            shot: { img: "assets/rbc/invite-3-mail.png", url: "메일 — RCS Biz Center 브랜드 초대장", label: "브랜드 초대장 메일" },
          },
        ],
      },

      /* ── [브랜드 · 발신번호] ───────────────────── */
      { id: "brand", group: "브랜드 · 발신번호", name: "브랜드 개설",
        intro: "브랜드를 개설하고 승인 요청하는 절차입니다. 브랜드명은 모바일에서 검색·노출되는 이름이므로 신중히 정하세요.",
        steps: [
          {
            title: "기업 대시보드 → 브랜드 개설",
            body: "로그인 후 <b>기업 대시보드</b>에서 <b>브랜드 개설</b>을 클릭합니다.",
            shot: { img: "assets/rbc/brand-1-dashboard.png", url: "rcsbizcenter.com/dashboard", label: "기업 대시보드" },
          },
          {
            title: "브랜드 기본 정보 입력",
            body: "브랜드의 기본 정보를 입력합니다. 삼성단말/아이폰단말 미리보기를 구분해 확인할 수 있습니다.",
            table: {
              cols: ["항목", "설명"],
              colWidths: ["26%", "74%"],
              rows: [
                ["브랜드명", "브랜드명 입력 (모바일 노출·검색 대상)"],
                ["브랜드 소개", "브랜드 슬로건·특징을 나타내는 소개 글"],
                ["프로필 이미지", "직접 등록(로고·이미지) 또는 RBC 기본 이미지 사용"],
                ["카테고리", "브랜드의 카테고리 등록"],
                ["전화번호", "전화번호 입력"],
                ["브랜드 컬러", "설정 시 <b>레이아웃 메시지의 버튼</b>에 브랜드 컬러 적용"],
              ],
            },
            shot: { img: "assets/rbc/brand-3-basic.png", url: "rcsbizcenter.com/brand/create", label: "브랜드 개설 — 기본 정보 입력" },
          },
          {
            title: "퀵버튼 · 탭 설정",
            body: "브랜드홈에 노출될 요소를 설정합니다. <b>아래 항목은 삼성 단말에서만 노출</b>됩니다.",
            table: {
              cols: ["항목", "설명"],
              colWidths: ["26%", "74%"],
              rows: [
                ["백그라운드 이미지", "직접 등록 또는 RBC 기본 이미지 사용"],
                ["퀵버튼", "브랜드홈에 노출되는 버튼"],
                ["탭 설정", "소식탭 우선 / 정보탭 우선"],
                ["영업정보", "영업 정보를 브랜드 홈에 노출"],
                ["소식탭 메뉴", "‘검색하기’ 체크 시 포털에서 브랜드명으로 검색 가능"],
              ],
            },
            shot: { img: "assets/rbc/brand-4-quick.png", url: "rcsbizcenter.com/brand/create", label: "퀵 버튼 · 탭 설정" },
          },
          {
            title: "브랜드 홈 탭 설정 → 승인 요청",
            body: "우선 노출탭·영업정보·노출정보를 설정하고 <b>정보성 메시지 발송 동의</b>를 체크한 뒤 <b>승인 요청</b>합니다.",
            table: {
              cols: ["항목", "설명"],
              colWidths: ["26%", "74%"],
              rows: [
                ["우선 노출탭", "소식탭 우선(소식·공지·프로모션) / 정보탭 우선(브랜드 정보)"],
                ["노출 정보", "전화번호(전화 걸기) · 웹(웹사이트 연결) · 포탈 검색(네이버 검색 결과 연결)"],
                ["정보성 메시지 발송 동의", "템플릿은 <b>정보성에 한하여</b> 이용 가능하다는 안내·동의"],
              ],
            },
            shot: { img: "assets/rbc/brand-5-hometab.png", url: "rcsbizcenter.com/brand/create", label: "브랜드 홈 탭 설정 · 승인 요청" },
          },
        ],
      },
      { id: "room", group: "브랜드 · 발신번호", name: "대화방(발신번호) 등록",
        intro: "대화방은 문자 발신번호를 대신해 고객에게 노출되는 이름입니다. 통신서비스가입증명원이 필요합니다.",
        steps: [
          {
            title: "개별 등록",
            body: "<b>대화방 &gt; 대화방 등록 &gt; 개별 등록</b>에서 대화방 정보를 입력하고 승인 요청합니다.",
            table: {
              cols: ["항목", "설명"],
              colWidths: ["26%", "74%"],
              rows: [
                ["대화방명", "문자 발신번호 대신 노출되는 이름 (최대 20자)"],
                ["대화방 유형", "<b>발신번호</b>(문자를 발송하는 번호) / <b>양방향 ID</b>(발신번호 아래 여러 ID를 만들어 대화방명·메뉴를 다르게 노출)"],
                ["통신서비스가입증명원", "<b>필수 첨부</b> — JPG·PNG·TIFF·PDF·ZIP (최대 20MB)"],
                ["양방향 대행사 연결", "양방향 서비스 이용 시 양방향 대행사 지정"],
                ["메시지 입력란", "미사용 시 ‘입력할 수 없는 대화방입니다’ 노출 / 사용 시 양방향 대화 가능"],
                ["안심마크", "KISA 인증마크 — <b>금융·공공기관 대상</b>. 해당하지 않으면 체크 해제"],
              ],
            },
            shot: { img: "assets/rbc/room-1-single.png", url: "rcsbizcenter.com/room/create", label: "대화방 등록 — 개별 등록" },
            note: "⚠ 전국대표번호 또는 유선번호로 <b>문자수신(MO) 서비스를 이용 중</b>이면 대화방 등록 시 MO가 불가하니 확인 후 등록하세요. <b>승인 심사는 영업일 기준 48시간 이내</b>이며 내부 사정으로 지연될 수 있습니다.",
          },
          {
            title: "대량 등록",
            body: "발신번호가 많으면 <b>대량 등록</b> 탭에서 엑셀로 <b>최대 1,000개</b>까지 등록할 수 있습니다.",
            list: [
              "등록할 발신번호를 엑셀에 기재해 파일로 업로드",
              "해당 발신번호의 <b>통신서비스가입증명원</b> 등록",
            ],
            shot: { img: "assets/rbc/room-2-bulk.png", url: "rcsbizcenter.com/room/create", label: "대화방 등록 — 대량 등록" },
            note: "등록 방법(개별↔대량)을 변경하면 입력한 데이터가 초기화됩니다.",
          },
        ],
      },
      { id: "agency", group: "브랜드 · 발신번호", name: "대행사 운영권한 부여 (케이티)",
        intro: "KT를 통해 RCS를 발송하려면 브랜드에 대행사 운영권한을 부여해야 합니다. 이 단계가 빠지면 발송이 되지 않습니다.",
        steps: [
          {
            title: "‘케이티’ 지정",
            body: "<b>내 브랜드 관리 &gt; 브랜드 운영 관리 &gt; 대행사 운영권한 부여</b>에서 <b>‘케이티’</b>를 검색·체크해 초대합니다.",
            shot: { img: "assets/rbc/agent-1-grant.png", url: "rcsbizcenter.com/brand/manage", label: "브랜드 운영 관리 — 대행사 운영권한 부여" },
            note: "⚠ <b>브랜드 승인이 완료된 이후에만</b> 대행사 지정이 가능합니다. 모노커뮤니케이션즈가 운영을 지원하는 경우 <b>‘모노커뮤니케이션즈’</b>도 함께 초대하세요(선택). 권한 부여 후 <b>서버 동기화에 약 3~4시간</b>이 소요됩니다.",
          },
          {
            title: "브랜드 ↔ 대행사 간 교환 정보",
            body: "RCS 메시지 발송·RBC 기능 대행을 위해 아래 정보를 교환해야 합니다.",
            table: {
              cols: ["정보", "확인 방법"],
              colWidths: ["34%", "66%"],
              rows: [
                ["브랜드 운영자의 <b>API Key</b>", "&lt;개인정보&gt; 화면에서 확인, 필요 시 변경 가능"],
                ["대행사의 <b>Agency IP</b>", "대행사 계정의 &lt;기업정보&gt;에서 확인, 다수 IP 등록 가능"],
              ],
            },
            note: "대행사가 브랜드 운영 권한을 갖는 방법은 ① 브랜드–대행사 간 중계 발송 계약 ② 브랜드의 대행사 운영 권한 설정입니다. 하나의 브랜드에 <b>여러 대행사</b>를 설정할 수 있습니다.",
          },
        ],
      },
      { id: "edit", group: "브랜드 · 발신번호", name: "정보 변경 · 발신번호 삭제",
        intro: "등록한 브랜드·대화방 정보를 변경하거나 발신번호를 삭제하는 방법입니다.",
        steps: [
          {
            title: "브랜드 정보 변경",
            body: "<b>브랜드 관리 &gt; 브랜드 &gt; 수정</b>에서 기본 정보를 수정하고 다음 → 브랜드 홈 탭 설정 → <b>승인 요청</b>합니다.",
            shot: { img: "assets/rbc/brandedit-1.png", url: "rcsbizcenter.com/brand/edit", label: "브랜드 정보 변경" },
          },
          {
            title: "대화방(발신번호) 정보 변경",
            body: "<b>기업 대시보드 &gt; 브랜드 클릭 &gt; 대화방 목록 &gt; 대화방명 클릭 &gt; 수정</b>에서 대화방 정보를 수정하고 <b>승인 요청</b>합니다.",
            shot: { img: "assets/rbc/roomedit-1.png", url: "rcsbizcenter.com/room/list", label: "대화방 정보 변경" },
          },
          {
            title: "발신번호(대화방) 삭제",
            body: "<b>대화방 목록 &gt; 대화방명 클릭 &gt; 삭제</b> → 확인 팝업에서 삭제 → <b>휴대폰번호 인증</b> 후 삭제 완료됩니다.",
            shot: { img: "assets/rbc/roomdel-1.png", url: "rcsbizcenter.com/room/list", label: "발신번호 삭제" },
          },
        ],
      },

      /* ── [브랜드 운영] ───────────────────────── */
      { id: "template", group: "브랜드 운영", name: "템플릿 · 브랜드 로고",
        intro: "RCS 템플릿을 등록·수정하고 브랜드 로고를 등록하는 방법입니다.",
        steps: [
          {
            title: "템플릿 등록",
            body: "<b>브랜드 클릭 &gt; 메시지 &gt; 템플릿 등록</b>에서 유형을 고르고 내용을 작성한 뒤 <b>승인 요청</b>합니다.",
            list: ["템플릿 종류: <b>이미지 템플릿 · LMS 템플릿 · 텍스트 템플릿</b>"],
            shot: { img: "assets/rbc/tpl-1-register.png", url: "rcsbizcenter.com/template/create", label: "템플릿 등록" },
            note: "브랜드 개설 시 동의한 대로 템플릿은 <b>정보성에 한하여</b> 이용 가능합니다.",
          },
          {
            title: "브랜드 로고 등록",
            body: "<b>템플릿 목록 &gt; 브랜드 로고 관리 &gt; 로고 등록 &gt; 파일찾기 &gt; 저장 &gt; 승인 요청</b> 순으로 등록합니다.",
            shot: { img: "assets/rbc/tpl-2-logo.png", url: "rcsbizcenter.com/template/logo", label: "브랜드 로고 등록" },
            note: "브랜드 로고는 <b>RBC 승인 후</b> 사용할 수 있습니다.",
          },
          {
            title: "템플릿 수정 · 삭제",
            body: "<b>브랜드 클릭 &gt; 메시지 &gt; 템플릿 목록 &gt; 템플릿명 클릭</b> 후 수정 또는 삭제합니다.",
            list: [
              "<b>수정</b> — 수정 → 템플릿 내용 수정 → 승인 요청",
              "<b>삭제</b> — 삭제 클릭",
            ],
            shot: { img: "assets/rbc/tpl-3-list.png", url: "rcsbizcenter.com/template/list", label: "템플릿 목록" },
          },
        ],
      },
      { id: "menu", group: "브랜드 운영", name: "대화방 메뉴 · 자동응답",
        intro: "대화방 하단에 노출되는 메뉴를 만들고 자동응답 메시지를 연결합니다.",
        steps: [
          {
            title: "대화방 메뉴 만들기",
            body: "<b>기업 대시보드 &gt; 브랜드 클릭 &gt; 대화방 메뉴 &gt; 대화방 메뉴 등록</b>에서 만듭니다.",
            table: {
              cols: ["항목", "설명"],
              colWidths: ["22%", "78%"],
              rows: [
                ["메뉴명", "대화방 메뉴에 노출되는 이름"],
                ["연결 항목", "전화연결 · 웹사이트 연결 · 브랜드 소식 연결 · <b>자동응답 메시지 연결</b>(양방향대행사 청약 필수) · <b>챗봇 연결</b>(양방향 대행사 청약 필수)"],
              ],
            },
            shot: { img: "assets/rbc/menu-1-create.png", url: "rcsbizcenter.com/menu/create", label: "대화방 메뉴 만들기" },
          },
          {
            title: "자동응답 메시지 연결",
            body: "<b>연결항목 &gt; 자동응답메시지 연결 &gt; 양방향 대행사 &gt; KTRCS중계 &gt; 자동응답메시지 선택 &gt; 등록</b> 순으로 연결합니다.",
            shot: { img: "assets/rbc/menu-2-autoreply-link.png", url: "rcsbizcenter.com/menu/create", label: "자동응답 메시지 연결" },
            note: "등록한 자동응답 메시지가 없다면 먼저 자동응답 메시지를 작성한 뒤 다시 등록하세요.",
          },
          {
            title: "자동응답 메시지 등록",
            body: "<b>대시보드 &gt; 브랜드 선택 &gt; 양방향 &gt; 자동응답메시지 등록</b>에서 내용을 입력하고 등록합니다.",
            table: {
              cols: ["항목", "설명"],
              colWidths: ["22%", "78%"],
              rows: [
                ["메시지 유형", "말풍선(1장, 텍스트 중심) · 카드(1장, 이미지+텍스트) · 슬라이드(2~6장)"],
                ["이미지 · 제목 · 내용", "노출할 이미지 업로드와 제목·본문 입력"],
                ["버튼", "URL 연결·전화하기 등 액션 버튼 사용 여부"],
                ["칩리스트", "메시지 카드 하단에 노출되는 칩리스트 사용 여부"],
                ["메시지 복사", "수신 고객의 메시지 복사 허용 여부"],
              ],
            },
            shot: { img: "assets/rbc/menu-3-autoreply-reg.png", url: "rcsbizcenter.com/autoreply/create", label: "자동응답 메시지 등록" },
          },
        ],
      },
      { id: "news", group: "브랜드 운영", name: "브랜드 소식",
        intro: "브랜드홈에 노출되는 소식(공지·프로모션)을 등록합니다.",
        steps: [
          {
            title: "브랜드 소식 등록",
            body: "<b>기업 대시보드 &gt; 브랜드 클릭 &gt; 브랜드 소식 &gt; 브랜드 소식 등록</b>에서 내용을 입력하고 등록합니다.",
            table: {
              cols: ["항목", "설명"],
              colWidths: ["20%", "80%"],
              rows: [
                ["게시 여부", "게시 여부 선택"],
                ["게시 방법", "<b>즉시 게시</b> / <b>예약 게시</b>(지정 시점부터 게시) / <b>숨김(URL) 게시</b>(소식으로 등록하지 않고 문자 본문에 넣는 URL 형태로만 이용)"],
                ["소식 유형", "<b>갤러리</b>(이미지 등록) · <b>쉐어링</b>(이미지 없이 글) · <b>슬라이드</b>(여러 소식을 슬라이드로, 최대 10개)"],
              ],
            },
            shot: { img: "assets/rbc/news-1.png", url: "rcsbizcenter.com/news/create", label: "브랜드 소식 등록" },
          },
        ],
      },
      { id: "stat", group: "브랜드 운영", name: "고객반응 통계",
        intro: "RCS로 보낸 메시지의 읽음·버튼 클릭 등 고객반응을 통계로 확인합니다.",
        steps: [
          {
            title: "서비스 개요 · 사용 조건",
            body: "RCS로 전송한 메시지의 고객반응을 통계로 제공합니다.",
            table: {
              cols: ["구분", "내용"],
              colWidths: ["22%", "78%"],
              rows: [
                ["제공 통계", "① 메시지 전송 고객반응(읽음 확인, 액션버튼 유형별 클릭수) ② 대화방메뉴 고객반응(버튼 유형별 클릭수)"],
                ["제공 방식", "① RBC 홈페이지 <b>고객반응 통계</b> 메뉴 ② <b>고객반응통계 API</b>"],
                ["사용 조건", "브랜드 단위로 <b>동일 메시지 종류·동일 그룹ID</b>로 전송한 메시지의 <b>이통사별 일 성공 100건 이상</b>. 대화방메뉴는 1건 이상 선택 시"],
                ["집계 기준", "최근 <b>1년 6개월</b> 이내 최대 <b>31일</b> 검색. 발송일 기준 <b>D+3일</b>까지 데이터 제공. 1일 내 동일 고객의 중복 클릭 제외"],
              ],
            },
            note: "⚠ 고객반응통계는 RCS 발송 시 <b>그룹ID를 포함</b>해야 제공되며, <b>대표번호 문자수신(SMS MO) 사용 중</b>으로 체크한 경우에는 제공되지 않습니다.",
          },
          {
            title: "통계 확인",
            body: "<b>기업 대시보드 &gt; 브랜드 클릭 &gt; 통계</b>에서 메시지 통계 / 대화방메뉴 통계 / 브랜드 소식 통계를 확인합니다.",
            shot: { img: "assets/rbc/stat-1.png", url: "rcsbizcenter.com/stat", label: "고객반응 통계" },
          },
        ],
      },

      /* ── [부록] ─────────────────────────────── */
      { id: "agencyjoin", group: "부록", name: "대행사 가입 (재판매사용)",
        intro: "재판매사가 RBC에 대행사로 가입하는 절차입니다. 일반 고객사는 해당하지 않습니다.",
        steps: [
          {
            title: "가입 절차 · 필요 서류",
            body: "<b>RBC 대행사 회원가입(재판매사) → 대행사 정보 검수(RCS Biz Center) → 승인/반려</b> 순으로 진행됩니다.",
            list: [
              "특수부가통신사업등록증",
              "<b>대량전송자격인증서</b> (v2.4부터 제출 필수)",
              "개인정보처리지침",
              "이용약관",
              "통신판매업 신고",
            ],
            shot: { img: "assets/rbc/agency-1-signup.png", url: "www.rcsbizcenter.com", label: "대행사 가입" },
          },
          {
            title: "정보 입력 (대행사 · 심사 · 서비스)",
            body: "대행사 정보 → 심사 정보 → 서비스 정보 순으로 입력합니다.",
            list: [
              "<b>수신서버 URL</b> — RBC에 등록된 기업 브랜드의 등록·수정·삭제 이벤트를 대행사 웹훅 URL로 전달",
              "알림 대상: 브랜드 계약(권한) 등록, 브랜드 수정·반려, 대화방 승인·수정·반려·삭제, 템플릿 승인·수정·반려·삭제, 자동응답메시지 등록·수정·삭제, 신규 포맷·템플릿 상품 등록, 대행사 키 재발급, 레이아웃 등록·수정·삭제, 브랜드 로고 승인·수정·반려·삭제",
            ],
            shot: { img: "assets/rbc/agency-2-info.png", url: "rcsbizcenter.com/agency/join", label: "대행사 정보 입력" },
          },
          {
            title: "대행사 관리자 정보 입력 · 신청",
            body: "대행사를 대표하는 <b>대행사 관리자</b> 정보를 입력하고 신청합니다.",
            list: [
              "RCS 서비스 이용에 필요한 <b>Agency Key · API Key</b> 등 주요 정보 관리 권한",
              "브랜드 운영을 위한 담당자 추가·삭제 권한",
            ],
            shot: { img: "assets/rbc/agency-3-admin.png", url: "rcsbizcenter.com/agency/join", label: "대행사 관리자 정보 입력" },
          },
          {
            title: "대행사 계정으로 브랜드 운영하기",
            body: "대행사 계정으로 로그인하면 <b>기업 대시보드 &gt; 내가 운영 중인 브랜드</b>에서 권한을 받은 브랜드를 관리할 수 있습니다.",
            shot: { img: "assets/rbc/agency-4-mybrands.png", url: "rcsbizcenter.com/dashboard", label: "내가 운영 중인 브랜드" },
            note: "대행사 계정은 아이디·패스워드 입력 후 <b>등록된 담당자 휴대폰 번호</b>로 인증번호를 받아 로그인합니다. 등록되지 않은 번호로는 로그인할 수 없습니다.",
          },
        ],
      },
      { id: "proxy", group: "부록", name: "브랜드 등록 대행",
        intro: "브랜드 개설을 대행사(케이티)에 맡기는 방법입니다. 기업 마스터 계정이 신청하고 검수합니다.",
        steps: [
          {
            title: "① 브랜드 개설 대행 신청 (기업)",
            body: "<b>기업 마스터 아이디로 로그인 &gt; 기업 대시보드 &gt; 우측 메뉴 &gt; 브랜드 개설 대행 신청</b>에서 대행사명에 <b>‘케이티’</b>를 입력·선택하고, 브랜드에 대한 책임 안내를 확인·체크한 뒤 신청합니다.",
            shot: { img: "assets/rbc/proxy-1-request.png", url: "rcsbizcenter.com/dashboard", label: "브랜드 개설 대행 신청 — ‘케이티’ 선택" },
          },
          {
            title: "② 대행 수락 (대행사)",
            body: "대행사는 <b>기업 대시보드 &gt; 브랜드 개설 대행 내역 &gt; 신청을 확인해주세요</b>를 클릭해 신청 기업 정보를 확인한 뒤 <b>수락하기 &gt; 브랜드 개설하기</b>를 진행합니다.",
            shot: { img: "assets/rbc/proxy-3-accept.png", url: "rcsbizcenter.com/dashboard", label: "(대행사) 브랜드 등록 대행 수락" },
          },
          {
            title: "③ 등록 정보 검수 (기업)",
            body: "기업(마스터) 계정으로 로그인해 <b>기업 대시보드 &gt; 브랜드 개설 대행 신청</b>에서 <b>검토 요청</b> 표시된 브랜드명을 클릭합니다. 브랜드 정보를 확인해 맞으면 <b>승인 요청</b>, 수정이 필요하면 <b>보완 요청</b>합니다.",
            shot: { img: "assets/rbc/proxy-2-review.png", url: "rcsbizcenter.com/dashboard", label: "브랜드 등록 정보 검수" },
          },
        ],
      },
    ],
  };
})();

/* ============================================================
   매뉴얼 셀 — KT MCS & X_MCS Agent × KT 스마트메시지(biz)
   ------------------------------------------------------------
   출처: MCS Agent 설치가이드 v1.4 (2023-07-19, ㈜다이얼로그스페이스)
   archive/창용's/스마트메시지biz/MCS_Agent_Manual_설치가이드.txt
   ※ 본 문서는 McsAgent(1·2센터, 레거시) 기준. 차세대(X_McsAgent)는
     'MCS 센터 선택'과 접속 IP만 다르고 절차는 동일.
   ============================================================ */
(function () {
  "use strict";
  var C = (window.HUB_CONTENT = window.HUB_CONTENT || {});
  var A = (C["mcs"] = C["mcs"] || {});

  /* 전체 응답코드(TCS_RESULT) — 코드/설명/결과. 6.응답코드 섹션과 VMS·FMS 표가 공유.
     (SMS·MMS 표는 채널별 별도 유지) */
  var TCS_FULL = [
    ["<code>-2, NULL</code>", "리포트 수신 전 임시코드 (Agent 4.0.0+ NULL, 이전 -2)", "대기"],
    ["<code>0</code>", "전송 성공", "성공"],
    ["<code>1</code>", "시스템 장애", "전송 실패"],
    ["<code>2</code>", "인증 실패 (인증파일 없음)", "로그인 실패"],
    ["<code>3</code>", "메시지 형식 오류 (규격 불일치)", "로그인 실패"],
    ["<code>5</code>", "인증티켓 유효성 오류 (비밀번호·SPID 틀림)", "로그인 실패"],
    ["<code>7</code>", "SP(가입자) 패스워드 틀림", "로그인 실패"],
    ["<code>8</code>", "SP(가입자) 일시정지", "로그인 실패"],
    ["<code>9</code>", "SP(가입자) 해지", "로그인 실패"],
    ["<code>10</code>", "End-User 존재하지 않음·해지·정지", "로그인 실패"],
    ["<code>16</code>", "시간 종료", "전송 실패"],
    ["<code>17</code>", "권한 없음 (접근 가능 IP 외 접속)", "로그인 실패"],
    ["<code>27</code>", "가입되지 않은 상품 발송", "전송 실패"],
    ["<code>33</code>", "월간 메시지 전송 개수 초과", "전송 실패"],
    ["<code>90</code>", "동보 개수 초과 (Agent 내부)", "전송 실패"],
    ["<code>91</code>", "데이터 형식 오류 (Agent 내부)", "전송 실패"],
    ["<code>92~96</code>", "첨부파일/업로드/Convert/다운로드 오류 (Agent 내부)", "전송 실패"],
    ["<code>99</code>", "발송 전 오류 (Agent 내부)", "전송 실패"],
    ["<code>101</code>", "메시지 내용 스팸", "전송 실패"],
    ["<code>102</code>", "발신자 스팸", "전송 실패"],
    ["<code>103</code>", "착신자 스팸", "전송 실패"],
    ["<code>104</code>", "회신번호 스팸", "전송 실패"],
    ["<code>108</code>", "동일 메시지 제한", "전송 실패"],
    ["<code>111</code>", "동일 착번 제한", "전송 실패"],
    ["<code>112</code>", "레포트 수신 시간 만료 (전송 후 24시간 미수신)", "전송 실패"],
    ["<code>114</code>", "번호도용/변작방지 차단", "전송 실패"],
    ["<code>115</code>", "미등록 회신번호 차단", "전송 실패"],
    ["<code>116</code>", "번호세칙 위반 차단", "전송 실패"],
    ["<code>200</code>", "통화중", "전송 실패"],
    ["<code>201</code>", "무응답 (단말기 무응답)", "전송 실패"],
    ["<code>202</code>", "착신 가입자 없음", "전송 실패"],
    ["<code>203</code>", "비가입자·결번·서비스 정지", "전송 실패"],
    ["<code>204</code>", "단말기 전원 꺼짐", "전송 실패"],
    ["<code>205</code>", "음영 지역", "전송 실패"],
    ["<code>206</code>", "단말기 메시지 Full", "전송 실패"],
    ["<code>207</code>", "Unknown / 단말기 형식 오류", "전송 실패"],
    ["<code>208</code>", "메시지 Overflow로 받지 못함", "전송 실패"],
    ["<code>209</code>", "번호 이동된 가입자", "전송 실패"],
    ["<code>210</code>", "SMS 착신전환 횟수 초과", "전송 실패"],
    ["<code>211</code>", "기간 만료", "전송 실패"],
    ["<code>212~216, 221~222</code>", "SKT 가입자 관련 오류 (가입자 없음·Sub Type·자리수 등)", "전송 실패(SKT)"],
    ["<code>213</code>", "NPDB 오류", "전송 실패"],
    ["<code>226</code>", "CallbackURL 사용자 아님", "전송 실패"],
    ["<code>227</code>", "착신번호 에러 (자리수 에러)", "전송 실패"],
    ["<code>228</code>", "착신번호 에러 (없는 번호)", "전송 실패"],
    ["<code>400</code>", "잘못된 요청 (Bad Request) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>403</code>", "금지됨 (Forbidden) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>404</code>", "사용자(번호) 없음 (Not Found) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>486</code>", "통화중 (Busy Here) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>487</code>", "미응답 (Request Terminated) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>500</code>", "SIP 서버 내부 오류 (Server Internal Error) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>503</code>", "서비스 불가 (Service Unavailable) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>504</code>", "시간 종료 (Server Time-out) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>600</code>", "모두 통화중 (Busy Everywhere) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>603</code>", "수신 거부 (Decline) — VMS/FMS", "VMS/FMS 실패"],
    ["<code>2100</code>", "포맷 오류 — MMS", "MMS 실패"],
    ["<code>2101</code>", "올바르지 않은 컨텐츠 — MMS", "MMS 실패"],
    ["<code>2103</code>", "미지원 단말 — MMS", "MMS 실패"],
    ["<code>2104</code>", "컨텐츠 크기 초과 — MMS", "MMS 실패"],
    ["<code>2106</code>", "발신번호 오류 — MMS", "MMS 실패"],
    ["<code>2107</code>", "착신번호 오류 — MMS", "MMS 실패"],
    ["<code>2152</code>", "Content-Type 오류 — MMS", "MMS 실패"],
    ["<code>4305</code>", "비가용폰 — MMS", "MMS 실패"],
    ["<code>4404</code>", "CALLBACK 스팸 — MMS", "MMS 실패"],
    ["<code>5300</code>", "단말기 수신 불가 — MMS", "MMS 실패"],
  ];

  /* VMS·FMS 응답코드 발췌 — 음성·팩스에서 실제로 자주 보는 코드만.
     전체표(TCS_FULL)는 ‘6. 응답코드(TCS_RESULT)’ 섹션에서 한 번에 본다. */
  var TCS_VF = [
    ["<code>-2, NULL</code>", "리포트 수신 전 임시코드 (Agent 4.0.0+ NULL, 이전 -2)", "대기"],
    ["<code>0</code>", "전송 성공", "성공"],
    ["<code>1</code>", "시스템 장애", "전송 실패"],
    ["<code>2~17</code>", "인증·로그인 계열 (인증파일 없음·비밀번호/SPID 오류·접근 IP 권한 등)", "로그인 실패"],
    ["<code>400, 403, 404</code>", "잘못된 요청 · 금지 · 사용자(번호) 없음", "VMS/FMS 실패"],
    ["<code>486, 487</code>", "통화중 · 미응답", "VMS/FMS 실패"],
    ["<code>500, 503, 504</code>", "SIP 서버 내부오류 · 서비스 불가 · 시간 종료", "VMS/FMS 실패"],
    ["<code>600, 603</code>", "모두 통화중 · 수신 거부", "VMS/FMS 실패"],
  ];

  A["smart"] = {
    navName: "MCS & X_MCS Agent", // 좌측 네비 대제목(에이전트 매뉴얼)
    intro: "MCS Agent 설치부터 메시지 유형별 연동까지 안내합니다. 아래 탭에서 선택하세요. (덜 채워진 항목은 ‘공사 중’으로 표시됩니다.)",
    download: { title: "MCS Agent 설치가이드 (v1.4)", meta: "PDF · 2023-07-19 · ㈜다이얼로그스페이스" },
    features: [
      {
        id: "install",
        name: "1. 설치 가이드",
        intro: "설치 환경 확인 → 준비사항 → 패키지 설치 → 실행 → 시험발송 → 발송 쿼리 순서입니다.",
        steps: [
      {
        title: "개요 · 용어",
        body: "본 가이드는 KT MCS 메시지 서버와 연동하여 문자/음성/팩스/멀티미디어 메시지를 전송하는 <b>Java 기반 MCS Agent</b>의 설치 및 환경설정 방법을 설명합니다.",
        table: {
          cols: ["용어", "설명"],
          rows: [
            ["MCS Agent", "문자(SMS)·음성(VMS)·팩스(FMS)·멀티미디어(MMS) 발송을 위해 SP가 사용하는 Java 기반 프로그램 (Client)"],
            ["MCS Server", "Agent의 발송 요청을 받아 처리·중계·저장하는 KT 메시지 시스템 (Server)"],
            ["SP", "KT 메시지 서비스를 사용하는 업체 (Service Provider)"],
            ["라이선스 키", "Server 인증 시 사용하는 인증 Ticket 생성용 Key File (<code>*.cert</code>)"],
            ["Agent 디렉토리", "McsAgent를 설치한 디렉토리 (예: <code>C:\\McsAgent</code>)"],
            ["*.bat / *.sh", "배치(쉘) 스크립트 — Windows: <code>*.bat</code> / Unix·Linux: <code>*.sh</code> (Agent 디렉토리에서 실행)"],
          ],
        },
        note: "이 문서는 <b>McsAgent(1·2센터, 레거시)</b> 기준입니다. <b>차세대(X_McsAgent)</b>는 ‘MCS 센터 선택’ 단계와 접속 IP만 다르고 나머지 절차는 동일합니다.",
      },
      {
        title: "설치 가능 OS 및 지원 DBMS",
        body: "Agent 설치가 가능한 OS와 연동 지원 DBMS는 아래와 같습니다. DBMS는 <b>Agent 버전</b>에 따라 지원 범위가 다릅니다.",
        tables: [
          {
            label: "Agent 설치 가능 OS",
            cols: ["Agent 설치 OS"],
            rows: [
              ["MS Windows (2000 이상)"],
              ["Linux (커널버전 2.2 · 2.4 이상)"],
              ["IBM AIX (5.x 이상)"],
              ["Sun Solaris"],
              ["HP-UX"],
            ],
          },
          {
            label: "연동 지원 DBMS (Agent 버전별)",
            cols: ["지원 DBMS", "지원 Agent 버전"],
            rows: [
              ["Oracle (8i 이상)", "2.x 이상"],
              ["MySQL (4.x 이상)", "2.x 이상"],
              ["MS SQLServer (2000 이상)", "2.x 이상"],
              ["Informix (11.x 이상)", "3.x 이상"],
              ["Tibero (4.x 이상)", "3.x 이상"],
              ["MariaDB (5.5X 이상)", "3.x 이상"],
              ["Sybase (15.x 이상)", "4.x 이상"],
              ["Caché (2013 이상)", "4.x 이상"],
              ["PostgreSQL (11.x 이상)", "4.x 이상"],
              ["EPAS (11.x 이상)", "4.x 이상"],
            ],
          },
        ],
        note: "‘지원 Agent 버전’은 해당 DBMS를 연동할 수 있는 최소 MCS Agent 버전입니다. — <b>Oracle · MySQL · MS SQLServer</b>는 Agent 2.x 이상 전 버전, <b>Informix · Tibero · MariaDB</b>는 3.x부터, <b>Sybase · Caché · PostgreSQL · EPAS</b>는 4.x부터 지원합니다.",
      },
      {
        title: "설치 전 준비사항 — 소프트웨어 (Java · DBMS)",
        nav: "준비물 — 소프트웨어",
        snapshot: true,
        body: "Agent 설치를 위해서는 <b>Java 실행환경</b>과 <b>DBMS 정보</b>가 필요합니다. 필요한 Java 버전은 <b>Agent 버전</b>에 따라 다릅니다.",
        list: [
          "<b>Java 실행환경</b> — Agent <b>2.x</b>는 <b>Java 1.6 이상</b>, Agent <b>3.x 이상</b>은 <b>Java 1.8 이상</b> <i>(최신 버전 권장)</i>",
          "<b>DBMS 정보</b> — DB 서버 IP(Agent와 동일 장비면 <code>localhost</code>/<code>127.0.0.1</code>), Listening Port, DB명(Oracle은 SID), 사용자 ID/PW",
          "<b>DB 권한</b> — Create/Alter Table · Insert · Select · Update · Delete · Create/Drop Index <i>(<code>envTest.bat</code> 실행 결과로 확인)</i>",
          "<b>JDBC Driver</b> — <code>&lt;Agent&gt;/lib/jdbc/</code> 에 DBMS별 기본 제공. 환경에 맞지 않으면 벤더 사이트에서 받아 교체(교체 후 Agent 재시작)",
          "<b>Unix/Linux 한글 설정</b> — Korean·UTF-8 로케일 필요(<code>jenv.sh</code>). 예: Linux/AIX <code>export LANG=ko_KR.UTF-8</code>, HP-UX <code>ko_KR.utf8</code>",
        ],
        note: "JDBC 다운로드: MySQL · Oracle · SQL Server · MariaDB 벤더 페이지. DataSource·Driver 클래스·JDBC URL은 환경설정 파일에서 수동 변경할 수 있습니다.",
      },
      {
        title: "설치 전 준비사항 — 네트워크 설정 / 방화벽",
        nav: "준비물 — 네트워크/방화벽",
        snapshot: true,
        body: "Agent가 설치될 서버에서 아래 IP·PORT와 통신되도록 방화벽을 설정합니다. IPS 등 보안장비가 있으면 함께 확인하세요.<br>(<b>레거시</b> = 1·2센터 / <b>차세대</b> = 차세대 센터)",
        tables: [
          {
            label: "네트워크 설정 정보 · 1센터 (레거시)",
            cols: ["서버", "IP", "PORT", "비고"],
            colWidths: ["23%", "27%", "12%", "38%"],
            rows: [
              ["자원 관리 서버", "<code>119.205.196.225</code>", "<code>80</code>", "<code>rcs.xroshot.com</code>"],
              ["메시지 연동 서버", "<code>119.205.196.240</code>", "<code>80</code>", ""],
              ["", "<code>119.205.196.241</code>", "", ""],
              ["", "<code>119.205.196.242</code>", "", ""],
              ["", "<code>119.205.196.243</code>", "", ""],
              ["", "<code>119.205.196.244</code>", "", ""],
              ["", "<code>119.205.196.245</code>", "", ""],
              ["파일 연동 서버", "<code>119.205.196.211</code>", "<code>80</code>", ""],
            ],
          },
          {
            label: "네트워크 설정 정보 · 2센터 (레거시)",
            cols: ["서버", "IP", "PORT", "비고"],
            colWidths: ["23%", "27%", "12%", "38%"],
            rows: [
              ["자원 관리 서버", "<code>210.105.195.140</code>", "<code>80</code>", "<code>rcs2.xroshot.com</code>"],
              ["메시지 연동 서버", "<code>210.105.195.150</code>", "<code>80</code>", ""],
              ["", "<code>210.105.195.151</code>", "", ""],
              ["", "<code>210.105.195.152</code>", "", ""],
              ["", "<code>210.105.195.153</code>", "", ""],
              ["", "<code>210.105.195.154</code>", "", ""],
              ["", "<code>210.105.195.155</code>", "", ""],
              ["파일 연동 서버", "<code>210.105.195.145</code>", "<code>80</code>", ""],
              ["", "<code>210.105.195.146</code>", "", ""],
              ["", "<code>210.105.195.147</code>", "", ""],
            ],
          },
          {
            label: "네트워크 설정 정보 · 차세대 센터 (X_McsAgent)",
            cols: ["서버", "IP", "PORT", "비고"],
            colWidths: ["23%", "27%", "12%", "38%"],
            rows: [
              ["자원 관리 서버", "<code>14.32.72.193</code>", "<code>80</code>", "<code>info.xroshot.com</code>"],
              ["", "<code>14.32.72.178</code>", "", ""],
              ["", "<code>221.148.244.20</code>", "", ""],
              ["", "<code>221.148.244.212</code>", "", ""],
              ["메시지 연동 서버", "<code>14.32.72.20</code>", "<code>8900</code>", "14.32.xx (분당) / 221.148.xx (대전)"],
              ["", "<code>14.32.72.148</code>", "", ""],
              ["", "<code>221.148.244.22</code>", "", ""],
              ["", "<code>221.148.244.194</code>", "", ""],
              ["파일 연동 서버", "<code>14.32.72.151</code>", "<code>80</code>", ""],
              ["", "<code>221.148.244.77</code>", "", ""],
            ],
          },
        ],
        note: "방화벽 확인은 <code>telnet &lt;목적지IP&gt; &lt;목적지Port&gt;</code> 로 모든 IP·Port에 대해 점검합니다. 표의 IP·PORT는 드래그하여 복사할 수 있습니다.",
      },
      {
        title: "패키지 설치 — 준비물 수령 및 압축 해제",
        body: "설치를 위해 아래 항목을 담당 영업 또는 KT 협력사를 통해 제공받습니다.",
        list: [
          "<b>McsAgent 패키지</b> — <code>mcs_agent_x.x.x.zip</code>",
          "<b>인증파일</b>(<code>*.cert</code>) — 서버 인증 Ticket 생성용 Key File",
          "<b>SP_ID / SP_Password</b> — 서버 접속 계정 <i>(Agent를 여러 개 쓰면 Agent별 ID 별도 발급)</i>",
          "설치할 디렉토리에서 패키지 <b>압축 해제</b> — 발송량이 많으면 로그도 커지므로 여유 공간이 넉넉한 위치 권장",
          "<i>(Linux/UNIX 필수)</i> Agent 운영 OS 계정을 정해 파일 복사·운영하고, <code>chmod u+x *.sh</code> 로 스크립트 실행권한 부여",
        ],
        tables: [
          {
            label: "로그 파일 — Agent 설치 시 <Agent>/logs 폴더에 생성 (★ = 가장 자주 확인)",
            cols: ["로그 파일", "용도"],
            rows: [
              ["★ <code>logs/agent_info.&lt;날짜&gt;.log</code>", "<b>계정 로그인·서버 접속</b> 등 운영 전반. Agent 시작/종료, 실행환경(OS·Java·DB), 서버 연결정보, 발송 기능, Agent 에러 내용 확인"],
              ["★ <code>logs/dbg/agent_dbg.&lt;날짜&gt;.log</code>", "<b>DB 연결 로그·발송 관련 데이터</b> 확인 (장애 분석용 디버그 로그)"],
              ["★ <code>logs/dbg/agent_msgdbg.&lt;날짜&gt;.log</code>", "발송 관련 데이터를 <b>dbg 로그보다 더 상세</b>하게 확인 (서버 송/수신 데이터)"],
              ["<code>logs/agent_mon.&lt;날짜&gt;.log</code>", "Monitor 시작/종료·정보·에러"],
              ["<code>logs/agent_msg.&lt;날짜&gt;.log</code>", "서버와 송/수신한 메시지 정보"],
              ["<code>logs/agent_inst.&lt;날짜&gt;.log</code>", "Agent 설치 시 생성되는 로그"],
            ],
          },
        ],
        note: "환경설정 완료 후 인증파일(<code>*.cert</code>)을 <code>&lt;Agent&gt;/file/auth/</code> 경로에 둬야 서버 로그인이 됩니다. 라이선스 파일이 없으면 Agent가 시작 직후 종료됩니다.<br><br><b>로그 안내</b> — <code>logs/dbg</code> 폴더의 파일은 장애 등 Agent 분석용입니다. <b>하루(자정)가 지난 전날 로그는 자동으로 압축 파일이 되어 <code>&lt;Agent&gt;/file/backup/</code> (에이전트 폴더 → file → backup) 폴더로 이관</b>되므로, 지난 로그는 이 폴더의 압축 파일에서 확인합니다. 모노에 로그 전달 시에는 <b>당일자 <code>logs</code> 디렉토리 전체(<code>dbg</code> 포함)</b>를 압축해 보내세요.",
      },
      {
        title: "설치 실행",
        body: "Agent 디렉토리에서 설치 스크립트를 실행합니다.",
        codePlain:
          "# Linux / UNIX\n" +
          "./installAgent.sh\n\n" +
          "# Windows  (Vista/2008 이후 버전은 ‘관리자 권한으로 실행’)\n" +
          "installAgent.bat",
        note: "설치 메시지의 한글이 깨지면 위 ‘한글 설정’을 적용하세요. 설치 결과로 환경설정 파일 <code>config\\mcs_agent_config.xml</code> 이 생성되며, 이후 설정 변경은 재설치 없이 이 파일 수정 후 Agent 재시작으로 반영됩니다.",
      },
      {
        title: "설치 단계 — 주요 입력값",
        body: "설치 스크립트 실행 후 순서대로 값을 입력합니다. <code>[Enter]</code>=기본값, <code>(Y/N)</code>=Y 또는 N, 번호 항목은 해당 번호 입력, 종료는 <code>exit</code> 입니다.",
        table: {
          cols: ["입력 항목", "설명"],
          rows: [
            ["라이선스 동의", "정책 동의 (Y/N). N이면 설치 종료 — 동의해야 진행"],
            ["비밀번호 암호화", "KT·DB 비밀번호 암호화 여부 (Y/N). 이후 <code>setupPasswd</code> 로 변경 가능"],
            ["MCS 센터 선택", "<b>1: 1센터 / 2: 2센터</b> — 사용자 ID에 해당하는 센터 선택 (차세대는 X_McsAgent에서 별도)"],
            ["KT 사용자 ID / PW", "KT에서 제공받은 SP_ID / SP_Password"],
            ["라이선스 파일명", "KT 제공 <code>*.cert</code> 파일명 (설치 후 <code>file/auth/</code> 에 배치)"],
            ["발송 이중화", "Y 선택 시 SUB 계정(센터·ID·PW·라이선스) 추가 입력"],
            ["서비스 사용 여부", "SMS · SMS MO · VMS · FMS · FMS MO · MMS 각각 (Y/N) — 미사용은 N으로 부하 감소"],
            ["발송금지 시간", "Y 선택 시 시작·종료 시각(HHMM 4자리). 예: 2100~0800"],
            ["REPORT 테이블 방식", "1: Fixed / 2: Monthly (월 단위 생성, suffix <code>_yymm</code>)"],
            ["RESERVED 컬럼", "사용자 컬럼 개수·크기 맞춤 (Y/N). 기본 개수 9, RESERVED1=64, 그 외 50"],
            ["연동규격", "1: 신규(MCS) / 2: UMS_SDK / 3: IMO / 4: EMMA / 5: JRobot"],
            ["DBMS 선택", "1:Oracle 2:MSSQL 3:MySQL 4:MySQL8 5:MariaDB 6:Tibero 7:Informix 8:Sybase 9:CacheDB 10:PostgreSQL 11:EPAS"],
            ["JDBC URL 직접입력", "Y 시 Driver 클래스·URL 직접 설정 (이때 서버·Port·DB명 입력 생략)"],
            ["DBMS 접속정보", "서버 IP(Oracle RAC는 연결 문자열)·Port·DB명(Oracle=SID)·USER·PW"],
            ["DB 한글 설정", "정상 출력되는 한글(‘한글 테스트샾’) 보기 번호 선택 (예: UTF8|UTF8)"],
          ],
        },
        note: "입력을 마치면 ‘입력사항’ 요약이 출력되고 <code>[Enter]</code> 시 <code>config\\mcs_agent_config.xml</code> 이 생성됩니다. 항목별 상세는 매뉴얼 ‘부록 — MCS 환경설정 파일 설명’ 참고.",
      },
      {
        title: "DB 객체 생성",
        body: "환경설정 후 발송에 필요한 DB 객체(Table·Index·Sequence)가 자동 생성됩니다. 이미 있으면 생성은 Skip되고 누락된 Field·Index만 추가됩니다. <code>installAgent.bat(sh) -d</code> 로 DB 객체 생성만 수행할 수도 있습니다.",
        tables: [
          {
            label: "메시지 유형별 약어 (테이블 이름의 *MS 자리에 들어감)",
            cols: ["메시지 유형", "약어", "비고"],
            rows: [
              ["단문 문자", "SMS", ""],
              ["장문·멀티미디어", "MMS", "LMS / MMS"],
              ["팩스", "FMS", ""],
              ["음성", "VMS", ""],
            ],
          },
          {
            label: "유형별 공통 테이블 구조 (*MS = 위 약어로 치환)",
            cols: ["구분", "테이블", "용도"],
            rows: [
              ["발송", "<code>SDK_*MS_SEND</code>", "고객이 INSERT하여 발송 요청"],
              ["결과", "<code>SDK_*MS_REPORT</code> · <code>SDK_*MS_REPORT_DETAIL</code>", "발송 결과·상세 수신"],
              ["수신", "<code>SDK_*MS_RECEIVE</code>", "MO(수신) 메시지 적재"],
              ["상태", "<code>SDK_SEND_STAT</code> · <code>SDK_RECV_STAT</code>", "Agent 발송·수신 상태"],
              ["시퀀스 <i>(Oracle)</i>", "<code>SDK_*MS_SEQ</code> · <code>SDK_*MS_RECV_SEQ</code>", "발송·수신용 채번"],
            ],
          },
        ],
        note: "예: 문자는 <code>SDK_SMS_SEND</code>, 음성은 <code>SDK_VMS_SEND</code> 처럼 <code>*MS</code> 자리에 약어를 넣습니다. 고객 시스템은 <code>SDK_*MS_SEND</code> 테이블에 INSERT하여 발송을 요청합니다. 주요 필드 — <code>SMS_MSG</code>(본문·90byte 권장), <code>CALLBACK</code>(회신번호·필수), <code>DEST_INFO</code>(수신자 이름^번호|…, 최대 100), <code>USER_ID</code>(SP_ID). 아래 ‘발송 쿼리 생성기’로 INSERT 쿼리를 바로 만들 수 있습니다.",
      },
      {
        title: "Agent 실행 · 종료 · 상태 확인",
        body: "설치 후 Agent를 기동합니다. 하나의 ID에는 하나의 세션만 허용되며(동일 ID 다중 접속 시 기존 세션이 끊어짐), 고객이 지정한 IP에서만 발송하는 보안 기능이 있습니다.",
        codePlain:
          "# 실행\n" +
          "[Linux/UNIX]  ./startAgent.sh        [Windows]  startAgent.bat\n" +
          "# 종료\n" +
          "[Linux/UNIX]  ./stopAgent.sh         [Windows]  stopAgent.bat\n" +
          "# 상태 확인\n" +
          "[Linux/UNIX]  ./agentStatus.sh       [Windows]  agentStatus.bat",
        list: [
          "프로세스 — <code>MCSAgent</code>(실제 발송) + <code>MCSMon</code>(Agent 감시·재시작). 강제 종료 시 <b>MCSMon → McsAgent</b> 순서",
          "<i>(Windows)</i> <code>installService.bat</code> 실행 시 ‘MCSAgent Service’로 등록(자동 시작). 제거는 <code>uninstallService.bat</code>",
        ],
        note: "Windows 서비스가 NAS 등 네트워크 자원을 사용하면 ‘Local System’ 권한 문제로 접근이 안 될 수 있습니다 — 서비스 ‘속성 &gt; 로그온’에서 권한 있는 계정으로 변경하세요. (발송 IP 보안 문의: 080-258-0303)",
      },
      {
        title: "문자(SMS) 시험발송",
        body: "<code>agentTest</code> 프로그램으로 문자(SMS)·음성(VMS)·팩스(FMS)를 시험 발송할 수 있습니다. (Agent가 정상 기동된 상태에서 실행)",
        codePlain:
          "[Linux/UNIX] ./agentTest.sh      [Windows] agentTest.bat\n\n" +
          ">> 선택 : 1               (1.문자  2.음성  3.팩스)\n" +
          "전송 타입 >> 1            (1.즉시  2.예약)\n" +
          "회신번호  >> 01012345678\n" +
          "KT OFFICE CODE >>         (없으면 비워둠)\n" +
          "메시지    >> sms test msg\n" +
          "수신자    >> name^01087654321     (형식: 이름^전화번호|이름^전화번호|…)",
        note: "Windows 환경은 McsAgent v2.3.2.0 이상에서 제공되는 UI 프로그램으로 모니터링할 수도 있습니다.",
      },
      {
        title: "부록 — 다중 Agent 기능",
        nav: "부록 — 다중 Agent",
        body: "한 서버에서 <b>복수 개의 Agent</b>를 실행하기 위한 기능입니다. Agent는 내부 포트 사용 등의 문제로 기본적으로 한 장비당 하나만 설치할 수 있으나, 장비 추가가 어려운 경우 이 기능을 사용합니다.",
        list: [
          "<code>installAgent.bat(sh)</code> 실행 시 <b>옵션</b>을 지정해 설치해야 합니다.",
          "각 Agent는 <b>서로 다른 DB(또는 스키마)</b>에 접속해야 합니다.",
          "각 Agent는 <b>서로 다른 KT 사용자 계정</b>을 사용해야 합니다.",
          "Agent 디렉토리를 각각 다른 이름으로 복사 — 예: <code>McsAgent_1</code>, <code>McsAgent_2</code>, <code>McsAgent_3</code> …",
          "각 디렉토리로 이동해 <code>installAgent.bat(sh) -m &lt;Agent_번호&gt;</code> 로 설치 (번호는 0보다 큰 정수). 이후 설치·실행 절차는 단일 Agent와 동일합니다.",
        ],
        codePlain:
          "# Agent 번호 1번 설치\n" +
          "[Windows]  D:\\KT\\McsAgent_1> installAgent.bat -m 1\n" +
          "[Linux]    $ ./installAgent.sh -m 1",
        table: {
          cols: ["구분", "내용"],
          rows: [
            ["프로세스 <i>(Windows)</i>", "작업관리자에 <code>MCSAgentJ_&lt;번호&gt;.exe</code>, <code>MCSMonJ_&lt;번호&gt;.exe</code> / 서비스 등록 시 <code>MCSAgent Service - &lt;번호&gt;</code>"],
            ["프로세스 <i>(Linux)</i>", "<code>ps</code> 에서 <code>MCSAgent_&lt;번호&gt;</code>, <code>MCSMon_&lt;번호&gt;</code> 로 grep"],
            ["환경설정 항목", "‘AGENT’ 카테고리에 <code>00.MULTI_NUM</code>(Agent 번호) 생성 — <b>변경 불가, 변경하려면 재설치</b>"],
            ["로컬 포트", "Agent↔Monitor 로컬 포트(<code>12.LOCAL_HEALTH_PORT</code>·<code>03.MONITOR_PORT</code>)는 설치 시 자동 분배. 충돌 시 환경설정에서 수동 변경 후 재시작"],
          ],
        },
        note: "<code>00.MULTI_SUFFIX</code> 에 문자열을 지정하면 Agent 번호 외에 해당 문자열로도 프로세스를 grep할 수 있습니다. <code>00.MULTI_NUM</code> 변경 시 재설치가 필요하며, 윈도우 서비스가 등록된 경우 서비스 삭제 후 재설치해야 합니다.",
      },
      {
        title: "부록 — Table Suffix 기능",
        nav: "부록 — Table Suffix",
        body: "<b>동일한 DB 영역</b>에 복수의 Agent를 실행하기 위한 기능입니다. 사용자 계정·테이블스페이스 등 DB 영역 추가가 어려운 환경에서 사용하며, <b>다중 Agent 기능과 병행</b>할 수 있습니다.",
        list: [
          "<code>installAgent.bat(sh)</code> 실행 시 <b>옵션</b>을 지정해 설치해야 합니다.",
          "테이블·인덱스 이름에 <code>_&lt;TableSuffix&gt;</code> 를 붙여 생성·사용 — 예: <code>SDK_SMS_SEND_A</code>, <code>SDK_SMS_REPORT_A</code>, <code>SDK_SMS_REPORT_DETAIL_2002_A</code>",
          "<code>installAgent.bat(sh) -s &lt;Table_Suffix&gt;</code> 로 설치. Suffix는 영문·숫자 사용(<b>대소문자 구분 없음</b>). 이후 절차는 단일 Agent와 동일합니다.",
          "Suffix 길이 자체는 제한이 없으나 <b>DB 종류·버전별 테이블/인덱스 이름 길이 제한</b>을 고려해야 합니다. 예: Oracle 11g 이하는 테이블명 최대 30자 → 월별 테이블 사용 시 Suffix는 <b>최대 3자</b>(<code>SDK_SMS_REPORT_DETAIL_2002_&lt;Suffix&gt;</code>)",
        ],
        codePlain:
          "# Table Suffix 'A' 로 설치\n" +
          "[Windows]  D:\\KT\\McsAgent> installAgent.bat -s A\n" +
          "[Linux]    $ ./installAgent.sh -s A\n\n" +
          "# 다중 Agent + Table Suffix 복합 설치 (1번 Agent, Suffix 'A')\n" +
          "installAgent.bat(sh) -m 1 -s A",
        note: "Table Suffix 사용 시 환경설정 ‘AGENT’ 카테고리에 <code>00.TABLE_SUFFIX</code> 항목이 생성됩니다.",
      },
      {
        title: "발송 쿼리 생성기",
        body: "DBMS와 메시지 유형(SMS/LMS/MMS/FMS/VMS)을 선택하고 값을 입력하면 <code>SDK_*_SEND</code> 테이블 INSERT 쿼리가 생성됩니다. 복사해서 그대로 사용하세요.",
        widget: "queryGen",
        note: "수신자는 <code>이름^번호|이름^번호</code> 형식으로 입력합니다. <code>USER_ID</code>에는 KT에서 발급받은 <b>스마트메시지 SP_ID</b>를 입력하면 되며, 이 값은 Agent가 내부적으로 발송 계정을 식별하는 용도일 뿐 <b>실제 KT로 전송되는 데이터는 아닙니다.</b>",
      },
        ],
      },
      {
        id: "sms",
        name: "2. 문자(SMS)",
        intro: "문자(SMS) 발송에 사용하는 DB 테이블 4종의 레이아웃·필드와 샘플 INSERT 쿼리, 전송 응답코드(TCS_RESULT)를 안내합니다. (출처: MCS_Agent_Manual_문자메시지 v1.4)",
        steps: [
          {
            title: "개요 · 문자(SMS) 발송 흐름",
            body: "고객 시스템이 <code>SDK_SMS_SEND</code> 테이블에 발송할 메시지를 <b>INSERT</b>하면 Agent가 서버로 전송하고, 처리 결과가 <code>SDK_SMS_REPORT</code> 계열 테이블로 적재되는 구조입니다. 문자 발송과 관련된 테이블은 아래 4종입니다.",
            table: {
              cols: ["테이블", "역할", "설명"],
              colWidths: ["28%", "24%", "48%"],
              rows: [
                ["<code>SDK_SMS_SEND</code>", "발송 요청", "고객이 메시지·수신자를 INSERT. 처리가 완료되면 Row가 삭제되고 내용이 REPORT로 이동"],
                ["<code>SDK_SMS_REPORT</code>", "발송 결과(집계)", "JOB 단위 성공·실패 건수 보관"],
                ["<code>SDK_SMS_REPORT_DETAIL</code>", "수신자별 상세 결과", "수신자별 전송 결과·요금·이통사 정보"],
                ["<code>SDK_SMS_RECEIVE</code>", "문자 수신(MO)", "수신 메시지 적재 <i>(현재 서비스 준비 중)</i>"],
              ],
            },
            note: "<code>NotNull</code> 필드에는 반드시 데이터를 입력해야 합니다. <code>RESERVED1~9</code> 는 사용자가 임의로 사용할 수 있는 여유 필드입니다. Oracle은 <code>MSG_ID</code> 에 Agent가 제공하는 시퀀스 <code>SDK_SMS_SEQ.nextval</code> 를 사용합니다.",
          },
          {
            title: "SDK_SMS_SEND — 발송 요청 테이블",
            body: "고객 시스템이 발송할 메시지·수신자를 INSERT하는 <b>발송 요청 테이블</b>입니다. NotNull(필수) 필드는 반드시 입력해야 하며, 처리가 완료되면 이 테이블의 Row는 삭제되고 내용이 <code>SDK_SMS_REPORT</code> 로 이동합니다.",
            tables: [
              {
                label: "SDK_SMS_SEND 필드 (● = NotNull 필수)",
                cols: ["컬럼", "타입", "필수", "기본값", "설명"],
                rows: [
                  ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값(자동증가 key). Oracle은 <code>SDK_SMS_SEQ.nextval</code> 사용"],
                  ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID (Agent가 관리하는 업체별 사용자 ID)"],
                  ["<code>SCHEDULE_TYPE</code>", "INT", "●", "0", "발송시점 구분 (0:즉시, 1:예약)"],
                  ["<code>SUBJECT</code>", "VARCHAR(50)", "", "", "제목 (메시지 구분용, 실제 발송 시 서버로 전송되지 않음)"],
                  ["<code>SMS_MSG</code>", "VARCHAR(200)", "", "", "발송 메시지 본문 (권장·최대 90 byte)"],
                  ["<code>CALLBACK_URL</code>", "VARCHAR(200)", "", "", "전송할 Callback URL (본문과 합산 80 byte, 별도 상품 가입 필요)"],
                  ["<code>NOW_DATE</code>", "VARCHAR(20)", "", "", "DB 입력 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>SEND_DATE</code>", "VARCHAR(20)", "", "", "발송 희망 시간 <code>YYYYMMDDHHMMSS</code> (예약 시)"],
                  ["<code>CALLBACK</code>", "VARCHAR(20)", "", "", "회신번호(발신번호), 숫자만 입력"],
                  ["<code>DEST_TYPE</code>", "INT", "●", "0", "수신자 정보 저장 타입 (0:TEXT 고정)"],
                  ["<code>DEST_COUNT</code>", "INT", "●", "0", "수신자 목록 개수 (Max 100)"],
                  ["<code>DEST_INFO</code>", "TEXT", "●", "", "수신자 정보 (이름^번호|이름^번호…)"],
                  ["<code>KT_OFFICE_CODE</code>", "VARCHAR(20)", "", "", "KT 유통망(전문점) 코드 — 있을 경우만 저장"],
                  ["<code>CDR_ID</code>", "VARCHAR(20)", "", "", "과금 지정 ID (미지정 시 로그인 SP_ID에 통합 과금)"],
                  ["<code>RESERVED1</code>", "VARCHAR(64)", "", "", "여분필드 1 (임의 사용 가능)"],
                  ["<code>RESERVED2~9</code>", "VARCHAR(50)", "", "", "여분필드 2~9 (임의 사용 가능)"],
                  ["<code>SEND_STATUS</code>", "INT", "●", "0", "전송 처리 상태 — 입력 시 항상 0 (아래 표 참조)"],
                  ["<code>SEND_COUNT</code>", "INT", "●", "0", "서버 전송 실패 시 재전송 회수 (최대 3회 재시도 후 실패 처리)"],
                  ["<code>SEND_RESULT</code>", "INT", "●", "0", "전송결과 서버 ACK 값"],
                  ["<code>SEND_PROC_TIME</code>", "VARCHAR(20)", "", "", "서버 전송 처리 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>STD_ID</code>", "VARCHAR(50)", "", "", "타 규격 연동 시 Agent 내부 사용"],
                  ["<code>KISA_ORIG_CODE</code>", "VARCHAR(9)", "", "", "최초 발신 사업자코드"],
                ],
              },
              {
                label: "SEND_STATUS 값 (전송 처리 상태 · INSERT 시 항상 0)",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0</code>", "메시지 입력"],
                  ["<code>1</code>", "Agent 처리 시작 (Fetch)"],
                  ["<code>2</code>", "서버 전송 중"],
                  ["<code>3</code>", "발송 완료 (Row 삭제 후 REPORT로 이동)"],
                  ["<code>-1</code>", "발송 실패 또는 데이터 COPY 실패"],
                  ["<code>-2</code>", "Report_detail 데이터 처리 후 실패"],
                ],
              },
            ],
            note: "주요 필드 — <b>SMS_MSG</b>: 본문, 이통사마다 다르나 <b>최대 90 byte</b>(권장규격). · <b>DEST_INFO</b>: 수신자 목록, <code>이름^번호|이름^번호</code> 형식이며 전화번호는 숫자만(<code>-</code> 제외), 동보 시 <code>DEST_COUNT</code> 와 개수 일치(최대 100). · <b>SCHEDULE_TYPE</b>: <code>0</code> 즉시(SEND_DATE 무관 즉시 발송) / <code>1</code> 예약(SEND_DATE 시각에 발송). · <b>CALLBACK</b>: 회신(발신)번호, 숫자만. · <b>CDR_ID</b>: 다수의 발송 ID(SP_ID)를 가진 경우 특정 ID로 과금하는 기능, 미지정(NULL) 시 설치 시 입력한 SP_ID에 통합 과금. · <b>CALLBACK_URL</b>: 별도 상품 가입 시에만 발송되며 본문과 합산 80 byte.",
          },
          {
            title: "SDK_SMS_REPORT — 발송 결과 테이블",
            body: "발송 요청 처리가 완료되면 <code>SDK_SMS_SEND</code> 의 내용이 이 테이블로 이동하며, JOB 단위로 성공·실패 건수가 집계됩니다. (SEND 테이블의 입력 필드는 그대로 보관되며, 아래는 결과 관련 주요 필드입니다.)",
            table: {
              cols: ["컬럼", "타입", "필수", "기본값", "설명"],
              rows: [
                ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값 (SEND 테이블과 동일)"],
                ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                ["<code>JOB_ID</code>", "BIGINT", "●", "0", "서버에서 관리되는 메시지 고유 ID 값"],
                ["<code>SUCC_COUNT</code>", "INT", "●", "0", "메시지 전송 성공 개수"],
                ["<code>FAIL_COUNT</code>", "INT", "●", "0", "메시지 전송 실패 개수"],
                ["<code>SUBJECT</code> · <code>SMS_MSG</code> · <code>DEST_INFO</code> 등", "—", "", "", "SEND 테이블의 입력값을 그대로 보관"],
                ["<code>STD_ID</code>", "VARCHAR(50)", "", "", "타 규격 연동 시 사용"],
                ["<code>KISA_ORIG_CODE</code>", "VARCHAR(9)", "", "", "최초 발신 사업자코드"],
              ],
            },
            note: "<code>CANCEL_STATUS · CANCEL_COUNT · CANCEL_REQ_DATE · CANCEL_RESULT</code> 및 <code>DELIVER_STATUS · DELIVER_COUNT · DELIVER_REQ_DATE · DELIVER_RESULT</code> 필드는 과거 SDK에서 사용하던 필드로 <b>현재는 사용하지 않습니다.</b> 오류 발생 방지를 위해 Schema에만 추가되어 있습니다.",
          },
          {
            title: "SDK_SMS_REPORT_DETAIL — 수신자별 상세 결과",
            body: "동보 전송 시 <b>수신자별</b> 전송 결과·요금·이통사 정보가 적재되는 테이블입니다. 전송 결과 확인 시에는 <code>TCS_RESULT</code> 값을 참조합니다.",
            tables: [
              {
                label: "SDK_SMS_REPORT_DETAIL 필드",
                cols: ["컬럼", "타입", "필수", "기본값", "설명"],
                rows: [
                  ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값 (SEND 테이블과 동일)"],
                  ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                  ["<code>JOB_ID</code>", "BIGINT", "●", "0", "서버에서 관리되는 메시지 고유 ID 값"],
                  ["<code>SUBJOB_ID</code>", "INT", "●", "0", "동보 전송일 경우 세부 메시지 ID (1, 2, 3…)"],
                  ["<code>SEND_DATE</code>", "VARCHAR(20)", "●", "", "발송 희망 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>DEST_NAME</code>", "VARCHAR(20)", "●", "", "수신자 이름 (DEST_INFO 참조)"],
                  ["<code>PHONE_NUMBER</code>", "VARCHAR(20)", "●", "", "수신자 전화번호 (DEST_INFO 참조)"],
                  ["<code>RESULT</code>", "INT", "●", "0", "전송 결과값 (기존 SDK 제공)"],
                  ["<code>TCS_RESULT</code>", "INT", "●", "-2,NULL", "신규 서버 제공 상세 전송 결과값 (응답코드 참조)"],
                  ["<code>FEE</code>", "FLOAT", "", "", "요금"],
                  ["<code>DELIVER_DATE</code>", "VARCHAR(20)", "", "", "SMS 전달 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>REPORT_RES_DATE</code>", "VARCHAR(20)", "", "", "리포트 서버로부터 응답 받은 날짜"],
                  ["<code>MSG_SUBJOB_TYPE</code>", "INT", "", "", "메시지 Sub Job Type (아래 표 참조)"],
                  ["<code>STAT_STATUS</code>", "INT", "", "", "통계 처리 상태 (아래 표 참조)"],
                  ["<code>TELCOINFO</code>", "VARCHAR(8)", "", "", "이통사 정보 (아래 표 참조)"],
                  ["<code>STATUS_TEXT</code>", "VARCHAR(200)", "", "", "전송결과 부가정보 (이통사 스팸차단 등)"],
                  ["<code>SEND_SPID</code>", "VARCHAR(100)", "", "", "이중화 구조 사용 시 발송 계정 SP_ID"],
                ],
              },
              {
                label: "MSG_SUBJOB_TYPE (메시지 종류)",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0x01</code>", "문자 메시지"],
                  ["<code>0x02</code>", "음성 메시지 (TTS)"],
                  ["<code>0x03</code>", "음성 메시지 (FILE)"],
                  ["<code>0x05</code>", "팩스 메시지"],
                  ["<code>0x0D</code>", "음성 메시지 (다단계 설문)"],
                ],
              },
              {
                label: "TELCOINFO (이통사 코드)",
                cols: ["값", "이통사"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>01690</code>", "KT"],
                  ["<code>01190</code>", "SKT"],
                  ["<code>01990</code>", "LGU+"],
                ],
              },
              {
                label: "STAT_STATUS (통계 처리 상태)",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0</code>", "초기 입력"],
                  ["<code>1</code>", "통계 처리 시작 (Fetch)"],
                  ["<code>2</code>", "통계 처리 중"],
                  ["<code>3</code>", "통계 처리 완료"],
                ],
              },
            ],
            note: "<b>TCS_RESULT</b> 에는 신규 서버가 제공하는 상세 전송 결과값이 저장되며, 전송 결과 확인 시 이 값을 참조합니다. (<code>RESULT</code> 는 기존 SDK 호환 결과값) · <b>STATUS_TEXT</b> 는 이통사 스팸차단 부가서비스에 의한 차단 등 부가정보를 담습니다.",
          },
          {
            title: "SDK_SMS_RECEIVE — 문자 수신 테이블 (준비 중)",
            body: "문자 수신(MO) 메시지를 적재하는 테이블입니다. <b>현재 서비스 준비 중</b>입니다.",
            table: {
              cols: ["컬럼", "타입", "필수", "설명"],
              rows: [
                ["<code>JOB_ID</code>", "BIGINT", "", "서버에서 관리하는 고유 ID 값"],
                ["<code>MSG_ID</code>", "INT", "", "각 업체에서 사용하는 유니크한 값"],
                ["<code>CALLBACK</code>", "VARCHAR(20)", "●", "회신 전화번호"],
                ["<code>ANI_NUMBER</code>", "VARCHAR(20)", "●", "발신 전화번호"],
                ["<code>DEST_NUMBER</code>", "VARCHAR(20)", "●", "수신 전화번호"],
                ["<code>SMS_MSG</code>", "VARCHAR(200)", "●", "수신된 문자 메시지 내용"],
                ["<code>RECV_DATE</code>", "VARCHAR(20)", "●", "메시지 수신 시간"],
                ["<code>STAT_STATUS</code>", "INT", "●", "통계 처리 상태 (기본 0 → 처리 후 1)"],
                ["<code>REPORT_STATUS</code> 등", "INT", "", "기존 SDK 호환용 — 신규 설치 시 미사용"],
              ],
            },
            note: "<code>REPORT_STATUS · REPORT_COUNT · REPORT_PROC_TIME · REPORT_RESULT</code> 필드는 기존 SDK 매뉴얼 참고용으로, 신규로 설치할 경우 사용하지 않는 필드입니다.",
          },
          {
            title: "통계 테이블 — SDK_SEND_STAT · SDK_RECV_STAT",
            body: "시간(시) 단위로 발송·수신 건수를 집계하는 통계 테이블입니다. 연·월·일·시 + 회원 ID 기준으로 유형별 건수를 누적합니다.",
            tables: [
              {
                label: "SDK_SEND_STAT (발송 통계) 주요 컬럼",
                cols: ["컬럼", "설명"],
                colWidths: ["48%", "52%"],
                rows: [
                  ["<code>SEND_YEAR · SEND_MONTH · SEND_DAY · SEND_HOUR</code>", "집계 기준 연·월·일·시"],
                  ["<code>USER_ID</code>", "회원 ID (업체별 구분용)"],
                  ["<code>SMS_TOTAL</code> · <code>SMS_SUCC</code>", "문자 발송 건수 · 성공 건수"],
                  ["<code>VMS_TTS_TOTAL/SUCC</code> · <code>VMS_FILE_TOTAL/SUCC</code>", "음성(TTS·FILE) 발송 건수 · 성공 건수"],
                  ["<code>VMS_MSTG_TOTAL/SUCC</code> · <code>VMS_SP_TOTAL/SUCC</code>", "시나리오 · SMS PLUS 발송 건수 · 성공 건수"],
                  ["<code>FMS_TOTAL/SUCC</code> · <code>MMS_TOTAL/SUCC</code>", "팩스 · 장문(MMS) 발송 건수 · 성공 건수"],
                ],
              },
              {
                label: "SDK_RECV_STAT (수신 통계) 주요 컬럼",
                cols: ["컬럼", "설명"],
                colWidths: ["48%", "52%"],
                rows: [
                  ["<code>RECV_YEAR · RECV_MONTH · RECV_DAY · RECV_HOUR</code>", "집계 기준 연·월·일·시"],
                  ["<code>SMS_TOTAL</code>", "시간별 문자 수신 건수"],
                  ["<code>FMS_TOTAL</code>", "시간별 팩스 수신 건수"],
                ],
              },
            ],
          },
          {
            title: "샘플 INSERT 쿼리",
            cta: { href: "#/agent/mcs?sec=step-smart-install-13", label: "발송 쿼리 생성기 열기 (설치 가이드)", icon: "sparkle" },
            body: "매뉴얼에서 제공하는 발송 샘플 쿼리입니다. DBMS와 발송 시점(즉시/예약)에 따라 아래를 참고하세요. (값을 채워 바로 만들려면 ‘1. 설치 가이드’ 탭의 <b>발송 쿼리 생성기</b>를 이용하세요.)",
            codeTabs: [
              {
                name: "MySQL·MS-SQL · 즉시",
                code:
                  "-- 즉시 발송 (SCHEDULE_TYPE=0)\n" +
                  "INSERT INTO SDK_SMS_SEND\n" +
                  "  (USER_ID, SCHEDULE_TYPE, SUBJECT, SMS_MSG, CALLBACK_URL,\n" +
                  "   NOW_DATE, SEND_DATE, CALLBACK, DEST_INFO)\n" +
                  "VALUES\n" +
                  "  ('testid', 0, '제목', '테스트메시지', '',\n" +
                  "   '201701010000', '201701010000', '01011112222', 'test^01011112222');",
              },
              {
                name: "MySQL·MS-SQL · 예약",
                code:
                  "-- 예약 발송 (SCHEDULE_TYPE=1, SEND_DATE 시각에 발송)\n" +
                  "INSERT INTO SDK_SMS_SEND\n" +
                  "  (USER_ID, SCHEDULE_TYPE, SUBJECT, SMS_MSG, CALLBACK_URL,\n" +
                  "   NOW_DATE, SEND_DATE, CALLBACK, DEST_INFO)\n" +
                  "VALUES\n" +
                  "  ('testid', 1, '제목', '테스트메시지', '',\n" +
                  "   '201701010000', '201701010000', '01011112222', 'test^01011112222');",
              },
              {
                name: "Oracle · 즉시",
                code:
                  "-- 즉시 발송 (MSG_ID = SDK_SMS_SEQ.nextval)\n" +
                  "INSERT INTO SDK_SMS_SEND\n" +
                  "  (MSG_ID, USER_ID, SCHEDULE_TYPE, SUBJECT, NOW_DATE, SEND_DATE,\n" +
                  "   CALLBACK, DEST_COUNT, DEST_INFO, SMS_MSG)\n" +
                  "VALUES\n" +
                  "  (SDK_SMS_SEQ.nextval, 'testid', 0, '제목', '201701010000', '201701010000',\n" +
                  "   '01011112222', 1, 'test^01011112222', '즉시발송 SMS');",
              },
            ],
            note: "<code>NOW_DATE</code> · <code>SEND_DATE</code> 는 <code>YYYYMMDDHHMMSS</code> 형식입니다. Oracle은 <code>MSG_ID</code> 에 반드시 시퀀스 <code>SDK_SMS_SEQ.nextval</code> 을 사용하세요. <code>DEST_INFO</code> 는 <code>이름^번호|이름^번호</code> 형식(전화번호 숫자만)입니다.",
          },
          {
            title: "응답코드 — TCS_RESULT",
            body: "전송 결과는 <code>SDK_SMS_REPORT_DETAIL.TCS_RESULT</code> 값으로 확인합니다. (<code>RESULT</code> 가 ‘기타에러’인 경우 <code>TCS_RESULT</code> 를 참조)",
            table: {
              cols: ["TCS_RESULT", "설명", "결과"],
              rows: [
                ["<code>-2, NULL</code>", "리포트 수신 전 임시코드 (Agent 4.0.0+ NULL, 이전 -2)", "대기"],
                ["<code>0</code>", "전송 성공", "성공"],
                ["<code>1</code>", "시스템 장애", "전송 실패"],
                ["<code>2</code>", "인증 실패 (인증파일 없음)", "로그인 실패"],
                ["<code>3</code>", "메시지 형식 오류 (규격 불일치)", "로그인 실패"],
                ["<code>5</code>", "인증티켓 유효성 오류 (비밀번호·SPID 틀림)", "로그인 실패"],
                ["<code>7</code>", "SP(가입자) 패스워드 틀림", "로그인 실패"],
                ["<code>8</code>", "SP(가입자) 일시정지", "로그인 실패"],
                ["<code>9</code>", "SP(가입자) 해지", "로그인 실패"],
                ["<code>10</code>", "End-User 존재하지 않음·해지·정지", "로그인 실패"],
                ["<code>16</code>", "시간 종료", "전송 실패"],
                ["<code>17</code>", "권한 없음 (접근 가능 IP 외 접속)", "로그인 실패"],
                ["<code>27</code>", "가입되지 않은 상품 발송", "전송 실패"],
                ["<code>33</code>", "월간 메시지 전송 개수 초과", "전송 실패"],
                ["<code>90</code>", "동보 개수 초과 (Agent 내부)", "전송 실패"],
                ["<code>91</code>", "데이터 형식 오류 (Agent 내부)", "전송 실패"],
                ["<code>92~96</code>", "첨부파일/업로드/Convert/다운로드 오류 (Agent 내부)", "전송 실패"],
                ["<code>99</code>", "발송 전 오류 (Agent 내부)", "전송 실패"],
                ["<code>101</code>", "메시지 내용 스팸", "전송 실패"],
                ["<code>102</code>", "발신자 스팸", "전송 실패"],
                ["<code>103</code>", "착신자 스팸", "전송 실패"],
                ["<code>104</code>", "회신번호 스팸", "전송 실패"],
                ["<code>108</code>", "동일 메시지 제한", "전송 실패"],
                ["<code>111</code>", "동일 착번 제한", "전송 실패"],
                ["<code>112</code>", "레포트 수신 시간 만료 (전송 후 24시간 미수신)", "전송 실패"],
                ["<code>114</code>", "번호도용/변작방지 차단", "전송 실패"],
                ["<code>115</code>", "미등록 회신번호 차단", "전송 실패"],
                ["<code>116</code>", "번호세칙 위반 차단", "전송 실패"],
                ["<code>200</code>", "통화중", "전송 실패"],
                ["<code>201</code>", "무응답 (단말기 무응답)", "전송 실패"],
                ["<code>202</code>", "착신 가입자 없음", "전송 실패"],
                ["<code>203</code>", "비가입자·결번·서비스 정지", "전송 실패"],
                ["<code>204</code>", "단말기 전원 꺼짐", "전송 실패"],
                ["<code>205</code>", "음영 지역", "전송 실패"],
                ["<code>206</code>", "단말기 메시지 Full", "전송 실패"],
                ["<code>207</code>", "Unknown / 단말기 형식 오류", "전송 실패"],
                ["<code>208</code>", "메시지 Overflow로 받지 못함", "전송 실패"],
                ["<code>209</code>", "번호 이동된 가입자", "전송 실패"],
                ["<code>210</code>", "SMS 착신전환 횟수 초과", "전송 실패"],
                ["<code>211</code>", "기간 만료", "전송 실패"],
                ["<code>212~216, 221~222</code>", "SKT 가입자 관련 오류 (가입자 없음·Sub Type·자리수 등)", "전송 실패(SKT)"],
                ["<code>213</code>", "NPDB 오류", "전송 실패"],
                ["<code>226</code>", "CallbackURL 사용자 아님", "전송 실패"],
                ["<code>227</code>", "착신번호 에러 (자리수 에러)", "전송 실패"],
                ["<code>228</code>", "착신번호 에러 (없는 번호)", "전송 실패"],
                ["<code>400, 403, 404, 486, 487</code>", "VMS/FMS — 잘못된 요청·금지·사용자 없음·통화중·미응답", "VMS/FMS 실패"],
                ["<code>500, 503, 504, 600, 603</code>", "VMS/FMS — SIP 서버 오류·서비스 불가·시간종료·모두사용중·거부", "VMS/FMS 실패"],
                ["<code>2100, 2101, 2103</code>", "MMS — 포맷 오류·올바르지 않은 컨텐츠·미지원 단말", "MMS 실패"],
                ["<code>2104, 2106, 2107, 2152</code>", "MMS — 컨텐츠 크기 초과·발신/착신번호 오류·Content-Type 오류", "MMS 실패"],
                ["<code>4305, 4404, 5300</code>", "MMS — 비가용폰·CALLBACK 스팸·단말기 수신 불가", "MMS 실패"],
              ],
            },
            note: "위 코드 중 <code>400</code> 번대는 VMS·FMS, <code>2100</code> 번대 이상은 MMS 전송 시 나타나는 결과코드입니다. 전체 코드 정의는 매뉴얼 ‘5. 응답코드 – TCS_RESULT’ 를 참조하세요.",
          },
        ],
      },
      {
        id: "mms",
        name: "3. 멀티메시지(LMS·MMS)",
        intro: "장문(LMS)·멀티미디어(MMS) 발송에 사용하는 DB 테이블과 필드, 첨부 컨텐츠 규격, 샘플 INSERT 쿼리, 전송 응답코드(TCS_RESULT)를 안내합니다. (출처: MCS_Agent_Manual_멀티미디어메시지 v1.6)",
        steps: [
          {
            title: "개요 · LMS·MMS 발송 흐름",
            body: "장문(LMS)과 멀티미디어(MMS)는 모두 <code>SDK_MMS_SEND</code> 테이블 하나로 발송합니다. <b>텍스트만</b> 보내면 LMS, <b>이미지 등 컨텐츠를 첨부</b>하면 MMS입니다. 문자(SMS) 대비 본문이 길고(최대 2000 byte) 이미지 첨부가 가능합니다.",
            tables: [
              {
                label: "LMS · MMS 구분",
                cols: ["구분", "전송 조합", "CONTENT_COUNT"],
                colWidths: ["28%", "24%", "48%"],
                rows: [
                  ["LMS (장문)", "본문 텍스트(<code>MMS_MSG</code>)만 발송", "<code>0</code>"],
                  ["MMS (멀티미디어)", "이미지 파일만 / 본문 + 이미지 조합", "<code>1~3</code>"],
                ],
              },
              {
                label: "관련 테이블",
                cols: ["테이블", "역할", "설명"],
                colWidths: ["28%", "24%", "48%"],
                rows: [
                  ["<code>SDK_MMS_SEND</code>", "발송 요청", "고객이 본문·수신자·첨부를 INSERT. 완료 시 Row 삭제 후 REPORT로 이동"],
                  ["<code>SDK_MMS_REPORT</code>", "발송 결과(집계)", "JOB 단위 성공·실패 건수"],
                  ["<code>SDK_MMS_REPORT_DETAIL</code>", "수신자별 상세 결과", "수신자별 결과·요금·이통사·확인(읽음) 시간"],
                  ["<code>SDK_SEND_STAT</code>", "발송 통계", "시간 단위 발송·성공 건수 (MMS_TOTAL = 장문 발송 건수)"],
                ],
              },
            ],
            note: "MMS 발송에는 <b>문자 수신(MO) 테이블이 없습니다.</b> Oracle은 <code>MSG_ID</code> 에 시퀀스 <code>SDK_MMS_SEQ.nextval</code> 를 사용합니다. <code>MMS_MSG</code> 본문은 최대 <b>2000 byte</b>입니다.",
          },
          {
            title: "SDK_MMS_SEND — 발송 요청 테이블",
            body: "본문·수신자·첨부 컨텐츠를 INSERT하는 <b>발송 요청 테이블</b>입니다. NotNull(필수) 필드는 반드시 입력하며, 처리가 완료되면 Row가 삭제되고 내용이 <code>SDK_MMS_REPORT</code> 로 이동합니다.",
            tables: [
              {
                label: "SDK_MMS_SEND 필드 (● = NotNull 필수)",
                cols: ["컬럼", "타입", "필수", "기본값", "설명"],
                rows: [
                  ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값(자동증가 key). Oracle은 <code>SDK_MMS_SEQ.nextval</code> 사용"],
                  ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID (Agent가 관리하는 업체별 사용자 ID)"],
                  ["<code>SCHEDULE_TYPE</code>", "INT", "●", "0", "발송시점 구분 (0:즉시, 1:예약)"],
                  ["<code>SUBJECT</code>", "VARCHAR(64)", "", "", "MMS 제목 (단말에 표시되는 제목)"],
                  ["<code>NOW_DATE</code>", "VARCHAR(20)", "●", "", "DB 입력 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>SEND_DATE</code>", "VARCHAR(20)", "●", "", "발송 희망 시간 <code>YYYYMMDDHHMMSS</code> (예약 시)"],
                  ["<code>CALLBACK</code>", "VARCHAR(20)", "●", "", "회신번호(발신번호), 숫자만 입력"],
                  ["<code>DEST_COUNT</code>", "INT", "●", "0", "수신자 목록 개수 (Max 100)"],
                  ["<code>DEST_INFO</code>", "TEXT", "●", "", "수신자 정보 (이름^번호|이름^번호…)"],
                  ["<code>MSG_TYPE</code>", "INT", "●", "0", "메시지 포맷 (0:일반 TEXT, 1:HTML 지원)"],
                  ["<code>MMS_MSG</code>", "TEXT", "", "", "전송할 본문 내용 (최대 2000 byte)"],
                  ["<code>CONTENT_COUNT</code>", "INT", "●", "0", "첨부 컨텐츠 개수 (파일 없으면 0, 이미지 최대 3개)"],
                  ["<code>CONTENT_DATA</code>", "VARCHAR(250)", "", "", "첨부 정보 <code>파일명^타입^서브타입|…</code> (아래 스텝 참조)"],
                  ["<code>KT_OFFICE_CODE</code>", "VARCHAR(20)", "", "", "KT 유통망(전문점) 코드 — 있을 경우만 저장"],
                  ["<code>CDR_ID</code>", "VARCHAR(20)", "", "", "과금 지정 ID (미지정 시 로그인 SP_ID에 통합 과금)"],
                  ["<code>RESERVED1~9</code>", "VARCHAR(50)", "", "", "여분필드 1~9 (임의 사용 가능)"],
                  ["<code>SEND_STATUS</code>", "INT", "●", "0", "전송 처리 상태 — 입력 시 항상 0 (아래 표 참조)"],
                  ["<code>SEND_COUNT</code>", "INT", "●", "0", "메시지 서버로 전송 횟수 (최대 3회 재시도)"],
                  ["<code>SEND_RESULT</code>", "INT", "●", "0", "전송 결과 서버 ACK 값"],
                  ["<code>SEND_PROC_TIME</code>", "VARCHAR(20)", "", "", "서버 전송 처리 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>STD_ID</code>", "VARCHAR(50)", "", "", "타 규격 연동 시 Agent 내부 사용"],
                  ["<code>KISA_ORIG_CODE</code>", "VARCHAR(9)", "", "", "최초 발신 사업자코드"],
                ],
              },
              {
                label: "SEND_STATUS 값 (전송 처리 상태 · INSERT 시 항상 0)",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0</code>", "메시지 입력"],
                  ["<code>1</code>", "Agent 처리 시작 (Fetch)"],
                  ["<code>2</code>", "서버 전송 중"],
                  ["<code>3</code>", "발송 완료 (Row 삭제 후 REPORT로 이동)"],
                  ["<code>-1</code>", "발송 실패 또는 데이터 COPY 실패"],
                  ["<code>-2</code>", "Report_detail 데이터 처리 후 실패"],
                ],
              },
            ],
            note: "주요 필드 — <b>SUBJECT</b>: 문자(SMS)와 달리 MMS는 제목이 단말에 표시됩니다. · <b>MMS_MSG</b>: 본문 최대 2000 byte. · <b>DEST_INFO</b>: <code>이름^번호|이름^번호</code> 형식, 전화번호 숫자만(<code>-</code> 제외), 동보 시 <code>DEST_COUNT</code> 와 개수 일치(최대 100). · <b>MSG_TYPE</b>: 보통 <code>0</code>(일반 TEXT). · <b>CDR_ID</b>: 다수의 발송 ID(SP_ID)를 가진 경우 특정 ID로 과금, 미지정 시 로그인 SP_ID에 통합 과금.",
          },
          {
            title: "첨부 컨텐츠 — CONTENT_DATA · 이미지 규격",
            body: "MMS로 이미지를 보낼 때는 <code>CONTENT_COUNT</code> 에 개수를, <code>CONTENT_DATA</code> 에 파일 정보를 입력합니다. <code>MMS_MSG</code>(텍스트)는 ① 텍스트만 ② 이미지만 ③ 텍스트+이미지 <b>세 가지 조합 모두</b> 가능합니다.",
            list: [
              "<b>CONTENT_DATA 형식</b> — <code>파일명^컨텐츠타입^컨텐츠서브타입</code>, 파일이 2개 이상이면 <code>|</code> 로 구분",
              "예) 단일 <code>test.jpg^1^0</code>, 다중 <code>test1.jpg^1^0 | test2.jpg^1^0</code>",
              "<b>컨텐츠 위치</b> — Agent의 MMS 파일 디렉토리 기준 경로(<code>img/2015/test.jpg^1^0</code>), 또는 <code>http/https</code> 로 시작하는 URL도 사용 가능(<code>https://www.test.com/test.jpg^1^0</code>)",
              "<b>첨부 개수</b> — 이미지 파일 <b>최대 3개</b>",
            ],
            tables: [
              {
                label: "CONTENT 타입 / 서브타입",
                cols: ["구분", "값"],
                colWidths: ["38%", "62%"],
                rows: [
                  ["컨텐츠 타입", "<code>1</code> = IMAGE"],
                  ["서브타입 [IMAGE]", "<code>0</code> = JPG"],
                ],
              },
              {
                label: "컨텐츠 사이즈 제한",
                cols: ["구분", "제한"],
                colWidths: ["38%", "62%"],
                rows: [
                  ["본문 (MMS_MSG)", "<b>최대 2000 byte</b> (LMS·MMS 공통)"],
                  ["IMAGE (JPG)", "개당 300 KB 미만, 해상도 <b>1500 × 1440 미만 (1499×1439 까지)</b>"],
                  ["권장", "이미지 개당 25~30 KB 적당"],
                ],
              },
              {
                label: "제목(SUBJECT) 최대 길이 (euc-kr 기준)",
                cols: ["구분", "제목 최대", "비고"],
                colWidths: ["34%", "20%", "46%"],
                rows: [
                  ["<b>★ 스마트메시지 발송 규격</b>", "<b>64 byte</b>", "<b>수신 이통사와 무관하게 64 byte 이내로 작성</b>"],
                  ["KT", "64 byte", "—"],
                  ["SKT", "40 byte", "OMA 규격 — 40 byte 초과분은 단말에서 달리 보일 수 있음"],
                  ["LGU+", "256 byte", "스마트메시지는 64 byte로 처리됨"],
                ],
              },
            ],
            note: "해상도·용량을 초과하면 이통사 등록 실패 또는 단말에서 이미지가 표시되지 않을 수 있습니다. · 제목(SUBJECT)은 <b>스마트메시지 발송 규격 64 byte(euc-kr) 이내</b>로 작성하세요(초과 시 잘리거나 실패 처리될 수 있음). <i>(MMS 사이즈 정보는 매뉴얼 v1.6에서 갱신된 규격입니다.)</i>",
          },
          {
            title: "SDK_MMS_REPORT — 발송 결과 테이블",
            body: "발송 요청 처리가 완료되면 <code>SDK_MMS_SEND</code> 의 내용이 이 테이블로 이동하며, JOB 단위로 성공·실패 건수가 집계됩니다. (SEND 테이블의 입력 필드는 그대로 보관됩니다.)",
            table: {
              cols: ["컬럼", "타입", "필수", "기본값", "설명"],
              rows: [
                ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값 (SEND 테이블과 동일)"],
                ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                ["<code>JOB_ID</code>", "BIGINT", "●", "0", "서버에서 관리되는 고유 ID 값"],
                ["<code>SUCC_COUNT</code>", "INT", "●", "0", "메시지 등록 성공 개수"],
                ["<code>FAIL_COUNT</code>", "INT", "●", "0", "메시지 등록 실패 개수"],
                ["<code>MSG_TYPE</code>", "INT", "●", "0", "메시지 포맷 (0:일반 TEXT, 1:HTML 지원)"],
                ["<code>SUBJECT</code> · <code>MMS_MSG</code> · <code>CONTENT_DATA</code> · <code>DEST_INFO</code> 등", "—", "", "", "SEND 테이블의 입력값을 그대로 보관"],
                ["<code>STD_ID</code> · <code>KISA_ORIG_CODE</code>", "—", "", "", "타 규격 연동값 · 최초 발신 사업자코드"],
              ],
            },
          },
          {
            title: "SDK_MMS_REPORT_DETAIL — 수신자별 상세 결과",
            body: "동보 전송 시 <b>수신자별</b> 전송 결과·요금·이통사·확인(읽음) 시간이 적재되는 테이블입니다. 전송 결과 확인 시에는 <code>TCS_RESULT</code> 값을 참조합니다.",
            tables: [
              {
                label: "SDK_MMS_REPORT_DETAIL 필드",
                cols: ["컬럼", "타입", "필수", "기본값", "설명"],
                rows: [
                  ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값 (SEND 테이블과 동일)"],
                  ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                  ["<code>JOB_ID</code>", "BIGINT", "●", "0", "서버에서 관리되는 고유 ID 값"],
                  ["<code>SUBJOB_ID</code>", "INT", "●", "0", "동보 전송일 경우 세부 메시지 ID"],
                  ["<code>SEND_DATE</code>", "VARCHAR(16)", "", "", "발송 희망 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>DEST_NAME</code>", "VARCHAR(20)", "", "", "수신자 이름 (DEST_INFO 참조)"],
                  ["<code>PHONE_NUMBER</code>", "VARCHAR(20)", "", "", "수신자 전화번호 (DEST_INFO 참조)"],
                  ["<code>RESULT</code>", "INT", "●", "0", "전송 결과값 (기존 SDK 제공)"],
                  ["<code>TCS_RESULT</code>", "INT", "●", "-2,NULL", "신규 서버 제공 상세 전송 결과값 (응답코드 참조)"],
                  ["<code>DELIVER_DATE</code>", "VARCHAR(20)", "", "", "MMS 전달 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>READ_TIME</code>", "VARCHAR(20)", "", "", "수신자가 메시지를 확인한 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>MOBILE_INFO</code>", "INT", "", "", "단말기의 이통사 구분 (아래 표 참조)"],
                  ["<code>FEE</code>", "INT", "", "", "요금"],
                  ["<code>REPORT_RES_DATE</code>", "VARCHAR(20)", "", "", "리포트 서버로부터 응답 받은 날짜"],
                  ["<code>STAT_STATUS</code>", "INT", "●", "0", "통계 처리 상태 (아래 표 참조)"],
                  ["<code>STIME</code>", "VARCHAR(16)", "", "", "KT → 이통사 메시지 발송 시간"],
                  ["<code>RTIME</code>", "VARCHAR(16)", "", "", "이통사 → KT 리포트 수신 시간"],
                  ["<code>STATUS_TEXT</code>", "VARCHAR(200)", "", "", "전송결과 부가정보 (이통사 스팸차단 등)"],
                  ["<code>SEND_SPID</code>", "VARCHAR(100)", "", "", "이중화 구조 사용 시 발송 계정 SP_ID"],
                ],
              },
              {
                label: "MOBILE_INFO (단말기 이통사 구분)",
                cols: ["값", "이통사"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>1</code>", "SKT"],
                  ["<code>2</code>", "KT (KTF)"],
                  ["<code>3</code>", "LGU+"],
                ],
              },
              {
                label: "STAT_STATUS (통계 처리 상태)",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0</code>", "초기 입력 (EARLY)"],
                  ["<code>1</code>", "통계 처리 시작 (Fetch)"],
                  ["<code>2</code>", "통계 처리 중 (PROC)"],
                  ["<code>3</code>", "통계 처리 완료 (COMPLETE)"],
                ],
              },
            ],
            note: "<b>READ_TIME</b> 은 MMS에서 수신자가 메시지를 확인한 시각입니다(읽음 확인). · <b>MOBILE_INFO</b> 의 이통사 코드값은 문자(SMS)의 <code>TELCOINFO</code>(01690 등)와 <b>체계가 다릅니다</b> — MMS는 <code>1·2·3</code> 을 사용합니다. · <b>TCS_RESULT</b> 가 상세 결과값이며, <code>RESULT</code> 는 기존 SDK 호환 결과값입니다.",
          },
          {
            title: "통계 테이블 — SDK_SEND_STAT",
            body: "시간(시) 단위로 유형별 발송·성공 건수를 집계하는 통계 테이블입니다. (문자·음성·팩스·MMS 공통 사용)",
            table: {
              cols: ["컬럼", "설명"],
              colWidths: ["48%", "52%"],
              rows: [
                ["<code>SEND_YEAR · SEND_MONTH · SEND_DAY · SEND_HOUR</code>", "집계 기준 연·월·일·시"],
                ["<code>USER_ID</code>", "회원 ID (업체별 구분용)"],
                ["<code>MMS_TOTAL</code> · <code>MMS_SUCC</code>", "장문(MMS) 발송 건수 · 성공 건수"],
                ["<code>SMS_TOTAL</code> · <code>SMS_SUCC</code>", "문자 발송 건수 · 성공 건수"],
                ["<code>VMS_TTS / VMS_FILE / VMS_MSTG / VMS_SP _TOTAL·SUCC</code>", "음성(TTS·FILE·시나리오·SMS PLUS) 건수 · 성공 건수"],
                ["<code>FMS_TOTAL</code> · <code>FMS_SUCC</code>", "팩스 발송 건수 · 성공 건수"],
              ],
            },
          },
          {
            title: "샘플 INSERT 쿼리",
            cta: { href: "#/agent/mcs?sec=step-smart-install-13", label: "발송 쿼리 생성기 열기 (설치 가이드)", icon: "sparkle" },
            body: "매뉴얼에서 제공하는 LMS(텍스트)·MMS(이미지) 발송 샘플입니다. (값을 채워 바로 만들려면 ‘1. 설치 가이드’ 탭의 <b>발송 쿼리 생성기</b>를 이용하세요.)",
            codeTabs: [
              {
                name: "MySQL·MS-SQL · LMS",
                code:
                  "-- LMS (텍스트만, CONTENT_COUNT=0)\n" +
                  "INSERT INTO SDK_MMS_SEND\n" +
                  "  (USER_ID, SCHEDULE_TYPE, SUBJECT, NOW_DATE, SEND_DATE, CALLBACK,\n" +
                  "   DEST_COUNT, DEST_INFO, MSG_TYPE, MMS_MSG, CONTENT_COUNT, CONTENT_DATA)\n" +
                  "VALUES\n" +
                  "  ('testid', 0, 'MMS Test', '201701010000', '201701010000', '01011112222',\n" +
                  "   1, 'mjkim^01011112222', 0, 'MMS 테스트입니다.', 0, '');",
              },
              {
                name: "MySQL·MS-SQL · MMS(이미지)",
                code:
                  "-- MMS (이미지 첨부, CONTENT_COUNT=1)\n" +
                  "INSERT INTO SDK_MMS_SEND\n" +
                  "  (USER_ID, SCHEDULE_TYPE, SUBJECT, NOW_DATE, SEND_DATE, DEST_COUNT, DEST_INFO,\n" +
                  "   MSG_TYPE, MMS_MSG, CONTENT_COUNT, CONTENT_DATA, CALLBACK)\n" +
                  "VALUES\n" +
                  "  ('testid', 0, 'MMS테스트', '201701010000', '201701010000', 1, 'test5^01011112222',\n" +
                  "   0, 'MMS JPG 테스트입니다', 1, 'test2.jpg^1^0', '01011112222');",
              },
              {
                name: "Oracle · LMS",
                code:
                  "-- LMS (텍스트만, MSG_ID = SDK_MMS_SEQ.nextval)\n" +
                  "INSERT INTO SDK_MMS_SEND\n" +
                  "  (MSG_ID, USER_ID, SCHEDULE_TYPE, SUBJECT, NOW_DATE, SEND_DATE, CALLBACK,\n" +
                  "   DEST_COUNT, DEST_INFO, MSG_TYPE, MMS_MSG, CONTENT_COUNT, CONTENT_DATA)\n" +
                  "VALUES\n" +
                  "  (SDK_MMS_SEQ.nextval, 'testid', 0, 'MMS Test', '201701010000', '201701010000',\n" +
                  "   '01011112222', 1, 'mjkim^01011112222', 0, 'MMS 테스트입니다.', 0, '');",
              },
              {
                name: "Oracle · MMS(이미지)",
                code:
                  "-- MMS (이미지 첨부, MSG_ID = SDK_MMS_SEQ.nextval)\n" +
                  "INSERT INTO SDK_MMS_SEND\n" +
                  "  (MSG_ID, USER_ID, SCHEDULE_TYPE, SUBJECT, NOW_DATE, SEND_DATE, DEST_COUNT, DEST_INFO,\n" +
                  "   MSG_TYPE, MMS_MSG, CONTENT_COUNT, CONTENT_DATA, CALLBACK)\n" +
                  "VALUES\n" +
                  "  (SDK_MMS_SEQ.nextval, 'testid', 0, 'MMS테스트', '201701010000', '201701010000',\n" +
                  "   1, 'test5^01011112222', 0, 'MMS JPG 테스트입니다', 1, 'test2.jpg^1^0', '01011112222');",
              },
            ],
            note: "<code>NOW_DATE</code> · <code>SEND_DATE</code> 는 <code>YYYYMMDDHHMMSS</code> 형식입니다. Oracle은 <code>MSG_ID</code> 에 반드시 <code>SDK_MMS_SEQ.nextval</code> 을 사용하세요. <i>(매뉴얼 원문의 Oracle 이미지 예시에는 <code>SDK_SMS_SEQ</code> 오타가 있으나, MMS는 <code>SDK_MMS_SEQ</code> 가 정확합니다.)</i> 이미지는 <code>CONTENT_DATA</code> 에 <code>파일명^1^0</code> 형식으로 입력합니다.",
          },
          {
            title: "응답코드 — TCS_RESULT",
            body: "전송 결과는 <code>SDK_MMS_REPORT_DETAIL.TCS_RESULT</code> 값으로 확인합니다. (<code>RESULT</code> 가 ‘기타에러’인 경우 <code>TCS_RESULT</code> 를 참조). 문자(SMS)와 공통 코드체계이며, <code>2100</code> 번대가 MMS 전용 결과코드입니다.",
            table: {
              cols: ["TCS_RESULT", "설명", "결과"],
              rows: [
                ["<code>-2, NULL</code>", "리포트 수신 전 임시코드 (Agent 4.0.0+ NULL, 이전 -2)", "대기"],
                ["<code>0</code>", "발송 성공", "성공"],
                ["<code>1</code>", "시스템 장애", "전송 실패"],
                ["<code>2</code>", "인증 실패 (인증파일 없음)", "로그인 실패"],
                ["<code>3</code>", "메시지 형식 오류 (규격 불일치)", "로그인 실패"],
                ["<code>5</code>", "인증티켓 유효성 오류 (비밀번호·SPID 틀림)", "로그인 실패"],
                ["<code>7</code>", "SP(가입자) 패스워드 틀림", "로그인 실패"],
                ["<code>8</code>", "SP(가입자) 일시정지", "로그인 실패"],
                ["<code>9</code>", "SP(가입자) 해지", "로그인 실패"],
                ["<code>10</code>", "End-User 존재하지 않음·해지·정지", "로그인 실패"],
                ["<code>16</code>", "시간 종료", "전송 실패"],
                ["<code>17</code>", "권한 없음 (접근 가능 IP 외 접속)", "로그인 실패"],
                ["<code>27</code>", "가입되지 않은 상품 발송", "전송 실패"],
                ["<code>33</code>", "월간 메시지 전송 개수 초과", "전송 실패"],
                ["<code>90</code>", "동보 개수 초과 (Agent 내부)", "전송 실패"],
                ["<code>91</code>", "데이터 형식 오류 (Agent 내부)", "전송 실패"],
                ["<code>92~96</code>", "첨부파일/업로드/Convert/다운로드 오류 (Agent 내부)", "전송 실패"],
                ["<code>99</code>", "발송 전 오류 (Agent 내부)", "전송 실패"],
                ["<code>101</code>", "메시지 내용 스팸", "전송 실패"],
                ["<code>102</code>", "발신자 스팸", "전송 실패"],
                ["<code>103</code>", "착신자 스팸", "전송 실패"],
                ["<code>104</code>", "회신번호 스팸", "전송 실패"],
                ["<code>108</code>", "동일 메시지 제한", "전송 실패"],
                ["<code>111</code>", "동일 착번 제한", "전송 실패"],
                ["<code>112</code>", "레포트 수신 시간 만료 (전송 후 24시간 미수신)", "전송 실패"],
                ["<code>114</code>", "번호도용/변작방지 차단", "전송 실패"],
                ["<code>115</code>", "미등록 회신번호 차단", "전송 실패"],
                ["<code>116</code>", "번호세칙 위반 차단", "전송 실패"],
                ["<code>200~211</code>", "통화중·무응답·결번·전원꺼짐·음영·Full·번호이동·기간만료 등", "전송 실패"],
                ["<code>212~216, 221~222</code>", "SKT 가입자 관련 오류 (가입자 없음·Sub Type·자리수 등)", "전송 실패(SKT)"],
                ["<code>213</code>", "NPDB 오류", "전송 실패"],
                ["<code>226</code>", "CallbackURL 사용자 아님", "전송 실패"],
                ["<code>227, 228</code>", "착신번호 에러 (자리수 / 없는 번호)", "전송 실패"],
                ["<code>400, 403, 404, 486, 487</code>", "VMS/FMS — 잘못된 요청·금지·사용자 없음·통화중·미응답", "VMS/FMS 실패"],
                ["<code>500, 503, 504, 600, 603</code>", "VMS/FMS — SIP 서버 오류·서비스 불가·시간종료·모두사용중·거부", "VMS/FMS 실패"],
                ["<code>2100, 2101, 2103</code>", "MMS — 포맷 오류·올바르지 않은 컨텐츠·미지원 단말", "MMS 실패"],
                ["<code>2104, 2106, 2107, 2152</code>", "MMS — 컨텐츠 크기 초과·발신/착신번호 오류·Content-Type 오류", "MMS 실패"],
                ["<code>4305, 4404, 5300</code>", "MMS — 비가용폰·CALLBACK 스팸·단말기 수신 불가", "MMS 실패"],
              ],
            },
            note: "<code>2100</code> 번대 이상이 MMS 전용 결과코드입니다(컨텐츠 크기·Content-Type·미지원 단말 등). 전체 코드 정의는 매뉴얼 ‘4. 응답코드 – TCS_RESULT’ 를 참조하세요.",
          },
        ],
      },
      {
        id: "vms",
        name: "4. 음성(VMS)",
        intro: "음성(VMS) 발송에 사용하는 DB 테이블·필드, 음성 구성(머리말·본문·맺음말)과 답변받기·상담원 연결, 샘플 INSERT 쿼리, 전송 응답코드(TCS_RESULT)를 안내합니다. (출처: MCS_Agent_Manual_음성메시지 v1.5)",
        steps: [
          {
            title: "개요 · 음성(VMS) 발송 흐름",
            body: "음성 메시지는 <code>SDK_VMS_SEND</code> 테이블에 INSERT하여 발송합니다. 발송 방식(TTS·음성파일·설문조사 등)은 <code>MSG_SUBTYPE</code> 으로 구분합니다.",
            tables: [
              {
                label: "MSG_SUBTYPE — 음성 발송 타입",
                cols: ["값", "음성 내용", "설명"],
                colWidths: ["28%", "24%", "48%"],
                rows: [
                  ["<code>30</code>", "TTS", "Text를 음성으로 변환하여 재생"],
                  ["<code>31</code>", "음성 파일", "Alaw PCM 음성파일을 로컬에서 크로샷 서버로 업로드 후 재생"],
                  ["<code>32</code>", "설문조사 (다단계)", "다단계 설문조사 음성 — 다단계 파일 생성 규칙 파일을 만들어 재생"],
                  ["<code>33</code>", "서버 등록 음성파일", "서버에 이미 업로드된 파일을 재생"],
                ],
              },
              {
                label: "관련 테이블",
                cols: ["테이블", "역할", "설명"],
                colWidths: ["28%", "24%", "48%"],
                rows: [
                  ["<code>SDK_VMS_SEND</code>", "발송 요청", "본문·수신자·음성 구성을 INSERT. 완료 시 Row 삭제 후 REPORT로 이동"],
                  ["<code>SDK_VMS_REPORT</code>", "발송 결과(집계)", "JOB 단위 성공·실패 건수"],
                  ["<code>SDK_VMS_REPORT_DETAIL</code>", "수신자별 상세 결과", "수신자별 결과·청취 시간·답변(DTMF)·요금"],
                ],
              },
            ],
            note: "Oracle은 <code>MSG_ID</code> 에 시퀀스 <code>SDK_VMS_SEQ.nextval</code> 을 사용합니다. <i>(매뉴얼 원문 필드설명에는 <code>SDK_MMS_SEQ</code> 오타가 있으나, VMS는 <code>SDK_VMS_SEQ</code> 가 정확합니다.)</i>",
          },
          {
            title: "SDK_VMS_SEND — 발송 요청 테이블",
            body: "음성 메시지 발송을 요청하는 테이블입니다. 발송 타입(<code>MSG_SUBTYPE</code>)에 따라 사용하는 필드가 달라집니다(TTS는 <code>TTS_MSG</code>, 파일은 <code>ATTACH_FILE</code>).",
            tables: [
              {
                label: "SDK_VMS_SEND 필드 (● = NotNull 필수)",
                cols: ["컬럼", "타입", "필수", "기본값", "설명"],
                rows: [
                  ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값. Oracle은 <code>SDK_VMS_SEQ.nextval</code> 사용"],
                  ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                  ["<code>MSG_SUBTYPE</code>", "INT", "●", "0", "발송 타입 (30:TTS, 31:음성파일, 32:설문, 33:서버파일)"],
                  ["<code>SCHEDULE_TYPE</code>", "INT", "●", "0", "발송시점 (0:즉시, 1:예약)"],
                  ["<code>DEST_TYPE</code>", "INT", "●", "0", "수신자 저장 타입 (0:TEXT 고정)"],
                  ["<code>MENT_TYPE</code>", "INT", "●", "0", "머리말·본문·맺음말 재생 타입 (아래 스텝)"],
                  ["<code>VOICE_TYPE</code>", "INT", "●", "0", "TTS 음성 변환 (0:여성, 1:남성)"],
                  ["<code>SUBJECT</code>", "VARCHAR(50)", "", "", "제목 (구분용, 실제 발송 시 서버로 전송 안 됨)"],
                  ["<code>NOW_DATE</code>", "VARCHAR(20)", "", "", "DB 입력 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>SEND_DATE</code>", "VARCHAR(20)", "", "", "발송 희망 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>CALLBACK</code>", "VARCHAR(20)", "", "", "회신번호(발신번호), 숫자만"],
                  ["<code>REPLY_TYPE</code>", "INT", "●", "0", "답변받기 (0:사용 안 함, 1:사용)"],
                  ["<code>REPLY_COUNT</code>", "INT", "●", "0", "답변받기 번호 범위 (최대 번호)"],
                  ["<code>COUNSELOR_DTMF</code>", "INT", "●", "0", "상담원 연결 시 누르는 번호 (보통 0)"],
                  ["<code>COUNSELOR_NUMBER</code>", "VARCHAR(20)", "", "", "연결할 상담원 전화번호 (숫자만)"],
                  ["<code>RELISTEN_COUNT</code>", "INT", "", "0", "재청취 횟수 (McsAgent에서는 미사용)"],
                  ["<code>KT_OFFICE_CODE</code>", "VARCHAR(20)", "", "", "KT 유통망(전문점) 코드"],
                  ["<code>CDR_ID</code>", "VARCHAR(20)", "", "", "과금 지정 ID (미지정 시 로그인 SP_ID에 통합 과금)"],
                  ["<code>SMSPLUS_MSG</code>", "VARCHAR(100)", "", "", "기존 SDK 참고 (미사용)"],
                  ["<code>HEADER_MSG</code>", "VARCHAR(150)", "", "", "음성 머리말 (TEXT 템플릿 또는 업로드 파일, 아래 스텝)"],
                  ["<code>TAIL_MSG</code>", "VARCHAR(150)", "", "", "음성 맺음말 (서버 업로드 파일만)"],
                  ["<code>TTS_MSG</code>", "TEXT", "", "", "TTS 변환 텍스트 (최대 1000 byte = 한글 500자)"],
                  ["<code>DEST_COUNT</code>", "INT", "●", "0", "수신자 목록 개수 (Max 100)"],
                  ["<code>DEST_INFO</code>", "TEXT", "●", "", "수신자 정보 (이름^번호|…)"],
                  ["<code>ATTACH_FILE</code>", "TEXT", "●", "", "첨부 음성/다단계 파일명 (아래 스텝, 미사용 시 빈 값)"],
                  ["<code>RESERVED1~9</code>", "VARCHAR(50)", "", "", "여분필드 1~9 (임의 사용 가능)"],
                  ["<code>SEND_STATUS</code>", "INT", "●", "0", "전송 처리 상태 — 입력 시 항상 0"],
                  ["<code>SEND_COUNT</code>", "INT", "●", "0", "메시지 서버로 전송 횟수 (최대 3회 재시도)"],
                  ["<code>SEND_RESULT</code>", "INT", "●", "0", "전송 결과 서버 ACK 값"],
                  ["<code>SEND_PROC_TIME</code>", "VARCHAR(20)", "", "", "서버 전송 처리 시간"],
                  ["<code>STD_ID</code>", "VARCHAR(50)", "", "", "타 규격 연동 시 Agent 내부 사용"],
                ],
              },
              {
                label: "SEND_STATUS 값 (전송 처리 상태 · INSERT 시 항상 0)",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0</code>", "메시지 입력"],
                  ["<code>1</code>", "Agent 처리 시작 (Fetch)"],
                  ["<code>2</code>", "서버 전송 중"],
                  ["<code>3</code>", "발송 완료 (Row 삭제 후 REPORT로 이동)"],
                  ["<code>-1</code>", "발송 실패 또는 데이터 COPY 실패"],
                  ["<code>-2</code>", "Report_detail 데이터 처리 후 실패"],
                ],
              },
            ],
            note: "<code>ATTACH_FILE</code> 은 스키마상 NotNull이지만 <b>TTS(30) 발송 시에는 사용하지 않습니다</b>(빈 값). · <code>DEST_INFO</code> 는 <code>이름^번호|이름^번호</code> 형식, 전화번호는 숫자만(<code>-</code> 제외). · <code>CDR_ID</code> 는 다수의 발송 ID(SP_ID)를 가진 경우 특정 ID로 과금하는 기능입니다.",
          },
          {
            title: "음성 구성 — 머리말·본문·맺음말 (MENT_TYPE · VOICE_TYPE)",
            body: "크로샷 음성 메시지는 <b>머리말 · 본문 · 맺음말</b>로 구성됩니다. <code>MENT_TYPE</code> 이 재생 구조를, <code>VOICE_TYPE</code> 이 TTS 음성(성별)을 결정합니다.",
            tables: [
              {
                label: "MENT_TYPE — 머리말·본문·맺음말 재생 타입",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0</code>", "본문만 사용 (머리말·맺음말 미사용)"],
                  ["<code>1</code>", "머리말 + 본문 (맺음말 미사용) — 머리말 → DTMF 수집 → 본문"],
                  ["<code>2</code>", "머리말·본문·맺음말 모두 사용자 지정 — 머리말 → DTMF 수집 → 본문 → 맺음말"],
                  ["<code>3</code>", "크로샷 기본 머리말 + 본문 + 맺음말 — 일반전화: 본문→맺음말 / 이동통신: 기본머리말→DTMF→본문→맺음말"],
                  ["<code>4</code>", "크로샷 기본 머리말 + 본문 — 일반전화: 본문 / 이동통신: 기본머리말→DTMF→본문"],
                ],
              },
              {
                label: "VOICE_TYPE — TTS 음성",
                cols: ["값", "음성"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0</code>", "여성 목소리"],
                  ["<code>1</code>", "남성 목소리"],
                ],
              },
            ],
            list: [
              "<b>HEADER_MSG</b> (머리말, 150byte) — 템플릿 <code>$TEXT$</code> (1회·70byte 제한) 또는 크로샷 서버에 업로드된 파일 경로를 입력. <code>$TEXT$</code> 는 <code>DEST_INFO</code> 의 전화번호 뒤 문장으로 대체됨 (개인화)",
              "<b>TAIL_MSG</b> (맺음말, 150byte) — 크로샷 서버에 이미 업로드된 파일만 사용 가능",
              "<b>TTS_MSG</b> — 음성으로 변환할 TEXT, 최대 <b>1000 byte(한글 500자)</b>",
            ],
            note: "크로샷 기본 머리말(MENT_TYPE 3·4)은 “메시지가 도착했습니다. 메시지를 청취하시려면 아무 버튼이나 눌러주세요”이며, 청취자가 전화기 버튼을 눌러야 본문이 재생됩니다. <br>템플릿 예) <code>HEADER_MSG: $TEXT$</code> + <code>DEST_INFO: 홍길동^01012345678^홍길동님 안녕하세요.|</code> → 전화번호 뒤 문장이 머리말로 재생됩니다.",
          },
          {
            title: "답변받기 · 상담원 연결",
            nav: "답변·상담원",
            body: "음성 메시지는 수신자 응답(DTMF)을 받거나, ‘0’ 버튼으로 상담원에 연결할 수 있습니다.",
            list: [
              "<b>답변받기</b> — <code>REPLY_TYPE</code> 를 <code>1</code> 로 설정하고, <code>REPLY_COUNT</code> 에 답변 범위의 <b>최대 번호</b>를 입력(예: 1·2·3 선택지면 3). 사용 안 하면 둘 다 <code>0</code>",
              "<b>상담원 연결</b> — <code>COUNSELOR_DTMF</code> 에 <code>0</code>(누를 번호), <code>COUNSELOR_NUMBER</code> 에 상담원 전화번호(숫자만) 입력",
            ],
            note: "답변받기 예) “만족도를 선택해주세요. 1번 만족, 2번 보통, 3번 불만족” → <code>REPLY_TYPE=1</code>, <code>REPLY_COUNT=3</code>. 수집된 답변은 결과 테이블의 <code>REPLIED_DTMF</code> 에 저장됩니다. · 음성/다단계 첨부 파일 규격은 아래 ‘발송 파일 규격’ 스텝을 참고하세요.",
          },
          {
            title: "TTS 작성법 — 발음·억양 태그 (DioTTS)",
            body: "TTS 발송(<code>MSG_SUBTYPE=30</code>, <code>TTS_MSG</code>)에서 텍스트를 음성으로 변환할 때, 아래 태그로 읽기 속도·음량·발음·날짜/숫자 읽기 등을 제어할 수 있습니다.",
            tables: [
              {
                label: "Tag 작성 형식",
                cols: ["형식", "예시", "설명"],
                rows: [
                  ["<code>&lt;tag&gt; text &lt;/tag&gt;</code>", "<code>&lt;syll&gt; apple &lt;/syll&gt;</code>", "값 없이 기능만 적용"],
                  ["<code>&lt;tag=\"값\"&gt;</code>", "<code>&lt;pause=\"1000\"&gt;</code>", "값을 직접 지정"],
                  ["<code>&lt;tag=\"값\"&gt; text &lt;/tag&gt;</code>", "<code>&lt;speed=\"150\"&gt; apple &lt;/speed&gt;</code>", "지정 범위에 적용"],
                  ["<code>&lt;tag 속성=\"값\"&gt; text &lt;/tag&gt;</code>", "<code>&lt;date format=\"yyyymmdd\"&gt; 20150624 &lt;/date&gt;</code>", "별도 속성값 적용"],
                ],
              },
              {
                label: "사용 가능 태그 (한국어 기준)",
                cols: ["태그", "문법 예시", "설명 · 값"],
                rows: [
                  ["<code>speed</code>", "<code>&lt;speed=\"150\"&gt;…&lt;/speed&gt;</code>", "읽기 속도. 50~200 (기본 100), ±값·±% 도 가능"],
                  ["<code>volume</code>", "<code>&lt;volume=\"120\"&gt;…&lt;/volume&gt;</code>", "음량. 0~200 (기본 100)"],
                  ["<code>pitch</code>", "<code>&lt;pitch=\"110\"&gt;…&lt;/pitch&gt;</code>", "음 높이. 80~120 (기본 100)"],
                  ["<code>emphasis</code>", "<code>&lt;emphasis level=\"strong\"&gt;…&lt;/emphasis&gt;</code>", "강조. level = strong / moderate"],
                  ["<code>pause</code>", "<code>&lt;pause=\"1000\"&gt;</code>", "묵음 삽입. 100~10000(ms). <code>\"1000ms\"</code>·<code>\"1s\"</code> 표기 가능"],
                  ["<code>syll</code>", "<code>&lt;syll&gt;ABC123&lt;/syll&gt;</code>", "한 자씩 읽기 → ‘에이 비 씨 일 이 삼’"],
                  ["<code>isyll</code>", "<code>&lt;isyll&gt;ABC123&lt;/isyll&gt;</code>", "한 자씩 끊어 읽기"],
                  ["<code>date</code>", "<code>&lt;date format=\"yyyymmdd\"&gt;20150624&lt;/date&gt;</code>", "날짜로 읽기. 8자리 yyyymmdd / 6자리 yymmdd / 4자리 mmdd"],
                  ["<code>time</code>", "<code>&lt;time format=\"hhmmss\"&gt;122530&lt;/time&gt;</code>", "시간(24시간)으로 읽기. h·m·s, 구분자 ‘:’"],
                  ["<code>digit</code>", "<code>&lt;digit&gt;1012&lt;/digit&gt;</code>", "숫자를 한 자리씩(또는 format 지정 자리)로 끊어 읽기"],
                  ["<code>money</code>", "<code>&lt;money type=\"3\"&gt;1012061530&lt;/money&gt;</code>", "금액으로 읽기. 3자리마다 끊어 읽음 (type 1·3·4)"],
                ],
              },
            ],
            list: [
              "대소문자 구분 없음 · 모든 <code>값</code>은 <code>\"\"</code> 안에 입력",
              "<code>&lt;/tag&gt;</code> 는 범위를 지정할 때만 사용",
              "<b>중첩(nested) 미지원</b> — 예: <code>&lt;speed=\"150\"&gt; S1 &lt;speed=\"80\"&gt; S2 &lt;/speed&gt; S3 &lt;/speed&gt;</code> 에서 S3는 기본값으로 합성됨",
              "<code>date · time · digit · money</code> 의 숫자에는 <code>,</code>(콤마)·<code>.</code>(온점)이 없어야 함",
            ],
            note: "출처: TTS 고객 작성법 Tag 설명서 (DioTTS). 한국어(KO_KR) 사용 가능 태그만 정리했으며, <code>break · spell · wpron · phoneme · sub</code> 등은 한국어 발송에는 적용되지 않습니다.",
          },
          {
            title: "다단계 시나리오 (MSTG)",
            body: "다단계 음성 시나리오는 <code>MSG_SUBTYPE=32</code> 로 발송하며, <code>ATTACH_FILE</code> 에 <code>*.mstg</code> 시나리오 파일명을 지정합니다. NODE_TYPE이라는 단위 기능을 조합해 <b>음성 재생·설문조사·상담원 연결·답변 녹음</b> 시나리오를 구성합니다.",
            tables: [
              {
                label: "NODE_TYPE — 시나리오 노드 종류",
                cols: ["값", "기능"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>1</code>", "음성 Play"],
                  ["<code>2</code>", "음성 Play + DTMF 1개 수집"],
                  ["<code>3</code>", "음성 Play + DTMF 여러 개 수집"],
                  ["<code>4</code>", "답변 녹음"],
                  ["<code>5</code>", "상담원 연결"],
                ],
              },
              {
                label: "MENT_TYPE — 노드의 음성 소스",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>1</code>", "업로드한 PCM 파일 경로 (예: <code>/TCSMSG/…/test.pcm</code>)"],
                  ["<code>2</code>", "TTS 텍스트 (MENT_INFO에 읽을 텍스트 입력)"],
                ],
              },
            ],
            list: [
              "파일 확장자는 반드시 <code>.mstg</code>, 문자코드는 ASCII",
              "첫 줄에 <code>TOTAL_NODE_COUNT</code>(전체 노드 수), 이후 노드 수만큼 노드 정보를 기록",
              "필드 구분자는 <code>|</code> — 메시지 내용에 <code>|</code> 가 포함되면 안 됨",
              "분기(NEXT_NODE): <code>1^2:2^3:3^4</code> = DTMF 1·2·3 → 각각 2·3·4번 노드로 이동 / 단일 번호면 유효 DTMF 입력 시 해당 노드로 이동",
            ],
            widget: "mstgExamples",
            note: "위 예제는 탭으로 골라 확인할 수 있습니다. 출처: Xroshot VMS 다단계 시나리오 설명서. <code>.mstg</code> 파일은 규칙에 맞게 직접 작성하며, 구성이 복잡하면 모노에 문의하세요.",
          },
          {
            title: "SDK_VMS_REPORT — 발송 결과 테이블",
            body: "발송 요청 처리가 완료되면 <code>SDK_VMS_SEND</code> 의 내용이 이 테이블로 이동하며, JOB 단위로 성공·실패 건수가 집계됩니다. (SEND 테이블의 입력 필드는 그대로 보관됩니다.)",
            table: {
              cols: ["컬럼", "타입", "필수", "기본값", "설명"],
              rows: [
                ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값 (SEND 테이블과 동일)"],
                ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                ["<code>JOB_ID</code>", "BIGINT", "●", "0", "서버에서 관리되는 고유 ID 값"],
                ["<code>SUCC_COUNT</code>", "INT", "●", "0", "메시지 등록 성공 개수"],
                ["<code>FAIL_COUNT</code>", "INT", "●", "0", "메시지 등록 실패 개수"],
                ["<code>MSG_SUBTYPE</code> · <code>MENT_TYPE</code> · <code>TTS_MSG</code> · <code>DEST_INFO</code> 등", "—", "", "", "SEND 테이블의 입력값을 그대로 보관"],
              ],
            },
            note: "<code>CANCEL_STATUS · CANCEL_COUNT · CANCEL_REQ_DATE · CANCEL_RESULT</code> 필드는 과거 SDK에서 사용하던 필드로 <b>현재는 사용하지 않습니다.</b> 오류 방지를 위해 Schema에만 추가되어 있습니다.",
          },
          {
            title: "SDK_VMS_REPORT_DETAIL — 수신자별 상세 결과",
            body: "동보 전송 시 <b>수신자별</b> 전송 결과·청취 시간·답변(DTMF)·요금이 적재되는 테이블입니다. 전송 결과 확인 시에는 <code>TCS_RESULT</code> 값을 참조합니다.",
            tables: [
              {
                label: "SDK_VMS_REPORT_DETAIL 필드",
                cols: ["컬럼", "타입", "필수", "기본값", "설명"],
                rows: [
                  ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값 (SEND 테이블과 동일)"],
                  ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                  ["<code>JOB_ID</code>", "BIGINT", "●", "0", "서버에서 관리되는 고유 ID 값"],
                  ["<code>SUBJOB_ID</code>", "INT", "●", "0", "동보 전송일 경우 세부 메시지 ID (1, 2, 3…)"],
                  ["<code>SEND_DATE</code>", "VARCHAR(20)", "●", "", "발송 희망 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>DEST_NAME</code>", "VARCHAR(20)", "●", "", "수신자 이름"],
                  ["<code>PHONE_NUMBER</code>", "VARCHAR(20)", "●", "", "수신자 전화번호"],
                  ["<code>RESULT</code>", "INT", "●", "0", "전송 결과값 (기존 SDK 제공)"],
                  ["<code>TCS_RESULT</code>", "INT", "●", "-2,NULL", "신규 서버 제공 상세 전송 결과값 (응답코드 참조)"],
                  ["<code>STIME</code>", "VARCHAR(20)", "", "", "호 연결 시간"],
                  ["<code>RTIME</code>", "VARCHAR(20)", "", "", "음성 메시지 청취 시작 시간"],
                  ["<code>FEE</code>", "FLOAT", "", "", "요금"],
                  ["<code>DURATION</code>", "INT", "●", "0", "음성 메시지 청취 시간 (요금과 관련)"],
                  ["<code>REPLIED_DTMF</code>", "INT", "●", "0", "답변받기 사용 시 받은 답변 값"],
                  ["<code>REPLIED_FILE</code>", "VARCHAR(250)", "", "", "답변 파일 (다단계 설문 답변 포함)"],
                  ["<code>REPORT_STATUS · REPORT_COUNT · REPORT_REQ_DATE · REPORT_RES_DATE</code>", "—", "", "", "리포트 수집 상태·요청 횟수·요청/응답 날짜"],
                  ["<code>MSG_SUBJOB_TYPE</code>", "INT", "", "", "메시지 Sub Job Type (아래 표 참조)"],
                  ["<code>STAT_STATUS</code>", "INT", "●", "0", "통계 처리 상태"],
                  ["<code>STATUS_TEXT</code>", "VARCHAR(200)", "", "", "전송결과 부가정보 (스팸차단 등)"],
                  ["<code>SEND_SPID</code>", "VARCHAR(100)", "", "", "이중화 구조 사용 시 발송 계정 SP_ID"],
                ],
              },
              {
                label: "MSG_SUBJOB_TYPE (메시지 종류)",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0x01</code>", "문자 메시지"],
                  ["<code>0x02</code>", "음성 메시지 (TTS)"],
                  ["<code>0x03</code>", "음성 메시지 (FILE)"],
                  ["<code>0x05</code>", "팩스 메시지"],
                  ["<code>0x0D</code>", "음성 메시지 (다단계 설문)"],
                ],
              },
            ],
            note: "<b>DURATION</b>(청취 시간)은 음성 요금 산정과 관련됩니다. · <b>REPLIED_DTMF</b> 는 답변받기(REPLY_TYPE=1) 사용 시 수신자가 누른 번호입니다. · <b>TCS_RESULT</b> 가 상세 결과값이며 <code>RESULT</code> 는 기존 SDK 호환 결과값입니다.",
          },
          {
            title: "통계 테이블 — SDK_SEND_STAT",
            body: "시간(시) 단위로 유형별 발송·성공 건수를 집계하는 통계 테이블입니다. (문자·음성·팩스·MMS 공통 사용)",
            table: {
              cols: ["컬럼", "설명"],
              colWidths: ["48%", "52%"],
              rows: [
                ["<code>SEND_YEAR · SEND_MONTH · SEND_DAY · SEND_HOUR</code>", "집계 기준 연·월·일·시"],
                ["<code>USER_ID</code>", "회원 ID (업체별 구분용)"],
                ["<code>VMS_TTS_TOTAL / SUCC</code>", "음성 TTS 발송 건수 · 성공 건수"],
                ["<code>VMS_FILE_TOTAL / SUCC</code>", "음성 File 발송 건수 · 성공 건수"],
                ["<code>VMS_MSTG_TOTAL / SUCC</code>", "시나리오(다단계) 발송 건수 · 성공 건수"],
                ["<code>VMS_SP_TOTAL / SUCC</code>", "SMS PLUS 발송 건수 · 성공 건수"],
                ["<code>SMS_ · FMS_ · MMS_TOTAL/SUCC</code>", "문자·팩스·장문 발송/성공 건수 (공통 컬럼)"],
              ],
            },
          },
          {
            title: "발송 파일 규격 — 음성(PCM) · 다단계(MSTG)",
            nav: "발송 파일 규격",
            body: "음성/다단계 파일은 <code>ATTACH_FILE</code> 에 파일명을 지정하며, 여러 파일은 <code>|</code> 로 구분합니다. 사용 가능한 확장자는 아래 두 가지뿐입니다.",
            tables: [
              {
                label: "사용 가능 파일",
                cols: ["용도", "확장자", "규격"],
                colWidths: ["26%", "16%", "58%"],
                rows: [
                  ["음성 파일", "<code>.pcm</code>", "CCITT A-Law · 8 KHz · mono · 64 kbps"],
                  ["다단계 시나리오", "<code>.mstg</code>", "ASCII (작성 규칙은 ‘다단계 시나리오’ 스텝 참조)"],
                ],
              },
            ],
            list: [
              "<b><code>.wav · .mp3</code> 등은 미지원</b> — <code>.wav</code>로 발송하면 전송(통화 연결)은 성공 처리되더라도 음성이 <b>묵음으로 재생</b>되므로 반드시 <code>.pcm</code>으로 변환해 사용하세요.",
              "<b>ATTACH_FILE</b> — 음성 파일 또는 다단계 시나리오 파일명. 여러 파일은 <code>|</code> 로 구분",
            ],
            note: "TTS 발송(<code>MSG_SUBTYPE=30</code>)은 파일이 아닌 <code>TTS_MSG</code> 텍스트를 사용하므로 첨부 파일이 필요 없습니다.",
          },
          {
            title: "샘플 INSERT 쿼리",
            cta: { href: "#/agent/mcs?sec=step-smart-install-13", label: "발송 쿼리 생성기 열기 (설치 가이드)", icon: "sparkle" },
            body: "매뉴얼에서 제공하는 음성 발송 샘플입니다. 발송 타입(TTS·다단계·서버파일)에 따라 사용하는 필드가 다릅니다. (값을 채워 만들려면 ‘1. 설치 가이드’ 탭의 <b>발송 쿼리 생성기</b> 참고)",
            codeTabs: [
              {
                name: "MySQL·MS-SQL · TTS",
                code:
                  "-- TTS 발송 (MSG_SUBTYPE=30)\n" +
                  "INSERT INTO SDK_VMS_SEND\n" +
                  "  (USER_ID, MSG_SUBTYPE, VOICE_TYPE, SCHEDULE_TYPE, SUBJECT, NOW_DATE,\n" +
                  "   SEND_DATE, CALLBACK, TTS_MSG, MENT_TYPE, DEST_COUNT, DEST_INFO)\n" +
                  "VALUES\n" +
                  "  ('testid', 30, 0, 0, 'vms 테스트', '201701010000',\n" +
                  "   '201701010000', '01022221111', '즉시 발송 음성 메시지', 4, 1, 'test^01011112222');",
              },
              {
                name: "MySQL·MS-SQL · 서버파일",
                code:
                  "-- 서버 등록 음성파일 발송 (MSG_SUBTYPE=33, ATTACH_FILE = 서버 경로)\n" +
                  "INSERT INTO SDK_VMS_SEND\n" +
                  "  (USER_ID, MSG_SUBTYPE, MENT_TYPE, SCHEDULE_TYPE, DEST_TYPE, VOICE_TYPE, SUBJECT,\n" +
                  "   NOW_DATE, SEND_DATE, CALLBACK, REPLY_TYPE, REPLY_COUNT, DEST_COUNT, DEST_INFO, ATTACH_FILE)\n" +
                  "VALUES\n" +
                  "  ('testid', 33, 0, 0, 0, 1, '테스트', '201701010000', '201701010000',\n" +
                  "   '01011112222', 0, 0, 1, 'test^01022221111', '/TCSMSG/default/ars/ars_groupmsg_succ.pcm');",
              },
              {
                name: "MySQL·MS-SQL · 다단계(MSTG)",
                code:
                  "-- 다단계 시나리오 발송 (MSG_SUBTYPE=32, .mstg 파일)\n" +
                  "INSERT INTO SDK_VMS_SEND\n" +
                  "  (USER_ID, MSG_SUBTYPE, MENT_TYPE, SCHEDULE_TYPE, DEST_TYPE, VOICE_TYPE, SUBJECT,\n" +
                  "   NOW_DATE, SEND_DATE, CALLBACK, DEST_COUNT, DEST_INFO, ATTACH_FILE)\n" +
                  "VALUES\n" +
                  "  ('testid', 32, 0, 0, 0, 1, '테스트', '201701010000', '201701010000',\n" +
                  "   '01011112222', 1, 'test^01022221111', 'test4.mstg');",
              },
              {
                name: "Oracle · TTS",
                code:
                  "-- TTS 발송 (MSG_ID = SDK_VMS_SEQ.nextval)\n" +
                  "INSERT INTO SDK_VMS_SEND\n" +
                  "  (MSG_ID, USER_ID, MSG_SUBTYPE, VOICE_TYPE, SCHEDULE_TYPE, SUBJECT, NOW_DATE,\n" +
                  "   SEND_DATE, CALLBACK, TTS_MSG, MENT_TYPE, DEST_COUNT, DEST_INFO)\n" +
                  "VALUES\n" +
                  "  (SDK_VMS_SEQ.nextval, 'testid', 30, 0, 0, 'vms 테스트', '201701010000',\n" +
                  "   '201701010000', '01022221111', '즉시 발송 음성 메시지', 4, 1, 'test^01011112222');",
              },
            ],
            note: "발송 타입(<code>MSG_SUBTYPE</code>) — <b>30</b>:TTS, <b>31</b>:음성파일(로컬 업로드), <b>32</b>:다단계(설문), <b>33</b>:서버 등록 음성파일. 서버 파일/다단계는 <code>ATTACH_FILE</code> 에 파일명 또는 서버 경로를, TTS는 <code>TTS_MSG</code> 에 본문을 입력합니다. Oracle은 <code>MSG_ID</code> 에 <code>SDK_VMS_SEQ.nextval</code> 을 사용하세요. <i>(매뉴얼 원문 예시에는 ‘서버 파일’ 샘플의 <code>MSG_SUBTYPE</code> 이 다단계와 같은 <code>32</code> 로, Oracle 다단계 예시 시퀀스가 <code>SDK_SMS_SEQ</code> 로 적힌 오기가 있어 각각 <code>33</code> · <code>SDK_VMS_SEQ</code> 로 바로잡았습니다.)</i>",
          },
          {
            title: "응답코드 — TCS_RESULT",
            body: "전송 결과는 <code>SDK_VMS_REPORT_DETAIL.TCS_RESULT</code> 값으로 확인합니다. (<code>RESULT</code> 가 ‘기타에러’인 경우 <code>TCS_RESULT</code> 참조). 음성은 <code>400</code> 번대 SIP 코드가 주요 실패 사유입니다. 아래는 <b>음성에서 자주 보는 코드 발췌</b>이며, 전체 코드는 ‘6. 응답코드’ 탭에서 봅니다.",
            table: {
              cols: ["TCS_RESULT", "설명", "결과"],
              rows: TCS_VF,
            },
            cta: { href: "#/agent/mcs?sec=step-smart-tcs-1", label: "전체 응답코드(TCS_RESULT) 보기", icon: "hash" },
            note: "음성(VMS) 발송 실패는 주로 <code>400</code> 번대(SIP) 코드로 표시됩니다 — 통화중·미응답·SIP 서버 오류 등.",
          },
        ],
      },
      {
        id: "fms",
        name: "5. 팩스(FMS)",
        intro: "팩스(FMS) 발송·수신에 사용하는 DB 테이블·필드, 스캔 가능 파일, 샘플 INSERT 쿼리, 전송 응답코드(TCS_RESULT)를 안내합니다. (출처: MCS_Agent_Manual_팩스메시지 v1.4)",
        steps: [
          {
            title: "개요 · 팩스(FMS) 발송 흐름",
            body: "팩스는 <code>SDK_FMS_SEND</code> 테이블에 발송할 문서 파일을 지정해 INSERT합니다. 로컬 파일을 업로드하거나(<code>MSG_SUBTYPE=20</code>), 서버에 이미 업로드된 파일을 사용(<code>21</code>)할 수 있습니다.",
            tables: [
              {
                label: "MSG_SUBTYPE — 팩스 발송 타입 (기본값 20)",
                cols: ["값", "팩스 내용", "설명"],
                colWidths: ["28%", "24%", "48%"],
                rows: [
                  ["<code>20</code>", "팩스 파일 (로컬)", "로컬에 있는 문서를 프로그램에서 업로드"],
                  ["<code>21</code>", "서버 업로드 파일", "이미 크로샷 서버에 업로드한 문서 사용"],
                ],
              },
              {
                label: "관련 테이블",
                cols: ["테이블", "역할", "설명"],
                colWidths: ["28%", "24%", "48%"],
                rows: [
                  ["<code>SDK_FMS_SEND</code>", "발송 요청", "수신자·첨부 문서를 INSERT. 완료 시 Row 삭제 후 REPORT로 이동"],
                  ["<code>SDK_FMS_REPORT</code>", "발송 결과(집계)", "JOB 단위 성공·실패 건수"],
                  ["<code>SDK_FMS_REPORT_DETAIL</code>", "수신자별 상세 결과", "수신자별 결과·팩스 페이지 수·요금"],
                  ["<code>SDK_FMS_RECEIVE</code>", "팩스 수신(MO)", "수신 팩스(TIF) 적재 — 03030 통신번호 신청 시"],
                ],
              },
            ],
            note: "Oracle은 <code>MSG_ID</code> 에 시퀀스 <code>SDK_FMS_SEQ.nextval</code> 을 사용합니다. <i>(매뉴얼 원문 필드설명에는 <code>SDK_MMS_SEQ</code> 오타가 있으나, FMS는 <code>SDK_FMS_SEQ</code> 가 정확합니다.)</i> 발송 가능한 문서 형식은 ‘발송 파일 규격’ 스텝을 참고하세요.",
          },
          {
            title: "SDK_FMS_SEND — 발송 요청 테이블",
            body: "팩스 발송을 요청하는 테이블입니다. <code>ATTACH_FILE</code> 에 보낼 문서 파일을 지정합니다.",
            tables: [
              {
                label: "SDK_FMS_SEND 필드 (● = NotNull 필수)",
                cols: ["컬럼", "타입", "필수", "기본값", "설명"],
                rows: [
                  ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값. Oracle은 <code>SDK_FMS_SEQ.nextval</code> 사용"],
                  ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                  ["<code>MSG_SUBTYPE</code>", "INT", "●", "20", "팩스 발송 타입 (20:로컬 파일, 21:서버 업로드)"],
                  ["<code>SCHEDULE_TYPE</code>", "INT", "●", "0", "발송시점 (0:즉시, 1:예약)"],
                  ["<code>DEST_TYPE</code>", "INT", "●", "0", "수신자 저장 타입 (0:TEXT 고정)"],
                  ["<code>SUBJECT</code>", "VARCHAR(50)", "", "", "제목 (구분용, 실제 발송 시 서버로 전송 안 됨)"],
                  ["<code>NOW_DATE</code>", "VARCHAR(20)", "", "", "DB 입력 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>SEND_DATE</code>", "VARCHAR(20)", "", "", "발송 희망 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>CALLBACK</code>", "VARCHAR(20)", "", "", "회신번호(발신번호), 숫자만"],
                  ["<code>KT_OFFICE_CODE</code>", "VARCHAR(20)", "", "", "KT 유통망(전문점) 코드"],
                  ["<code>CDR_ID</code>", "VARCHAR(20)", "", "", "과금 지정 ID (미지정 시 로그인 SP_ID에 통합 과금)"],
                  ["<code>DEST_COUNT</code>", "INT", "●", "0", "수신자 목록 개수 (Max 100)"],
                  ["<code>DEST_INFO</code>", "TEXT", "●", "", "수신자 정보 (이름^번호|…)"],
                  ["<code>ATTACH_FILE</code>", "TEXT", "●", "", "보낼 팩스 문서 파일명 (최대 20byte, 여러 파일은 <code>;</code> 구분)"],
                  ["<code>RESERVED1~9</code>", "VARCHAR(50)", "", "", "여분필드 1~9 (임의 사용 가능)"],
                  ["<code>SEND_STATUS</code>", "INT", "●", "0", "전송 처리 상태 — 입력 시 항상 0"],
                  ["<code>SEND_COUNT</code>", "INT", "●", "0", "서버 전송 실패 시 재전송 회수 (최대 3회)"],
                  ["<code>SEND_RESULT</code>", "INT", "●", "0", "전송결과 서버 ACK 값"],
                  ["<code>SEND_PROC_TIME</code>", "VARCHAR(20)", "", "", "서버 전송 처리 시간"],
                  ["<code>STD_ID</code>", "VARCHAR(50)", "", "", "타 규격 연동 시 Agent 내부 사용"],
                ],
              },
              {
                label: "SEND_STATUS 값 (전송 처리 상태 · INSERT 시 항상 0)",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0</code>", "메시지 입력"],
                  ["<code>1</code>", "Agent 처리 시작 (Fetch)"],
                  ["<code>2</code>", "서버 전송 중"],
                  ["<code>3</code>", "발송 완료 (Row 삭제 후 REPORT로 이동)"],
                  ["<code>-1</code>", "발송 실패 또는 데이터 COPY 실패"],
                  ["<code>-2</code>", "Report_detail 데이터 처리 후 실패"],
                ],
              },
            ],
            note: "<b>ATTACH_FILE</b> — 보낼 문서 파일명. 여러 파일을 보낼 때 구분자는 <code>;</code> 입니다(음성 VMS의 <code>|</code> 와 다름). 파일명 길이는 최대 20byte입니다. · <code>DEST_INFO</code> 는 <code>이름^번호|이름^번호</code> 형식, 전화번호는 숫자만(<code>-</code> 제외).",
          },
          {
            title: "SDK_FMS_REPORT — 발송 결과 테이블",
            body: "발송 요청 처리가 완료되면 <code>SDK_FMS_SEND</code> 의 내용이 이 테이블로 이동하며, JOB 단위로 성공·실패 건수가 집계됩니다. (SEND 테이블의 입력 필드는 그대로 보관됩니다.)",
            table: {
              cols: ["컬럼", "타입", "필수", "기본값", "설명"],
              rows: [
                ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값 (SEND 테이블과 동일)"],
                ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                ["<code>JOB_ID</code>", "BIGINT", "●", "0", "서버에서 관리되는 고유 ID 값"],
                ["<code>SUCC_COUNT</code>", "INT", "●", "0", "메시지 전송 성공 개수"],
                ["<code>FAIL_COUNT</code>", "INT", "●", "0", "메시지 전송 실패 개수"],
                ["<code>MSG_SUBTYPE</code> · <code>ATTACH_FILE</code> · <code>DEST_INFO</code> 등", "—", "", "", "SEND 테이블의 입력값을 그대로 보관"],
              ],
            },
            note: "<code>CANCEL_STATUS · CANCEL_COUNT · CANCEL_REQ_DATE · CANCEL_RESULT</code> 필드는 과거 SDK에서 사용하던 필드로 <b>현재는 사용하지 않습니다.</b> 오류 방지를 위해 Schema에만 추가되어 있습니다.",
          },
          {
            title: "SDK_FMS_REPORT_DETAIL — 수신자별 상세 결과",
            body: "동보 전송 시 <b>수신자별</b> 전송 결과·팩스 페이지 수·요금이 적재되는 테이블입니다. 전송 결과 확인 시에는 <code>TCS_RESULT</code> 값을 참조합니다.",
            tables: [
              {
                label: "SDK_FMS_REPORT_DETAIL 필드",
                cols: ["컬럼", "타입", "필수", "기본값", "설명"],
                rows: [
                  ["<code>MSG_ID</code>", "BIGINT", "●", "", "고유 메시지 구분값 (SEND 테이블과 동일)"],
                  ["<code>USER_ID</code>", "VARCHAR(20)", "●", "", "회원 ID"],
                  ["<code>JOB_ID</code>", "BIGINT", "●", "0", "서버에서 관리되는 고유 ID 값"],
                  ["<code>SUBJOB_ID</code>", "INT", "●", "0", "동보 전송일 경우 세부 메시지 ID (1, 2, 3…)"],
                  ["<code>SEND_DATE</code>", "VARCHAR(20)", "●", "", "발송 희망 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>DEST_NAME</code>", "VARCHAR(20)", "●", "", "수신자 이름"],
                  ["<code>PHONE_NUMBER</code>", "VARCHAR(20)", "●", "", "수신자 전화번호"],
                  ["<code>RESULT</code>", "INT", "●", "0", "전송 결과값 (기존 SDK 제공)"],
                  ["<code>TCS_RESULT</code>", "INT", "", "-2,NULL", "신규 서버 제공 상세 전송 결과값 (응답코드 참조)"],
                  ["<code>DELIVER_DATE</code>", "VARCHAR(20)", "", "", "팩스 전달 시간 <code>YYYYMMDDHHMMSS</code>"],
                  ["<code>FEE</code>", "FLOAT", "", "", "요금"],
                  ["<code>FAX_PAGE</code>", "INT", "●", "0", "팩스 페이지 수"],
                  ["<code>REPORT_STATUS · REPORT_COUNT · REPORT_REQ_DATE · REPORT_RES_DATE</code>", "—", "", "", "리포트 수집 상태·요청 횟수·요청/응답 시간"],
                  ["<code>MSG_SUBJOB_TYPE</code>", "INT", "", "", "메시지 Sub Job Type (아래 표 참조)"],
                  ["<code>STAT_STATUS</code>", "INT", "●", "0", "통계 처리 상태"],
                  ["<code>STATUS_TEXT</code>", "VARCHAR(200)", "", "", "전송결과 부가정보 (스팸차단 등)"],
                  ["<code>SEND_SPID</code>", "VARCHAR(100)", "", "", "이중화 구조 사용 시 발송 계정 SP_ID"],
                ],
              },
              {
                label: "MSG_SUBJOB_TYPE (메시지 종류)",
                cols: ["값", "설명"],
                colWidths: ["16%", "84%"],
                rows: [
                  ["<code>0x01</code>", "문자 메시지"],
                  ["<code>0x02</code>", "음성 메시지 (TTS)"],
                  ["<code>0x03</code>", "음성 메시지 (FILE)"],
                  ["<code>0x05</code>", "팩스 메시지"],
                  ["<code>0x0D</code>", "음성 메시지 (다단계 설문)"],
                ],
              },
            ],
            note: "<b>FAX_PAGE</b> 는 발송된 팩스 페이지 수, <b>DELIVER_DATE</b> 는 실제 발송 시간입니다. · <b>TCS_RESULT</b> 가 상세 결과값이며 <code>RESULT</code> 는 기존 SDK 호환 결과값입니다.",
          },
          {
            title: "SDK_FMS_RECEIVE — 팩스 수신 테이블 (MO)",
            body: "MO 서비스 신청 시 <b>03030 통신번호</b>를 신청하여 팩스를 수신할 수 있습니다. 수신된 팩스(TIF 파일)가 이 테이블에 적재됩니다.",
            table: {
              cols: ["컬럼", "타입", "필수", "설명"],
              rows: [
                ["<code>JOB_ID</code>", "BIGINT", "●", "서버에서 관리하는 고유 ID 값"],
                ["<code>SUBJOB_ID</code>", "INT", "", "팩스 수신 시 1로 고정"],
                ["<code>ANI_NUMBER</code>", "VARCHAR(20)", "", "발신자 전화번호"],
                ["<code>DEST_NUMBER</code>", "VARCHAR(20)", "", "수신자 팩스번호"],
                ["<code>FILE_NAME</code>", "VARCHAR(250)", "", "팩스로 수신된 TIF 파일 이름"],
                ["<code>RESULT</code>", "INT", "●", "수신 결과 (기본 2)"],
                ["<code>TCS_RESULT</code>", "INT", "●", "상세 전송 결과값 (기본 -2)"],
                ["<code>STIME · RTIME · DURATION</code>", "VARCHAR", "", "호 연결·플레이 시간·통화(수신) 시간"],
                ["<code>FEE</code>", "FLOAT", "", "과금"],
                ["<code>FAX_PAGE</code>", "INT", "", "팩스 페이지 수"],
                ["<code>MSG_ID</code>", "INT", "", "각 업체에서 사용하는 유니크한 값"],
                ["<code>RECV_DATE</code>", "VARCHAR(20)", "", "수신한 날짜"],
                ["<code>STAT_STATUS</code>", "INT", "●", "통계 처리 상태 (기본 0 → 처리 후 1)"],
              ],
            },
            note: "팩스 수신은 <b>03030 MO 서비스 신청</b>이 필요합니다. 수신 파일은 <code>FILE_NAME</code> 의 TIF 파일로 저장됩니다. <code>UMS_MEMO · DEL_TM</code> 등은 기존 SDK 호환용 필드입니다.",
          },
          {
            title: "통계 테이블 — SDK_SEND_STAT · SDK_RECV_STAT",
            body: "시간(시) 단위로 발송·수신 건수를 집계하는 통계 테이블입니다.",
            tables: [
              {
                label: "SDK_SEND_STAT (발송 통계) 주요 컬럼",
                cols: ["컬럼", "설명"],
                colWidths: ["48%", "52%"],
                rows: [
                  ["<code>SEND_YEAR · SEND_MONTH · SEND_DAY · SEND_HOUR</code>", "집계 기준 연·월·일·시"],
                  ["<code>USER_ID</code>", "회원 ID (업체별 구분용)"],
                  ["<code>FMS_TOTAL</code> · <code>FMS_SUCC</code>", "팩스 발송 건수 · 성공 건수"],
                  ["<code>SMS_ · VMS_ · MMS_TOTAL/SUCC</code>", "문자·음성·장문 발송/성공 건수 (공통 컬럼)"],
                ],
              },
              {
                label: "SDK_RECV_STAT (수신 통계) 주요 컬럼",
                cols: ["컬럼", "설명"],
                colWidths: ["48%", "52%"],
                rows: [
                  ["<code>RECV_YEAR · RECV_MONTH · RECV_DAY · RECV_HOUR</code>", "집계 기준 연·월·일·시"],
                  ["<code>FMS_TOTAL</code>", "시간별 팩스 수신 건수"],
                  ["<code>SMS_TOTAL</code>", "시간별 문자 수신 건수"],
                ],
              },
            ],
          },
          {
            title: "발송 파일 규격 — 스캔 가능 문서",
            nav: "발송 파일 규격",
            body: "<code>ATTACH_FILE</code> 에 보낼 문서 파일명을 지정합니다. 발송(스캔) 가능한 파일 형식은 아래와 같습니다.",
            tables: [
              {
                label: "스캔 가능 파일 (ATTACH_FILE)",
                cols: ["구분", "확장자"],
                colWidths: ["20%", "80%"],
                rows: [
                  ["이미지", "bmp · gif · jpg · tif · tiff"],
                  ["문서", "doc · docx · xls · xlsx · ppt · pptx · htm · html · hwp · pdf"],
                ],
              },
            ],
            list: [
              "<b>ATTACH_FILE</b> — 파일명 최대 20byte. 여러 파일은 <code>;</code> 로 구분합니다 <i>(음성 VMS의 <code>|</code> 와 다름)</i>",
              "<b>MSG_SUBTYPE</b> — <code>20</code>:로컬 파일 업로드 / <code>21</code>:서버 업로드 파일 사용",
            ],
            note: "확장자가 <code>.tif</code> 라도 팩스 발송 규격(해상도·크기)에 맞지 않으면, KT 내부 팩스 변환 서버에서 재변환 후 발송됩니다.",
          },
          {
            title: "샘플 INSERT 쿼리",
            cta: { href: "#/agent/mcs?sec=step-smart-install-13", label: "발송 쿼리 생성기 열기 (설치 가이드)", icon: "sparkle" },
            body: "매뉴얼에서 제공하는 팩스 발송 샘플입니다. (값을 채워 만들려면 ‘1. 설치 가이드’ 탭의 <b>발송 쿼리 생성기</b> 참고)",
            codeTabs: [
              {
                name: "MySQL·MS-SQL · 즉시",
                code:
                  "-- 즉시 발송 (SCHEDULE_TYPE=0)\n" +
                  "INSERT INTO SDK_FMS_SEND\n" +
                  "  (USER_ID, MSG_SUBTYPE, SCHEDULE_TYPE, DEST_TYPE, SUBJECT, NOW_DATE, SEND_DATE,\n" +
                  "   CALLBACK, CDR_ID, DEST_COUNT, DEST_INFO, ATTACH_FILE)\n" +
                  "VALUES\n" +
                  "  ('testid', 20, 0, 0, '제목', '201701010000', '201701010000',\n" +
                  "   '021112222', '', 1, 'mjkim^022221111', 'myfax.doc');",
              },
              {
                name: "MySQL·MS-SQL · 예약",
                code:
                  "-- 예약 발송 (SCHEDULE_TYPE=1, SEND_DATE 시각에 발송)\n" +
                  "INSERT INTO SDK_FMS_SEND\n" +
                  "  (USER_ID, MSG_SUBTYPE, SCHEDULE_TYPE, DEST_TYPE, SUBJECT, NOW_DATE, SEND_DATE,\n" +
                  "   CALLBACK, CDR_ID, DEST_COUNT, DEST_INFO, ATTACH_FILE)\n" +
                  "VALUES\n" +
                  "  ('testid', 20, 1, 0, '제목', '201701010000', '201701011200',\n" +
                  "   '021112222', '', 1, 'mjkim^022221111', 'myfax.doc');",
              },
              {
                name: "Oracle · 즉시",
                code:
                  "-- 즉시 발송 (MSG_ID = SDK_FMS_SEQ.nextval)\n" +
                  "INSERT INTO SDK_FMS_SEND\n" +
                  "  (MSG_ID, USER_ID, MSG_SUBTYPE, SCHEDULE_TYPE, DEST_TYPE, SUBJECT, NOW_DATE,\n" +
                  "   SEND_DATE, CALLBACK, CDR_ID, DEST_COUNT, DEST_INFO, ATTACH_FILE)\n" +
                  "VALUES\n" +
                  "  (SDK_FMS_SEQ.nextval, 'testid', 20, 0, 0, '제목', '201701010000',\n" +
                  "   '201701010000', '021112222', '', 1, 'mjkim^022221111', 'myfax.doc');",
              },
            ],
            note: "<code>ATTACH_FILE</code> 에는 스캔 가능 문서(doc·pdf·hwp·jpg·tif 등)를 지정합니다. 여러 파일은 <code>;</code> 로 구분합니다. Oracle은 <code>MSG_ID</code> 에 <code>SDK_FMS_SEQ.nextval</code> 을 사용하세요.",
          },
          {
            title: "응답코드 — TCS_RESULT",
            body: "전송 결과는 <code>SDK_FMS_REPORT_DETAIL.TCS_RESULT</code> 값으로 확인합니다. (<code>RESULT</code> 가 ‘기타에러’인 경우 <code>TCS_RESULT</code> 참조). 팩스는 음성과 마찬가지로 <code>400</code> 번대 SIP 코드가 주요 실패 사유입니다. 아래는 <b>팩스에서 자주 보는 코드 발췌</b>이며, 전체 코드는 ‘6. 응답코드’ 탭에서 봅니다.",
            table: {
              cols: ["TCS_RESULT", "설명", "결과"],
              rows: TCS_VF,
            },
            cta: { href: "#/agent/mcs?sec=step-smart-tcs-1", label: "전체 응답코드(TCS_RESULT) 보기", icon: "hash" },
            note: "팩스(FMS) 발송 실패는 주로 <code>400</code> 번대(SIP) 코드로 표시됩니다.",
          },
        ],
      },
      {
        id: "tcs",
        name: "6. 응답코드(TCS_RESULT)",
        intro: "문자·멀티·음성·팩스 발송 결과(SDK_*_REPORT_DETAIL.TCS_RESULT)를 한곳에 모은 전체 응답코드표입니다. 코드 / 설명 / 결과로 정리했습니다.",
        steps: [
          {
            title: "전체 응답코드 (TCS_RESULT)",
            body: "발송 결과는 각 <code>SDK_SMS/MMS/VMS/FMS_REPORT_DETAIL</code> 테이블의 <code>TCS_RESULT</code> 값으로 확인합니다. (<code>RESULT</code> 가 ‘기타에러’인 경우 <code>TCS_RESULT</code> 참조)",
            table: {
              cols: ["TCS_RESULT", "설명", "결과"],
              rows: TCS_FULL,
            },
            note: "<code>2</code>~<code>17</code> 인증 계열은 발송 실패가 아니라 <b>접속(로그인) 단계</b> 오류입니다. <code>400</code> 번대(SIP)는 음성(VMS)·팩스(FMS), <code>2100</code> 번대 이상은 멀티(MMS) 전송 시 나타납니다.",
          },
          {
            title: "더 많은 코드 — KT 스마트메시지(Agent) 전체 에러코드",
            body: "위는 발송 결과(TCS_RESULT) 중심 요약입니다. 로그인·인증·발송요청 단계까지 포함한 <b>KT 스마트메시지(Agent) 전체 에러코드</b>는 결과코드 페이지에서 확인하세요. 코드 의미가 불확실하거나 차단 해제·인증파일 재발급 등이 필요하면 <b>모노커뮤니케이션즈</b>로 문의 바랍니다.",
            cta: { href: "#/codes?svc=mcs-agent", label: "결과코드 페이지 · KT 스마트메시지(Agent) 전체 에러코드 보기", icon: "hash" },
          },
        ],
      },
    ],
  };
})();

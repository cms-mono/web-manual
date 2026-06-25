/* ============================================================
   매뉴얼 셀 — KT MCS & X_MCS Agent × KT RCS (RCS 버전)
   ------------------------------------------------------------
   출처: MCS Agent Manual (RCS 버전) — 설치가이드 / 문자메시지(SMS)+RCS v1.6
        / 멀티미디어메시지(MMS)+RCS v1.8 (2023-07-04, ㈜다이얼로그스페이스)
        archive/창용's/스마트메시지biz/rcs버전/mcs/*_RCS.pdf
   ※ RCS 발송도 동일 MCS / X_MCS Agent를 사용하되, RCS 발송 기능이 추가된
     별도 설치 패키지(McsAgent-rcs / X_McsAgent-rcs)로 제공된다.
     기존 SDK_SMS_SEND / SDK_MMS_SEND 테이블에 RCS_* 컬럼을 채워 발송한다.
   ============================================================ */
(function () {
  "use strict";
  var C = (window.HUB_CONTENT = window.HUB_CONTENT || {});
  var A = (C["mcs"] = C["mcs"] || {});

  A["rcs"] = {
    navName: "MCS & X_MCS Agent-rcs", // 좌측 네비 대제목(에이전트 매뉴얼)
    intro: "RCS 발송도 동일한 MCS / X_MCS Agent를 사용합니다(RCS 발송 기능이 포함된 별도 설치 패키지). 기존 <code>SDK_SMS_SEND</code> · <code>SDK_MMS_SEND</code> 테이블에 <code>RCS_*</code> 컬럼을 채워 발송하며, 실패 시 기존 문자/멀티메시지로 Fallback할 수 있습니다.",
    download: { title: "MCS Agent (RCS) 매뉴얼 — 설치 / 문자 v1.6 / 멀티미디어 v1.8", meta: "PDF · 2023-07-04 · ㈜다이얼로그스페이스" },
    features: [
      /* ================= 1. 설치 · RCS 계정 설정 ================= */
      {
        id: "install",
        name: "1. 설치 · RCS 계정 설정",
        intro: "엔진 설치·네트워크(방화벽)·DB 객체 생성 절차는 ‘KT 스마트메시지’ 탭의 설치 가이드와 동일합니다. 여기서는 RCS 버전에서 추가되는 RCS 계정 설정만 안내합니다.",
        steps: [
          {
            title: "개요 — RCS 버전 Agent",
            body: "RCS 발송은 <b>스마트메시지와 동일한 MCS / X_MCS Agent</b>로 처리하되, <b>RCS 발송 기능이 포함된 별도 설치 패키지</b>(<code>McsAgent-rcs</code> / <code>X_McsAgent-rcs</code>)를 사용합니다. 발송은 기존 <code>SDK_SMS_SEND</code>(단문) · <code>SDK_MMS_SEND</code>(장문·멀티미디어) 테이블에 <code>RCS_*</code> 컬럼을 추가로 채워 요청합니다.",
            list: [
              "<b>발송 흐름</b> — 고객 시스템이 <code>SDK_*MS_SEND</code> 에 RCS 컬럼을 채워 INSERT → Agent가 RCS 서버로 발송 → 결과가 <code>SDK_*MS_REPORT_DETAIL</code> 의 <code>RCS_*</code> 컬럼에 적재",
              "<b>Fallback</b> — RCS 발송 실패 시 기존 문자(SMS/LMS/MMS)로 자동 전환 발송할 수 있습니다(<code>RCS_SEND_TYPE</code> = <code>RF</code>)",
              "<b>연동규격</b> — 설치 시 ‘연동규격’은 <b>2번 UMS SDK (KT-통합메시징)</b> 를 선택합니다(<code>SDK_*_SEND</code> 테이블 방식)",
            ],
            note: "엔진 설치 실행·DBMS 선택·DB 객체 생성·실행/종료·시험발송 등 공통 절차는 ‘KT 스마트메시지 → 1. 설치 가이드’와 동일합니다. 차이는 아래 ‘RCS 계정 설정’ 입력뿐입니다.",
            cta: { href: "#/agent/mcs?sec=step-smart-install-1", label: "공통 설치 절차 보기 (KT 스마트메시지 · 설치 가이드)", icon: "arrow" },
          },
          {
            title: "RCS 발송 사전 준비",
            body: "RCS를 발송하려면 <b>RCS Biz Center</b>에서 브랜드·에이전트가 등록되어 있어야 하고, RCS 계정 정보가 필요합니다.",
            list: [
              "<b>RCS Biz Center 등록</b> — RCS 브랜드(ChatBot) 및 메시지 템플릿(메시지베이스) 등록 (<code>rcsbizcenter.com</code>)",
              "<b>RCS 계정 ‘A2P 결과 처리 방식’</b> 은 반드시 <b>‘API 조회’</b> 로 설정되어야 합니다 (미설정 시 발송 결과를 수신하지 못함)",
              "<b>대행사(Agency) 고객</b> — RCS Biz Center에서 발급받은 <b>Agency ID / Agency Key</b> 가 필요하며, 발송 시 <code>RCS_BRAND_KEY</code>(BrandKey) 입력이 필수입니다",
              "<b>대표 발신번호</b> — RCS 브랜드의 대표 발신번호(<code>RCS_CHATBOT_ID</code>). 미입력 시 <code>CALLBACK</code> 값을 사용",
            ],
            note: "RCS 브랜드·템플릿 등록, BrandKey·메시지베이스 ID 발급은 RCS Biz Center에서 진행합니다. 구성이 복잡하면 모노커뮤니케이션즈로 문의하세요.",
          },
          {
            title: "설치 입력값 — RCS 계정 (설치 순서 10~13)",
            body: "RCS 버전 설치 스크립트(<code>installAgent</code>) 실행 시, 기존 입력 항목(센터·KT ID/PW·라이선스·이중화) 다음에 <b>RCS 계정 항목</b>이 추가로 입력됩니다.",
            table: {
              cols: ["순서", "입력 항목", "설명"],
              colWidths: ["12%", "30%", "58%"],
              rows: [
                ["10", "RCS ID", "RCS 계정 ID. <b>‘A2P 결과 처리 방식’ = ‘API 조회’</b> 로 설정된 계정이어야 함"],
                ["11", "RCS Password", "RCS 계정 비밀번호 (비밀번호 암호화 기능 사용 시 암호화 저장)"],
                ["12", "RCS Agency ID", "RCS Biz Center 발급 대행사 ID — 브랜드·대행사 권한 / 최초 발신사업자의 대행사 ID <i>(대행사 고객 필수)</i>"],
                ["13", "RCS Agency Key", "Agency ID와 매핑되는 대행사 Key <i>(대행사 고객 필수)</i>"],
              ],
            },
            note: "이후 항목(SMS/VMS/FMS/MMS 사용 여부, 발송금지 시간, REPORT 테이블 방식, RESERVED 컬럼 등)은 스마트메시지 설치와 동일합니다. 설치를 마치면 <code>config</code> 에 RCS 계정이 저장되며, 변경은 재설치 또는 설정 파일 수정 후 Agent 재시작으로 반영됩니다.",
          },
        ],
      },

      /* ================= 2. RCS 공통 규격 ================= */
      {
        id: "common",
        name: "2. RCS 공통 규격",
        intro: "문자형(RCSSMS)·멀티미디어형(RCSLMS·RCSMMS·RCSTMPL)에 공통으로 적용되는 발송 타입·상품 타입·헤더·버튼 규격입니다.",
        steps: [
          {
            title: "RCS 발송 타입 · Fallback (RCS_SEND_TYPE)",
            body: "<code>RCS_SEND_TYPE</code> 값으로 RCS 발송 여부와 실패 시 동작(Fallback)을 결정합니다.",
            table: {
              cols: ["값", "동작"],
              colWidths: ["18%", "82%"],
              rows: [
                ["<code>RF</code>", "RCS로 발송, <b>실패 시 기존 메시지(SMS/LMS/MMS)로 Fallback 발송</b>"],
                ["<code>RO</code>", "RCS로 발송, 실패 시 <b>Fallback 안 함</b>"],
                ["(미입력)", "RCS 발송하지 않고 <b>기존 문자/멀티메시지로 발송</b>"],
              ],
            },
            note: "Fallback 발송 결과는 <code>SDK_*MS_REPORT_DETAIL.TCS_RESULT</code> 에, RCS 발송 결과는 <code>RCS_ERROR_CODE</code> 에 적재됩니다(‘5. 결과·응답코드’ 참조). Fallback 시 사용할 본문은 기존 <code>SMS_MSG</code> / <code>MMS_MSG</code> 값입니다.",
          },
          {
            title: "RCS 상품 타입 (RCS_SERVICE_TYPE) · 사용 테이블",
            body: "RCS 상품 타입에 따라 사용하는 발송 테이블과 표현 형식이 다릅니다. 단문(RCSSMS)은 <code>SDK_SMS_SEND</code>, 장문·멀티미디어·템플릿은 <code>SDK_MMS_SEND</code> 를 사용합니다.",
            tables: [
              {
                label: "RCS 상품 타입",
                cols: ["상품 타입", "발송 테이블", "설명"],
                colWidths: ["20%", "26%", "54%"],
                rows: [
                  ["<code>RCSSMS</code>", "<code>SDK_SMS_SEND</code>", "단문 RCS (텍스트, 버튼 최대 1개)"],
                  ["<code>RCSLMS</code>", "<code>SDK_MMS_SEND</code>", "장문 RCS (첨부 없음, 버튼 최대 3개)"],
                  ["<code>RCSMMS</code>", "<code>SDK_MMS_SEND</code>", "멀티미디어 RCS — standalone(카드 1개) / carousel(복수 카드), 카드당 버튼 최대 2개"],
                  ["<code>RCSTMPL</code>", "<code>SDK_MMS_SEND</code>", "RCS Biz Center에 등록한 개별 템플릿으로 발송 (버튼 허용 안 함)"],
                ],
              },
            ],
            note: "<code>RCS_SERVICE_TYPE</code> 은 MMS 테이블 발송 시 지정하며 미입력 시 <code>RCSLMS</code> 입니다. SMS 테이블 발송은 항상 <code>RCSSMS</code> 입니다.",
          },
          {
            title: "공통 RCS 컬럼",
            body: "발송 타입과 무관하게 공통으로 쓰이는 RCS 컬럼입니다.",
            table: {
              cols: ["컬럼", "타입", "설명"],
              colWidths: ["26%", "20%", "54%"],
              rows: [
                ["<code>RCS_CHATBOT_ID</code>", "VARCHAR(40)", "RCS 브랜드의 대표 발신번호. 미입력 시 <code>CALLBACK</code> 사용"],
                ["<code>RCS_HEADER</code>", "CHAR(1)", "헤더(광고) 수록 여부 — <code>0</code>:안 함(기본), <code>1</code>:수록. <i>RCSTMPL은 <code>0</code> 필수</i>"],
                ["<code>RCS_FOOTER</code>", "VARCHAR(20)", "수신거부 전화번호. <code>RCS_HEADER=1</code> 이면 필수"],
                ["<code>RCS_COPY_ALLOWED</code>", "TINYINT", "단말 메시지 복사 허용 — <code>0</code>:안 함, <code>1</code>:허용(기본)"],
                ["<code>RCS_CDR_ID</code>", "VARCHAR(20)", "RCS ‘별도 과금’ 사용 시 과금할 ID"],
                ["<code>RCS_BRAND_KEY</code>", "VARCHAR(64)", "RBC 발급 BrandKey. <code>RCS_CHATBOT_ID</code> 와 불일치 시 통신사에서 실패 처리 <i>(대행사 고객 필수)</i>"],
              ],
            },
            note: "<code>RCS_DESC</code>(본문)는 동보 치환 기능을 지원합니다 — 본문에 <code>$TEXT$</code> 를 넣으면 <code>DEST_INFO</code> 에 입력한 순서대로 치환됩니다.",
          },
          {
            title: "버튼 규격 (RCS_BUTTON)",
            body: "버튼은 <b>타입 코드 + 타이틀</b>로 시작하고 이후 타입별 정보를 <code>|^|</code> 로 구분해 입력합니다. (기본 시간 형식 <code>yyyyMMddHHmmss</code>)",
            tables: [
              {
                label: "버튼 타입 / 형식",
                cols: ["코드", "기능", "형식 · 예시"],
                colWidths: ["10%", "22%", "68%"],
                rows: [
                  ["<code>U</code>", "웹페이지(기본 브라우저)", "<code>U|^|타이틀|^|웹주소</code><br>예) <code>U|^|주소 열기|^|https://kt.com</code>"],
                  ["<code>LB</code>", "메시지앱 내 브라우저", "<code>LB|^|타이틀|^|웹주소|^|halfView</code> (true=화면 일부 / false=전체)"],
                  ["<code>MQ</code>", "지도 — 키워드 질의", "<code>MQ|^|타이틀|^|키워드|^|fallback웹주소</code>"],
                  ["<code>ML</code>", "지도 — 위/경도", "<code>ML|^|타이틀|^|위도|^|경도|^|marker라벨|^|fallback웹주소</code>"],
                  ["<code>CA</code>", "일정 등록", "<code>CA|^|타이틀|^|시작시간|^|종료시간|^|제목|^|본문</code>"],
                  ["<code>CL</code>", "복사하기", "<code>CL|^|타이틀|^|복사할_text</code>"],
                  ["<code>CO</code>", "대화방 열기", "<code>CO|^|타이틀|^|전화번호|^|메시지_text</code>"],
                  ["<code>D</code>", "전화 연결", "<code>D|^|타이틀|^|전화번호</code>"],
                ],
              },
            ],
            list: [
              "<b>복수 버튼</b> — 각 버튼을 <code>|b|</code> 로 구분. 예) <code>U|^|주소 열기|^|https://kt.com|b|D|^|전화 걸기|^|01012345678</code>",
              "<b>카드별 버튼</b>(캐러셀) — 각 카드의 버튼은 <code>|c|</code> 로 구분. 중간에 버튼 없는 카드는 <code>|c||c|</code> 처럼 빈 값으로 표시",
              "<b>버튼 개수</b> — RCSSMS 최대 1개 · RCSLMS 최대 3개 · RCSMMS 카드당 최대 2개 · <b>RCSTMPL 허용 안 함</b>",
            ],
          },
        ],
      },

      /* ================= 3. 문자형 RCS (RCSSMS) ================= */
      {
        id: "rcssms",
        name: "3. 문자형 RCS (RCSSMS)",
        intro: "단문 RCS(RCSSMS)는 기존 <code>SDK_SMS_SEND</code> 테이블에 <code>RCS_*</code> 컬럼을 추가로 채워 발송합니다. (출처: MCS Agent 문자메시지(SMS)+RCS v1.6)",
        steps: [
          {
            title: "개요 — SDK_SMS_SEND 기반 RCS",
            body: "기존 SMS 발송과 동일하게 <code>SDK_SMS_SEND</code> 에 INSERT하되, <code>RCS_SEND_TYPE</code> 등 RCS 컬럼을 채우면 RCS(RCSSMS)로 발송됩니다. RCS 발송 실패 시 기존 SMS 본문(<code>SMS_MSG</code>)·회신번호(<code>CALLBACK</code>)로 Fallback됩니다.",
            note: "RCSSMS는 <b>버튼 최대 1개</b>, 본문(<code>RCS_DESC</code>) 최대 100자입니다. SMS 기본 필드(<code>USER_ID·SCHEDULE_TYPE·DEST_INFO</code> 등)는 ‘KT 스마트메시지 → 문자(SMS)’ 탭과 동일합니다.",
          },
          {
            title: "SDK_SMS_SEND — RCS 추가 컬럼",
            nav: "SDK_SMS_SEND · RCS 컬럼",
            body: "문자형 RCS 발송 시 사용하는 RCS 전용 컬럼입니다. (기존 SMS 컬럼은 그대로 사용)",
            table: {
              cols: ["컬럼", "타입", "설명"],
              colWidths: ["26%", "20%", "54%"],
              rows: [
                ["<code>RCS_SEND_TYPE</code>", "VARCHAR(2)", "RCS 발송 타입 (<code>RF</code>/<code>RO</code>, 미입력=기존 문자)"],
                ["<code>RCS_CHATBOT_ID</code>", "VARCHAR(40)", "RCS 대표 발신번호 (미입력 시 <code>CALLBACK</code>)"],
                ["<code>RCS_HEADER</code>", "CHAR(1)", "헤더(광고) 수록 여부 (0/1)"],
                ["<code>RCS_FOOTER</code>", "VARCHAR(20)", "수신거부 전화번호 (<code>RCS_HEADER=1</code> 시 필수)"],
                ["<code>RCS_COPY_ALLOWED</code>", "TINYINT", "메시지 복사 허용 (0/1, 기본 1)"],
                ["<code>RCS_DESC</code>", "VARCHAR(200)", "RCS 메시지 본문 (최대 100자, <code>$TEXT$</code> 동보 치환 지원)"],
                ["<code>RCS_BUTTON</code>", "VARCHAR(1000)", "RCS 버튼 (RCSSMS 최대 1개)"],
                ["<code>RCS_CDR_ID</code>", "VARCHAR(20)", "RCS 별도 과금 ID"],
                ["<code>RCS_BRAND_KEY</code>", "VARCHAR(64)", "RBC BrandKey (대행사 고객 필수)"],
              ],
            },
          },
          {
            title: "샘플 INSERT 쿼리 (RCSSMS)",
            body: "RCSSMS 발송 샘플입니다. <code>RCS_SEND_TYPE</code> 만 넣으면 기존 SMS 본문/회신번호로 RCS 발송(Fallback 포함)되고, RCS 컬럼을 채우면 RCS 전용 본문·버튼으로 발송됩니다.",
            codeTabs: [
              {
                name: "기본값 발송 (Fallback)",
                code:
                  "-- RCSSMS 발송, 실패 시 기존 SMS로 Fallback (기존 SMS_MSG·CALLBACK 사용)\n" +
                  "INSERT INTO SDK_SMS_SEND (\n" +
                  "  USER_ID, SCHEDULE_TYPE, SUBJECT, SMS_MSG, CALLBACK_URL,\n" +
                  "  NOW_DATE, SEND_DATE, CALLBACK, DEST_INFO,\n" +
                  "  RCS_SEND_TYPE\n" +
                  ") VALUES (\n" +
                  "  'testid', 0, '제목', '테스트메시지', '',\n" +
                  "  '202201010000', '202201010000', '01011112222', 'test^01011112222',\n" +
                  "  'RF'\n" +
                  ");",
              },
              {
                name: "RCSSMS 값 설정",
                code:
                  "-- RCS 전용 본문·버튼 지정\n" +
                  "INSERT INTO SDK_SMS_SEND (\n" +
                  "  USER_ID, SCHEDULE_TYPE, SUBJECT, SMS_MSG, CALLBACK_URL,\n" +
                  "  NOW_DATE, SEND_DATE, CALLBACK, DEST_INFO,\n" +
                  "  RCS_SEND_TYPE, RCS_CHATBOT_ID, RCS_HEADER, RCS_FOOTER, RCS_COPY_ALLOWED,\n" +
                  "  RCS_DESC, RCS_BUTTON\n" +
                  ") VALUES (\n" +
                  "  'testid', 0, '제목', '테스트메시지', '',\n" +
                  "  '202201010000', '202201010000', '01011112222', 'test^01011112222',\n" +
                  "  'RF', '0211112222', '1', '08011112222', 0,\n" +
                  "  'RCS 테스트 메시지', 'U|^|KT 홈페이지|^|https://kt.com'\n" +
                  ");",
              },
            ],
            note: "Oracle은 <code>MSG_ID</code> 에 <code>SDK_SMS_SEQ.nextval</code> 을 사용합니다. <code>RCS_HEADER=1</code>(광고) 이면 <code>RCS_FOOTER</code>(수신거부 번호)가 필수입니다.",
          },
        ],
      },

      /* ================= 4. 멀티미디어형 RCS ================= */
      {
        id: "rcsmms",
        name: "4. 멀티미디어형 RCS",
        intro: "장문(RCSLMS)·멀티미디어 카드/캐러셀(RCSMMS)·개별 템플릿(RCSTMPL)은 <code>SDK_MMS_SEND</code> 테이블에 <code>RCS_*</code> 컬럼을 채워 발송합니다. (출처: MCS Agent 멀티미디어메시지(MMS)+RCS v1.8)",
        steps: [
          {
            title: "개요 — SDK_MMS_SEND 기반 RCS",
            body: "<code>SDK_MMS_SEND</code> 에 INSERT하며 <code>RCS_SERVICE_TYPE</code> 으로 상품 타입(RCSLMS/RCSMMS/RCSTMPL)을 지정합니다. 실패 시 기존 LMS/MMS 본문(<code>MMS_MSG</code>)으로 Fallback됩니다.",
            note: "MMS 기본 필드(<code>MMS_MSG·CONTENT_COUNT·CONTENT_DATA</code> 등)는 ‘KT 스마트메시지 → 멀티메시지(LMS·MMS)’ 탭과 동일합니다. 본문(<code>RCS_DESC</code>)은 RCSLMS 최대 1300자, RCSMMS 카드별 최대 1300자입니다.",
          },
          {
            title: "SDK_MMS_SEND — RCS 추가 컬럼",
            nav: "SDK_MMS_SEND · RCS 컬럼",
            body: "멀티미디어형 RCS 발송 시 사용하는 RCS 전용 컬럼입니다.",
            table: {
              cols: ["컬럼", "타입", "설명"],
              colWidths: ["28%", "18%", "54%"],
              rows: [
                ["<code>RCS_SEND_TYPE</code>", "VARCHAR(2)", "RCS 발송 타입 (<code>RF</code>/<code>RO</code>, 미입력=기존 메시지)"],
                ["<code>RCS_SERVICE_TYPE</code>", "VARCHAR(10)", "상품 타입 (<code>RCSLMS</code>/<code>RCSMMS</code>/<code>RCSTMPL</code>, 미입력=RCSLMS)"],
                ["<code>RCS_MESSAGEBASE_ID</code>", "VARCHAR(40)", "메시지 템플릿(메시지베이스) ID. 미입력 시 RCSLMS=<code>SL000000</code>, RCSMMS=<code>SMwThM00</code>(세로형 Medium)"],
                ["<code>RCS_CHATBOT_ID</code>", "VARCHAR(40)", "RCS 대표 발신번호"],
                ["<code>RCS_HEADER</code> · <code>RCS_FOOTER</code>", "CHAR(1)·VARCHAR(20)", "헤더(광고) 수록 여부 / 수신거부 번호 (RCSTMPL은 헤더 0 필수)"],
                ["<code>RCS_COPY_ALLOWED</code>", "TINYINT", "메시지 복사 허용 (0/1, 기본 1)"],
                ["<code>RCS_CARD_COUNT</code>", "TINYINT", "카드(carousel) 개수 (미입력 1)"],
                ["<code>RCS_TITLE</code>", "VARCHAR(500)", "제목 (카드별 최대 30자, 복수 카드는 <code>|c|</code> 구분)"],
                ["<code>RCS_DESC</code>", "TEXT", "본문 (RCSLMS 1300자 / RCSMMS 카드별 1300자, <code>|c|</code> 구분)"],
                ["<code>RCS_ATTACH</code>", "VARCHAR(2000)", "첨부 멀티미디어 (RCSMMS 카드당 1개 필수, 아래 스텝)"],
                ["<code>RCS_BUTTON</code>", "VARCHAR(2000)", "버튼 (RCSLMS 3개 / RCSMMS 카드당 2개 / RCSTMPL 불가)"],
                ["<code>RCS_TMPL_BODY_JSON</code>", "TEXT", "RCSTMPL 발송 시 템플릿 BODY JSON (변수부 가변값 합 90자 이내)"],
                ["<code>RCS_CDR_ID</code> · <code>RCS_BRAND_KEY</code>", "VARCHAR", "별도 과금 ID / RBC BrandKey(대행사 필수)"],
              ],
            },
          },
          {
            title: "첨부 멀티미디어 (RCS_ATTACH) — RCSMMS",
            body: "RCSMMS는 <b>카드(carousel)당 첨부 멀티미디어 1개가 필수</b>입니다. 첨부 타입 코드로 시작해 정보를 <code>^</code> 로 구분하여 입력합니다.",
            tables: [
              {
                label: "첨부 타입 / 형식",
                cols: ["코드", "기능", "형식 · 예시"],
                colWidths: ["10%", "26%", "64%"],
                rows: [
                  ["<code>F</code>", "이미지 파일 등록", "<code>F^브랜드ID^파일경로^mime타입</code><br>예) <code>F^BR.Xaet9ypZoz^image.jpg^image/jpeg</code>"],
                  ["<code>U</code>", "이미지 파일 Url", "<code>U^파일Url</code> (<code>maapfile://</code> 스키마)<br>예) <code>U^maapfile://BR.Xaet9ypZoz.0_jpg_...</code>"],
                  ["<code>VF</code>", "동영상Url + 썸네일 등록", "<code>VF^동영상Url^브랜드ID^파일경로^mime타입</code> (동영상=YouTube 주소)"],
                  ["<code>VU</code>", "동영상Url + 썸네일 Url", "<code>VU^동영상Url^파일Url</code>"],
                ],
              },
            ],
            list: [
              "<b>파일 경로</b> — Agent 설정의 <code>MMS_FILE_DIR</code>(예: <code>&lt;Agent&gt;/file/mms</code>) 기준",
              "<b>크기 제한</b> — 이미지 파일 최대 1MB, <b>메시지에 포함된 전체 미디어 합 1MB 이하</b>",
              "<b>유효기간</b> — 등록일로부터 365일(단말 조회는 456일=365+91일)",
              "<b>복수 카드</b> — 각 카드의 첨부는 <code>|c|</code> 로 구분. 예) <code>U^파일Url1|c|U^파일Url2</code>",
            ],
            note: "동영상은 YouTube 주소 3형식만 지원합니다: <code>youtube.com/watch?v=ID</code> · <code>youtu.be/ID</code> · <code>m.youtube.com/watch?v=ID</code>",
          },
          {
            title: "카드 · 캐러셀 / 개별 템플릿 (RCSTMPL)",
            body: "복수 카드(캐러셀)는 <code>RCS_CARD_COUNT</code> 와 카드별 값(<code>|c|</code> 구분)으로 구성합니다. 개별 템플릿(RCSTMPL)은 RCS Biz Center에 등록한 템플릿을 <code>RCS_TMPL_BODY_JSON</code> 으로 채워 발송합니다.",
            list: [
              "<b>standalone</b>(카드 1개) — <code>RCS_CARD_COUNT=1</code>, 메시지베이스 예) <code>SMwThM00</code>",
              "<b>carousel</b>(복수 카드) — <code>RCS_CARD_COUNT=N</code>, 메시지베이스 예) <code>CMwMhM0300</code>(Medium 3카드). <code>RCS_TITLE·RCS_DESC·RCS_ATTACH·RCS_BUTTON</code> 을 <code>|c|</code> 로 카드 수만큼 구분",
              "<b>RCSTMPL</b> — <code>RCS_SERVICE_TYPE='RCSTMPL'</code>, <code>RCS_MESSAGEBASE_ID</code>=브랜드 템플릿 ID, <code>RCS_HEADER='0'</code> 필수, <code>RCS_TMPL_BODY_JSON</code> 에 템플릿 값(JSON) 입력",
              "<b>RCSTMPL 변수부</b> — 템플릿 변수(<code>{{name}}</code> 등)는 JSON에 값 지정, 동보 치환은 <code>$TEXT$</code> 사용(가변값 합 90자 이내)",
            ],
            note: "메시지베이스 ID(<code>RCS_MESSAGEBASE_ID</code>)와 템플릿은 RCS Biz Center에서 발급·등록합니다. RCSTMPL은 버튼을 허용하지 않습니다.",
          },
          {
            title: "샘플 INSERT 쿼리 (RCSLMS · RCSMMS · RCSTMPL)",
            body: "상품 타입별 발송 샘플입니다. (MySQL·MS-SQL 기준 / Oracle은 <code>MSG_ID</code> 에 <code>SDK_MMS_SEQ.nextval</code> 추가)",
            codeTabs: [
              {
                name: "RCSLMS",
                code:
                  "-- 장문 RCS (첨부 없음), 실패 시 Fallback\n" +
                  "INSERT INTO SDK_MMS_SEND (\n" +
                  "  USER_ID, SCHEDULE_TYPE, SUBJECT, NOW_DATE, SEND_DATE, CALLBACK,\n" +
                  "  DEST_COUNT, DEST_INFO, MSG_TYPE, MMS_MSG, CONTENT_COUNT, CONTENT_DATA,\n" +
                  "  RCS_SEND_TYPE, RCS_SERVICE_TYPE, RCS_MESSAGEBASE_ID, RCS_CHATBOT_ID,\n" +
                  "  RCS_HEADER, RCS_FOOTER, RCS_COPY_ALLOWED, RCS_TITLE, RCS_DESC, RCS_BUTTON\n" +
                  ") VALUES (\n" +
                  "  'testid', 0, 'MMS Test', '202201010000', '202201010000', '01011112222',\n" +
                  "  1, 'mjkim^01011112222', 0, 'MMS 테스트입니다.', 0, '',\n" +
                  "  'RF', 'RCSLMS', 'SL000000', '0211112222',\n" +
                  "  '1', '08011112222', 0, 'RCS LMS Test', 'RCS LMS 테스트입니다.', 'U|^|KT 홈페이지|^|https://kt.com'\n" +
                  ");",
              },
              {
                name: "RCSMMS · standalone",
                code:
                  "-- 멀티미디어 RCS, 카드 1개 (첨부 1개 필수)\n" +
                  "INSERT INTO SDK_MMS_SEND (\n" +
                  "  USER_ID, SCHEDULE_TYPE, SUBJECT, NOW_DATE, SEND_DATE, DEST_COUNT, DEST_INFO,\n" +
                  "  MSG_TYPE, MMS_MSG, CONTENT_COUNT, CONTENT_DATA, CALLBACK,\n" +
                  "  RCS_SEND_TYPE, RCS_SERVICE_TYPE, RCS_MESSAGEBASE_ID, RCS_CHATBOT_ID,\n" +
                  "  RCS_HEADER, RCS_FOOTER, RCS_COPY_ALLOWED, RCS_CARD_COUNT,\n" +
                  "  RCS_TITLE, RCS_DESC, RCS_ATTACH, RCS_BUTTON\n" +
                  ") VALUES (\n" +
                  "  'testid', 0, 'MMS테스트', '201701010000', '201701010000', 1, 'test5^01011112222',\n" +
                  "  0, 'MMS JPG 테스트입니다', 1, 'image.jpg^1^0', '01011112222',\n" +
                  "  'RF', 'RCSMMS', 'SMwThM00', '0211112222',\n" +
                  "  '1', '08011112222', 0, 1,\n" +
                  "  'RCS MMS Test', 'RCS MMS 테스트입니다.',\n" +
                  "  'F^BR.Xaet9ypZoz^image.jpg^image/jpeg', 'U|^|KT 홈페이지|^|https://kt.com'\n" +
                  ");",
              },
              {
                name: "RCSMMS · carousel(3카드)",
                code:
                  "-- 멀티미디어 RCS, 카드 3개 (|c| 로 카드별 값 구분)\n" +
                  "INSERT INTO SDK_MMS_SEND (\n" +
                  "  USER_ID, SCHEDULE_TYPE, SUBJECT, NOW_DATE, SEND_DATE, DEST_COUNT, DEST_INFO,\n" +
                  "  MSG_TYPE, MMS_MSG, CONTENT_COUNT, CONTENT_DATA, CALLBACK,\n" +
                  "  RCS_SEND_TYPE, RCS_SERVICE_TYPE, RCS_MESSAGEBASE_ID, RCS_CHATBOT_ID,\n" +
                  "  RCS_HEADER, RCS_FOOTER, RCS_COPY_ALLOWED, RCS_CARD_COUNT,\n" +
                  "  RCS_TITLE, RCS_DESC, RCS_ATTACH, RCS_BUTTON\n" +
                  ") VALUES (\n" +
                  "  'testid', 0, 'MMS테스트', '201701010000', '201701010000', 1, 'test5^01011112222',\n" +
                  "  0, 'MMS JPG 테스트입니다', 1, 'image.jpg^1^0', '01011112222',\n" +
                  "  'RF', 'RCSMMS', 'CMwMhM0300', '0211112222',\n" +
                  "  '1', '08011112222', 0, 3,\n" +
                  "  '제목1|c|제목2|c|제목3',\n" +
                  "  '본문1|c|본문2|c|본문3',\n" +
                  "  'F^BR.x^image1.jpg^image/jpeg|c|F^BR.x^image2.jpg^image/jpeg|c|F^BR.x^image3.jpg^image/jpeg',\n" +
                  "  'U|^|열기1|^|https://kt.com|c|LB|^|열기2|^|https://kt.com|^|false|c|D|^|전화3|^|01011112222'\n" +
                  ");",
              },
              {
                name: "RCSTMPL",
                code:
                  "-- 개별 템플릿 발송 (RCS_HEADER='0' 필수, 버튼 불가)\n" +
                  "INSERT INTO SDK_MMS_SEND (\n" +
                  "  USER_ID, SCHEDULE_TYPE, SUBJECT, NOW_DATE, SEND_DATE, DEST_COUNT, DEST_INFO,\n" +
                  "  MSG_TYPE, MMS_MSG, CONTENT_COUNT, CONTENT_DATA,\n" +
                  "  RCS_SEND_TYPE, RCS_SERVICE_TYPE, RCS_MESSAGEBASE_ID, RCS_CHATBOT_ID,\n" +
                  "  RCS_HEADER, RCS_COPY_ALLOWED, RCS_TMPL_BODY_JSON\n" +
                  ") VALUES (\n" +
                  "  'testid', 0, 'MMS테스트', '201701010000', '201701010000', 1, 'test5^01011112222',\n" +
                  "  0, 'MMS 테스트입니다', 0, '',\n" +
                  "  'RF', 'RCSTMPL', '<브랜드 템플릿 메시지베이스ID>', '0211112222',\n" +
                  "  '0', 0, '{ \"cell_1_l\":\"홍길동\", \"cell_2_r\":\"2020/03/09\", \"cell_3_r\":\"130,000\", \"cell_4_l\":\"케이뱅크\" }'\n" +
                  ");",
              },
            ],
            note: "메시지베이스 ID(<code>SL000000·SMwThM00·CMwMhM0300</code> 등)와 템플릿 메시지베이스 ID는 RCS Biz Center 등록 값에 따릅니다. RCSMMS는 카드당 첨부 1개가 필수입니다.",
          },
        ],
      },

      /* ================= 5. 결과 · 응답코드 ================= */
      {
        id: "result",
        name: "5. 결과 · 응답코드",
        intro: "RCS 발송 결과는 <code>SDK_*MS_REPORT_DETAIL</code> 의 <code>RCS_*</code> 컬럼에, Fallback(기존 문자) 결과는 <code>TCS_RESULT</code> 에 적재됩니다.",
        steps: [
          {
            title: "SDK_*MS_REPORT_DETAIL — RCS 결과 컬럼",
            body: "수신자별 상세 결과 테이블(<code>SDK_SMS_REPORT_DETAIL</code> / <code>SDK_MMS_REPORT_DETAIL</code>)에 추가된 RCS 결과 컬럼입니다.",
            table: {
              cols: ["컬럼", "타입", "설명"],
              colWidths: ["24%", "18%", "58%"],
              rows: [
                ["<code>RCS_MSG_ID</code>", "VARCHAR(40)", "RCS 발송 메시지 ID"],
                ["<code>RCS_ERROR_CODE</code>", "VARCHAR(10)", "RCS 발송 결과 — 성공 시 <code>0</code>, 그 외는 RCS ErrorCode (아래 응답코드)"],
                ["<code>RCS_RES_DATE</code>", "VARCHAR(20)", "RCS 서버로부터 응답 수신 시간 (YYYYMMDDHHMMSS)"],
                ["<code>RCS_SENT_TIME</code>", "VARCHAR(20)", "RCS 서버가 통신 3사로 발송 요청한 시간"],
                ["<code>RCS_TIMESTAMP</code>", "VARCHAR(20)", "성공 시 단말의 RCS 수신 시간 / 실패 시 만료·상태 업데이트 시간"],
                ["<code>RCS_MNO_INFO</code>", "VARCHAR(5)", "착신 고객의 통신사 정보 (KT/SKT/LGU 등)"],
                ["<code>LEGACY_SEQ</code>", "INT", "기존 메시지로 Fallback 발송 시 사용한 Sequence Number"],
              ],
            },
            note: "<b>RCS 성공/실패</b>는 <code>RCS_ERROR_CODE</code>(<code>0</code>=성공)로 확인하고, <b>Fallback(기존 문자/멀티)으로 전환 발송된 결과</b>는 <code>TCS_RESULT</code> 로 확인합니다.",
          },
          {
            title: "응답코드 — RCS_ERROR_CODE / TCS_RESULT",
            body: "<b>RCS_ERROR_CODE</b> 는 KT RCS 중계 에러코드 체계를 따릅니다(성공 <code>0</code>). <b>TCS_RESULT</b> 는 Fallback 발송(기존 SMS/LMS/MMS) 결과로, ‘KT 스마트메시지’ 탭의 응답코드와 동일합니다(0 성공 / 400번대 등).",
            note: "RCS 발송 에러코드 전체 정의는 <i>KT RCS 중계 ErrorCode</i> 문서를 따릅니다. 코드 의미가 불확실하거나 차단 해제·브랜드 설정 확인이 필요하면 <b>모노커뮤니케이션즈</b>로 문의하세요.",
            cta: { href: "#/codes?svc=rcs", label: "결과코드 페이지 · KT RCS 전체 에러코드 보기", icon: "hash" },
          },
        ],
      },
    ],
  };
})();

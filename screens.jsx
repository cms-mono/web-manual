/* ============================================================
   통합 매뉴얼 허브 — 화면 (Home / ServiceView / AgentDetail / Search)
   ------------------------------------------------------------
   가독성 우선 리뉴얼:
   - Home: 카드 안에 매뉴얼 목록을 바로 노출(드릴다운 없이 스캔).
   - AgentDetail: 단일 컬럼 "캡처 스택" — 번호+제목 + 큰 화면 캡처 +
     한 줄 캡션만. 사이드바·배지·콜아웃·다운로드바 등 부수 요소 제거.
   ============================================================ */

const HEADER_OFFSET = 88;
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: y, behavior: "smooth" });
}
/* 최상단에서 출발하면 상단 퀵메뉴 자리(topmenu-spacer, 약 65px)가 접히면서
   본문이 그만큼 위로 밀려 목표 지점이 헤더에 가려진다.
   스크롤이 끝난 뒤 위치를 한 번 더 확인해 어긋난 만큼만 보정한다. */
function scrollToIdSettled(id) {
  scrollToId(id);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const off = el.getBoundingClientRect().top - HEADER_OFFSET;
    if (Math.abs(off) > 8) window.scrollTo({ top: window.scrollY + off, behavior: "smooth" });
  }, 400);
}

/* 검색 진입 시 본문 내 키워드 강조 ----------------------------------------
   문서에 이미 렌더된 DOM의 텍스트 노드를 직접 훑어 일치 구간을 <mark>로 감싼다.
   (본문은 대부분 dangerouslySetInnerHTML/메모이즈된 정적 콘텐츠라 React 재조정과 충돌하지 않음) */
function clearSearchHighlights() {
  document.querySelectorAll("mark.search-hit").forEach((m) => {
    const parent = m.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
}
function highlightTerm(container, term) {
  if (!container || !term) return null;
  const low = String(term).toLowerCase();
  if (low.length < 2) return null;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue || n.nodeValue.toLowerCase().indexOf(low) < 0) return NodeFilter.FILTER_REJECT;
      const p = n.parentNode;
      // 코드블록(<code>는 React가 텍스트로 관리 → 복사 시 재렌더와 충돌)·버튼류는 제외
      if (p && p.closest && p.closest(".cap-code, .code-copy, .cap-snap, .code-tab, mark.search-hit")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  let first = null;
  nodes.forEach((n) => {
    const text = n.nodeValue;
    const lo = text.toLowerCase();
    const frag = document.createDocumentFragment();
    let i = 0, p;
    while ((p = lo.indexOf(low, i)) >= 0) {
      if (p > i) frag.appendChild(document.createTextNode(text.slice(i, p)));
      const mk = document.createElement("mark");
      mk.className = "search-hit";
      mk.textContent = text.slice(p, p + low.length);
      if (!first) first = mk;
      frag.appendChild(mk);
      i = p + low.length;
    }
    if (i < text.length) frag.appendChild(document.createTextNode(text.slice(i)));
    n.parentNode && n.parentNode.replaceChild(frag, n);
  });
  return first;
}

/* 본문 텍스트에서 한 줄 캡션 추출 (HTML 제거 + 첫 문장 / 길이 제한) */
function stripHtml(s) {
  return (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function firstLine(s, max) {
  const t = stripHtml(s);
  if (!t) return "";
  const m = t.match(/^.*?다\.(?=\s|$)/); // 첫 한국어 문장
  let out = m ? m[0] : t;
  const lim = max || 90;
  if (out.length > lim) out = out.slice(0, lim).trim() + "…";
  return out;
}
function agentInitial(a) {
  if (a.id === "openapi") return "API";
  return a.name.replace(/^KT |^M2X /, "").slice(0, 2);
}

/* (형광펜 제거) 에이전트명은 그대로 표시 — 병합 안내는 카드 보조 텍스트로 */
function hlName(name) {
  return name;
}

/* ============================ 다운로드 버튼 ============================
   매뉴얼·에이전트가 한 페이지(통합 다운로드 센터)에 있어 단일 버튼으로 연결 */
function DownloadButtons({ agent }) {
  // 링크 배열이 지정된 경우(예: Communis 이용가이드) → 다운로드 대신 외부 사이트 버튼 여러 개
  if (agent && agent.links && agent.links.length) {
    return (
      <div className="dl-buttons">
        {agent.links.map((l, i) => (
          <a key={i} className="dl-btn" href={l.url} target="_blank" rel="noopener noreferrer">
            <Icon name={l.icon || "external"} size={16} /> {l.label}
          </a>
        ))}
      </div>
    );
  }
  // 에이전트에 siteUrl 이 있으면 다운로드 대신 해당 사이트 링크를 노출(예: openAPI 포털)
  if (agent && agent.siteUrl) {
    return (
      <div className="dl-buttons">
        <a className="dl-btn" href={agent.siteUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="external" size={16} /> {agent.siteLabel || "사이트 바로가기"}
        </a>
      </div>
    );
  }
  const url = window.HUB.DOWNLOADS;
  return (
    <div className="dl-buttons">
      <a className="dl-btn" href={url} target="_blank" rel="noopener noreferrer">
        <Icon name="download" size={16} /> 매뉴얼 · 에이전트 다운로드
      </a>
    </div>
  );
}

/* ============================ 우측 고정 네비 (전 페이지 공통) ============================ */
function RightNav({ index, onNavigate }) {
  return (
    <aside className="rnav">
      <div className="rnav-card">
        <div className="rnav-title">바로가기</div>
        {window.HUB.QUICKLINKS.map((l, i) => (
          <a key={i} className="rnav-link" href={l.url} target="_blank" rel="noopener noreferrer" title={l.desc || l.label}>
            <span className="rnav-main">
              <span className="rnav-top">
                <span className="rnav-name">{l.label}</span>
                {l.by && <span className="rnav-by">{l.by}</span>}
              </span>
              {l.desc && <span className="rnav-desc">{l.desc}</span>}
            </span>
            <Icon name="external" size={13} />
          </a>
        ))}
      </div>
    </aside>
  );
}

/* ============================ 발송 쿼리 생성기 ============================
   출처: 사내 dashboard 발송 쿼리 템플릿 (tools/dashboard/app.py)
   SDK_*_SEND 테이블 INSERT 쿼리(MariaDB·MySQL / Oracle)를 생성한다.
*/
const QGEN_TYPES = ["SMS", "LMS", "MMS", "FMS", "VMS-TTS"];
const QGEN_FIELDS = {
  SMS: ["userId", "callback", "dest", "subject", "msg"],
  LMS: ["userId", "callback", "dest", "subject", "msg"],
  MMS: ["userId", "callback", "dest", "subject", "msg", "img"],
  FMS: ["userId", "callback", "dest", "subject", "file"],
  "VMS-TTS": ["userId", "callback", "dest", "subject", "tts"],
};
const QGEN_META = {
  userId: { label: "USER_ID (KT 발급 SP_ID)", def: "SP_ID" },
  callback: { label: "회신번호 (CALLBACK)", def: "0212345678" },
  dest: { label: "수신자 DEST_INFO (이름^번호|이름^번호)", def: "홍길동^01012345678" },
  subject: { label: "제목 (SUBJECT)", def: "제목" },
  msg: { label: "메시지 본문", def: "메시지 내용" },
  img: { label: "이미지 CONTENT_DATA (파일명^타입^서브타입 · 최대 3개 |로 구분)", def: "이미지1.jpg^1^0|이미지2.jpg^1^0" },
  file: { label: "첨부파일 ATTACH_FILE (확장자 포함)", def: "파일명.pdf" },
  tts: { label: "TTS 메시지", def: "음성 테스트 메시지입니다." },
};

/* 컬럼별 주석 (주석 포함 버전에서 사용) */
const QGEN_COMMENTS = {
  MSG_ID: "PK (Oracle: 시퀀스)",
  USER_ID: "발송 계정 (KT 발급 SP_ID)",
  SCHEDULE_TYPE: "0:즉시 / 1:예약",
  SUBJECT: "제목 (LMS·MMS·FMS·VMS)",
  SMS_MSG: "본문 (90byte 권장)",
  MMS_MSG: "본문",
  NOW_DATE: "등록일시 (yyyymmddHHMMSS)",
  SEND_DATE: "발송일시 (예약 시 지정)",
  CALLBACK: "회신번호 (필수)",
  DEST_INFO: "수신자 (이름^번호|이름^번호)",
  CONTENT_COUNT: "첨부 이미지 개수 (이미지 수와 일치, 0:없음)",
  CONTENT_DATA: "이미지(파일명^타입^서브타입), 최대 3개까지 |로 구분",
  MSG_TYPE: "0:TEXT / 1:HTML",
  MSG_SUBTYPE: "메시지 서브타입",
  DEST_TYPE: "수신 타입",
  CDR_ID: "과금 계정 (미지정 시 NULL)",
  ATTACH_FILE: "첨부 파일명 (확장자 포함)",
  MENT_TYPE: "멘트 구성 (0~4)",
  VOICE_TYPE: "0:여성 / 1:남성",
  REPLY_TYPE: "0:미사용 / 1:답변받기",
  REPLY_COUNT: "답변 범위 (0~9)",
  TTS_MSG: "TTS 텍스트",
};

/* (dialect, type) → { table, rows: [[col, value], ...] } */
function qgenColumns(dialect, type, v) {
  const oracle = dialect === "oracle";
  const now = oracle ? "to_char(sysdate,'yyyymmddhh24miss')" : "DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')";
  const q = (s) => "'" + String(s == null ? "" : s).replace(/'/g, "''") + "'";
  let table, rows;
  if (type === "SMS") {
    table = "SDK_SMS_SEND";
    rows = [["USER_ID", q(v.userId)], ["SCHEDULE_TYPE", "0"], ["SUBJECT", q(v.subject)], ["SMS_MSG", q(v.msg)], ["NOW_DATE", now], ["SEND_DATE", now], ["CALLBACK", q(v.callback)], ["DEST_INFO", q(v.dest)], ["CDR_ID", "NULL"]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_SMS_SEQ.nextval"]);
  } else if (type === "LMS") {
    table = "SDK_MMS_SEND";
    rows = [["USER_ID", q(v.userId)], ["SCHEDULE_TYPE", "0"], ["NOW_DATE", now], ["SEND_DATE", now], ["CONTENT_COUNT", "0"], ["MSG_TYPE", "0"], ["CALLBACK", q(v.callback)], ["DEST_INFO", q(v.dest)], ["SUBJECT", q(v.subject)], ["MMS_MSG", q(v.msg)], ["CDR_ID", "NULL"]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_MMS_SEQ.nextval"]);
  } else if (type === "MMS") {
    table = "SDK_MMS_SEND";
    const imgCount = String((v.img || "").split("|").filter(function (s) { return s.trim(); }).length || 0);
    rows = [["USER_ID", q(v.userId)], ["SCHEDULE_TYPE", "0"], ["NOW_DATE", now], ["SEND_DATE", now], ["CONTENT_COUNT", imgCount], ["CONTENT_DATA", q(v.img)], ["MSG_TYPE", "0"], ["CALLBACK", q(v.callback)], ["DEST_INFO", q(v.dest)], ["SUBJECT", q(v.subject)], ["MMS_MSG", q(v.msg)], ["CDR_ID", "NULL"]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_MMS_SEQ.nextval"]);
  } else if (type === "FMS") {
    table = "SDK_FMS_SEND";
    rows = [["USER_ID", q(v.userId)], ["MSG_SUBTYPE", "20"], ["SCHEDULE_TYPE", "0"], ["DEST_TYPE", "0"], ["SUBJECT", q(v.subject)], ["NOW_DATE", now], ["SEND_DATE", now], ["CALLBACK", q(v.callback)], ["CDR_ID", "NULL"], ["DEST_INFO", q(v.dest)], ["ATTACH_FILE", q(v.file)]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_FMS_SEQ.nextval"]);
  } else {
    table = "SDK_VMS_SEND";
    rows = [["USER_ID", q(v.userId)], ["MSG_SUBTYPE", "30"], ["SCHEDULE_TYPE", "0"], ["MENT_TYPE", "0"], ["VOICE_TYPE", "1"], ["SUBJECT", q(v.subject)], ["NOW_DATE", now], ["SEND_DATE", now], ["CALLBACK", q(v.callback)], ["REPLY_TYPE", "0"], ["REPLY_COUNT", "0"], ["CDR_ID", "NULL"], ["TTS_MSG", q(v.tts)], ["DEST_INFO", q(v.dest)]];
    if (oracle) rows.unshift(["MSG_ID", "SDK_VMS_SEQ.nextval"]);
  }
  return { table, rows, oracle };
}

function qgenSql(dialect, type, v, commented) {
  const { table, rows, oracle } = qgenColumns(dialect, type, v);
  const e = oracle ? "" : ";";
  const colLines = rows.map((r, i) => "    " + (i ? ", " : "  ") + r[0]).join("\n");
  if (!commented) {
    const valLines = rows.map((r, i) => "    " + (i ? ", " : "  ") + r[1]).join("\n");
    return "INSERT INTO " + table + " (\n" + colLines + "\n)\nVALUES (\n" + valLines + "\n)" + e;
  }
  // 주석 포함 — 값 옆에 [컬럼] 설명
  const w = Math.min(38, Math.max.apply(null, rows.map((r) => r[1].length)));
  const valLines = rows.map((r, i) => {
    const lead = "    " + (i ? ", " : "  ");
    const cmt = QGEN_COMMENTS[r[0]] || "";
    return lead + r[1].padEnd(w) + "  -- " + r[0] + (cmt ? " : " + cmt : "");
  }).join("\n");
  return "INSERT INTO " + table + " (\n" + colLines + "\n)\nVALUES (\n" + valLines + "\n)" + e;
}

function qgenDefaults() {
  const d = {};
  Object.keys(QGEN_META).forEach((k) => { d[k] = QGEN_META[k].def; });
  return d;
}

function QueryGenerator() {
  const [dialect, setDialect] = React.useState("maria");
  const [type, setType] = React.useState("SMS");
  const [v, setV] = React.useState(qgenDefaults);
  const [commented, setCommented] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const sql = qgenSql(dialect, type, v, commented);
  const set = (k, val) => setV((p) => ({ ...p, [k]: val }));

  function copy() {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sql).then(done, done);
    } else {
      const ta = document.createElement("textarea");
      ta.value = sql; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  }

  return (
    <div className="qgen">
      <div className="qgen-controls">
        <div className="qgen-seg">
          <button className={dialect === "maria" ? "active" : ""} onClick={() => setDialect("maria")}>MariaDB · MySQL</button>
          <button className={dialect === "oracle" ? "active" : ""} onClick={() => setDialect("oracle")}>Oracle</button>
        </div>
        <div className="qgen-tabs">
          {QGEN_TYPES.map((t) => (
            <button key={t} className={"qgen-tab" + (type === t ? " active" : "")} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
        <label className="qgen-chk">
          <input type="checkbox" checked={commented} onChange={(e) => setCommented(e.target.checked)} />
          주석 포함
        </label>
      </div>

      <div className="qgen-fields">
        {QGEN_FIELDS[type].map((k) => (
          <label className="qgen-field" key={k}>
            <span>{QGEN_META[k].label}</span>
            <input value={v[k]} onChange={(e) => set(k, e.target.value)} spellCheck={false} />
          </label>
        ))}
      </div>

      <div className="qgen-out">
        <button className="qgen-copy" onClick={copy}>
          <Icon name={copied ? "check" : "doc"} size={14} /> {copied ? "복사됨" : "복사"}
        </button>
        <pre><code>{sql}</code></pre>
      </div>
    </div>
  );
}

/* ============================ HOME ============================ */
/* 서비스 카드 — 헤더 + 간단 설명 (서비스 4개만 노출, Agent 목록은 제외) */
/* 터미널 코드 블록 + 복사 버튼 (설치 실행·쿼리·MSTG 예제 공통) */
function fallbackCopy(text, done) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.top = "-9999px"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    done();
  } catch (e) {}
}
/* 텍스트 클립보드 복사(공용) */
function copyToClipboard(text, done) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
/* 화면 하단 토스트 알림(단일 인스턴스 재사용) */
function showToast(msg) {
  let el = document.getElementById("hub-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "hub-toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}
/* 코드 블록
   - 기본(복사형): 터미널 스타일 + 복사 버튼 — 예제·쿼리 등 그대로 붙여넣는 내용
   - plain(설명형): 복사 버튼 없음 — 명령 흐름·설정·콘솔 출력 등 설명용(일반 텍스트 혼재) */
function CodeBlock({ code, plain }) {
  const [copied, setCopied] = React.useState(false);
  function copy() {
    const text = code || "";
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }
  return (
    <pre className={"cap-code" + (plain ? " plain" : "")}>
      {!plain && (
        <button className={"code-copy" + (copied ? " ok" : "")} onClick={copy} title="코드 복사">
          {copied ? "✓ 복사됨" : "복사"}
        </button>
      )}
      <code>{code}</code>
    </pre>
  );
}

/* 여러 복사형 코드(예: DBMS·발송타입별 INSERT 쿼리)를 탭으로 분리 — 탭마다 개별 복사 */
function CodeTabs({ tabs }) {
  const [i, setI] = React.useState(0);
  const list = tabs || [];
  const cur = list[i] || list[0];
  if (!cur) return null;
  return (
    <div className="code-tabs">
      <div className="code-tabs-bar">
        {list.map((t, k) => (
          <button key={k} className={"code-tab" + (k === i ? " on" : "")} onClick={() => setI(k)}>
            {t.name}
          </button>
        ))}
      </div>
      <CodeBlock key={i} code={cur.code} />
    </div>
  );
}

/* VMS 다단계 시나리오(MSTG) 예제 — 예제별 탭 전환 (출처: Xroshot VMS 시나리오 설명서) */
const MSTG_EXAMPLES = [
  {
    name: "기본 음성 안내",
    tag: "NODE_TYPE 1 · TTS",
    code: "1|\n1 | 1 | 2 | 안녕하세요 OOO 입니다 | 0 | -1 |",
    desc: "음성 1개만 재생하고 종료. MENT_TYPE 2(TTS)로 텍스트를 음성 변환합니다. BARGEIN 0 = DTMF가 들어와도 끝까지 재생.",
  },
  {
    name: "PCM 연속 재생",
    tag: "NODE_TYPE 1 · PCM 2노드",
    code: "2|\n1 | 1 | 1 | /TCSMSG/default/ars/ars_groupmsg_succ1.pcm | 1 | 2 |\n2 | 1 | 1 | /TCSMSG/default/ars/ars_groupmsg_succ2.pcm | 0 | -1 |",
    desc: "업로드한 PCM 파일 2개를 순서대로 재생. BARGEIN 1 = DTMF 입력 시 음성 중지, 0 = 끝까지 재생.",
  },
  {
    name: "단일 선택 수집",
    tag: "NODE_TYPE 2",
    code: "1|\n1 | 2 | 2 | 남자면 1번 여자면 2번을 눌러주세요 | 12 | -1 |",
    desc: "음성 재생 후 DTMF 1개 수집(VALIED_DTMF=12 → 1·2만 유효). 수신자가 누른 값은 발송자에게 Report됩니다.",
  },
  {
    name: "설문조사 (분기)",
    tag: "NODE_TYPE 1·2·3 조합 · 5노드",
    code:
      "5|\n" +
      "1 | 2 | 2 | 안녕하십니까? $TEXT$ 님 잠시 설문에 응해주세요 | 1 | 2 |\n" +
      "2 | 2 | 2 | 남자면 1번 여자면 2번을 눌러 주세요 | 12 | 1^3;2^4 |\n" +
      "3 | 2 | 2 | 10대 1번, 20대 2번, 30대 3번, 40대 4번 | 1234 | 4 |\n" +
      "4 | 3 | 2 | 주민등록번호 13자리를 눌러주세요 | 1 | 13 | NULL | 5 |\n" +
      "5 | 1 | 2 | 설문에 응해주셔서 감사합니다 | 1 | -1 |",
    desc: "머리말 → 성별(분기 1^3;2^4: 1번이면 3번·2번이면 4번 노드) → 연령대 → 주민번호 13자리 수집 → 맺음말. $TEXT$는 템플릿(착신자 정보 이름^번호^홍길동).",
  },
  {
    name: "음성 녹음",
    tag: "NODE_TYPE 4",
    code:
      "4|\n" +
      "1 | 2 | 2 | OO은행에서 OOO님께 메시지를 전달했습니다 | 1 | 2 |\n" +
      "2 | 2 | 2 | 주소가 변경되었으면 1번을 눌러 변경된 주소를 녹음해주세요 | 1 | 3 |\n" +
      "3 | 4 | 0 | NULL | 4 |\n" +
      "4 | 1 | 2 | 감사합니다 | 1 | -1 |",
    desc: "안내 → 녹음 유도(DTMF) → NODE_TYPE 4 음성 녹음 → 맺음말. 녹음된 음성파일은 발송자에게 Report됩니다.",
  },
  {
    name: "상담원 연결",
    tag: "NODE_TYPE 5",
    code:
      "3|\n" +
      "1 | 2 | 2 | OO공단에서 OOO님께 메시지를 전달했습니다 | 1 | 2 |\n" +
      "2 | 2 | 2 | 이번달 연체 요금 안내 … 상담원 통화를 원하시면 1번을 눌러주세요 | 1 | 3 |\n" +
      "3 | 5 | 0 | NULL | 02-OOO-OOOO | -1 |",
    desc: "안내 후 1번 입력 시 상담원 번호(예: 02-OOO-OOOO)로 연결. NODE_TYPE 5는 NEXT_NODE가 항상 -1(종료)입니다.",
  },
];

function MstgExamples() {
  const [sel, setSel] = React.useState(0);
  const ex = MSTG_EXAMPLES[sel];
  return (
    <div className="mstg-ex">
      <div className="mstg-tabs">
        {MSTG_EXAMPLES.map((e, i) => (
          <button key={i} className={"mstg-tab" + (i === sel ? " active" : "")} onClick={() => setSel(i)}>
            {e.name}
          </button>
        ))}
      </div>
      <div className="mstg-meta">
        <span className="mstg-badge">{ex.tag}</span>
        <span className="mstg-fmt">형식: NODE_NO | NODE_TYPE | MENT_TYPE | MENT_INFO | … | NEXT_NODE</span>
      </div>
      <CodeBlock code={ex.code} />
      <div className="cap-note">
        <span className="ni"><Icon name="info" size={15} /></span>
        <span>{ex.desc}</span>
      </div>
    </div>
  );
}

function HomeServiceCard({ service, onNavigate }) {
  const agents = window.HUB.liveAgentsForService(service.id);
  const enabled = window.HUB.isServicePublished(service.id);
  // 서비스에 agentCount(표시용 오버라이드)가 있으면 그 값을, 없으면 실제 지원 Agent 수를 사용
  const agentCount = (service.agentCount != null) ? service.agentCount : agents.length;
  return (
    <a
      className={"hcard hcard-svc" + (enabled ? " linkcard ready" : " locked")}
      style={{ background: cardColorForService(service.id) }}
      onClick={enabled ? () => onNavigate({ name: "service", id: service.id }) : undefined}
    >
      <div className="hcard-head">
        <div className="hcard-logo svc"><ServiceGlyph service={service} size={20} /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="hcard-title">{service.name}</p>
        </div>
        {service.integrated && <span className="hcard-tag">통합</span>}
        {service.hasCenter && <span className="hcard-tag neutral">센터</span>}
        {!enabled && <span className="hcard-tag locked">준비중</span>}
      </div>
      <p className="hcard-desc">{service.tagline}</p>
      <div className="hcard-foot">
        <span>{enabled ? agentCount + "개 Agent 지원" : "준비 중"}</span>
        {enabled && <span className="mrow-arrow"><Icon name="arrow" size={15} /></span>}
      </div>
    </a>
  );
}

/* 카드 색상 — '같은 서비스는 같은 색'이 되도록 서비스 기준으로 통일한다.
   서비스끼리는 확실히 구분되도록 계열(파랑/초록/주황)을 달리하고,
   Agent는 서비스에 종속되지 않는 설치형이라 별도 색(무채)을 쓴다. */
const SERVICE_RGB = {
  smart:    "79,70,229",    // indigo — KT 스마트메시지 Biz (openAPI)
  communis: "14,148,136",   // teal   — KT Communis (웹·API)
  rcs:      "217,119,6",    // amber  — KT 스마트메시지 RCS (RCS API·Hermes)
  twoway:   "139,92,246",   // violet — KT 양방향서비스
};
const AGENT_KIND_RGB = "100,116,139"; // slate — Agent(설치형 엔진) 전용
const FALLBACK_RGB = "100,116,139";
function serviceRgb(serviceId) { return SERVICE_RGB[serviceId] || FALLBACK_RGB; }
// 헤더 밴드용(흰 카드 위 한 겹) / 카드 전체용(면적이 넓어 더 옅게)
function headColorForService(serviceId) { return "rgba(" + serviceRgb(serviceId) + ",0.13)"; }
function cardColorForService(serviceId) { return "rgba(" + serviceRgb(serviceId) + ",0.06)"; }
const AGENT_KIND_COLOR = "rgba(" + AGENT_KIND_RGB + ",0.13)";
// 준비중(locked) 카드는 .hcard.locked의 opacity로 자연히 흐려지므로 색은 그대로 준다
// (같은 서비스 계열임을 색으로 알 수 있게).

/* Agent 카드 — 헤더(색상 배경) + 지원 서비스 목록(매뉴얼)을 인라인 노출 */
function HomeAgentCard({ agent, idx, onNavigate }) {
  const ext = agent.externalUrl;                       // 외부 매뉴얼 사이트가 있는 Agent
  const openExt = () => window.open(ext, "_blank", "noopener");
  const enabled = window.HUB.isAgentPublished(agent.id) || !!ext;
  const soon = agent.status === "soon" && !ext;
  const services = window.HUB.servicesForAgent(agent.id);
  const p = window.HUB.PROVIDERS[agent.provider];
  // Agent(설치형)는 전용 색, API 카드는 대상 서비스 색을 따른다
  const headBg = window.HUB.agentKind(agent) === "agent"
    ? AGENT_KIND_COLOR
    : headColorForService(agent.supports && agent.supports[0]);
  // serviceGuide(예: Communis)는 서비스 경로가 정식 주소 — 카드에서도 바로 서비스로 보낸다.
  const routeTo = (anchor) =>
    agent.serviceGuide && agent.supports && agent.supports[0]
      ? { name: "service", id: agent.supports[0], anchor: anchor }
      : { name: "agent", id: agent.id, anchor: anchor };
  // 카드 제목 클릭 시 도착 지점(agent.homeAnchor 지정 시 해당 섹션으로 바로 이동)
  const goHome = () => onNavigate(routeTo(agent.homeAnchor));
  return (
    <div className={"hcard" + (enabled ? " ready" : " locked")}>
      <div
        className="hcard-head"
        style={{ background: headBg }}
        onClick={ext ? openExt : (window.HUB.isAgentPublished(agent.id) ? goHome : undefined)}
      >
        <AgentAvatar agent={agent} className="hcard-logo" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="hcard-title">{window.HUB.agentDisplayName(agent, null)}</p>
          <p className="hcard-sub">{agent.cardSub || (p.name + " · " + (agent.transport === "API" ? "API 연동" : "TCP 소켓"))}</p>
        </div>
        {!enabled && <span className="hcard-tag locked">{soon ? "예정" : "준비중"}</span>}
      </div>
      <div className="mlist">
        {ext ? (
          <a className="mrow" onClick={openExt}>
            <span className="mrow-badge svc"><Icon name="book" size={13} /></span>
            <span className="mrow-text">매뉴얼 열기</span>
            <span className="mrow-arrow"><Icon name="external" size={15} /></span>
          </a>
        ) : window.HUB.isAgentPublished(agent.id) ? (
          services.map((s) => (
            <a
              key={s.id}
              className="mrow"
              onClick={() => onNavigate(routeTo(
                // 단일 서비스 카드(예: Communis API)는 카드가 가리키는 지점으로 통일
                (agent.homeAnchor && services.length === 1) ? agent.homeAnchor : "sec-" + s.id
              ))}
            >
              <span className="mrow-badge svc"><ServiceGlyph service={s} size={13} /></span>
              <span className="mrow-text">{s.name}</span>
              <span className="mrow-arrow"><Icon name="arrow" size={15} /></span>
            </a>
          ))
        ) : (
          <div className="mrow disabled">{soon ? "지원 서비스 확정 예정" : "준비 중입니다"}</div>
        )}
      </div>
    </div>
  );
}

/* 홈 '웹' 그룹 카드 — 콘솔(웹) 발송 가이드로 보내는 바로가기 */
function HomeWebCard({ card, idx, onNavigate }) {
  const ready = !!card.goto && card.status !== "soon";
  const headBg = headColorForService(card.serviceId);
  return (
    <div className={"hcard" + (ready ? " ready" : " locked")}>
      <div
        className="hcard-head"
        style={{ background: headBg }}
        onClick={ready ? () => onNavigate(card.goto) : undefined}
      >
        <div className="hcard-logo av-svc"><Icon name={card.icon || "grid"} size={20} /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="hcard-title">{card.name}</p>
          <p className="hcard-sub">{card.sub}</p>
        </div>
        {!ready && <span className="hcard-tag locked">준비중</span>}
      </div>
      <div className="mlist">
        {ready ? (
          <a className="mrow" onClick={() => onNavigate(card.goto)}>
            <span className="mrow-badge svc"><Icon name="book" size={13} /></span>
            <span className="mrow-text">{card.rowLabel || "웹 발송 가이드"}</span>
            <span className="mrow-arrow"><Icon name="arrow" size={15} /></span>
          </a>
        ) : (
          <div className="mrow disabled">준비 중입니다</div>
        )}
      </div>
    </div>
  );
}

function Home({ index, onNavigate }) {
  // 사용 가능(발행됨) 항목이 위로 오도록 정렬 — 그룹 내 기존 순서는 유지(안정 정렬)
  const services = window.HUB.SERVICES.slice().sort(
    (a, b) => window.HUB.isServicePublished(b.id) - window.HUB.isServicePublished(a.id)
  );
  // 홈 'Agent & API' 카드 — hidden 제외, 발행된 항목이 위로(안정 정렬)
  const cards = window.HUB.homeAgentApiCards().sort(
    (a, b) => window.HUB.isAgentPublished(b.id) - window.HUB.isAgentPublished(a.id)
  );
  const webCards = window.HUB.HOME_WEB_CARDS || [];
  // 이용·연동 방법을 웹(콘솔) / API / Agent 세 그룹으로 나눠 태그와 함께 표시
  const KIND_GROUPS = [
    { kind: "web", label: "웹", desc: "콘솔에서 직접 발송" },
    { kind: "api", label: "API", desc: "REST API 직접 연동" },
    { kind: "agent", label: "Agent", desc: "설치형 연동 엔진" },
    { kind: "etc", label: "기타 · 부록", desc: "발송 전 준비 · 외부 포털 가이드" },
  ];
  React.useEffect(() => {
    if (window.__homeScroll) {
      // 특정 섹션으로 돌아가는 경우(예: '홈으로' 복귀) 해당 위치로
      const id = window.__homeScroll; window.__homeScroll = null;
      setTimeout(() => scrollToId(id), 80);
    } else {
      // 그 외에는 항상 맨 위에서 시작 (서비스·에이전트 페이지와 동일)
      window.scrollTo(0, 0);
    }
  }, []);
  return (
    <div className="page fade-up">
      <div className="wrap">
        <section className="home-sec" style={{ marginTop: 28 }}>
          <div className="home-sec-head">
            <span className="bar"></span>
            <h2>서비스별</h2>
            <span className="count">{services.length}</span>
          </div>
          <div className="hgrid cols2 stagger">
            {services.map((s) => (
              <HomeServiceCard key={s.id} service={s} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        <div className="home-divider"></div>

        <section className="home-sec" id="home-agents" style={{ paddingBottom: 64 }}>
          <div className="home-sec-head">
            <span className="bar agt"></span>
            <h2>이용 · 연동 방법</h2>
            <span className="count">{cards.length + webCards.length}</span>
          </div>
          {KIND_GROUPS.map((g) => {
            const isWeb = g.kind === "web";
            const list = isWeb ? webCards : cards.filter((a) => window.HUB.agentKind(a) === g.kind);
            return (
              <div className="home-kind" key={g.kind}>
                <div className="home-kind-head">
                  <span className={"kind-tag " + g.kind}>{g.label}</span>
                  <span className="home-kind-desc">{g.desc}</span>
                  <span className="count">{list.length}</span>
                </div>
                {list.length ? (
                  <div className="hgrid stagger">
                    {list.map((a, i) =>
                      isWeb ? (
                        <HomeWebCard key={a.id} card={a} idx={i} onNavigate={onNavigate} />
                      ) : (
                        <HomeAgentCard key={a.id} agent={a} idx={cards.indexOf(a)} onNavigate={onNavigate} />
                      )
                    )}
                  </div>
                ) : (
                  <p className="home-kind-empty">준비 중입니다.</p>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

/* ============================ SERVICE VIEW ============================ */
function ServiceView({ serviceId, index, onNavigate }) {
  const service = window.HUB.SERVICE_MAP[serviceId];
  if (!service || !window.HUB.isServicePublished(serviceId)) return <NotFound onNavigate={onNavigate} />;
  const cell = (window.HUB_SVC && window.HUB_SVC[serviceId]) || {};
  const flow = cell.flow || [];
  const sites = service.sites || [];
  // 연동 방식(에이전트·API): 발행된 것 먼저, 그 다음 준비중 순
  const agents = window.HUB.liveAgentsForService(serviceId).slice().sort(
    (a, b) => (window.HUB.isAgentPublished(b.id) ? 1 : 0) - (window.HUB.isAgentPublished(a.id) ? 1 : 0)
  );
  const empty = !sites.length && !flow.length;
  const readyAgents = agents.filter((a) => window.HUB.isAgentPublished(a.id));
  // 고정 헤더 높이를 고려해 섹션 제목이 가려지지 않게 이동
  function goManuals() { scrollToIdSettled("svc-manuals"); }

  React.useEffect(() => { window.scrollTo(0, 0); }, [serviceId]);

  return (
    <div className="page fade-up">
      <div className="svc-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a onClick={() => onNavigate({ name: "home" })}>홈</a>
            <Icon name="chevron" size={14} />
            <span className="cur">{service.name}</span>
          </div>
          <div className="svc-hero-inner">
            <div className="svc-hero-icon"><ServiceGlyph service={service} size={32} /></div>
            <div className="svc-hero-text">
              <h1>{service.name}</h1>
              <p>{service.tagline}</p>
              <div className="svc-hero-feats">
                {service.features.map((f) => <span className="tag" key={f}>{f}</span>)}
              </div>
            </div>
            {readyAgents.length > 0 && (
              <div className="svc-hero-cta">
                <span className="svc-hero-cta-cap">이 서비스의 매뉴얼 {readyAgents.length}종</span>
                <button className="svc-cta-btn" onClick={goManuals}>
                  <Icon name="book" size={16} /> 매뉴얼 보기
                  <Icon name="chevron" size={14} className="svc-cta-arr" />
                </button>
                <span className="svc-hero-cta-sub">연동 방법을 골라 바로 확인하세요</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="wrap section-pad">
        {agents.length > 0 && (
          <section className="svc-sec" id="svc-manuals">
            <div className="sec-head">
              <h2>매뉴얼 · 연동 방법</h2>
              <p>사용할 방법을 고르면 해당 매뉴얼로 이동합니다.</p>
            </div>
            <div className="mcards">
              {agents.map((a) => {
                const enabled = window.HUB.isAgentPublished(a.id);
                const route = (a.serviceGuide && a.supports && a.supports[0])
                  ? { name: "service", id: a.supports[0], anchor: a.homeAnchor }
                  : { name: "agent", id: a.id, anchor: "sec-" + serviceId };
                return (
                  <a
                    key={a.id}
                    className={"mcard" + (enabled ? " ready" : " locked")}
                    onClick={enabled ? () => onNavigate(route) : undefined}
                  >
                    <span className="mcard-ico"><Icon name={a.transport === "API" ? "api" : "cpu"} size={20} /></span>
                    <span className="mcard-main">
                      <span className="mcard-top">
                        {a.label && <span className="mcard-kind">{a.label}</span>}
                        <span className="mcard-title">{window.HUB.agentDisplayName(a, serviceId)}</span>
                      </span>
                      <span className="mcard-desc">{a.cardSub || a.desc}</span>
                    </span>
                    {enabled
                      ? <span className="mcard-cta">매뉴얼 보기 <Icon name="arrow" size={15} /></span>
                      : <span className="mcard-soon">준비중</span>}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {flow.length > 0 && (
          <section className="svc-sec">
            <div className="sec-head">
              <h2>서비스 이용 방법</h2>
              <p>가입부터 발송, 사이트 이용까지 순서대로 안내합니다.</p>
            </div>
            <div className="cap-stack">
              {flow.map((st, i) => (
                <CapStep key={st.id || i} step={st} n={i + 1} id={"flow-" + (i + 1)} noLink />
              ))}
            </div>
          </section>
        )}

        {sites.length > 0 && (
          <section className="svc-sec svc-sec-sites">
            <div className="sec-head">
              <h2>관련 사이트</h2>
              <p>매뉴얼이 아닌 <b>외부 운영 사이트</b>입니다. 실제 등록·발송 작업을 할 때 이용하세요.</p>
            </div>
            <SiteLinks sites={sites} compact />
          </section>
        )}

        {empty && (
          <div className="cap-wip">
            <span className="cap-wip-ico">🚧</span>
            <div>
              <div className="cap-wip-title">준비 중입니다</div>
              <p>이 서비스의 이용 안내는 곧 업데이트될 예정입니다. 위 ‘연동 방법’에서 매뉴얼을 확인하세요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ AGENT DETAIL (캡처 스택) ============================ */
/* 섹션 → 페이지 평탄화: features는 기능별로 1페이지, steps는 서비스당 1페이지 */
/* 목차(좌측 네비)용 짧은 라벨.
   본문 제목(st.title)은 설명형으로 길게 두고, 목차는 핵심만 보여 스캔 기능을 살린다.
   우선순위: st.nav(명시) > DB 테이블 스텝(업무명+테이블명) > "—" 앞 핵심(+코드 힌트) > 원제목.
   - "SDK_VMS_SEND — 발송 요청 테이블"        → "발송 요청 (SDK_VMS_SEND)"
   - "SDK_VMS_REPORT_DETAIL — 수신자별 …"     → "상세 결과 (REPORT_DETAIL)"
   - "통계 테이블 — SDK_SEND_STAT"            → "통계 테이블 (SDK_SEND_STAT)"
   - "응답코드 — TCS_RESULT"                  → "응답코드 (TCS_RESULT)"
   ※ 공백 있는 라벨은 길면 다음 줄로 깔끔히 넘어간다(허용). */
const TBL_ROLE = [
  [/_REPORT_DETAIL$/, "상세 결과", true],   // true = 접두(SDK_xxx_) 떼고 표기
  [/_REPORT$/, "발송 결과", false],
  [/_RECEIVE$/, "수신", false],
  [/_SEND$/, "발송 요청", false],
];
function navLabel(st) {
  if (st.nav) return st.nav;
  const t = (st.title || "").trim();
  const i = t.indexOf(" — ");
  if (i < 0) return t;
  const left = t.slice(0, i).trim();
  const right = t.slice(i + 3).trim();
  if (/^SDK_[A-Z0-9_]+$/.test(left)) {                        // DB 테이블 스텝
    for (const [re, role, useSuffix] of TBL_ROLE) {
      if (re.test(left)) {
        const shown = useSuffix ? left.replace(/^SDK_[A-Z0-9]+_/, "") : left;
        return role + " (" + shown + ")";                    // 업무명 (테이블명)
      }
    }
    return left;                                             // 매칭 안 되면 코드 그대로
  }
  const code = (right.match(/\b(?:SDK_[A-Z0-9_]+|TCS_RESULT|CONTENT_DATA)\b/) || [])[0];
  if (code && left.length <= 8) return left + " (" + code + ")"; // 짧은 핵심 + 코드 힌트
  return left;                                                // 그 외엔 "—" 앞 핵심만
}

function buildPages(sections) {
  const pages = [];
  sections.forEach((sec) => {
    if (sec.type === "features") {
      sec.features.forEach((f) => pages.push({
        key: sec.service.id + "/" + f.id,
        serviceId: sec.service.id,
        featureId: f.id,
        group: f.group || sec.navName || sec.service.name,
        title: f.name,
        construction: !!f.construction,
        steps: f.steps || [],
        intro: f.intro,
        mapGroups: f.mapGroups,
      }));
    } else {
      pages.push({
        key: sec.service.id,
        serviceId: sec.service.id,
        featureId: "_",
        group: sec.navName || sec.service.name,
        title: sec.service.name + " 연동 가이드",
        construction: false,
        steps: sec.steps || [],
        intro: sec.intro,
      });
    }
  });
  return pages;
}
/* 페이지를 서비스 단위로 묶어 좌측 네비 구성 */
function buildNavGroups(pages) {
  const groups = [];
  pages.forEach((p, i) => {
    let g = groups[groups.length - 1];
    if (!g || g.serviceId !== p.serviceId || g.name !== p.group) {
      g = { serviceId: p.serviceId, name: p.group, items: [] };
      groups.push(g);
    }
    g.items.push({ idx: i, title: p.title, construction: p.construction });
  });
  return groups;
}

/* 스크롤 목표 위로 비워둘 여유(px).
   기본은 고정 헤더 + 여백(92). 최상단에서 퀵메뉴(.topmenu.show)가 내려와 있으면
   그 아래까지 비워, 스텝 제목이 헤더·퀵메뉴에 가리지 않게 한다. */
function topClearance() {
  let bottom = 0;
  const tm = document.querySelector(".topmenu.show");
  if (tm) bottom = tm.getBoundingClientRect().bottom;
  return Math.max(92, bottom + 16);
}

function AgentDetail({ agentId, index, onNavigate, anchor, query, navToken }) {
  const agent = window.HUB.AGENT_MAP[agentId];
  const sections = React.useMemo(() => window.MANUALS.getSections(agentId), [agentId]);
  const pages = React.useMemo(() => buildPages(sections), [sections]);
  const groups = React.useMemo(() => buildNavGroups(pages), [pages]);
  const dispName = agent ? window.HUB.agentDisplayName(agent, null) : "";
  const topRef = React.useRef(null);
  const spyLock = React.useRef(false); // true면 스크롤스파이 억제(프로그램 스크롤 진행 중)
  const lockTimer = React.useRef(null);
  const hlTimer = React.useRef(null);   // 키워드 강조 자동 해제 타이머
  function lockSpy() {
    // 클릭/딥링크로 프로그램 스크롤 시작 → 스크롤이 멈출 때 해제(onScroll). 안전상 최대치도 설정.
    spyLock.current = true;
    clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => { spyLock.current = false; }, 1600);
  }

  // anchor로 진입 시 시작 페이지 선택
  //  · sec-<serviceId>            → 해당 서비스 첫 페이지
  //  · step-<svc>-<feat>-<stepNo> → 해당 기능 페이지 (스텝은 아래 effect에서 스크롤)
  const initial = React.useMemo(() => {
    if (anchor && anchor.indexOf("step-") === 0) {
      // serviceId·featureId에 '-'가 들어갈 수 있어 위치 분해 대신 접두사로 매칭한다.
      const rest = anchor.slice(5); // "<svc>-<feat>-<stepNo>"
      const i = pages.findIndex((pg) => rest.indexOf(pg.serviceId + "-" + pg.featureId + "-") === 0);
      if (i >= 0) return i;
    }
    if (anchor && anchor.indexOf("sec-") === 0) {
      const sid = anchor.slice(4);
      const i = pages.findIndex((p) => p.serviceId === sid);
      if (i >= 0) return i;
    }
    return 0;
  }, [anchor, pages]);
  // step-…-<stepNo> 딥링크의 목표 스텝 번호
  const targetStep = React.useMemo(() => {
    if (anchor && anchor.indexOf("step-") === 0) {
      const n = parseInt(anchor.split("-").pop(), 10);
      return n > 0 ? n : null;
    }
    return null;
  }, [anchor]);
  const [active, setActive] = React.useState(initial);
  const [navOpen, setNavOpen] = React.useState(true); // 활성 항목의 하위 목차 펼침 여부
  const [activeStep, setActiveStep] = React.useState(1); // 스크롤 위치의 현재 스텝(좌측 네비 강조)

  React.useEffect(() => { setActive(initial); setNavOpen(true); window.scrollTo(0, 0); }, [agentId, anchor, initial, navToken]);

  /* 현재 보고 있는 탭의 그룹을 상단 메뉴에 알린다.
     한 페이지(예: Communis 가이드)가 '서비스 소개'와 '연동 방법'을 겸하는 경우,
     상단 메뉴가 지금 구간에 맞는 항목만 활성화할 수 있게 한다. */
  React.useEffect(() => {
    const cur = pages[active];
    const detail = { agentId: agentId, group: (cur && cur.group) || null };
    window.__hubSection = detail;
    window.dispatchEvent(new CustomEvent("hub:section", { detail: detail }));
    return () => {
      window.__hubSection = null;
      window.dispatchEvent(new CustomEvent("hub:section", { detail: { agentId: null, group: null } }));
    };
  }, [agentId, active, pages]);

  // 스크롤 위치에 따라 현재 보고 있는 스텝을 좌측 네비에 표시(스크롤스파이)
  React.useEffect(() => {
    setActiveStep(1);
    const count = (pages[active] && pages[active].steps && pages[active].steps.length) || 0;
    if (count <= 1) return;
    let ticking = false;
    let endTimer = null;
    function compute() {
      ticking = false;
      if (spyLock.current) return; // 프로그램 스크롤 중엔 강조 고정(클릭한 스텝 유지)
      let cur = 1;
      for (let n = 1; n <= count; n++) {
        const el = document.getElementById("step-" + n);
        if (el && el.getBoundingClientRect().top - 100 <= 0) cur = n;
      }
      setActiveStep(cur); // 같은 값이면 React가 재렌더 생략
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(compute); } // 프레임당 1회
      // 스크롤이 멈추면(프로그램 스크롤 종료) 잠금 해제 — 멈춘 위치에선 재계산하지 않아 깜빡임 없음
      clearTimeout(endTimer);
      endTimer = setTimeout(() => { spyLock.current = false; }, 150);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(endTimer); };
  }, [active, pages]);

  // 검색 결과·공유 링크(step-…)로 진입 시 목표 스텝까지 스크롤 + 키워드 강조
  React.useEffect(() => {
    if (!targetStep) return;
    let cancelled = false;
    let hadHit = false;
    // initial=true: 강조·반짝임 + 부드러운 스크롤 / false: 레이아웃 안정 후 위치 보정(즉시)
    function place(initial) {
      const el = document.getElementById("step-" + targetStep);
      if (!el || cancelled) return;
      lockSpy();
      let focus = el;
      if (initial) {
        clearSearchHighlights();
        // 제목(h3)·번호 등 React가 직접 관리하는 텍스트는 건드리지 않도록 본문(.cap-body)만 강조
        const body = el.querySelector(".cap-body");
        const hit = query && body ? highlightTerm(body, query) : null;
        hadHit = !!hit;
        if (hit) focus = hit;
        setActiveStep(targetStep);
        el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
        if (hit) {
          clearTimeout(hlTimer.current);
          hlTimer.current = setTimeout(() => clearSearchHighlights(), 2600);
        }
      } else if (hadHit) {
        const m = el.querySelector("mark.search-hit");
        if (m) focus = m;
      }
      // 키워드가 있으면 화면 중앙(약 40%)에, 없으면 스텝 제목이 헤더 아래에 보이도록
      const offset = hadHit ? Math.round(window.innerHeight * 0.4) : topClearance();
      const y = Math.max(0, focus.getBoundingClientRect().top + window.scrollY - offset);
      window.scrollTo({ top: y, behavior: initial ? "smooth" : "auto" });
    }
    const t1 = setTimeout(() => place(true), 140);
    // 신규 탭으로 딥링크 진입 시 폰트·표 로딩으로 레이아웃이 늦게 잡혀 위치가 어긋나므로,
    // 페이지 로드 직후(초기) 진입에 한해 안정된 뒤 한 번 더 위치를 보정한다.
    const fresh = (typeof performance !== "undefined" ? performance.now() : 9999) < 4000;
    const t2 = fresh ? setTimeout(() => place(false), 650) : null;
    if (fresh && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!cancelled) place(false); });
    }
    return () => { cancelled = true; clearTimeout(t1); if (t2) clearTimeout(t2); clearTimeout(hlTimer.current); };
  }, [targetStep, active, agentId, anchor, query, navToken]);

  // 페이지를 벗어나거나 언마운트 시 강조 제거
  React.useEffect(() => () => clearSearchHighlights(), [active]);

  function goPage(i) {
    setActive(i);
    setNavOpen(true);
    if (topRef.current) {
      const y = topRef.current.getBoundingClientRect().top + window.scrollY - topClearance();
      window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goStep(pageIdx, n) {
    lockSpy(); // 스크롤이 멈출 때까지 스파이 억제
    setActiveStep(n);
    function scroll() {
      const el = document.getElementById("step-" + n);
      if (el) {
        // 헤더 + (표시 중이면) 퀵메뉴 아래로 — 스텝 제목이 가리지 않게
        const y = el.getBoundingClientRect().top + window.scrollY - topClearance();
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
    if (pageIdx !== active) { setActive(pageIdx); setTimeout(scroll, 60); }
    else scroll();
  }

  if (!agent || !window.HUB.isAgentPublished(agentId)) return <NotFound onNavigate={onNavigate} />;

  const page = pages[active] || pages[0];
  const prev = active > 0 ? pages[active - 1] : null;
  const next = active < pages.length - 1 ? pages[active + 1] : null;

  return (
    <div className="page fade-up">
      <div className="wrap doc-wrap">
        <div className="doc-layout" ref={topRef}>
          <aside className="doc-nav">
            {groups.map((g, gi) => (
              <div className="doc-nav-group" key={gi}>
                <div className="doc-nav-svc">{g.name}</div>
                {g.items.map((it) => (
                  <React.Fragment key={it.idx}>
                    <button
                      className={"doc-nav-item" + (active === it.idx ? " active" : "")}
                      onClick={() => (it.idx === active ? setNavOpen((o) => !o) : goPage(it.idx))}
                    >
                      <span>{it.title}{it.construction ? " 🚧" : ""}</span>
                      {!it.construction && pages[it.idx].steps.length > 1 && (
                        <Icon
                          name="chevron"
                          size={13}
                          className="doc-nav-caret"
                          style={{ transform: "rotate(" + (active === it.idx && navOpen ? 90 : 0) + "deg)" }}
                        />
                      )}
                    </button>
                    {active === it.idx && navOpen && !it.construction && pages[it.idx].steps.length > 1 && (
                      <div className="doc-nav-sub">
                        {pages[it.idx].steps.map((st, si, arr) => {
                          const showGrp = st._group && st._group !== (si > 0 ? arr[si - 1]._group : null);
                          return (
                            <React.Fragment key={si}>
                              {showGrp && <div className="doc-nav-grp">{st._group}</div>}
                              <button
                                className={"doc-nav-subitem" + (active === it.idx && activeStep === si + 1 ? " active" : "")}
                                onClick={() => goStep(it.idx, si + 1)}
                              >
                                <span className="doc-nav-subnum">{si + 1}</span>
                                <span title={st.title}>{navLabel(st)}</span>
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </aside>

          <main className="doc-main">
            <div className="doc-head-row">
              <header className="cap-head">
                <AgentAvatar agent={agent} className="cap-avatar" />
                <h1>{dispName}</h1>
              </header>
              <DownloadButtons agent={agent} />
            </div>
            {agent.detailIntro ? (
              <ul className="cap-lead-list">
                {agent.detailIntro.map((t, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: t }} />
                ))}
              </ul>
            ) : (
              <p className="cap-lead">{agent.desc}</p>
            )}
            <CapPage page={page} agentId={agentId} />
            <div className="doc-pager">
              <div className="doc-pager-side">
                {prev && (
                  <button className="doc-pager-btn" onClick={() => goPage(active - 1)}>
                    <span className="dir">← 이전</span>
                    <span className="t">{prev.title}</span>
                  </button>
                )}
              </div>
              <div className="doc-pager-side right">
                {next && (
                  <button className="doc-pager-btn next" onClick={() => goPage(active + 1)}>
                    <span className="dir">다음 →</span>
                    <span className="t">{next.title}</span>
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* 가이드 맵 — 가이드 첫 페이지의 '한눈에 보기'. 그룹 카드 + 링크 항목(해시 이동) */
function GuideMap({ groups }) {
  return (
    <div className="gmap">
      {(groups || []).map((g, i) => (
        <section className="gmap-card" key={i}>
          <div className="gmap-head">
            <span className="gmap-ic"><Icon name={g.icon || "hash"} size={18} /></span>
            <div className="gmap-htx">
              <h3>{g.title}</h3>
              {g.desc && <p>{g.desc}</p>}
            </div>
          </div>
          <div className="gmap-items">
            {(g.items || []).map((it, j) => (
              <a className="gmap-item" key={j} href={it.href}>
                <span className="gmap-item-tx">
                  <span className="gmap-item-label">{it.label}</span>
                  {it.sub && <span className="gmap-item-sub">{it.sub}</span>}
                </span>
                <Icon name="arrow" size={14} className="gmap-item-arr" />
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ============================ 미리보기(Peek) ============================
   본문 안의 상호참조 링크(a.xref)를 눌렀을 때, 페이지를 떠나지 않고
   대상 문서를 딤 처리된 오버레이로 먼저 훑어보게 한다.
   링크 형식:  <a class="xref" data-to="<agentId>" data-sec="<anchor>">텍스트</a>
               data-svc 로 서비스 경로(가이드형)를 지정할 수도 있다.
   ====================================================================== */
function peekTargetOf(el) {
  const to = el.getAttribute("data-to");
  if (!to) return null;
  return { agentId: to, anchor: el.getAttribute("data-sec") || null, svcId: el.getAttribute("data-svc") || null };
}

function PeekModal({ target, onClose, onNavigate }) {
  useBodyScrollLock();
  const agent = window.HUB.AGENT_MAP[target.agentId];
  const pages = React.useMemo(
    () => (agent ? buildPages(window.MANUALS.getSections(target.agentId)) : []),
    [target.agentId, agent]
  );
  // 앵커로 시작 페이지 찾기(없으면 첫 페이지)
  const startIdx = React.useMemo(() => {
    const a = target.anchor;
    if (a && a.indexOf("step-") === 0) {
      const rest = a.slice(5);
      const i = pages.findIndex((pg) => rest.indexOf(pg.serviceId + "-" + pg.featureId + "-") === 0);
      if (i >= 0) return i;
    }
    if (a && a.indexOf("sec-") === 0) {
      const sid = a.slice(4);
      const i = pages.findIndex((pg) => pg.serviceId === sid);
      if (i >= 0) return i;
    }
    return 0;
  }, [pages, target.anchor]);
  const [idx, setIdx] = React.useState(startIdx);
  React.useEffect(() => setIdx(startIdx), [startIdx]);
  const bodyRef = React.useRef(null);
  // 탭/이전·다음 이동 시 본문을 맨 위로
  function go(i) {
    setIdx(i);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }

  // ESC로 닫기 + 배경 스크롤 잠금
  React.useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!agent) return null;
  const page = pages[idx] || pages[0];
  const prev = idx > 0 ? pages[idx - 1] : null;
  const next = idx < pages.length - 1 ? pages[idx + 1] : null;
  const route = target.svcId
    ? { name: "service", id: target.svcId, anchor: target.anchor }
    : (agent.serviceGuide && agent.supports && agent.supports[0])
      ? { name: "service", id: agent.supports[0], anchor: target.anchor }
      : { name: "agent", id: target.agentId, anchor: target.anchor };
  const href = location.href.split("#")[0] + routeToHash(route);

  return (
    <div className="peek-back" onClick={onClose}>
      <div className="peek" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="peek-head">
          <div className="peek-tt">
            <span className="peek-badge">미리보기</span>
            <b>{window.HUB.agentDisplayName(agent, null)}</b>
            {page && <span className="peek-sub">{page.title}</span>}
          </div>
          <div className="peek-acts">
            <a className="peek-btn" href={href} target="_blank" rel="noopener noreferrer">
              <Icon name="external" size={14} /> 새 탭으로 열기
            </a>
            <button className="peek-btn primary" onClick={() => { onClose(); onNavigate(route); }}>
              이 문서로 이동 <Icon name="arrow" size={14} />
            </button>
            <button className="peek-x" onClick={onClose} aria-label="닫기"><Icon name="x" size={16} /></button>
          </div>
        </div>
        {pages.length > 1 && (
          <div className="peek-tabs">
            {pages.map((pg, i) => (
              <button key={pg.key} className={"peek-tab" + (i === idx ? " on" : "")} onClick={() => go(i)}>
                {pg.title}
              </button>
            ))}
          </div>
        )}
        <div className="peek-body" ref={bodyRef}>
          {page ? <CapPage page={page} agentId={target.agentId} /> : <p className="doc-page-intro">내용이 없습니다.</p>}
          {/* 뒤에 더 있는지 알 수 있게 하단 이전/다음 */}
          {pages.length > 1 && (
            <div className="doc-pager peek-pager">
              <div className="doc-pager-side">
                {prev && (
                  <button className="doc-pager-btn" onClick={() => go(idx - 1)}>
                    <span className="dir">← 이전</span>
                    <span className="t">{prev.title}</span>
                  </button>
                )}
              </div>
              <div className="doc-pager-side right">
                {next && (
                  <button className="doc-pager-btn next" onClick={() => go(idx + 1)}>
                    <span className="dir">다음 →</span>
                    <span className="t">{next.title}</span>
                  </button>
                )}
              </div>
            </div>
          )}
          <p className="peek-foot">
            {idx + 1} / {pages.length}
            {next ? " · 아래 [다음]으로 이어서 볼 수 있습니다" : " · 마지막 문서입니다"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* 본문 어디서든 a.xref 클릭을 가로채 미리보기를 띄운다 */
function usePeek() {
  const [target, setTarget] = React.useState(null);
  React.useEffect(() => {
    function onClick(e) {
      const a = e.target.closest && e.target.closest("a.xref");
      if (!a) return;
      const t = peekTargetOf(a);
      if (!t) return;
      e.preventDefault();
      setTarget(t);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return [target, setTarget];
}

/* 단일 페이지 본문 (캡처 스택 또는 공사중) */
const CapPage = React.memo(function CapPage({ page, agentId }) {
  if (!page) return null;
  if (page.construction) {
    return (
      <div>
        <h2 className="doc-page-title">{page.title}</h2>
        <div className="cap-wip">
          <span className="cap-wip-ico">🚧</span>
          <div>
            <div className="cap-wip-title">공사 중입니다</div>
            <p>{page.intro || "이 항목은 준비 중입니다. 곧 업데이트될 예정입니다."}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 className="doc-page-title">{page.title}</h2>
      {page.intro && <p className="doc-page-intro">{page.intro}</p>}
      {page.mapGroups ? (
        <GuideMap groups={page.mapGroups} />
      ) : (
        <div className="cap-stack">
          {page.steps.map((st, i, arr) => {
            const showGrp = st._group && st._group !== (i > 0 ? arr[i - 1]._group : null);
            return (
              <React.Fragment key={i}>
                {showGrp && <div className="cap-group" id={"grp-" + (i + 1)}>{st._group}</div>}
                <CapStep step={st} n={i + 1} id={"step-" + (i + 1)} agentId={agentId} serviceId={page.serviceId} featureId={page.featureId} />
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
});

/* 표 렌더러 — schema: 첫 칸을 컬럼명(모노)으로 강조 */
function CapTable({ table }) {
  const cw = table.colWidths; // 지정 시 고정 컬럼폭(여러 표 정렬용)
  return (
    <div className="cap-table-wrap">
      <table className={"cap-table" + (table.schema ? " schema" : "") + (cw ? " fixed" : "")}>
        {cw && <colgroup>{cw.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>}
        <thead>
          <tr>{table.cols.map((c, i) => <th key={i}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} dangerouslySetInnerHTML={{ __html: String(cell) }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 스텝 영역을 이미지(PNG)로 저장 — 설치 준비사항·방화벽 등 영업 현장 캡처용 */
function saveStepImage(id, filename) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!window.html2canvas) { alert("이미지 저장 기능을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."); return; }
  const bg = getComputedStyle(el).backgroundColor;
  window.html2canvas(el, {
    backgroundColor: bg && bg !== "rgba(0, 0, 0, 0)" ? bg : "#ffffff",
    scale: 2,
    ignoreElements: (node) => node.classList && node.classList.contains("cap-snap"),
  }).then((canvas) => {
    const a = document.createElement("a");
    a.download = (filename || "manual").replace(/[\\/:*?"<>|]/g, "_") + ".png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }).catch(() => alert("이미지 저장에 실패했습니다."));
}

/* 단계 한 칸 = 번호+제목 + 본문(설명/목록/표/코드/캡처/노트) */
function CapStep({ step, n, id, agentId, serviceId, featureId, noLink }) {
  const [linked, setLinked] = React.useState(false);
  const linkTimer = React.useRef(null);
  function copySectionLink() {
    const base = location.href.split("#")[0];
    const ag = window.HUB.AGENT_MAP[agentId];
    // serviceGuide(예: Communis)는 서비스 경로로 공유
    const path = (ag && ag.serviceGuide)
      ? "#/service/" + serviceId + "?sec=step-" + serviceId + "-" + featureId + "-" + n
      : "#/agent/" + agentId + "?sec=step-" + serviceId + "-" + featureId + "-" + n;
    const url = base + path;
    copyToClipboard(url, () => {
      setLinked(true);
      showToast("링크가 복사되었습니다.");
      clearTimeout(linkTimer.current);
      linkTimer.current = setTimeout(() => setLinked(false), 1600);
    });
  }
  return (
    <div className="cap-step" id={id}>
      <div className="cap-step-head">
        <span className="cap-num">{n}</span>
        <h3
          className={"cap-title" + (noLink ? " plain" : "")}
          onClick={noLink ? undefined : copySectionLink}
          title={noLink ? undefined : "클릭하면 이 섹션 링크가 복사됩니다"}
        >
          <span>{step.title}</span>
          {!noLink && (
            <button
              type="button"
              className={"cap-link-btn" + (linked ? " ok" : "")}
              onClick={(e) => { e.stopPropagation(); copySectionLink(); }}
              aria-label="이 섹션 링크 복사"
              title="이 섹션 링크 복사"
            >
              <Icon name={linked ? "check" : "copy"} size={14} />
            </button>
          )}
        </h3>
        {step.snapshot && (
          <button className="cap-snap" onClick={() => saveStepImage(id, step.title)} title="이 내용을 이미지로 저장">
            <Icon name="download" size={14} /><span>이미지 저장</span>
          </button>
        )}
      </div>
      <div className="cap-body">
        {step.body && <p dangerouslySetInnerHTML={{ __html: step.body }} />}
        {step.list && (
          <ul className="cap-list">
            {step.list.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: li }} />)}
          </ul>
        )}
        {step.table && <CapTable table={step.table} />}
        {step.tables && step.tables.map((t, i) => (
          <div className="cap-subtable" key={i}>
            {t.label && <div className="cap-subtable-label">{t.label}</div>}
            <CapTable table={t} />
          </div>
        ))}
        {step.downloads && (
          <div className="dl-cards">
            {step.downloads.map((d, i) => (
              <a key={i} className="dl-card" href={d.href} target="_blank" rel="noopener noreferrer">
                <span className="dl-card-ic"><Icon name="download" size={18} /></span>
                <span className="dl-card-tx">
                  <span className="dl-card-title">{d.label}</span>
                  {d.sub && <span className="dl-card-sub">{d.sub}</span>}
                </span>
                <span className="dl-card-arr"><Icon name="external" size={15} /></span>
              </a>
            ))}
          </div>
        )}
        {step.code && <CodeBlock code={step.code} />}
        {step.codePlain && <CodeBlock plain code={step.codePlain} />}
        {step.codeTabs && <CodeTabs tabs={step.codeTabs} />}
        {step.widget === "queryGen" && <QueryGenerator />}
        {step.widget === "mstgExamples" && <MstgExamples />}
        {step.widget === "hermesFlow" && <HermesSendFlow />}
        {step.shot && <Shot shot={step.shot} />}
        {step.note && (
          <div className="cap-note">
            <span className="ni"><Icon name="info" size={15} /></span>
            <span dangerouslySetInnerHTML={{ __html: step.note }} />
          </div>
        )}
        {step.cta && (
          <a className="cap-cta" href={step.cta.href}>
            <span className="cap-cta-ic"><Icon name={step.cta.icon || "hash"} size={16} /></span>
            <span className="cap-cta-tx">{step.cta.label}</span>
            <span className="cap-cta-arr"><Icon name="arrow" size={16} /></span>
          </a>
        )}
      </div>
    </div>
  );
}

/* ============================ 맨 위/아래 이동 버튼 ============================ */
function ScrollButtons() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toBottom = () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  return (
    <div className="scroll-btns">
      <button className="scroll-btn" onClick={toTop} title="맨 위로" aria-label="맨 위로">
        <Icon name="chevron" size={18} style={{ transform: "rotate(-90deg)" }} />
      </button>
      <button className="scroll-btn" onClick={toBottom} title="맨 아래로" aria-label="맨 아래로">
        <Icon name="chevron" size={18} style={{ transform: "rotate(90deg)" }} />
      </button>
    </div>
  );
}

/* ============================ CHANGELOG (문서 버전 이력) ============================ */
function verBadge(status) {
  const map = {
    done: ["반영 완료", "done"],
    pending: ["반영 대기", "pending"],
    planned: ["작성 예정", "planned"],
  };
  const m = map[status] || ["—", ""];
  return '<span class="ver-badge ' + m[1] + '">' + m[0] + "</span>";
}

function Changelog({ onNavigate }) {
  const V = window.HUB_VERSIONS || { sources: [], changelog: [], updated: "", sourceAgents: [] };
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  // 출처 매뉴얼을 에이전트별로 묶어 접이식으로 표시
  const srcGroups = (V.sourceAgents || []).map((ag) => ({
    ag,
    list: (V.sources || []).filter((s) => s.agent === ag.id),
  })).filter((g) => g.list.length);
  const [openSrc, setOpenSrc] = React.useState(srcGroups.length ? srcGroups[0].ag.id : null);
  function srcTableOf(list) {
    return {
      cols: ["원본 PDF 파일", "버전", "작성일", "Agent Ver", "적용 위치", "변경 요약"],
      colWidths: ["30%", "8%", "12%", "11%", "20%", "19%"],
      rows: list.map((s) => [
        "<b>" + s.file + "</b>",
        "v" + s.ver,
        s.docDate,
        s.agentVer ? "Ver " + s.agentVer : "—",
        s.target,
        s.change || "—",
      ]),
    };
  }

  return (
    <div className="page fade-up">
      <div className="wrap section-pad">
        <div className="breadcrumb">
          <a onClick={() => onNavigate({ name: "home" })}>홈</a>
          <Icon name="chevron" size={14} />
          <span className="cur">문서 이력</span>
        </div>

        <h1 className="cl-title">문서 버전 이력</h1>
        <p className="cl-intro">
          웹 매뉴얼의 각 항목이 어떤 <b>원본 매뉴얼(버전)</b>을 기준으로 작성되었는지 관리합니다.
          최신 매뉴얼 입수 시 변경분을 반영하고 이 표를 갱신합니다.
        </p>
        {V.note && (
          <div className="cap-note" style={{ marginBottom: 26 }}>
            <span className="ni"><Icon name="info" size={15} /></span>
            <span dangerouslySetInnerHTML={{ __html: V.note }} />
          </div>
        )}

        <section className="home-sec" style={{ marginTop: 8 }}>
          <div className="home-sec-head">
            <span className="bar"></span>
            <h2>참고한 원본 매뉴얼</h2>
            <span className="count">{(V.sources || []).length}</span>
          </div>
          <p className="cl-hint">에이전트를 누르면 실제 참고한 PDF 파일·버전 목록이 펼쳐집니다.</p>
          <div className="src-acc">
            {srcGroups.map((g) => {
              const open = openSrc === g.ag.id;
              return (
                <div className={"src-grp" + (open ? " open" : "")} key={g.ag.id}>
                  <button className="src-grp-head" onClick={() => setOpenSrc(open ? null : g.ag.id)}>
                    <span className="src-grp-tt">
                      <span className="src-grp-name">{g.ag.name}</span>
                      <span className="src-grp-sub">{g.ag.sub}</span>
                    </span>
                    <span className="src-grp-cnt">{g.list.length}개</span>
                    <Icon name="chevron" size={16} className="src-grp-caret" style={{ transform: open ? "rotate(90deg)" : "none" }} />
                  </button>
                  {open && (
                    <div className="src-grp-body">
                      <CapTable table={srcTableOf(g.list)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="home-sec" style={{ marginTop: 36, paddingBottom: 40 }}>
          <div className="home-sec-head">
            <span className="bar agt"></span>
            <h2>업데이트 내역</h2>
            <span className="count">{(V.changelog || []).length}</span>
          </div>
          <ol className="cl-log">
            {(V.changelog || []).map((c, i) => (
              <li key={i}>
                <div className="cl-head">
                  <span className="cl-date">{c.date}</span>
                  <span className="cl-area">{c.area}</span>
                </div>
                {c.items && (
                  <ul className="cl-items">
                    {c.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }} />)}
                  </ul>
                )}
                {c.text && <span dangerouslySetInnerHTML={{ __html: c.text }} />}
              </li>
            ))}
          </ol>
        </section>

        {V.updated && <div className="cl-foot">마지막 갱신 · {V.updated}</div>}
      </div>
    </div>
  );
}

/* ============================ RESULT CODES (서비스별 결과코드) ============================ */
function rcHighlight(text, needle) {
  // 검색어를 <mark>로 강조. text는 평문(엑셀 원본)이므로 먼저 이스케이프.
  const esc = String(text == null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (!needle) return esc;
  const q = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return esc.replace(new RegExp("(" + q + ")", "gi"), "<mark>$1</mark>");
}

function ResultCodes({ onNavigate, group, q: initialQ }) {
  const RC = window.HUB_RESULTCODES || { groups: [] };
  const groups = RC.groups || [];
  const [active, setActive] = React.useState(() => {
    const f = groups.find((g) => g.id === group);
    return (f && f.id) || (groups[0] && groups[0].id) || "";
  });
  const [q, setQ] = React.useState(initialQ || "");

  React.useEffect(() => { window.scrollTo(0, 0); }, []);
  React.useEffect(() => {
    if (group && groups.some((g) => g.id === group)) setActive(group);
  }, [group]);
  // 결과코드 검색으로 진입(예: "104") 시 해당 코드로 필터를 채워 바로 보이게
  React.useEffect(() => { setQ(initialQ || ""); }, [initialQ]);

  const cur = groups.find((g) => g.id === active) || groups[0];
  const codes = (cur && cur.codes) || [];
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? codes.filter((c) => (c.code + " " + c.title + " " + c.desc).toLowerCase().includes(needle))
    : codes;

  function pick(id) {
    setActive(id);
    setQ("");
    onNavigate({ name: "resultcodes", group: id }); // 주소 동기화 → 탭 단위 링크 공유 가능
  }

  return (
    <div className="page fade-up">
      <div className="wrap section-pad">
        <div className="breadcrumb">
          <a onClick={() => onNavigate({ name: "home" })}>홈</a>
          <Icon name="chevron" size={14} />
          <span className="cur">결과코드</span>
        </div>

        <h1 className="cl-title">서비스별 결과코드</h1>
        {RC.note && <p className="cl-intro">{RC.note}</p>}

        <div className="rc-tabs">
          {groups.map((g) => (
            <button
              key={g.id}
              className={"rc-tab" + (g.id === active ? " on" : "")}
              onClick={() => pick(g.id)}
            >
              {g.short}
              <span className="rc-tab-count">{g.count}</span>
            </button>
          ))}
        </div>

        <div className="rc-toolbar">
          <div className="rc-search">
            <Icon name="search" size={15} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={cur ? cur.short + " — 코드·제목·내용 검색…" : "검색…"}
            />
            {q && <button className="rc-clear" onClick={() => setQ("")} aria-label="지우기">×</button>}
          </div>
          <span className="rc-count">
            {needle ? <b>{filtered.length}</b> : <b>{codes.length}</b>}
            {needle ? " / " + codes.length : ""} 건
          </span>
        </div>

        <div className="cap-table-wrap rc-table-wrap">
          <table className="cap-table rc-table">
            <thead>
              <tr>
                <th className="rc-c-code">코드</th>
                <th className="rc-c-title">제목</th>
                <th>설명 (조치 / 답변)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={3} className="rc-empty">검색 결과가 없습니다.</td></tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={i}>
                    <td className="rc-code" dangerouslySetInnerHTML={{ __html: rcHighlight(c.code, needle) }} />
                    <td className="rc-title" dangerouslySetInnerHTML={{ __html: rcHighlight(c.title, needle) }} />
                    <td className="rc-desc" dangerouslySetInnerHTML={{ __html: rcHighlight(c.desc, needle) }} />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {RC.updated && <div className="cl-foot">출처 · {RC.source} · 갱신 {RC.updated}</div>}
      </div>
    </div>
  );
}

/* ============================ SEARCH RESULTS ============================ */
function SearchResults({ query, index, onNavigate }) {
  const [filter, setFilter] = React.useState("all");
  const [q, setQ] = React.useState(query);

  React.useEffect(() => { setQ(query); window.scrollTo(0, 0); }, [query]);

  const results = React.useMemo(() => searchIndex(index, q), [q, index]);
  const counts = React.useMemo(() => {
    const c = { all: results.length, resultcode: 0, service: 0, agent: 0, document: 0 };
    results.forEach((r) => { if (c[r.type] != null) c[r.type]++; });
    return c;
  }, [results]);

  const filtered = filter === "all" ? results : results.filter((r) => r.type === filter);
  const groups = groupResults(filtered);
  const order = ["resultcode", "service", "agent", "document"];
  const kindLabel = { resultcode: "결과코드", service: "서비스", agent: "Agent", document: "문서" };

  return (
    <div className="page fade-up">
      <div className="wrap">
        <div className="results-head">
          <div className="breadcrumb">
            <a onClick={() => onNavigate({ name: "home" })}>홈</a>
            <Icon name="chevron" size={14} />
            <span className="cur">검색 결과</span>
          </div>
          <div style={{ maxWidth: 560, margin: "0 0 18px" }}>
            <SearchBar
              index={index}
              onNavigate={onNavigate}
              large
              autoFocus
              placeholder="검색어를 입력하세요…"
            />
          </div>
          <h1>
            <span className="q">"{q}"</span> 검색 결과
          </h1>
          <p className="meta">{results.length}건의 결과를 찾았습니다.</p>
        </div>

        <div className="results-filters">
          {["all", "resultcode", "service", "agent", "document"].map((f) => (
            <button
              key={f}
              className={"filter-pill" + (filter === f ? " active" : "")}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "전체" : kindLabel[f]}
              <span className="c">{counts[f]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="ico"><Icon name="search" size={30} /></div>
            <h3>결과가 없습니다</h3>
            <p>다른 키워드로 검색하거나, 홈에서 서비스·Agent를 둘러보세요.</p>
          </div>
        ) : (
          order.map((type) =>
            groups[type] && groups[type].length ? (
              <div className="result-group" key={type}>
                <div className="result-group-h">
                  {kindLabel[type]} <span style={{ color: "var(--text-3)" }}>{groups[type].length}</span>
                  <span className="line"></span>
                </div>
                {groups[type].map((r) => (
                  <ResultItem key={r.type + r.id} r={r} q={q} onNavigate={onNavigate} />
                ))}
              </div>
            ) : null
          )
        )}
      </div>
    </div>
  );
}

function ResultItem({ r, q, onNavigate }) {
  let icoEl, kicker, tags = [];
  if (r.type === "service") {
    const s = window.HUB.SERVICE_MAP[r.id];
    icoEl = <div className="result-ico" style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}><ServiceGlyph service={s} size={20} /></div>;
    kicker = <>서비스 · {window.HUB.liveAgentsForService(s.id).length}개 Agent</>;
    tags = s.features.slice(0, 3);
  } else if (r.type === "agent") {
    const a = window.HUB.AGENT_MAP[r.id];
    const p = window.HUB.PROVIDERS[a.provider];
    icoEl = <div className={"result-ico " + p.av}><Icon name={a.transport === "TCP_SOCKET" ? "cpu" : "link"} size={20} /></div>;
    kicker = <>Agent · {p.name}</>;
    tags = [a.transport === "API" ? "API 연동" : "TCP 소켓", ...(window.HUB.showsCenter(a) ? [window.HUB.CENTERS[a.center].name + " 센터"] : [])];
  } else if (r.type === "resultcode") {
    icoEl = <div className="result-ico" style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}><Icon name="hash" size={20} /></div>;
    kicker = <>결과코드 · 통합 조회</>;
    tags = (r.keywords || []).slice(0, 3);
  } else {
    const a = window.HUB.AGENT_MAP[r.agentId];
    const s = window.HUB.SERVICE_MAP[r.serviceId];
    icoEl = <div className="result-ico" style={{ background: "var(--bg-sunken)", color: "var(--text-3)" }}><Icon name="doc" size={20} /></div>;
    kicker = <>문서 · {a ? a.name : ""}{s ? " / " + s.name : ""}</>;
    tags = (r.keywords || []).slice(0, 3);
  }

  return (
    <div className="result-item" onClick={() => onNavigate(r.route)}>
      {icoEl}
      <div className="result-main">
        <div className="result-kicker">{kicker}</div>
        <h3 className="result-title">{highlight(r.title, q)}</h3>
        {r.body && <p className="result-snippet">{snippetHL(r.body, q)}</p>}
        {tags.length > 0 && (
          <div className="result-tags">
            {tags.map((t, i) => <span className="tag" key={i}>{t}</span>)}
          </div>
        )}
      </div>
      <span className="result-arrow"><Icon name="arrow" size={18} /></span>
    </div>
  );
}

function snippetHL(body, q) {
  const terms = q.trim().toLowerCase().split(/\s+/);
  let pos = -1;
  for (const t of terms) {
    const i = body.toLowerCase().indexOf(t);
    if (i >= 0) { pos = i; break; }
  }
  let text = body;
  if (pos > 60) text = "…" + body.slice(pos - 30);
  if (text.length > 150) text = text.slice(0, 150) + "…";
  return highlight(text, terms.find((t) => text.toLowerCase().includes(t)) || "");
}

/* ============================ NOT FOUND ============================ */
function NotFound({ onNavigate }) {
  return (
    <div className="wrap">
      <div className="empty-state">
        <div className="ico"><Icon name="search" size={30} /></div>
        <h3>찾을 수 없습니다</h3>
        <p>요청한 페이지가 존재하지 않습니다.</p>
        <button className="btn primary" style={{ marginTop: 18 }} onClick={() => onNavigate({ name: "home" })}>
          홈으로
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  Home,
  ServiceView,
  AgentDetail,
  SearchResults,
  NotFound,
  RightNav,
  scrollToId,
});

/* ============================================================
   헤르메스 발송 가이드 — 전체 화면 + 단계 스포트라이트 + 확대 팝업
   ------------------------------------------------------------
   · content/hermes/_ui.js 의 실제 마크업·CSS로 발송 화면을 통째로 렌더
   · 선택한 단계만 또렷하게(나머지 음영), 축소본은 맥락 파악용
   · 자세히 볼 때는 [크게 보기] 팝업에서 원래 크기로 확인
   · 조작 바(제목 드롭다운·이전/다음)는 sticky로 항상 따라다닌다
   ============================================================ */
const HZ_NATURAL_W = 1100;   // 헤르메스 본문 기준 폭(px)

/* 상자 안에 화면을 '잘리지 않게' 담기 위한 배율·높이 계산.
   컨테이너 패딩과 강조 테두리(inset -8px)까지 빼고 여유를 둔다. */
function hzFit(box, page) {
  if (!box || !page) return null;
  var cs = getComputedStyle(box);
  var padX = parseFloat(cs.paddingLeft || 0) + parseFloat(cs.paddingRight || 0);
  var padY = parseFloat(cs.paddingTop || 0) + parseFloat(cs.paddingBottom || 0);
  var avail = box.clientWidth - padX - 20;              // 좌우 여유 20px
  var nat = Math.max(page.scrollWidth, HZ_NATURAL_W);   // 내용이 더 넓으면 그 폭 기준
  var s = Math.min(1, avail / nat);
  return { scale: s, height: page.scrollHeight * s + padY + 20 };
}

/* 각 단계의 detail[] 은 헤르메스 실제 화면(2026-08-26 확인)에서 옮긴 것.
   화면 문구를 그대로 인용한 부분은 <i>…</i> 로 표시했다.
   hi[] = 가이드 팝업에서 강조할 영역을 찾는 키워드(화면 안의 th·제목·버튼 문구). */
const HZ_STEPS = [
  { part: "brand",    title: "브랜드 · 발신번호 선택",
    desc: "<b>[조회]</b>를 눌러 팝업에서 <b>브랜드 → 발신번호</b> 순으로 고릅니다. 발신번호는 대표번호가 자동 선택됩니다.",
    tip: "목록에 브랜드·발신번호가 없다면 RBC 등록·승인이 끝나지 않은 것입니다.",
    detail: [
      { t: "[조회] — 브랜드 선택 팝업", hi: ["브랜드 선택"], pop: "brand",
        d: "제목은 <b>‘브랜드를 선택해주세요’</b>. 표는 <b>번호 · 브랜드 명 · 브랜드 ID</b> 3열이고 위에 검색창이 있습니다. <b>내 계정에 등록·승인된 브랜드만</b> 나옵니다.<br><b class=\"hz-ex\">이 화면에서는</b> <code>모노커뮤니케이션즈 / BR.Q854Yi4JR8</code> 을 골랐습니다." },
      { t: "[조회] — 발신번호 선택 팝업", hi: ["발신 번호"], pop: "number",
        d: "제목은 <b>‘발신번호를 선택해주세요’</b>. <b>브랜드를 먼저 골라야</b> 목록이 채워지고, 그 브랜드에 등록된 대화방(발신번호)만 나옵니다. <b>대표 발신번호가 자동 선택</b>됩니다.<br><b class=\"hz-ex\">이 화면에서는</b> <code>(주) 모노커뮤니케이션즈 / 15777223</code> 이 들어갔습니다." },
      { t: "목록이 비어 있다면",
        d: "① RBC에서 <b>브랜드가 승인</b>되었는지 → ② 그 브랜드에 <b>대화방(발신번호)이 등록·승인</b>되었는지 순서로 확인합니다. 브랜드가 아예 안 보이면 <b>브랜드 KEY 등록</b>(RCS 비즈니스센터에서 받은 KEY를 입력)이 남아 있는 경우입니다." },
    ] },

  { part: "msgtype",  title: "메시지 종류 선택",
    desc: "<b>[조회]</b>로 <b>메시지 베이스</b>를 고릅니다. 종류를 먼저 골라야 아래 입력란이 열립니다.",
    tip: "템플릿을 쓰려면 미리 만들어 승인까지 받아 둬야 이 목록에 나옵니다.",
    detail: [
      { t: "먼저 규격을 고릅니다", hi: ["메시지 종류"], pop: "base",
        d: "팝업 상단이 <b>기존 RCS</b> / <b>통합 RCS</b> 두 갈래입니다. 아래는 화면에 적힌 설명 그대로입니다.",
        table: { head: ["구분", "화면에 적힌 설명"], rows: [
          ["기존 RCS", "삼성 단말 이용자에게만 RCS 전송이 가능하지만, 가독성이 높고 효과적인 메시지"],
          ["통합 RCS", "삼성, 아이폰 등 단말의 구분 없이 모든 고객에 RCS 메시지를 전송할 수 있어 편리하고 효율적인 메시지"],
        ] } },
      { t: "그 다음 메시지 베이스", hi: ["메시지 종류"], pop: "base",
        d: "<b>SMS · LMS · MMS · 템플릿LMS · 템플릿이미지 · 템플릿레이아웃</b> 중에서 고릅니다. 오른쪽 <b>미리보기</b>에 고른 베이스의 모양이 나타납니다.<br><b class=\"hz-ex\">이 화면에서는</b> <code>기존 RCS · SMS</code> 를 골랐고, 메시지 베이스 ID는 <code>SS000000</code> 입니다." },
      { t: "템플릿은 미리 만들어 승인받아야 합니다",
        d: "<b>템플릿 관리 &gt; 템플릿 생성</b>에서 만들고 <b>[승인 요청]</b>까지 해야 이 목록에 뜹니다. 진행 상태는 <b>템플릿 관리 &gt; 템플릿 조회</b>의 <b>상태</b> 열에서 확인합니다." },
      { t: "템플릿 종류 — 3분류 18종",
        d: "<b>이미지(8)</b> 이미지 &amp; 타이틀 강조형 · 이미지 강조형 · 썸네일형 세로 · 썸네일형 가로 · SNS형(하단버튼) · SNS형(중간버튼) · 아이템 상세형 · 슬라이드형<br><b>LMS(4)</b> 기본형 · 기본형 타이틀 강조 · 명세서 아이템 강조 · 문단형<br><b>텍스트(6)</b> 기본형 아이템 강조 · 테이블 아이템 강조 · 타이틀 선택형 서술/스타일 · 타이틀 자유형 서술/스타일" },
      { t: "템플릿 생성 화면 순서",
        d: "① <b>기본 정보</b>(요청 템플릿 ID · 브랜드 ID [조회] · 템플릿 명 · 비율 1:1 / 3:4) → ② <b>내용 작성</b> → ③ <b>버튼 옵션</b>(URL 연결 · 지도보여주기(좌표/쿼리) · 현재위치공유 · 전화 연결 · 복사하기 · 일정 등록 · 메시지 작성) → 동의문 체크 후 <b>[승인 요청]</b>. 화면에 <i>이미지 템플릿은 임시 저장 기능을 사용할 수 없습니다</i> 라고 안내됩니다." },
    ] },

  { part: "common",   title: "공통 정보 · 제목 · 내용",
    desc: "광고 표시 여부·수신거부번호·본문 복사·만료 옵션을 정하고 제목과 내용을 씁니다. 우측 <b>미리보기</b>에 반영됩니다.",
    tip: "<b>'(광고)' 표시 여부</b>와 <b>무료 수신거부번호</b>는 필수 항목(*)입니다.",
    detail: [
      { t: "'(광고)' 표시 여부 — 필수 · 기본값 ‘사용’", hi: ["(광고)"],
        d: "툴팁은 <b>header</b>. <b>사용</b>이면 본문 맨 앞에 <code>(광고)</code>가 자동으로 붙고, 오른쪽 미리보기에 <code>[Web발신](광고)</code> 형태로 나타납니다.<br><b class=\"hz-ex\">이 화면에서는</b> <b>사용</b>이라 오른쪽 미리보기 맨 앞에 <code>(광고)</code> 가 붙어 있습니다." },
      { t: "무료 수신거부번호 — 필수", hi: ["무료 수신거부번호"],
        d: "툴팁은 <b>footer</b> — 본문 끝에 붙습니다. 입력란에 직접 적으며 안내 예시는 <code>08012345678</code>. <b>화면에서 번호를 만들어 주지는 않으므로</b> 쓸 080 번호가 미리 개통돼 있어야 합니다.<br><b class=\"hz-ex\">이 화면에서는</b> <code>08012345678</code> 을 넣었고, 미리보기 맨 끝에 <code>수신거부 08012345678</code> 로 붙습니다." },
      { t: "본문 복사 (copyAllowed)", hi: ["본문 복사"],
        d: "툴팁 그대로 — <i>발송한 메시지를 수신 고객이 복사하도록 허용할지 여부를 선택하는 메뉴</i>. <b>허용 / 비허용</b>." },
      { t: "만료 옵션 (expiryOption)", hi: ["만료 옵션"],
        d: "툴팁 그대로 — <i>발송 결과 응답 대기 시간 이후 메시지 만료 처리. ‘전송성공 불확실(79998)’ 로 실패처리. 만료 처리 이후 SMS/LMS로 발송 가능</i>.<br>짧게 잡을수록 대체 발송이 빨라지고, 길게 잡을수록 RCS로 도달할 기회를 더 줍니다." },
      { t: "제목 · 내용 → 미리보기", hi: ["메시지 제목", "메시지 종류를 선택 해주세요"],
        d: "메시지 종류를 고르기 전에는 미리보기에 <i>메시지 종류를 선택 해주세요.</i> 만 표시됩니다. 종류를 고른 뒤 제목·내용을 쓰면 오른쪽에 그대로 반영됩니다.<br><b class=\"hz-ex\">이 화면에서는</b> 내용에 <code>{{변수1}}님, 요청하신 안내 자료를 보내드립니다.</code> 를 넣었습니다." },
      { t: "커스텀 변수 표기 규칙", hi: ["메시지 내용"],
        d: "입력란 안내문 — <i>변수부에 오타 또는 공백이 있을 경우 변수 처리가 불가능 합니다.</i><br>· 처리 가능 &nbsp;<code>{{변수1}}</code><br>· 처리 불가 &nbsp;<code>{{변수}}</code> · <code>{{변수1 }}</code> · <code>{{ 변수1}}</code>" },
      { t: "액션 버튼 설정", hi: ["액션 버튼 설정"],
        d: "<b>미사용 / 1개 / 2개 / 3개</b> 중에서 고릅니다." },
    ] },

  { part: "fallback", title: "발송 실패 시 문자 전송 (Fallback)",
    desc: "RCS 발송이 실패했을 때 SMS/LMS/MMS로 대신 보낼지 정합니다. <b>기본값은 미사용</b>입니다.",
    tip: "계정이 ‘크로샷 사용’으로 설정돼 있어야만 켤 수 있습니다.",
    detail: [
      { t: "먼저 계정 설정이 되어 있어야 합니다", hi: ["사용 여부"],
        d: "툴팁 그대로 — <i>RCS 발송 실패건에 대한 발송 방식이 ‘크로샷 사용’으로 설정된 경우에만 가능</i>." },
      { t: "설정 여부 확인 경로", hi: ["사용 여부"],
        d: "툴팁 그대로 — <i>마이페이지 &gt; 청약관리 &gt; 발송포탈RCS_ID(ex&gt;P_RCSID_01) 상세 화면에서 확인 가능</i>. 이 화면에서는 <b>확인만</b> 되고 값을 바꾸지는 못합니다." },
      { t: "켜면 무엇을 더 채우나",
        d: "<b>사용</b>으로 바꾸면 대체 발송으로 내보낼 문자(SMS/LMS/MMS) 내용을 따로 작성합니다. 이미지로 보낼 때는 <b>서버 파일 선택</b> 팝업(번호 · 썸네일 · 파일 ID · 사용 가능 여부)에서 파일을 고릅니다." },
    ] },

  { part: "name",     title: "메시지 저장 · 표기 의무 확인",
    desc: "이름을 붙여 저장하면 다음에 그대로 불러 쓸 수 있습니다. 바로 아래에 <b>광고성 표기 의무 확인</b> 체크가 있습니다.",
    tip: "저장은 선택이지만, 저장하지 않으면 이번 발송에만 쓰이고 남지 않습니다.",
    detail: [
      { t: "메시지 이름 + [메시지 저장]", hi: ["메시지 이름"],
        d: "저장해 두면 다음 발송 때 <b>‘기존 메시지를 선택해주세요’</b> 팝업에서 불러 쓸 수 있습니다. 목록에 나오는 항목은 <b>번호 · 메시지 이름 · 브랜드 ID · 브랜드 명 · 메시지 베이스 · FALLBACK 사용 여부 · 생성일</b>.<br><b class=\"hz-ex\">이 화면에서는</b> 이름을 <code>2026-08 안내 발송</code> 으로 저장했습니다." },
      { t: "저장하지 않으면", hi: ["메시지 이름"],
        d: "발송 자체는 됩니다. 다만 내용이 남지 않아 같은 메시지를 다시 보내려면 브랜드 선택부터 다시 채워야 합니다." },
      { t: "광고성 표기 의무 확인 체크", hi: ["광고성 문자 전송 시"],
        d: "메시지 저장 바로 아래에 <b>‘광고성 문자 전송 시 표기 의무를 준수하여 메시지를 작성하였습니다’</b> 체크박스가 있습니다. 발송 직전에 확인하는 항목입니다." },
    ] },

  { part: "sendinfo", title: "발송 정보 (형태 · 발송량 · 그룹ID)",
    desc: "즉시/예약을 고르고 <b>[발송량 현황 조회]</b>로 가능한 시간대를 확인합니다. 발송그룹ID는 <b>[중복검사]</b>까지 마쳐야 합니다.",
    tip: "빨간 안내(<b>발송그룹ID 중복검사필요</b>)가 남아 있으면 발송으로 넘어가지 않습니다.",
    detail: [
      { t: "발송 형태", hi: ["발송 형태"],
        d: "<b>즉시 발송</b> / <b>예약 발송</b>. 예약을 고르면 옆의 <b>[발송량 현황 조회]</b>로 시간대를 먼저 확인합니다." },
      { t: "[발송량 현황 조회] — 조회 범위", hi: ["발송량 현황 조회"], pop: "sendState",
        d: "<b>선택일</b>은 드롭다운으로 오늘부터 7일치. 화면 안내 그대로 <i>발송량 현황 조회는 현재 시간부터 7일 뒤까지 조회 가능합니다</i>." },
      { t: "[발송량 현황 조회] — 시간대 보기", hi: ["발송량 현황 조회"], pop: "sendState",
        d: "기본으로 <b>오전 08:00 ~ 오후 20:50</b>까지 <b>10분 간격</b>으로 펼쳐집니다. <b>[야간시간대 보기]</b>를 켜면 그 밖의 시간대도 함께 나오고, <b>refresh</b>로 최신 수치를 다시 받습니다." },
      { t: "[발송량 현황 조회] — 칸 색깔 3가지", hi: ["발송량 현황 조회"], pop: "sendState",
        d: "<b>선택 가능</b> · <b>부분 발송 가능</b> · <b>선택 불가</b>. 부분 발송 가능인 칸에는 <code>17:30 / 38만건</code>처럼 남은 가용량이 함께 적히고 <b>[부분 발송 가용량 펼쳐보기]</b>로 한 번에 볼 수 있습니다." },
      { t: "발송량 — 단건과 대용량", hi: ["발송량"],
        d: "<b>단건/20건 이하 발송</b> 과 <b>대용량 발송(1회 10만건까지 발송 가능)</b> 중에서 고릅니다. 10만 건을 넘기려면 나눠서 발송해야 합니다." },
      { t: "발송그룹ID — 화면 안내 3줄", hi: ["발송그룹ID"],
        d: "<i>· 발송 캠페인 단위로 설정, 통신사별 100건 이상 전송 성공시 RCS비즈센터에서 읽음확인, 버튼클릭 등 고객반응통계 조회 가능<br>· 발송그룹ID는 발송시마다 다르게 입력해야 함 ( 중복체크 필수 )<br>· 입력하지 않으면 자동으로 유니크한 값이 입력 됨</i>" },
      { t: "[중복검사] · [복사하기]", hi: ["발송그룹ID"],
        d: "검사 전에는 옆에 <b>‘발송그룹ID 중복검사필요’</b>가 빨갛게 남아 있습니다. <b>[중복검사]</b>를 눌러 통과시켜야 하고, <b>[복사하기]</b>로 방금 쓴 ID를 클립보드에 담아 둘 수 있습니다(나중에 통계에서 찾을 때 씁니다).<br><b class=\"hz-ex\">이 화면에서는</b> <code>GUIDE-20260827-01</code> 로 검사를 통과해 <b>사용가능</b>으로 바뀌었습니다." },
    ] },

  { part: "recv",     title: "수신자 추가",
    desc: "<b>[수신자 추가]</b>로 직접 넣거나 <b>[커스텀 수신 정보 업로드]</b> · <b>[주소록 불러오기]</b>로 가져옵니다.",
    tip: "본문에 변수를 썼다면 값도 수신자별로 같이 올려야 합니다.",
    detail: [
      { t: "[수신자 추가] — 한 명씩", hi: ["수신자 추가"], pop: "recvOne",
        d: "팝업 제목은 <b>‘수신자를 추가해주세요’</b>. <b>주소록 등록</b> / <b>임시번호</b> 중에서 고릅니다. 주소록 등록이면 <b>그룹 선택</b>(없으면 <b>[그룹 등록]</b>으로 먼저 만듭니다)까지 한 뒤 <b>이름 · 전화번호</b>를 넣고 <b>[등록]</b>." },
      { t: "[커스텀 수신 정보 업로드] — 파일로", hi: ["커스텀 수신 정보 업로드"], pop: "recvFile",
        d: "<b>엑셀로 추가</b> / <b>텍스트로 추가</b> 두 탭과 <b>[샘플 다운로드]</b>가 있습니다. 화면 안내 — <i>업로드한 번호는 해당 메시지 발송에만 사용됩니다. 번호를 주소록에 추가하시려면 주소록 관리 메뉴를 사용해주세요.</i>" },
      { t: "[주소록 불러오기] — 저장해 둔 주소록에서", hi: ["주소록 불러오기"], pop: "recvAddr",
        d: "그룹을 검색해서 고릅니다. 화면 안내 — <i>주소록을 더블 클릭하여 개별 주소를 검색하고 추가할 수 있습니다.</i>" },
      { t: "변수를 쓰면 목록 표가 달라집니다", hi: ["전화번호"],
        d: "본문에 변수가 없으면 목록은 <b>수신 번호 · 이름 · 전화번호</b> 3열입니다. 변수를 쓰면 여기에 <b>변수1 ~ 변수4</b> 열이 더 생기고, 수신자마다 값을 채워야 합니다.<br><b class=\"hz-ex\">이 화면에서는</b> 본문에 <code>{{변수1}}</code> 을 썼기 때문에 <b>변수1</b> 열이 생겼고, 수신자 2명의 값을 채웠습니다." },
      { t: "변수 길이는 ‘치환 뒤’로 따집니다",
        d: "커스텀 변수 설정 안내 — <i>{{변수}} 항목을 입력하고 byte 이하로 입력되었더라도 실제 커스텀 수신 정보의 항목이 길어 byte 가 초과될 경우 메시지 발송이 불가합니다.</i> 본문만 짧으면 되는 게 아니라 <b>가장 긴 수신자 값으로 치환했을 때</b>를 기준으로 봐야 합니다." },
    ] },
];

/* 팝업이 겹쳐 뜰 수 있으므로 본문 스크롤 잠금은 참조 카운트로 관리한다.
   각자 이전값을 저장했다 되돌리면, 나중에 열린 팝업이 '이전값 = hidden'을
   저장해 버려 전부 닫은 뒤에도 body가 잠긴 채로 남는다. */
let hzLockN = 0;
let hzLockPrev = "";
function useBodyScrollLock() {
  React.useEffect(() => {
    if (hzLockN === 0) {
      hzLockPrev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    hzLockN += 1;
    return () => {
      hzLockN -= 1;
      if (hzLockN <= 0) { hzLockN = 0; document.body.style.overflow = hzLockPrev; }
    };
  }, []);   // 의존성 없음 — 리렌더 때마다 잠금이 풀렸다 걸리지 않게
}

/* 고정(sticky/fixed) 요소에 가리지 않도록 대상을 화면에 드러낸다.

   핵심은 "최종 도착 지점을 미리 정확히 계산해서 한 번에 가는 것".
   예전에는 현재 화면 기준으로 대충 움직인 뒤 두세 번 보정했는데,
   최상단에서는 조작 바가 아직 sticky로 붙기 전이라 기준이 엉뚱했고
   그래서 세 번에 나눠 내려가는 것처럼 보였다.

   미리 알 수 있는 값들:
   · 조작 바가 붙었을 때 아래쪽 = CSS top(헤더+8) + 조작 바 높이
   · 최상단에서 내려가면 상단 퀵메뉴 스페이서가 접히며 문서가 그만큼 위로 밀린다
   둘 다 계산에 넣으면 한 번의 부드러운 스크롤로 정확히 도착한다. */
let hzRevealJob = null;

function hzTargetY(el, headEl) {
  const docTop = el.getBoundingClientRect().top + window.scrollY;
  const hdr = document.querySelector(".hdr");
  const hdrH = hdr ? hdr.getBoundingClientRect().height : 64;

  let cover = hdrH;
  if (headEl) {
    const st = parseFloat(getComputedStyle(headEl).top);
    cover = (isNaN(st) ? hdrH + 8 : st) + headEl.getBoundingClientRect().height;
  }

  /* 최상단(스페이서가 펼쳐진 상태)에서 내려가면 그만큼 문서가 위로 올라온다 */
  const sp = document.querySelector(".topmenu-spacer");
  const shrink = (sp && window.scrollY < 12) ? sp.getBoundingClientRect().height : 0;

  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - shrink);
  return Math.max(0, Math.min(docTop - shrink - cover - 16, max));
}

function hzReveal(el, headEl) {
  if (!el) return;
  if (hzRevealJob) hzRevealJob.cancel();

  let idleT = null, deadT = null, tries = 0, done = false;

  function gap() {
    let cover = 0;
    [document.querySelector(".hdr"), headEl].forEach((b) => {
      if (!b) return;
      const pos = getComputedStyle(b).position;
      if (pos !== "sticky" && pos !== "fixed") return;
      cover = Math.max(cover, b.getBoundingClientRect().bottom);
    });
    return el.getBoundingClientRect().top - (cover + 16);
  }

  function onScroll() { clearTimeout(idleT); idleT = setTimeout(settled, 110); }

  /* 계산이 어긋난 드문 경우에만 조용히 맞춘다(움직임이 눈에 띄지 않게 즉시) */
  function settled() {
    if (done) return;
    const d = gap();
    const atBottom = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2;
    if (Math.abs(d) > 6 && tries < 2 && !(d > 0 && atBottom)) {
      tries += 1;
      window.scrollBy({ top: d, behavior: "auto" });
      clearTimeout(idleT); idleT = setTimeout(settled, 130);
      return;
    }
    stop();
  }

  function stop() {
    if (done) return;
    done = true;
    clearTimeout(idleT); clearTimeout(deadT);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    if (hzRevealJob === job) hzRevealJob = null;
  }

  const job = { cancel: stop };
  hzRevealJob = job;

  window.addEventListener("scroll", onScroll, { passive: true });
  /* 사용자가 직접 휠·터치로 스크롤하면 보정을 멈춘다(끌어당기는 느낌 방지) */
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });

  const y = hzTargetY(el, headEl);
  if (Math.abs(y - window.scrollY) > 3) window.scrollTo({ top: y, behavior: "smooth" });
  idleT = setTimeout(settled, 320);   // 스크롤이 아예 일어나지 않은 경우 대비
  deadT = setTimeout(stop, 2000);     // 어떤 경우에도 2초 뒤에는 손을 뗀다
}

/* ── 확대 팝업 · 가이드 팝업 ────────────────────────────────
   [크게 보기] → 그 단계 영역을 원래 크기로 (HzZoom)
   [가이드 보기] → 전체 화면을 띄우고 항목을 하나씩 짚어줌 (HzTour)
   확대 팝업 안에도 [가이드 보기]가 있어 팝업 → 팝업으로 넘어간다.
   ------------------------------------------------------------ */

/* 자식 margin이 빠져나가 scrollHeight가 실제보다 작게 잡히는 경우가 있어
   가장 아래 자식의 위치까지 함께 본다. transform이 없는 상태에서 부를 것. */
function hzPageH(page) {
  let h = page.scrollHeight;
  const top = page.getBoundingClientRect().top;
  page.querySelectorAll("*").forEach((k) => {
    const b = k.getBoundingClientRect().bottom - top;
    if (b > h) h = b;
  });
  return Math.ceil(h) + 4;
}

/* hi[] 키워드로 강조할 요소를 찾는다. 제목칸(th·.tit)을 먼저 보고,
   없으면 버튼·라벨에서 찾는다 — '발송량'이 '발송량 현황 조회' 버튼에
   먼저 걸리는 것을 막기 위함. */
function hzTargets(root, hi) {
  if (!root || !hi || !hi.length) return [];
  const strong = root.querySelectorAll("th, .tit, .card-header h2");
  const weak = root.querySelectorAll("button, label, p");
  const out = [];
  hi.forEach((q) => {
    let node = null;
    for (let i = 0; i < strong.length; i++) {
      if ((strong[i].textContent || "").indexOf(q) >= 0) { node = strong[i]; break; }
    }
    if (!node) {
      for (let i = 0; i < weak.length; i++) {
        if ((weak[i].textContent || "").indexOf(q) >= 0) { node = weak[i]; break; }
      }
    }
    if (!node) return;
    const box = node.tagName === "BUTTON"
      ? node
      : (node.closest("tr, .row, .message-preview, .check-group, .card-header") || node.closest(".card") || node);
    if (out.indexOf(box) < 0) out.push(box);
  });
  return out;
}

/* 강조 대상엔 .hz-hi, 나머지 행엔 .hz-lo (조상 opacity를 쓰면 자식이 되살아나지
   못하므로 행 단위로 따로 칠한다) */
function hzPaint(root, targets) {
  if (!root) return;
  root.querySelectorAll(".hz-hi, .hz-lo").forEach((e) => e.classList.remove("hz-hi", "hz-lo"));
  if (!targets.length) return;
  targets.forEach((t) => t.classList.add("hz-hi"));
  root.querySelectorAll("tr, .row, .check-group, .card-header, .message-preview").forEach((e) => {
    const near = targets.some((t) => t === e || t.contains(e) || e.contains(t));
    if (!near) e.classList.add("hz-lo");
  });
}

/* 폰트가 늦게 붙으면 높이가 달라진다 → 리사이즈·폰트 로드까지 다시 잰다 */
function useHzRemeasure(measure, deps) {
  React.useLayoutEffect(() => {
    measure();
    const t1 = setTimeout(measure, 120);
    const t2 = setTimeout(measure, 500);
    window.addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(() => {});
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener("resize", measure); };
  }, deps);
}

/* ── 확대 팝업 — 그 단계 영역만 원래 크기로 ── */
function HzZoom({ step, idx, onClose, onGo, onGuide, paused }) {
  useBodyScrollLock();
  const boxRef = React.useRef(null);
  const pageRef = React.useRef(null);
  const [z, setZ] = React.useState({ scale: 1 });

  /* transform:scale 은 레이아웃 높이를 바꾸지 않아 바깥 상자 높이를 픽셀로
     따로 계산해야 했고, 글꼴 차이로 그 값이 어긋나면 아래가 잘렸다.
     CSS zoom 은 레이아웃에 반영되므로 상자가 알아서 늘어난다 → 잘릴 일이 없다. */
  const measure = React.useCallback(() => {
    const box = boxRef.current, page = pageRef.current;
    if (!box || !page) return;
    page.style.zoom = "1";
    const nat = Math.max(page.scrollWidth, HZ_NATURAL_W);
    const cs = getComputedStyle(box);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
    const s = Math.min(1, avail / nat);
    page.style.zoom = String(s);
    setZ({ scale: s });
  }, []);
  useHzRemeasure(measure, [step.part]);

  /* 가이드 팝업이 위에 겹쳐 있으면 키 입력은 그쪽이 맡는다.
     둘 다 듣고 있으면 방향키 한 번에 '단계 이동'(여기)과 '항목 이동'(가이드)이
     동시에 일어나 화면이 통째로 건너뛴다. */
  React.useEffect(() => {
    if (paused) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onGo(idx + 1);
      if (e.key === "ArrowLeft") onGo(idx - 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onGo, idx, paused]);

  const ui = window.HZ_UI || { parts: {} };
  return ReactDOM.createPortal(
    <div className="peek-back" onClick={onClose}>
      <div className="peek hz-zoom" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="peek-head">
          <div className="peek-tt">
            <span className="peek-badge">{idx + 1} / {HZ_STEPS.length}</span>
            <b>{step.title}</b>
          </div>
          <div className="peek-acts">
            <button className="peek-btn gd" onClick={onGuide}><Icon name="book" size={13} /> 가이드 보기</button>
            <button className="peek-btn" disabled={idx === 0} onClick={() => onGo(idx - 1)}>← 이전</button>
            <button className="peek-btn primary" disabled={idx === HZ_STEPS.length - 1} onClick={() => onGo(idx + 1)}>다음 →</button>
            <button className="peek-x" onClick={onClose} aria-label="닫기"><Icon name="x" size={16} /></button>
          </div>
        </div>
        <div className="hz-zoom-desc">
          <span dangerouslySetInnerHTML={{ __html: step.desc }} />
          {step.tip && <em dangerouslySetInnerHTML={{ __html: step.tip }} />}
          <b className="hz-zoom-cta">이 화면을 항목별로 자세히 보려면 <span>가이드 보기</span>를 누르세요.</b>
        </div>
        <div className="peek-body hz-zoom-body">
          <div className="hz-fit auto" ref={boxRef}>
            <div className="hz-real hz-page" ref={pageRef}
                 style={{ zoom: z.scale, width: HZ_NATURAL_W }}
                 dangerouslySetInnerHTML={{ __html: ui.parts[step.part] || "" }} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── 가이드 팝업 — 전체 화면을 띄우고 강조 지점으로 이동 ──
   화면 전체를 렌더한 뒤 강조 영역이 가운데 오도록 '옮겨서' 보여준다.
   스크롤바 없이 위아래 맥락이 살짝 보이므로 잘린 느낌이 나지 않는다. */
function HzTour({ stepIdx, sub, onMove, onClose }) {
  useBodyScrollLock();
  const step = HZ_STEPS[stepIdx];
  const items = step.detail || [];
  const cur = items[sub] || {};
  const ui = window.HZ_UI || { parts: {} };

  const boxRef = React.useRef(null);
  const viewRef = React.useRef(null);
  const pageRef = React.useRef(null);
  const popRef = React.useRef(null);
  const [popZoom, setPopZoom] = React.useState(1);
  const [v, setV] = React.useState({ scale: 1, tx: 0, ty: 0, w: HZ_NATURAL_W, h: 0, up: false, down: false });

  const atFirst = stepIdx === 0 && sub === 0;
  const atLast = stepIdx === HZ_STEPS.length - 1 && sub === items.length - 1;

  const fullHtml = React.useMemo(
    () => HZ_STEPS.map((s) => ui.parts[s.part] || "").join(""),
    [ui]
  );

  const measure = React.useCallback(() => {
    const box = boxRef.current, page = pageRef.current;
    if (!box || !page) return;
    page.style.transform = "none";

    /* 강조는 위치를 재기 전에 칠해 둔다(강조로 높이가 변하진 않지만 대상 좌표가 필요) */
    const targets = hzTargets(page, cur.hi);
    hzPaint(page, targets);

    const natW = Math.max(page.scrollWidth, HZ_NATURAL_W);
    const natH = hzPageH(page);
    const cs = getComputedStyle(box);
    const availW = box.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
    const availH = box.clientHeight - parseFloat(cs.paddingTop || 0) - parseFloat(cs.paddingBottom || 0);

    let s = Math.min(1, availW / natW);

    /* 강조 영역(여백 포함)이 한 화면에 안 들어가면 그만큼 더 줄인다 */
    let mid = null;
    if (targets.length) {
      const pr = page.getBoundingClientRect();
      let top = Infinity, bot = -Infinity;
      targets.forEach((e) => {
        const r = e.getBoundingClientRect();
        top = Math.min(top, r.top - pr.top);
        bot = Math.max(bot, r.bottom - pr.top);
      });
      const PAD = 70;
      const need = (bot - top) + PAD * 2;
      if (need * s > availH) s = Math.min(s, availH / need);
      mid = (top + bot) / 2;
    }

    const cw = natW * s, ch = natH * s;
    const viewW = Math.min(availW, cw);
    const viewH = Math.min(availH, ch);

    let ty = 0;
    if (mid != null && ch > viewH) {
      ty = Math.max(0, Math.min(mid * s - viewH / 2, ch - viewH));
    }
    page.style.transform = "scale(" + s + ")";
    setV({ scale: s, tx: 0, ty: ty, w: viewW, h: viewH, up: ty > 2, down: ty < ch - viewH - 2 });

    /* 팝업도 무대 안에 통째로 들어오도록 줄인다 */
    const pop = popRef.current;
    if (pop) {
      pop.style.zoom = "1";
      const pw = pop.scrollWidth, ph = pop.scrollHeight;
      const z = Math.min(1, (availW - 24) / Math.max(pw, 1), (availH - 24) / Math.max(ph, 1));
      pop.style.zoom = String(z);
      setPopZoom(z);
    }
  }, [cur.hi, stepIdx, sub]);

  useHzRemeasure(measure, [stepIdx, sub, cur.t, cur.pop]);

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); onMove(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); onMove(-1); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onMove]);

  /* 화면 가운데를 기준으로 왼쪽은 이전, 오른쪽은 다음 */
  function onStageClick(e) {
    const box = boxRef.current;
    if (!box) return onMove(1);
    const r = box.getBoundingClientRect();
    onMove(e.clientX < r.left + r.width / 2 ? -1 : 1);
  }

  return ReactDOM.createPortal(
    <div className="peek-back over" onClick={onClose}>
      <div className="peek hz-tour" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="peek-head">
          <div className="peek-tt">
            <span className="peek-badge">{stepIdx + 1} / {HZ_STEPS.length}</span>
            <b>{step.title}</b>
          </div>
          <div className="peek-acts">
            <button className="peek-btn" disabled={atFirst} onClick={() => onMove(-1)}>← 이전</button>
            <button className="peek-btn primary" disabled={atLast} onClick={() => onMove(1)}>다음 →</button>
            <button className="peek-x" onClick={onClose} aria-label="닫기"><Icon name="x" size={16} /></button>
          </div>
        </div>

        {/* 설명 — 언제나 맨 위에 보인다 */}
        <div className="hz-say">
          <span className="hz-say-n">{sub + 1}</span>
          <div className="hz-say-tx">
            <b>{cur.t}</b>
            <span dangerouslySetInnerHTML={{ __html: cur.d || "" }} />
          </div>
        </div>
        {cur.table && (
          <div className="cap-table-wrap hz-say-tbl">
            <table className="cap-table">
              <thead><tr>{cur.table.head.map((h, k) => <th key={k}>{h}</th>)}</tr></thead>
              <tbody>
                {cur.table.rows.map((r, k) => (
                  <tr key={k}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 화면 전체 — 강조된 곳으로 옮겨서 보여준다(스크롤 없음)
            왼쪽 절반을 누르면 이전, 오른쪽 절반을 누르면 다음 */}
        <div className="hz-tour-stage" ref={boxRef} onClick={onStageClick}>
          <button type="button" className="hz-tour-arrow left" disabled={atFirst}
                  onClick={(e) => { e.stopPropagation(); onMove(-1); }} aria-label="이전 항목">
            <Icon name="chevron" size={22} />
          </button>
          <button type="button" className="hz-tour-arrow right" disabled={atLast}
                  onClick={(e) => { e.stopPropagation(); onMove(1); }} aria-label="다음 항목">
            <Icon name="chevron" size={22} />
          </button>
          <div className={"hz-tour-view" + (v.up ? " up" : "") + (v.down ? " down" : "")}
               ref={viewRef} style={{ width: v.w || undefined, height: v.h || undefined }}>
            <div className="hz-real hz-tour-page" ref={pageRef}
                 style={{ width: HZ_NATURAL_W, transform: "scale(" + v.scale + ")", left: -v.tx, top: -v.ty }}
                 dangerouslySetInnerHTML={{ __html: fullHtml }} />
          </div>
          {/* [조회] 등을 눌렀을 때 실제로 뜨는 팝업 — 화면 위에 그대로 얹는다 */}
          {cur.pop && (ui.pops || {})[cur.pop] && (
            <div className="hz-pop-layer">
              <div className="hz-real hz-pop" ref={popRef} style={{ zoom: popZoom }}
                   dangerouslySetInnerHTML={{ __html: ui.pops[cur.pop] }} />
            </div>
          )}
        </div>

        <div className="hz-tour-foot">
          <span className="hz-tour-dots">
            {items.map((_, k) => (
              <i key={k} className={k === sub ? "on" : (k < sub ? "done" : "")}
                 onClick={(e) => { e.stopPropagation(); onMove(k - sub); }} title={items[k].t} />
            ))}
          </span>
          <span className="hz-tour-hint">화면 왼쪽을 누르면 이전 · 오른쪽을 누르면 다음 · ESC 닫기</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function HermesSendFlow() {
  const [i, setI] = React.useState(0);
  const [open, setOpen] = React.useState(false);   // 제목 드롭다운
  const [zoom, setZoom] = React.useState(false);   // 확대 팝업
  const [tour, setTour] = React.useState(null);    // 가이드 팝업 {sub}
  const ui = window.HZ_UI || { css: "", parts: {} };
  const step = HZ_STEPS[i];

  const boxRef = React.useRef(null);
  const pageRef = React.useRef(null);
  const headRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);
  const [boxH, setBoxH] = React.useState(0);

  React.useEffect(() => {
    if (!ui.css || document.getElementById("hz-real-css")) return;
    const el = document.createElement("style");
    el.id = "hz-real-css";
    el.textContent = ui.css;
    document.head.appendChild(el);
  }, [ui.css]);

  React.useLayoutEffect(() => {
    function fit() {
      const r = hzFit(boxRef.current, pageRef.current);
      if (!r) return;
      setScale(r.scale); setBoxH(r.height);
    }
    fit();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    if (ro && boxRef.current) ro.observe(boxRef.current);
    window.addEventListener("resize", fit);
    const t = setTimeout(fit, 300);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", fit); clearTimeout(t); };
  }, [ui.parts]);

  // 바깥 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (!e.target.closest || !e.target.closest(".hz-pick")) setOpen(false); }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  /* 단계 이동 — 고정 헤더·sticky 조작 바에 묻히지 않게.
     높이를 미리 계산해 빼는 방식은 조작 바 높이(설명 줄 수)나 상단 메뉴
     접힘 때문에 자꾸 어긋났다. 대신 '지금 실제로 가리고 있는 것의 아래쪽'을
     매번 재서 그만큼만 움직이고, 자리가 잡힌 뒤 한 번 더 확인한다. */
  function go(k) {
    if (k < 0 || k >= HZ_STEPS.length) return;
    setI(k); setOpen(false);
    setTimeout(() => {
      const el = pageRef.current && pageRef.current.querySelector('[data-part="' + HZ_STEPS[k].part + '"]');
      if (el) hzReveal(el, headRef.current);
    }, 40);
  }

  /* 가이드 이동 — 항목 끝에 닿으면 다음(이전) 단계로 자연스럽게 넘어간다 */
  function tourMove(d) {
    if (!tour) return;
    const items = (k) => (HZ_STEPS[k].detail || []).length;
    let k = i, n = tour.sub + d;
    while (n >= items(k)) { if (k >= HZ_STEPS.length - 1) { n = items(k) - 1; break; } n -= items(k); k += 1; }
    while (n < 0) { if (k <= 0) { n = 0; break; } k -= 1; n += items(k); }
    if (k !== i) setI(k);
    setTour({ sub: n });
  }

  return (
    <div className="hz">
      <div className="hz-bar"><div className="hz-bar-fill" style={{ width: ((i + 1) / HZ_STEPS.length) * 100 + "%" }} /></div>

      {/* 조작 바 — 제목 드롭다운 · 설명 · 이전/다음 · 크게 보기 (스크롤해도 따라옴) */}
      <div className="hz-head" ref={headRef}>
        <div className="hz-head-top">
          <span className="hz-head-n">{i + 1}</span>
          <div className="hz-pick">
            <button className={"hz-pick-btn" + (open ? " on" : "")} onClick={() => setOpen(!open)}>
              {step.title}<Icon name="chevron" size={14} className="hz-pick-arr" />
            </button>
            {open && (
              <div className="hz-pick-menu">
                {HZ_STEPS.map((s, k) => (
                  <button key={s.part} className={"hz-pick-item" + (k === i ? " on" : "")} onClick={() => go(k)}>
                    <span className="hz-pick-n">{k + 1}</span>{s.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hz-head-acts">
            <button className="hz-navbtn sm" onClick={() => setZoom(true)}><Icon name="search" size={13} /> 크게 보기</button>
            <button className="hz-navbtn sm gd" onClick={() => setTour({ sub: 0 })}><Icon name="book" size={13} /> 가이드 보기</button>
            <button className="hz-navbtn sm" disabled={i === 0} onClick={() => go(i - 1)}>← 이전</button>
            <button className="hz-navbtn sm pri" disabled={i === HZ_STEPS.length - 1} onClick={() => go(i + 1)}>다음 →</button>
          </div>
        </div>
        <div className="hz-head-tx">
          <span dangerouslySetInnerHTML={{ __html: step.desc }} />
          {step.tip && <em dangerouslySetInnerHTML={{ __html: step.tip }} />}
        </div>
      </div>

      <div className="hz-stage">
        <div className="hz-stage-bar">
          <span className="hz-dots"><i /><i /><i /></span>
          <span className="hz-path">rcs.hermes.kt.com › 메시지발송(웹) › 메시지 조회/생성/발송</span>
          <span className="hz-live">전체 화면 {Math.round(scale * 100)}% · 영역을 누르면 크게 볼 수 있습니다</span>
        </div>
        <div className="hz-fit" ref={boxRef} style={{ height: boxH || undefined }}>
          <div className="hz-real hz-page" ref={pageRef} style={{ transform: "scale(" + scale + ")", width: HZ_NATURAL_W }}>
            <div className="hz-tabrow">
              <span className="hz-tabon">메시지 생성/상세조회/발송</span>
              <span className="hz-taboff">메시지 조회/삭제</span>
            </div>
            {HZ_STEPS.map((s, k) => (
              <div
                key={s.part}
                className={"hz-part" + (k === i ? " on" : "")}
                data-part={s.part}
                onClick={() => { if (k === i) setZoom(true); else go(k); }}
                dangerouslySetInnerHTML={{ __html: ui.parts[s.part] || "" }}
              />
            ))}
            {/* 광고성 표기 의무 체크는 실제 화면과 같이 '메시지 저장'(name 파트) 안에 있다 */}
            <div className="hz-sendrow">
              <span className="hz-sendbtns"><b>목록</b><b className="pri">발송</b></span>
            </div>
          </div>
        </div>
      </div>


      {zoom && <HzZoom step={step} idx={i} onClose={() => setZoom(false)}
                       onGo={(k) => { if (k >= 0 && k < HZ_STEPS.length) setI(k); }}
                       onGuide={() => setTour({ sub: 0 })} paused={!!tour} />}
      {tour && <HzTour stepIdx={i} sub={tour.sub} onMove={tourMove} onClose={() => setTour(null)} />}
    </div>
  );
}

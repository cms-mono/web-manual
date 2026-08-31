/* ============================================================
   통합 매뉴얼 허브 — App (라우팅 / 헤더 / 다크모드 / 마운트)
   ============================================================ */

/* 라우트 ↔ 해시 직렬화 */
function routeToHash(r) {
  if (!r || r.name === "home") return "#/";
  if (r.name === "service") {
    const p = [];
    if (r.anchor) p.push("sec=" + r.anchor);
    if (r.q) p.push("q=" + encodeURIComponent(r.q));
    return "#/service/" + r.id + (p.length ? "?" + p.join("&") : "");
  }
  if (r.name === "agent") {
    const p = [];
    if (r.anchor) p.push("sec=" + r.anchor);
    if (r.q) p.push("q=" + encodeURIComponent(r.q));
    return "#/agent/" + r.id + (p.length ? "?" + p.join("&") : "");
  }
  if (r.name === "search") return "#/search?q=" + encodeURIComponent(r.q || "");
  if (r.name === "changelog") return "#/changelog";
  if (r.name === "resultcodes") {
    const p = [];
    if (r.group) p.push("svc=" + r.group);
    if (r.q) p.push("q=" + encodeURIComponent(r.q));
    return "#/codes" + (p.length ? "?" + p.join("&") : "");
  }
  return "#/";
}
function hashToRoute(hash) {
  const h = (hash || "").replace(/^#\/?/, "");
  if (!h) return { name: "home" };
  const [path, qs] = h.split("?");
  const parts = path.split("/");
  const params = {};
  (qs || "").split("&").forEach((p) => {
    const [k, v] = p.split("=");
    if (k) params[k] = decodeURIComponent(v || "");
  });
  if (parts[0] === "service") return { name: "service", id: parts[1], anchor: params.sec, q: params.q || "" };
  if (parts[0] === "agent") {
    // serviceGuide 에이전트(예: Communis 이용가이드)는 서비스 경로로 정규화한다.
    const ag = window.HUB && window.HUB.AGENT_MAP[parts[1]];
    if (ag && ag.serviceGuide && ag.supports && ag.supports[0]) {
      return { name: "service", id: ag.supports[0], anchor: params.sec, q: params.q || "" };
    }
    return { name: "agent", id: parts[1], anchor: params.sec, q: params.q || "" };
  }
  if (parts[0] === "search") return { name: "search", q: params.q || "" };
  if (parts[0] === "changelog") return { name: "changelog" };
  if (parts[0] === "codes") return { name: "resultcodes", group: params.svc || "", q: params.q || "" };
  return { name: "home" };
}

/* 다크모드 훅 */
function useTheme() {
  const [theme, setTheme] = React.useState(() => {
    try { return localStorage.getItem("hub-theme") || "light"; } catch (e) { return "light"; }
  });
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("hub-theme", theme); } catch (e) {}
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "light" ? "dark" : "light"))];
}

/* 헤더 */
function Header({ index, onNavigate, route, theme, toggleTheme }) {
  const onHome = route.name === "home";
  return (
    <header className="hdr">
      <div className="hdr-inner">
        <div className="brand" onClick={() => onNavigate({ name: "home" })}>
          <div className="brand-mark"><Icon name="layers" size={19} /></div>
          <div>
            <div className="brand-name">매뉴얼 허브</div>
            <div className="brand-sub">KT 메시징 · 통합 문서</div>
          </div>
        </div>

        <div className="hdr-search">
          <SearchBar index={index} onNavigate={onNavigate} placeholder="문서·서비스·Agent 검색…" />
        </div>

        <div className="hdr-actions">
          <button className="hdr-link" onClick={() => onNavigate({ name: "resultcodes" })} title="서비스별 결과코드">
            <Icon name="hash" size={16} /><span>결과코드</span>
          </button>
          <button className="icon-btn" onClick={() => onNavigate({ name: "search", q: "" })} title="검색" aria-label="검색">
            <Icon name="search" size={18} />
          </button>
          <button className="icon-btn" onClick={toggleTheme} title="테마 전환" aria-label="테마 전환">
            <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

/* 푸터 */
function Footer({ onNavigate }) {
  return (
    <footer className="ftr">
      <div className="wrap ftr-inner">
        <div className="ftr-brand">
          <div className="brand-mark" style={{ width: 30, height: 30 }}><Icon name="layers" size={16} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>통합 매뉴얼 허브</div>
            <div className="ftr-copy">KT 기반 B2B 메시징 · 서비스 &amp; Agent 문서</div>
          </div>
        </div>
        <div className="ftr-links">
          <a onClick={() => onNavigate({ name: "home" })}>홈</a>
          <a onClick={() => onNavigate({ name: "resultcodes" })}>결과코드</a>
          <a onClick={() => onNavigate({ name: "changelog" })}>문서 이력</a>
          <a onClick={() => onNavigate({ name: "search", q: "" })}>검색</a>
        </div>
      </div>
    </footer>
  );
}

/* 상단 퀵메뉴 — 홈으로 가지 않고도 서비스·에이전트·결과코드로 바로 이동.
   아래로 스크롤하면 사라지고, 마우스를 화면 맨 위에 대면(호버) 페이지 위로 스르륵 내려온다. */
function TopMenu({ onNavigate, route }) {
  const [open, setOpen] = React.useState(true);
  const lastY = React.useRef(0);
  const hideTimer = React.useRef(null);

  React.useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y < 12) setOpen(true);                       // 최상단 → 표시
      else if (y > lastY.current + 2) setOpen(false);  // 아래로 스크롤 → 숨김
      lastY.current = y;
    }
    function onMove(e) {
      // 고정 헤더(약 64px) 영역에 마우스를 올리면 그 아래로 메뉴가 내려온다
      if (e.clientY <= 72) { clearTimeout(hideTimer.current); setOpen(true); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      clearTimeout(hideTimer.current);
    };
  }, []);

  // 본문(AgentDetail)이 알려주는 '지금 보고 있는 탭의 그룹'
  const [section, setSection] = React.useState(() => window.__hubSection || null);
  React.useEffect(() => {
    function onSection(e) { setSection(e.detail || null); }
    window.addEventListener("hub:section", onSection);
    return () => window.removeEventListener("hub:section", onSection);
  }, []);

  const services = window.HUB.publishedServices();
  const curAgent = route.name === "agent" ? route.id : null;
  const curSvc = route.name === "service" ? route.id : null;

  /* '이용 · 연동 방법' 드롭다운 — 홈 섹션과 같은 카테고리(웹 / API / Agent / 기타·부록)로 묶는다.
     serviceGuide(예: Communis)도 포함하고, 이동 경로는 홈 카드와 동일하게 맞춘다. */
  const methodAgents = window.HUB.homeAgentApiCards().filter((a) => window.HUB.isAgentPublished(a.id));
  const webCards = (window.HUB.HOME_WEB_CARDS || []).filter((c) => !!c.goto && c.status !== "soon");
  const METHOD_GROUPS = [
    { kind: "web", label: "웹" },
    { kind: "api", label: "API" },
    { kind: "agent", label: "Agent" },
    { kind: "etc", label: "기타 · 부록" },
  ];
  function agentRoute(a) {
    return (a.serviceGuide && a.supports && a.supports[0])
      ? { name: "service", id: a.supports[0], anchor: a.homeAnchor }
      : { name: "agent", id: a.id, anchor: a.homeAnchor };
  }
  /* 트리거 활성 표시 — 두 메뉴가 동시에 켜지지 않도록 한쪽만 고른다.
     가이드가 서비스 경로에서 렌더되는 경우(Communis)에는 지금 보고 있는 구간으로 판단한다.
       · 개요·시작하기 구간  → '서비스'
       · 웹 발송·API 연동 등 → '이용 · 연동 방법' */
  const guideAgentId = curSvc ? (window.HUB.SERVICE_MAP[curSvc] || {}).guideAgentId : null;
  let svcActive = !!curSvc;
  let onMethod = !!curAgent;
  if (guideAgentId) {
    const ga = window.HUB.AGENT_MAP[guideAgentId] || {};
    const scope = ga.serviceScopeGroups || [];
    const g = section && section.agentId === guideAgentId ? section.group : null;
    // 그룹 정보가 아직 없으면(초기 렌더) 서비스 쪽을 기본으로 둔다
    const inServiceScope = g == null ? true : scope.indexOf(g) >= 0;
    svcActive = inServiceScope;
    onMethod = !inServiceScope;
  }

  return (
    <div className="topmenu-wrap">
    <nav
      className={"topmenu" + (open ? " show" : "")}
      onMouseEnter={() => { clearTimeout(hideTimer.current); setOpen(true); }}
      onMouseLeave={() => { hideTimer.current = setTimeout(() => { if (window.scrollY > 12) setOpen(false); }, 240); }}
    >
      <div className="topmenu-inner">
        <button className="topmenu-home" onClick={() => onNavigate({ name: "home" })}>
          <Icon name="layers" size={15} /><span>홈</span>
        </button>
        <span className="topmenu-sep" />
        <div className="topmenu-dd">
          <button className={"topmenu-trigger" + (svcActive ? " on" : "")}>
            서비스 <Icon name="chevron" size={13} className="topmenu-caret" />
          </button>
          <div className="topmenu-panel">
            {services.map((s) => (
              <a key={s.id} className={"topmenu-panel-item" + (curSvc === s.id ? " on" : "")}
                 onClick={() => onNavigate({ name: "service", id: s.id })}>
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <div className="topmenu-dd">
          <button className={"topmenu-trigger" + (onMethod ? " on" : "")}>
            이용 · 연동 방법 <Icon name="chevron" size={13} className="topmenu-caret" />
          </button>
          <div className="topmenu-panel wide">
            {METHOD_GROUPS.map((g) => {
              const isWeb = g.kind === "web";
              const list = isWeb ? webCards : methodAgents.filter((a) => window.HUB.agentKind(a) === g.kind);
              if (!list.length) return null;
              return (
                <div className="topmenu-panel-sec" key={g.kind}>
                  <span className={"topmenu-panel-group kind-tag " + g.kind}>{g.label}</span>
                  {list.map((a) =>
                    isWeb ? (
                      <a key={a.id} className="topmenu-panel-item"
                         onClick={() => onNavigate(a.goto)}>{a.name}</a>
                    ) : (
                      <a key={a.id} className={"topmenu-panel-item" + (curAgent === a.id ? " on" : "")}
                         onClick={() => onNavigate(agentRoute(a))}>
                        {window.HUB.agentDisplayName(a, null)}
                      </a>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <span className="topmenu-sep" />
        <a className={"topmenu-link" + (route.name === "resultcodes" ? " on" : "")}
           onClick={() => onNavigate({ name: "resultcodes" })}>결과코드</a>
        <a className={"topmenu-link" + (route.name === "changelog" ? " on" : "")}
           onClick={() => onNavigate({ name: "changelog" })}>문서 이력</a>
      </div>
    </nav>
    </div>
  );
}

/* App */
function App() {
  const index = React.useMemo(
    () => window.HUB.buildSearchIndex(window.MANUALS),
    []
  );
  const [route, setRoute] = React.useState(() => hashToRoute(location.hash));
  const [theme, toggleTheme] = useTheme();
  const navSeq = React.useRef(0);

  // 매 내비게이션마다 증가하는 nonce(_seq)를 라우트에 실어, 동일 해시 재검색에도
  // 화면 효과(재스크롤·강조)가 다시 트리거되게 한다.
  const applyHash = React.useCallback(() => {
    setRoute(Object.assign(hashToRoute(location.hash), { _seq: navSeq.current }));
  }, []);
  const navigate = React.useCallback((r) => {
    navSeq.current += 1;
    const h = routeToHash(r);
    if (h === location.hash) applyHash();   // 동일 해시 → hashchange 미발생 → 직접 갱신
    else location.hash = h;                 // 해시 변경 → hashchange가 applyHash 호출
  }, [applyHash]);

  React.useEffect(() => {
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [applyHash]);

  /* 본문에 쓰인 해시 링크(a[href^="#/"], 예: 스텝의 [따라하기 보기] 버튼)를 가로챈다.
     브라우저에 맡기면 지금 주소와 값이 같을 때 hashchange 가 발생하지 않아
     클릭해도 아무 일도 일어나지 않는다. navigate 와 같은 규칙으로 처리한다. */
  React.useEffect(() => {
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href^="#/"]');
      if (!a || a.target === "_blank") return;
      e.preventDefault();
      const h = a.getAttribute("href");
      navSeq.current += 1;
      if (h === location.hash) applyHash();
      else location.hash = h;
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [applyHash]);

  // ⌘K / Ctrl+K → 검색 포커스
  React.useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = document.querySelector(".hdr-search input, .hero-search input");
        if (input) input.focus();
        else navigate({ name: "search", q: "" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // 본문 상호참조 링크(a.xref) → 미리보기 오버레이
  const [peek, setPeek] = usePeek();

  let screen;
  if (route.name === "service") {
    const svc = window.HUB.SERVICE_MAP[route.id];
    if (svc && svc.guideAgentId) {
      // 이 서비스는 이용가이드(가이드 콘텐츠)를 서비스 경로에서 바로 렌더한다.
      screen = <AgentDetail key={"svc-" + route.id} agentId={svc.guideAgentId} index={index} onNavigate={navigate} anchor={route.anchor} query={route.q} navToken={route._seq} />;
    } else {
      screen = <ServiceView serviceId={route.id} index={index} onNavigate={navigate} />;
    }
  }
  else if (route.name === "agent") screen = <AgentDetail key={route.id} agentId={route.id} index={index} onNavigate={navigate} anchor={route.anchor} query={route.q} navToken={route._seq} />;
  else if (route.name === "search") screen = <SearchResults query={route.q} index={index} onNavigate={navigate} />;
  else if (route.name === "changelog") screen = <Changelog onNavigate={navigate} />;
  else if (route.name === "resultcodes") screen = <ResultCodes group={route.group} q={route.q} onNavigate={navigate} />;
  else screen = <Home index={index} onNavigate={navigate} />;

  return (
    <div className="app-root">
      <TopMenu onNavigate={navigate} route={route} />
      <Header index={index} onNavigate={navigate} route={route} theme={theme} toggleTheme={toggleTheme} />
      {/* 퀵메뉴가 덮을 자리. 높이는 항상 고정이다 — 스크롤 위치에 따라 접었다 펴면
          문서 높이가 바뀌고, 크롬의 스크롤 앵커링이 그만큼 되돌려 무한히 튕긴다. */}
      <div className="topmenu-spacer" aria-hidden="true" />
      {screen}
      <Footer onNavigate={navigate} />
      <RightNav index={index} onNavigate={navigate} route={route} />
      <ScrollButtons />
      {peek && <PeekModal target={peek} onClose={() => setPeek(null)} onNavigate={navigate} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

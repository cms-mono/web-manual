/* ============================================================
   통합 매뉴얼 허브 — App (라우팅 / 헤더 / 다크모드 / 마운트)
   ============================================================ */

/* 라우트 ↔ 해시 직렬화 */
function routeToHash(r) {
  if (!r || r.name === "home") return "#/";
  if (r.name === "service") return "#/service/" + r.id;
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
  if (parts[0] === "service") return { name: "service", id: parts[1] };
  if (parts[0] === "agent") return { name: "agent", id: parts[1], anchor: params.sec, q: params.q || "" };
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

  const agents = window.HUB.publishedAgents();
  const services = window.HUB.publishedServices();
  const curAgent = route.name === "agent" ? route.id : null;
  const curSvc = route.name === "service" ? route.id : null;

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
        <span className="topmenu-label">에이전트</span>
        {agents.map((a) => (
          <a key={a.id} className={"topmenu-link" + (curAgent === a.id ? " on" : "")}
             onClick={() => onNavigate({ name: "agent", id: a.id })}>
            {window.HUB.agentDisplayName(a, null)}
          </a>
        ))}
        <span className="topmenu-sep" />
        <span className="topmenu-label">서비스</span>
        {services.map((s) => (
          <a key={s.id} className={"topmenu-link" + (curSvc === s.id ? " on" : "")}
             onClick={() => onNavigate({ name: "service", id: s.id })}>
            {s.name}
          </a>
        ))}
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

  // 페이지 최상단에서는 퀵메뉴가 본문을 가리지 않도록 그만큼 본문을 밀어준다(스페이서).
  const [atTop, setAtTop] = React.useState(true);
  React.useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  let screen;
  if (route.name === "service") screen = <ServiceView serviceId={route.id} index={index} onNavigate={navigate} />;
  else if (route.name === "agent") screen = <AgentDetail key={route.id} agentId={route.id} index={index} onNavigate={navigate} anchor={route.anchor} query={route.q} navToken={route._seq} />;
  else if (route.name === "search") screen = <SearchResults query={route.q} index={index} onNavigate={navigate} />;
  else if (route.name === "changelog") screen = <Changelog onNavigate={navigate} />;
  else if (route.name === "resultcodes") screen = <ResultCodes group={route.group} q={route.q} onNavigate={navigate} />;
  else screen = <Home index={index} onNavigate={navigate} />;

  return (
    <div className="app-root">
      <TopMenu onNavigate={navigate} route={route} />
      <Header index={index} onNavigate={navigate} route={route} theme={theme} toggleTheme={toggleTheme} />
      <div className={"topmenu-spacer" + (atTop ? " on" : "")} aria-hidden="true" />
      {screen}
      <Footer onNavigate={navigate} />
      <RightNav index={index} onNavigate={navigate} route={route} />
      <ScrollButtons />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

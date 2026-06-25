/* ============================================================
   통합 매뉴얼 허브 — 본문 소비자(consumer)
   ------------------------------------------------------------
   실제 본문은 content/<agent>/<service>.js 셀 파일에 들어 있고
   (window.HUB_CONTENT[agentId][serviceId]), 이 파일은 그것을 읽어
   화면이 기대하는 섹션 형태로 조립만 한다.

   - 셀이 아직 없거나 비어 있으면 공용 더미(HUB_TPL)로 폴백 →
     셀을 하나씩 채워 나가도 화면은 항상 정상 동작.
   - 신규 Agent/서비스 추가: data.js에 매핑 + content에 셀 파일 추가.

   섹션 형태(= screens.jsx가 받는 계약):
     { service, download:{title,meta}, intro, type:"steps"|"features",
       steps?[], features?[] }
   ============================================================ */
(function () {
  "use strict";
  const H = window.HUB;
  const CONTENT = window.HUB_CONTENT || {};
  const TPL = window.HUB_TPL || {};

  /* 서비스별 기본 인트로(셀에서 intro로 덮어쓸 수 있음) */
  const SVC_INTRO = {
    smart: "KT 스마트메시지(구 크로샷)로 문자(SMS/LMS/MMS)·음성·팩스를 발송하기 위한 연동 절차입니다.",
    rcs: "브랜드 RCS 메시지(리치카드·캐러셀 포함) 발송을 위한 연동 절차입니다. 발송 전 브랜드 등록이 선행되어야 합니다.",
    twoway: "고객 회신 수신 및 대화형 시나리오 운영을 위한 양방향 송수신 연동 절차입니다.",
    communis: "Communis는 통합 서비스이므로, 발송 기능별로 연동 절차가 나뉩니다. 아래 탭에서 기능을 선택하세요.",
  };

  /* 특정 (agent, service) 셀을 가져온다(없으면 {}) */
  function cellOf(agentId, serviceId) {
    const a = CONTENT[agentId];
    return (a && a[serviceId]) || {};
  }

  /* 셀이 비었을 때 transport 기준 공용 더미 */
  function fallbackSteps(agent, svc) {
    if (agent.transport === "TCP_SOCKET") {
      return TPL.socketSteps ? TPL.socketSteps(svc.short, agent.center) : [];
    }
    return TPL.apiSteps ? TPL.apiSteps(svc.short) : [];
  }
  function fallbackFeatures() {
    return TPL.communisFeatures ? TPL.communisFeatures() : [];
  }

  /* 다운로드 바 기본 제목 */
  function defaultDlTitle(agent, svc) {
    const ctxName = H.agentDisplayName(agent, svc.id);
    return agent.id === "openapi"
      ? `${ctxName} 연동 가이드`
      : `${agent.name} × ${svc.name} 연동 가이드`;
  }

  /* ---------------- 스텝 그룹핑 ----------------
     DB 테이블 기반 서비스(SMS·MMS·VMS·FMS) 탭은 스텝을 3그룹으로 묶어
     좌측 목차에 '발송하기 / DB 테이블 규격 / 결과 확인' 구분선을 보인다.
     - 셀의 스텝 배열은 그대로 두고, 여기서 그룹 기준 '안정 정렬'만 수행
       (그룹 내 상대 순서는 원본 유지) → 콘텐츠 이동 없이 재구성.
     - 정렬된 각 스텝에 _group(표시 라벨)을 붙여 렌더러가 구분선을 그린다.
     - 표/검색 모두 동일 함수를 거치므로 스텝 번호·딥링크 앵커가 일치한다. */
  const GROUPED_FEATURES = { sms: 1, mms: 1, vms: 1, fms: 1 };
  const GROUPS = [
    { key: "send", label: "발송하기" },
    { key: "db", label: "DB 테이블 규격" },
    { key: "result", label: "결과 확인" },
  ];
  function groupKey(st) {
    const t = st.title || "";
    if (/^SDK_/.test(t) || /^통계 테이블/.test(t)) return "db";
    if (/^응답코드/.test(t)) return "result";
    return "send"; // 개요·구성·작성법·샘플 등
  }
  function rankOf(k) { for (let i = 0; i < GROUPS.length; i++) if (GROUPS[i].key === k) return i; return 0; }
  function labelOf(k) { for (let i = 0; i < GROUPS.length; i++) if (GROUPS[i].key === k) return GROUPS[i].label; return ""; }
  function arrangeSteps(featureId, steps) {
    if (!GROUPED_FEATURES[featureId] || !steps) return steps || [];
    return steps
      .map((st, i) => ({ st, i, k: groupKey(st) }))
      .sort((a, b) => (rankOf(a.k) - rankOf(b.k)) || (a.i - b.i))
      .map((x) => Object.assign({}, x.st, { _group: labelOf(x.k) }));
  }

  /* ---------------- 섹션 빌더 ----------------
     Agent 한 개의 본문 섹션 = 지원 서비스마다 1섹션.
     각 섹션 본문은 해당 셀(content/<agent>/<svc>.js)에서 읽고,
     없으면 공용 더미로 폴백한다. */
  function getSections(agentId) {
    const agent = H.AGENT_MAP[agentId];
    if (!agent) return [];

    return H.servicesForAgent(agentId).map((svc) => {
      const cell = cellOf(agentId, svc.id);
      const dl = cell.download || {};
      const base = {
        service: svc,
        // 좌측 네비 대제목: 셀에 navName이 있으면 사용(에이전트 매뉴얼명), 없으면 서비스명
        navName: cell.navName || svc.name,
        download: {
          title: dl.title || defaultDlTitle(agent, svc),
          meta: dl.meta || "PDF · 업데이트 2026-04-24",
        },
        intro: cell.intro || SVC_INTRO[svc.id],
      };

      // 셀이 features(하위 탭)를 제공하면 탭 구성, 아니면 communis 기본 탭
      if ((cell.features && cell.features.length) || svc.id === "communis") {
        const rawFeatures =
          cell.features && cell.features.length ? cell.features : fallbackFeatures();
        const features = rawFeatures.map((f) =>
          Object.assign({}, f, { steps: arrangeSteps(f.id, f.steps) })
        );
        return Object.assign({}, base, { type: "features", features });
      }

      const steps =
        cell.steps && cell.steps.length ? cell.steps : fallbackSteps(agent, svc);
      return Object.assign({}, base, { type: "steps", steps });
    });
  }

  /* ---------------- 검색용 문서 인덱스 ----------------
     Agent×서비스×기능×스텝 단위로 문서를 생성한다.
     스텝 문서는 표 셀(컬럼명)·코드까지 search 필드에 담아 'RECV_YEAR' 같은
     필드명 검색이 가능하고, 클릭 시 해당 스텝까지 스크롤(딥링크)된다. */
  function stripHtml(s) {
    return String(s || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ").trim();
  }
  function tableText(t) {
    if (!t) return "";
    let out = (t.cols || []).join(" ") + " ";
    (t.rows || []).forEach((r) => { out += (Array.isArray(r) ? r.join(" ") : r) + " "; });
    return out;
  }
  // 스텝의 전체 검색 텍스트(제목·본문·목록·표 셀·노트·코드 — 컬럼명 포함)
  function stepText(st) {
    const parts = [st.title || "", stripHtml(st.body || st.intro || "")];
    (st.list || []).forEach((li) => parts.push(stripHtml(li)));
    if (st.table) parts.push(stripHtml(tableText(st.table)));
    (st.tables || []).forEach((t) => parts.push(stripHtml((t.label || "") + " " + tableText(t))));
    if (st.note) parts.push(stripHtml(st.note));
    (st.downloads || []).forEach((d) => parts.push((d.label || "") + " " + (d.sub || "")));
    if (st.code) parts.push(st.code);
    if (st.codePlain) parts.push(st.codePlain);
    (st.codeTabs || []).forEach((t) => parts.push((t.name || "") + " " + (t.code || "")));
    return parts.join(" ");
  }
  function shortText(st) {
    const b = stripHtml(st.body || st.intro || "");
    return b.length > 90 ? b.slice(0, 90) + "…" : b;
  }
  function stepDoc(agent, svc, ctxName, featureId, st, stepNo) {
    return {
      type: "document",
      id: `${agent.id}-${svc.id}-${featureId}-s${stepNo}`,
      title: st.title || `${stepNo}단계`,
      keywords: [ctxName, svc.short],
      body: shortText(st),
      search: stepText(st),           // 매칭 전용(컬럼명 등) — 스니펫에는 미노출
      agentId: agent.id,
      serviceId: svc.id,
      feature: featureId,
      route: { name: "agent", id: agent.id, anchor: `step-${svc.id}-${featureId}-${stepNo}` },
    };
  }

  function buildDocuments() {
    const docs = [];
    H.AGENTS.forEach((agent) => {
      if (agent.status === "soon") return;
      H.servicesForAgent(agent.id).forEach((svc) => {
        const ctxName = H.agentDisplayName(agent, svc.id);
        const cell = cellOf(agent.id, svc.id);
        const hasFeatures = (cell.features && cell.features.length) || svc.id === "communis";

        if (hasFeatures) {
          const features =
            cell.features && cell.features.length ? cell.features : fallbackFeatures();
          features.forEach((f) => {
            docs.push({
              type: "document",
              id: `${agent.id}-${svc.id}-${f.id}`,
              title: `${f.name} (${ctxName})`,
              keywords: [ctxName, agent.name, svc.short, f.name, "연동", "발송"],
              body: f.intro || "",
              agentId: agent.id,
              serviceId: svc.id,
              feature: f.id,
              route: { name: "agent", id: agent.id, anchor: `step-${svc.id}-${f.id}-1` },
            });
            arrangeSteps(f.id, f.steps).forEach((st, si) => docs.push(stepDoc(agent, svc, ctxName, f.id, st, si + 1)));
          });
        } else {
          const steps = cell.steps && cell.steps.length ? cell.steps : fallbackSteps(agent, svc);
          docs.push({
            type: "document",
            id: `${agent.id}-${svc.id}`,
            title: `${svc.name} 연동 가이드 (${ctxName})`,
            keywords: [ctxName, agent.name, svc.short, ...svc.features, "연동", "발송"],
            body: cell.intro || SVC_INTRO[svc.id],
            agentId: agent.id,
            serviceId: svc.id,
            route: { name: "agent", id: agent.id, anchor: `sec-${svc.id}` },
          });
          steps.forEach((st, si) => docs.push(stepDoc(agent, svc, ctxName, "_", st, si + 1)));
        }
      });
    });
    return docs;
  }

  window.MANUALS = {
    getSections,
    documents: buildDocuments(),
    // 하위 호환: 기본 Communis 기능 구성
    COMMUNIS_FEATURES: fallbackFeatures(),
  };
})();

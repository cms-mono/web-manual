# 통합 매뉴얼 허브 (web-manual)

KT 기반 B2B 메시징 서비스 · Agent 통합 문서 (내부 공유용).

빌드 과정 없는 정적 웹앱입니다 — React 18 + Babel(브라우저 내 JSX 변환).

## 실행 방법

정적 파일이므로 로컬 HTTP 서버로 열면 됩니다.

```bash
python -m http.server 8008
```

브라우저에서 `http://localhost:8008` 접속.

## 구조

| 파일 / 폴더 | 역할 |
|------------|------|
| `index.html` | 진입점 (스크립트 로드) |
| `app.jsx` | 라우팅 · 헤더 · 푸터 · 마운트 |
| `screens.jsx` | 화면(홈/서비스/에이전트/검색/결과코드/문서이력) |
| `components.jsx` | 공통 컴포넌트 (검색바·사이트링크 등) |
| `data.js` | 서비스 · 에이전트 데이터 모델 |
| `content/` | 에이전트×서비스별 매뉴얼 콘텐츠 셀 |
| `resultcodes.js` | 서비스별 결과코드 |
| `versions.js` | 문서 변경 이력 |
| `styles.css` | 스타일 |

/* eslint-disable */
/* rcs.hermes.kt.com 선택 팝업들 — 실제 마크업·스타일
   ------------------------------------------------------------
   [조회] 등을 눌렀을 때 뜨는 팝업을 실제 화면(2026-08-27)에서 그대로 가져왔다.
   · CSS는 _ui.js 가 이미 가진 규칙과 겹치지 않는 것만 담아 뒤에 이어 붙인다.
   · 다른 고객사 브랜드명과 브랜드 ID, 예시로 쓰지 않는 대화방은 가림 처리했다.
   · data-v-* 속성과 빈 주석은 걷어냈다.
   · 발송량 현황의 시간표는 분량을 줄여 일부 시간대만 남겼고, 색 구분(선택 가능·
     부분 발송 가능·선택 불가)이 보이도록 disabled 상태를 손봤다.
   · 스프라이트(/img/spr_icons….png)는 가져올 수 없어 라디오·체크박스·툴팁
     아이콘은 styles.css 에서 CSS로 대체한다.
   ============================================================ */
(function () {
  var CSS = `.hz-real .ico { display: inline-block; }
.hz-real .ico-refresh { width: 15px; height: 15px; }
.hz-real .btn-sm { width: 150px; height: 45px; line-height: 45px; font-size: 14px; }
.hz-real .btn-sm2 { height: 35px; line-height: 35px; }
.hz-real .btn-sm2 { width: 100px; font-size: 14px; }
.hz-real .btn-sm4 { height: 40px; line-height: 40px; }
.hz-real .btn-sm4 { width: 110px; font-size: 14px; }
.hz-real .btn-icon { width: 35px; height: 35px; line-height: 36px; }
.hz-real .btn-icon .ico { line-height: 1.3; }
.hz-real .preview-area.template .body-area { padding: 20px 16px; min-height: 180px; }
.hz-real .tab-menu { margin-bottom: 40px; }
.hz-real .tab-menu ul { display: flex; width: 100%; }
.hz-real .tab-menu li { flex: 1 1 0%; height: 47px; text-align: center; }
.hz-real .tab-menu li + li a { border-left: 0px; }
.hz-real .tab-menu li a { display: block; height: 100%; line-height: 47px; border: 1px solid rgb(218, 219, 221); color: rgb(153, 153, 153); font-size: 15px; font-weight: 300; }
.hz-real .tab-menu li.current a { background-color: rgb(27, 174, 197); border: 0px; color: rgb(255, 255, 255); }
.hz-real .srch-area { display: block; position: relative; margin-bottom: 20px; text-align: right; }
.hz-real .srch-area input { display: inline-block; width: 287px; height: 30px; padding: 0px 40px 0px 12px; border: 1px solid rgb(218, 219, 221); font-size: 12px; font-weight: 300; }
.hz-real .srch-area button { top: 0px; right: 0px; padding: 0px 12px; line-height: 0; }
.hz-real .srch-area button { overflow: hidden; position: absolute; height: 100%; }
.hz-real .file-input { position: relative; width: 100%; vertical-align: middle; }
.hz-real .file-input label { position: absolute; height: 30px; cursor: pointer; }
.hz-real .file-input label { top: 1px; right: 3px; width: 84px; line-height: 30px; background-color: rgb(110, 112, 116); font-size: 13px; color: rgb(255, 255, 255); font-weight: 300; border-radius: 4px; text-align: center; z-index: 4; }
.hz-real .file-input-hidden { position: absolute; top: 0px; left: 0px; width: 100%; cursor: pointer; }
.hz-real .file-input-hidden { font-size: 15px; opacity: 0; z-index: 20; }
.hz-real .file-input.fileinput-type label + span { display: block; position: relative; z-index: 3; width: 100%; height: 36px; line-height: 34px; padding: 0px 12px; border-radius: 4px; background-color: rgb(247, 247, 247); border: 1px solid rgb(218, 219, 221); font-size: 12px; color: rgb(34, 34, 34); box-sizing: border-box; }
.hz-real .file-input.fileinput-type .file-input-hidden { z-index: 1; }
.hz-real .select-type { display: block; position: relative; min-width: 80px; height: 36px; font-size: 12px; color: rgb(68, 68, 68); cursor: pointer; vertical-align: middle; text-align: left; }
.hz-real .select-type select { width: 100%; height: 100%; border-radius: 4px; }
.hz-real .popup { position: relative; width: 100%; padding: 0; background-color: rgb(255, 255, 255); }
.hz-real .popup .popup-header { padding-bottom: 25px; text-align: center; }
.hz-real .popup .popup-header h3 { margin-bottom: 15px; font-size: 22px; font-weight: 500; color: rgb(34, 34, 34); }
.hz-real .popup .popup-footer .btn-area { padding-top: 20px; text-align: center; }
.hz-real .popup .popup-footer .btn-area .btn + .btn { margin-left: 7px; }
.hz-real .popup .form-wrap { padding: 30px 45px; border-top: 1px solid rgb(68, 68, 68); border-bottom: 1px solid rgb(218, 219, 221); }
.hz-real .popup .input-group { display: flex; align-items: center; }
.hz-real .popup .input-group + .input-group { margin-top: 10px; }
.hz-real .popup .tit { display: inline-block; width: 90px; color: rgb(34, 34, 34); vertical-align: middle; }
.hz-real .popup input { flex: 1 1 0%; height: 40px; }
.hz-real .popup.fild-list .popup-header { margin-bottom: 30px; border-bottom: 1px solid rgb(68, 68, 68); }
.hz-real .popup.fild-list .popup-header h3 { margin-bottom: 0px; }
.hz-real .popup .table-wrap.scroll-y { overflow: hidden auto; max-height: 240px; }
.hz-real .popup .srch-area { width: 460px; margin: 0px auto 30px; text-align: center; }
.hz-real .popup .srch-area .flex { align-items: center; justify-content: center; }
.hz-real .popup .srch-area input { display: inline-block; width: auto; height: 40px; font-size: 14px; }
.hz-real .popup .srch-area button { position: static; height: 40px; margin-left: 5px; }
.hz-real .popup .srch-area select { width: 100%; height: 40px; margin-right: -1px; font-size: 14px; color: rgb(34, 34, 34); }
.hz-real .popup.fild-list .select-type { width: 130px; height: 40px; flex: initial; }
.hz-real .popup.fild-list .select-type select { border-right: 0px; }
.hz-real .popup select option { color: rgb(153, 153, 153); }
.hz-real .popup.fild-list .srch-area input { padding: 0px 12px; }
.hz-real .popup .card.preview-wrap { width: 279px; height: 340px; }
.hz-real .popup .preview-area { width: 100%; height: 254px; }
.hz-real .popup .preview-area .inner { width: 219px; height: auto; padding: 20px 14px; }
.hz-real .popup .card.table-type .card-header { height: 32px; line-height: 32px; }
.hz-real .popup .card.table-type .card-header h2 { font-size: 14px; }
.hz-real .popup .card.table-type.preview-wrap .card-body { height: calc(100% - 32px); }
.hz-real .popup .preview-area .txt { padding: 4px 0px 5px; font-size: 12px; letter-spacing: -0.05em; line-height: 16px; }
.hz-real .popup .preview-area .txt:first-of-type { margin-top: -8px; padding: 5px 0px; }
.hz-real .flex.center { align-items: center; justify-content: center; }
.hz-real .send-table th { text-align: left; }
.hz-real .send-table td, .hz-real .send-table th { padding: 10px; }
.hz-real .send-table .time-area { display: flex; justify-content: space-between; }
.hz-real .send-table .time-area input { flex: inherit; width: 380px; }
.hz-real .send-table .time-area .arrow { font-size: 14px; }
.hz-real .send-list .flex + .flex { margin-top: 8px; }
.hz-real .send-list button { width: 128px; height: 38px; border-radius: 2px; border: 1px solid rgb(0, 0, 0); background: #fff; }
.hz-real .send-list button + button { margin-left: 8px; }
.hz-real .send-list button.select { color: rgb(27, 174, 197); border-color: rgb(27, 174, 197); background-color: rgba(27, 174, 197, 0.14); }
.hz-real .send-list button.partial { color: rgb(255, 172, 11); border-color: rgb(255, 172, 11); background-color: rgba(255, 172, 11, 0.14); }
.hz-real .send-list button[disabled] { color: rgb(204, 204, 204); border-color: rgb(218, 219, 221); background-color: rgb(247, 247, 247); }
.hz-real .send-state .table-data { overflow-y: auto; width: 200px; margin-left: 40px; }
.hz-real .send-state .table-data th { padding: 10px 0px; }
.hz-real .send-legend { margin-left: auto; }
.hz-real .send-legend span + span { margin-left: 16px; }
.hz-real .send-legend i { display: inline-block; width: 16px; height: 16px; vertical-align: middle; margin-right: 6px; border-radius: 2px; border: 1px solid rgb(0, 0, 0); }
.hz-real .send-legend .select i { border-color: rgb(27, 174, 197); background-color: rgba(27, 174, 197, 0.14); }
.hz-real .send-legend .partial i { border-color: rgb(255, 172, 11); background-color: rgba(255, 172, 11, 0.14); }
.hz-real .menu-btn .menu-area { display: flex; flex-wrap: wrap; gap: 8px 0; }
.hz-real .menu-btn .menu-item { position: relative; height: 36px; padding: 0px 20px; line-height: 34px; font-weight: 500; font-size: 14px; color: rgb(179, 179, 179); border-radius: 100px; border: 1px solid rgb(218, 219, 221); background-color: rgb(255, 255, 255); cursor: pointer; }
.hz-real .menu-btn .menu-item.selected { border-color: rgb(27, 174, 197); color: rgb(27, 174, 197); }
.hz-real .menu-btn .menu-item + .menu-item { margin-left: 8px; }
.hz-real .popup .tab-menu { width: 630px; margin: 0px auto; }
.hz-real .popup .tab-menu li { position: relative; }
.hz-real h3 { font-weight: 400; color: rgb(51, 51, 51); padding: 0; margin: 0; border: 0; }
.hz-real img { max-width: 100%; vertical-align: middle; }
.hz-real fieldset { width: 100%; border: 0px; padding: 0; margin: 0; }
.hz-real legend { display: none; }
.hz-real input:disabled { background-color: rgb(247, 247, 247); }
.hz-real select { min-width: 60px; height: 40px; padding: 0px 0px 0px 10px; border-radius: 4px; border: 1px solid rgb(218, 219, 221); font-family: "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif; font-size: 12px; color: rgb(34, 34, 34); font-weight: 300; vertical-align: middle; }
.hz-real strong { font-weight: 700; padding: 0; margin: 0; }
.hz-real .checkbox-type { display: inline-block; position: relative; line-height: 1; }
.hz-real .align-c { text-align: center !important; }
.hz-real .mg-t6 { margin-top: 6px !important; }
.hz-real .mg-l10 { margin-left: 10px !important; }
.hz-real .vue-js-switch { display: inline-block; position: relative; vertical-align: middle; user-select: none; font-size: 10px; cursor: pointer; }
.hz-real .vue-js-switch .v-switch-input { opacity: 0; position: absolute; width: 1px; height: 1px; }
.hz-real .vue-js-switch .v-switch-core { display: block; position: relative; box-sizing: border-box; outline: 0px; margin: 0px; }
.hz-real .vue-js-switch .v-switch-core .v-switch-button { display: block; position: absolute; overflow: hidden; top: 0px; left: 0px; border-radius: 100%; background-color: rgb(255, 255, 255); z-index: 2; }`;

  var POPS = {};

  POPS.brand = `<div class="popup fild-list fild-prd fild-brand"><div class="popup-header"><h3>브랜드를 선택해주세요</h3></div><div class="popup-body"><fieldset class="srch-area"><legend>검색영역</legend><div class="flex"><span class="select-type"><select><option value="all" selected="">전체</option><option value="brandId">브랜드ID</option><option value="brandName">브랜드명</option></select></span><input type="text" placeholder="검색어를 입력해주세요." value="" readonly=""><button type="button" class="btn btn-sm4 btn-gray fx-init">검색</button></div></fieldset><div class="table-wrap scroll-y"><table class="table-data"><caption>브랜드 선택</caption><colgroup><col style="width: 42px;"><col style="width: auto;"><col style="width: auto;"></colgroup><thead><tr><th>번호</th><th>브랜드 명</th><th>브랜드 ID</th></tr></thead><tbody><tr style="background-color: white;"><td>1</td><td>(다른 브랜드)</td><td>BR.**********</td></tr><tr style="background-color: white;"><td>2</td><td>모노커뮤니케이션즈</td><td>BR.Q854******</td></tr></tbody></table></div></div><div class="popup-footer"><div class="btn-area"><button type="button" class="btn btn-sm2">취소</button><button type="button" class="btn btn-sm2 btn-primary">확인</button></div></div></div>`;

  POPS.number = `<div class="popup fild-list fild-number"><div class="popup-header"><h3>발신번호를 선택해주세요</h3></div><div class="popup-body"><fieldset class="srch-area"><legend>검색영역</legend><div class="flex"><input type="text" placeholder="검색어를 입력해주세요." value="" readonly=""><button type="button" class="btn btn-sm4 btn-gray fx-init">검색</button></div></fieldset><div class="table-wrap scroll-y"><table class="table-data"><caption>발신번호 선택</caption><colgroup><col style="width: 42px;"><col style="width: auto;"></colgroup><thead><tr><th>번호</th><th>대화방(발신번호) 명</th><th>발신번호</th></tr></thead><tbody><tr><td>1</td><td>(다른 대화방)</td><td>bot-**********</td></tr><tr><td>2</td><td>(다른 대화방)</td><td>bot-**********</td></tr><tr style="background-color:#e8f7fa;"><td>3</td><td>(주) 모노커뮤니케이션즈</td><td>15777223</td></tr><tr><td>4</td><td>(다른 대화방)</td><td>0707*******</td></tr><tr><td>5</td><td>모노커뮤니케이션즈</td><td>023337223</td></tr><tr><td>6</td><td>(다른 대화방)</td><td>0233*****</td></tr></tbody></table></div></div><div class="popup-footer"><div class="btn-area"><button type="button" class="btn btn-sm2">취소</button><button type="button" class="btn btn-sm2 btn-primary">확인</button></div></div></div>`;

  POPS.base = `<div class="popup fild-list fild-base preview"><div class="popup-header" style="margin-bottom: 10px;"><h3>메시지 종류를 선택해주세요</h3></div><div class="popup-body"><fieldset><div class="tab-menu mg-t25"><ul><li class="current"><a>기존 RCS</a><div class="tooltip"><p>삼성 단말 이용자에게만 RCS 전송이 가능하지만, 가독성이 높고 효과적인 메시지</p></div></li><li class=""><a>통합 RCS</a><div class="tooltip"><p>삼성, 아이폰 등 단말의 구분 없이 모든 고객에 RCS 메시지를 전송할 수 있어 편리하고 효율적인 메시지</p></div></li></ul></div><div><div class="menu-btn mg-t10"><div class="menu-area" style="justify-content: center;"><div class="menu-item selected">SMS</div><div class="menu-item">LMS</div><div class="menu-item">MMS</div><div class="menu-item">템플릿</div><div class="menu-item">LMS템플릿</div><div class="menu-item">이미지템플릿</div><div class="menu-item">레이아웃</div></div></div><div class="flex mg-t10" style="width: 630px; margin: 10px auto 0;"><input type="text" placeholder="검색어를 입력해주세요." value="" readonly=""><button type="button" class="btn btn-sm4 btn-gray fx-init">검색</button></div></div></fieldset><div class="flex mg-t10"><div class="table-wrap scroll-y" style="flex:1"><table class="table-data"><caption>메시지 종류 선택</caption><colgroup><col style="width: 42px;"><col style="width: auto;"></colgroup><thead><tr><th>번호</th><th>메시지 종류</th></tr></thead><tbody><tr style="background-color:#e8f7fa;"><td>1</td><td>SMS</td></tr></tbody></table></div><div class="message-preview fx-init" style="width: 320px;"><div class="card table-type preview-wrap"><div class="card-header"><h2>미리보기</h2></div><div class="card-body"><div class="preview-area template desc custom-scroll"><div class="card-type"><div class="inner"><div class="cont"><div class="body-area"><div class="txt-area"><p class="txt align-c">미리보기 화면</p></div></div></div></div></div></div></div></div></div></div></div><div class="popup-footer"><div class="btn-area"><button type="button" class="btn btn-sm2">취소</button><button type="button" class="btn btn-sm2 btn-primary">확인</button></div></div></div>`;

  POPS.recvOne = `<div class="popup send-number-single"><div class="popup-header"><h3>수신자를 추가해주세요</h3></div><div class="popup-body"><div class="form-wrap"><div class="input-group"><div class="radio-group result-ctrl"><span class="radio-type"><input type="radio" id="sendState01" name="state-radio" value="addrRegi" checked=""><label for="sendState01">주소록 등록</label></span><span class="radio-type"><input type="radio" id="sendState02" name="state-radio" value="temp"><label for="sendState02">임시번호</label></span></div></div><div class="input-group"><div class="radio-group result-ctrl"><span class="radio-type"><input type="radio" id="sendState03" name="state-radio2" value="groupSelete" checked=""><label for="sendState03">그룹선택</label></span><span class="radio-type"><input type="radio" id="sendState04" name="state-radio2" value="groupInsert"><label for="sendState04">그룹등록</label></span></div></div><span class="select-type input-group"><select><option value="groupNull" selected="">그룹이 없습니다. 그룹을 추가해주세요</option></select></span><span class="input-group"><label class="tit">이름</label><input type="text" placeholder="이름을 입력해주세요." value="홍길동" readonly=""></span><span class="input-group"><label class="tit">전화번호</label><input type="text" placeholder="전화번호를 입력해주세요." value="01012345678" readonly=""></span></div></div><div class="popup-footer"><div class="btn-area"><button type="button" class="btn btn-sm2">닫기</button><button type="button" class="btn btn-sm2 btn-primary">등록</button></div></div></div>`;

  POPS.recvFile = `<div class="popup fild-list send-number-file"><div class="popup-header"><h3>수신 번호를 업로드해주세요</h3></div><div class="popup-body"><div class="tab-menu"><ul><li class="current"><a>엑셀로 추가</a></li><li class=""><a>텍스트로 추가</a></li></ul></div><div class="align-c"><button class="mg-t10 btn btn-sm2 btn-primary">샘플 다운로드</button></div><span class="input-group file-input-group mg-t25"><span class="file-input fileinput-type mg-t6"><label for="inputFile02">파일선택</label><span id="fileName02" class="filename-inner">수신자_20260827.xlsx</span></span></span><span class="txt-caution">직접 작성한 엑셀파일을 불러 발송할 수 있습니다. <br> 업로드한 번호는 해당 메시지 발송에만 사용됩니다. <br> 번호를 주소록에 추가하시려면 주소록 관리 메뉴를 사용해주세요. </span></div><div class="popup-footer"><div class="btn-area"><button type="button" class="btn btn-sm2">취소</button><button type="button" class="btn btn-sm2 btn-primary">확인</button></div></div></div>`;

  POPS.recvAddr = `<div class="popup fild-list fild-prd send-number-address"><div class="popup-header"><h3>주소록을 선택해주세요</h3></div><div class="popup-body"><div class="tab-menu"><ul><li class="current"><a>그룹</a></li></ul></div><fieldset class="srch-area"><legend>검색영역</legend><div class="flex"><input type="text" placeholder="검색어를 입력해주세요." value="" readonly=""><button type="button" class="btn btn-sm4 btn-gray fx-init">검색</button></div></fieldset><div class="table-wrap scroll-y"><table class="table-data"><caption>주소록</caption><colgroup><col style="width: 42px;"><col style="width: auto;"></colgroup><thead><tr><th><span class="checkbox-type"><input type="checkbox" id="addrGrpChkAll"><label for="addrGrpChkAll"></label></span></th><th>그룹명</th></tr></thead><tbody><tr><td colspan="2" class="center">데이타가 없습니다.</td></tr></tbody></table></div></div><div class="popup-footer"><div class="btn-area"><button type="button" class="btn btn-sm2">취소</button><button type="button" class="btn btn-sm2 btn-primary">확인</button></div></div></div>`;

  POPS.sendState = `<div class="popup fild-list send-state"><div class="card-body"><div class="flex center"><h3>발송량 현황</h3></div></div><div><div class="popup-body"><div class="flex"><div class="send-table" style="flex:1"><table><colgroup><col style="width: 80px;"><col style="width: auto;"></colgroup><tbody><tr><th>선택일</th><td><span class="input-area"><select><option value="2026-08-27" selected="">2026-08-27</option><option value="2026-08-28">2026-08-28</option><option value="2026-08-29">2026-08-29</option><option value="2026-08-30">2026-08-30</option><option value="2026-08-31">2026-08-31</option><option value="2026-09-01">2026-09-01</option><option value="2026-09-02">2026-09-02</option></select></span><button type="button" class="btn btn-sm btn-icon mg-l10"><i class="ico ico-refresh">↻</i></button><span style="margin-left: 15px; display: inline-flex; align-items: center; vertical-align: middle;"><label class="vue-js-switch"><div class="v-switch-core" style="width: 35px; height: 20px; background-color: rgb(191, 203, 217); border-radius: 10px;"><div class="v-switch-button" style="width: 14px; height: 14px; transform: translate3d(3px, 3px, 0px);"></div></div></label><span style="margin-left: 5px;">야간시간대 보기</span></span><span class="mg-l10">* 발송량 현황 조회는 현재 시간부터 7일 뒤까지 조회 가능합니다</span></td></tr><tr><th>현재 시각</th><td><div class="time-area"><input type="text" value="2026년 8월 27일 11시 41분 / 가용 발송량 : 384,000 건" readonly=""><button class="arrow">부분 발송 가용량 펼쳐보기</button></div></td></tr><tr><th>오전</th><td><div class="send-list"><div class="flex"><button class="select btn-select"><strong>08:00</strong></button><button class="select btn-select"><strong>08:10</strong></button><button class="select btn-select"><strong>08:20</strong></button><button class="select btn-select"><strong>08:30</strong></button><button class="select btn-select"><strong>08:40</strong></button><button class="select btn-select"><strong>08:50</strong></button></div><div class="flex"><button class="select btn-select"><strong>09:00</strong></button><button class="select btn-select"><strong>09:10</strong></button><button class="select btn-select"><strong>09:20</strong></button><button class="select btn-select"><strong>09:30</strong></button><button class="select btn-select"><strong>09:40</strong></button><button class="select btn-select"><strong>09:50</strong></button></div><div class="flex"><button disabled="disabled" class="btn-select"><strong>10:00</strong></button><button disabled="disabled" class="btn-select"><strong>10:10</strong></button><button class="select btn-select"><strong>10:20</strong></button><button class="select btn-select"><strong>10:30</strong></button><button class="select btn-select"><strong>10:40</strong></button><button class="select btn-select"><strong>10:50</strong></button></div></div></td></tr><tr><th>오후</th><td><div class="send-list"><div class="flex"><button class="select btn-select"><strong>12:00</strong></button><button class="select btn-select"><strong>12:10</strong></button><button class="select btn-select"><strong>12:20</strong></button><button class="partial btn-select"><strong>12:30</strong> / 38만건</button><button class="select btn-select"><strong>12:40</strong></button><button class="select btn-select"><strong>12:50</strong></button></div><div class="flex"><button class="select btn-select"><strong>13:00</strong></button><button class="select btn-select"><strong>13:10</strong></button><button class="select btn-select"><strong>13:20</strong></button><button class="select btn-select"><strong>13:30</strong></button><button class="partial btn-select"><strong>13:40</strong> / 37만건</button><button class="select btn-select"><strong>13:50</strong></button></div><div class="flex"><button class="select btn-select"><strong>14:00</strong></button><button class="partial btn-select"><strong>14:10</strong> / 37만건</button><button class="partial btn-select"><strong>14:20</strong> / 36만건</button><button class="partial btn-select"><strong>14:30</strong> / 36만건</button><button class="partial btn-select"><strong>14:40</strong> / 37만건</button><button disabled="disabled" class="btn-select"><strong>14:50</strong></button></div></div></td></tr><tr><th></th><td><div class="flex"><p>* 메시지 발송 가능한 시간대와 가용 발송량 확인 후 시간을 선택해주세요</p><div class="send-legend fx-init"><span class="select"><i></i>선택 가능</span><span class="partial"><i></i>부분 발송 가능</span><span><i></i>선택 불가</span></div></div></td></tr></tbody></table></div><div class="send-state table-data fx-init"><table><tbody><tr><th colspan="2">2026-8-27</th></tr><tr><th colspan="2">부분 발송 가용 발송량</th></tr><tr><td>12:30</td><td>383,877 건</td></tr><tr><td>13:40</td><td>371,528 건</td></tr><tr><td>14:10</td><td>371,529 건</td></tr><tr><td>14:20</td><td>368,801 건</td></tr><tr><td>14:30</td><td>366,748 건</td></tr><tr><td>14:40</td><td>371,520 건</td></tr></tbody></table></div></div></div></div><div class="popup-footer"><div class="btn-area"><button type="button" class="btn btn-sm2">취소</button><button type="button" class="btn btn-sm2 btn-primary">확인</button></div></div></div>`;

  /* 목록이 비었을 때 — 등록·승인이 끝나지 않으면 이렇게 보인다 */
  POPS.brandEmpty = `<div class="popup fild-list fild-prd fild-brand"><div class="popup-header"><h3>브랜드를 선택해주세요</h3></div><div class="popup-body"><fieldset class="srch-area"><legend>검색영역</legend><div class="flex"><span class="select-type"><select><option value="all" selected="">전체</option><option value="brandId">브랜드ID</option><option value="brandName">브랜드명</option></select></span><input type="text" placeholder="검색어를 입력해주세요." value="" readonly=""><button type="button" class="btn btn-sm4 btn-gray fx-init">검색</button></div></fieldset><div class="table-wrap scroll-y" style="min-height:140px;"><table class="table-data"><caption>브랜드 선택</caption><colgroup><col style="width: 42px;"><col style="width: auto;"><col style="width: auto;"></colgroup><thead><tr><th>번호</th><th>브랜드 명</th><th>브랜드 ID</th></tr></thead><tbody></tbody></table></div></div><div class="popup-footer"><div class="btn-area"><button type="button" class="btn btn-sm2">취소</button><button type="button" class="btn btn-sm2 btn-primary">확인</button></div></div></div>`;

  POPS.numberEmpty = `<div class="popup fild-list fild-number"><div class="popup-header"><h3>발신번호를 선택해주세요</h3></div><div class="popup-body"><fieldset class="srch-area"><legend>검색영역</legend><div class="flex"><input type="text" placeholder="검색어를 입력해주세요." value="" readonly=""><button type="button" class="btn btn-sm4 btn-gray fx-init">검색</button></div></fieldset><div class="table-wrap scroll-y" style="min-height:140px;"><table class="table-data"><caption>발신번호 선택</caption><colgroup><col style="width: 42px;"><col style="width: auto;"></colgroup><thead><tr><th>번호</th><th>대화방(발신번호) 명</th><th>발신번호</th></tr></thead><tbody></tbody></table></div></div><div class="popup-footer"><div class="btn-area"><button type="button" class="btn btn-sm2">취소</button><button type="button" class="btn btn-sm2 btn-primary">확인</button></div></div></div>`;

  window.HZ_UI = window.HZ_UI || {};
  window.HZ_UI.pops = POPS;
  window.HZ_UI.css = (window.HZ_UI.css || "") + "\n" + CSS;
})();

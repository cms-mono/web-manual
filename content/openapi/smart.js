/* ============================================================
   매뉴얼 셀 — 서비스 API(openAPI) × KT 스마트메시지 Biz
   ------------------------------------------------------------
   출처: 크로샷(Xroshot) BIZ API 명세서 (openapi.xroshot.com/biz, 제공: KT)
   archive/창용's/스마트메시지biz/openAPI/xroshot_biz_api_spec.md
   ------------------------------------------------------------
   HMAC-SHA256 인증 기반 REST API. SMS/LMS/MMS/VMS/FMS 발송 + 결과 조회 + 예약 취소/조회.
   ※ 인증 규격(TIMESTAMP=YYYYMMDDHHmmss, SALT=10자리 랜덤, SECRET-KEY 헤더, HASH 산출)은
     공식 SDK(Java/Node/PHP) 기준으로 확정. API 포털·IP 등록 절차 등 일부만 '확인 필요'.
   ============================================================ */
(function () {
  "use strict";
  var C = (window.HUB_CONTENT = window.HUB_CONTENT || {});
  var A = (C["openapi"] = C["openapi"] || {});

  /* ── 발송 테스트 코드 (SMS 동보 1건) — 언어별 탭 ───────────── */
  var SEND_PY =
    "import json, hmac, hashlib, random, requests\n" +
    "from datetime import datetime\n" +
    "\n" +
    "# ── 인증 정보 ─────────────────────────────\n" +
    "API_KEY    = \"발급받은_API-KEY\"\n" +
    "SECRET_KEY = \"발급받은_SECRET-KEY\"\n" +
    "SALT       = \"\".join(str(random.randint(0, 9)) for _ in range(10))  # 10자리 랜덤 숫자\n" +
    "\n" +
    "# 차세대 센터. 1센터: openapi1 / 2센터: openapi2\n" +
    "BASE = \"https://openapis.xroshot.com\"\n" +
    "\n" +
    "\n" +
    "def send_sms(callback, receivers, content):\n" +
    "    body = {\n" +
    "        \"MessageSubType\": 1,        # 1: 일반텍스트\n" +
    "        \"CallbackNumber\": callback, # 회신번호\n" +
    "        \"ReserveType\": 1,           # 1: 즉시 발송\n" +
    "        \"Message\": [{\n" +
    "            \"Content\": content,\n" +
    "            \"Receivers\": [\n" +
    "                {\"Seq\": i + 1, \"Number\": n}\n" +
    "                for i, n in enumerate(receivers)\n" +
    "            ],\n" +
    "        }],\n" +
    "    }\n" +
    "\n" +
    "    # ★ HASH 산출에 쓴 body 문자열과 '실제 전송 body'가 1바이트도 달라선 안 된다.\n" +
    "    body_str = json.dumps(body, ensure_ascii=False, separators=(\",\", \":\"))\n" +
    "    timestamp = datetime.now().strftime(\"%Y%m%d%H%M%S\")  # YYYYMMDDHHmmss\n" +
    "\n" +
    "    data = (body_str + SALT).encode(\"utf-8\")\n" +
    "    key  = (SECRET_KEY + \"_\" + timestamp).encode(\"utf-8\")\n" +
    "    hash_val = hmac.new(key, data, hashlib.sha256).hexdigest().upper()\n" +
    "\n" +
    "    headers = {\n" +
    "        \"Content-Type\": \"application/json; charset=utf-8\",\n" +
    "        \"API-KEY\":   API_KEY,\n" +
    "        \"SECRET-KEY\": SECRET_KEY,\n" +
    "        \"SALT\":      SALT,\n" +
    "        \"TIMESTAMP\": timestamp,\n" +
    "        \"HASH\":      hash_val,\n" +
    "    }\n" +
    "    # body는 해시한 문자열 그대로 전송 (requests의 json= 사용 금지)\n" +
    "    res = requests.post(BASE + \"/V1/send/sms\",\n" +
    "                        data=body_str.encode(\"utf-8\"), headers=headers)\n" +
    "    print(res.status_code, res.text)\n" +
    "    return res\n" +
    "\n" +
    "\n" +
    "if __name__ == \"__main__\":\n" +
    "    send_sms(\"0212345678\", [\"01012345678\"], \"테스트 메시지입니다.\")\n";

  var SEND_CURL =
    "#!/usr/bin/env bash\n" +
    "API_KEY=\"발급받은_API-KEY\"\n" +
    "SECRET_KEY=\"발급받은_SECRET-KEY\"\n" +
    "SALT=$(tr -dc '0-9' </dev/urandom | head -c 10)   # 10자리 랜덤 숫자\n" +
    "TIMESTAMP=$(date +%Y%m%d%H%M%S)                   # YYYYMMDDHHmmss\n" +
    "\n" +
    "# body 변수를 해시와 전송에 똑같이 써서 1바이트도 어긋나지 않게 한다\n" +
    "BODY='{\"MessageSubType\":1,\"CallbackNumber\":\"0212345678\",\"ReserveType\":1,\"Message\":[{\"Content\":\"테스트 메시지입니다.\",\"Receivers\":[{\"Seq\":1,\"Number\":\"01012345678\"}]}]}'\n" +
    "\n" +
    "HASH=$(printf '%s' \"${BODY}${SALT}\" \\\n" +
    "  | openssl dgst -sha256 -hmac \"${SECRET_KEY}_${TIMESTAMP}\" -binary \\\n" +
    "  | xxd -p -c 256 | tr 'a-z' 'A-Z')\n" +
    "\n" +
    "curl -X POST \"https://openapis.xroshot.com/V1/send/sms\" \\\n" +
    "  -H \"Content-Type: application/json; charset=utf-8\" \\\n" +
    "  -H \"API-KEY: ${API_KEY}\" \\\n" +
    "  -H \"SECRET-KEY: ${SECRET_KEY}\" \\\n" +
    "  -H \"SALT: ${SALT}\" \\\n" +
    "  -H \"TIMESTAMP: ${TIMESTAMP}\" \\\n" +
    "  -H \"HASH: ${HASH}\" \\\n" +
    "  -d \"${BODY}\"\n";

  var SEND_NODE =
    "const crypto = require(\"crypto\");\n" +
    "\n" +
    "const API_KEY    = \"발급받은_API-KEY\";\n" +
    "const SECRET_KEY = \"발급받은_SECRET-KEY\";\n" +
    "const SALT       = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join(\"\"); // 10자리 랜덤\n" +
    "const BASE       = \"https://openapis.xroshot.com\";\n" +
    "\n" +
    "async function sendSms(callback, receivers, content) {\n" +
    "  const body = {\n" +
    "    MessageSubType: 1,          // 1: 일반텍스트\n" +
    "    CallbackNumber: callback,   // 회신번호\n" +
    "    ReserveType: 1,             // 1: 즉시 발송\n" +
    "    Message: [{\n" +
    "      Content: content,\n" +
    "      Receivers: receivers.map((n, i) => ({ Seq: i + 1, Number: n })),\n" +
    "    }],\n" +
    "  };\n" +
    "\n" +
    "  // 해시한 문자열과 전송 본문이 동일해야 한다\n" +
    "  const bodyStr   = JSON.stringify(body);\n" +
    "  const _d = new Date(), _p = (n) => String(n).padStart(2, \"0\");\n" +
    "  const timestamp = \"\" + _d.getFullYear() + _p(_d.getMonth() + 1) + _p(_d.getDate())\n" +
    "                    + _p(_d.getHours()) + _p(_d.getMinutes()) + _p(_d.getSeconds()); // YYYYMMDDHHmmss\n" +
    "  const hash = crypto\n" +
    "    .createHmac(\"sha256\", SECRET_KEY + \"_\" + timestamp)\n" +
    "    .update(bodyStr + SALT, \"utf8\")\n" +
    "    .digest(\"hex\")\n" +
    "    .toUpperCase();\n" +
    "\n" +
    "  const res = await fetch(BASE + \"/V1/send/sms\", {\n" +
    "    method: \"POST\",\n" +
    "    headers: {\n" +
    "      \"Content-Type\": \"application/json; charset=utf-8\",\n" +
    "      \"API-KEY\": API_KEY,\n" +
    "      \"SECRET-KEY\": SECRET_KEY,\n" +
    "      \"SALT\": SALT,\n" +
    "      \"TIMESTAMP\": timestamp,\n" +
    "      \"HASH\": hash,\n" +
    "    },\n" +
    "    body: bodyStr,\n" +
    "  });\n" +
    "  console.log(res.status, await res.text());\n" +
    "}\n" +
    "\n" +
    "sendSms(\"0212345678\", [\"01012345678\"], \"테스트 메시지입니다.\");\n";

  var SEND_JAVA = `import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

public class SendSms {
    static final String API_KEY    = "발급받은_API-KEY";
    static final String SECRET_KEY = "발급받은_SECRET-KEY";
    static final String SALT       = newSalt();
    static final String BASE       = "https://openapis.xroshot.com";

    public static void main(String[] args) throws Exception {
        // 해시한 문자열과 전송 본문이 1바이트도 달라선 안 된다 (Java 15+ 텍스트 블록)
        String body = """
                {"MessageSubType":1,"CallbackNumber":"0212345678","ReserveType":1,"Message":[{"Content":"테스트 메시지입니다.","Receivers":[{"Seq":1,"Number":"01012345678"}]}]}""";

        String timestamp = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")); // YYYYMMDDHHmmss
        String hash = hmacSha256(body + SALT, SECRET_KEY + "_" + timestamp).toUpperCase();

        HttpRequest req = HttpRequest.newBuilder(URI.create(BASE + "/V1/send/sms"))
                .header("Content-Type", "application/json; charset=utf-8")
                .header("API-KEY", API_KEY)
                .header("SECRET-KEY", SECRET_KEY)
                .header("SALT", SALT)
                .header("TIMESTAMP", timestamp)
                .header("HASH", hash)
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> res = HttpClient.newHttpClient()
                .send(req, HttpResponse.BodyHandlers.ofString());
        System.out.println(res.statusCode() + " " + res.body());
    }

    static String hmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : raw) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    static String newSalt() {
        StringBuilder s = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < 10; i++) s.append(rnd.nextInt(10));
        return s.toString();
    }
}
`;

  /* 결과 조회 테스트 코드 (Python · cURL · Node.js · Java) */
  var INQ_PY =
    "import json, hmac, hashlib, random, requests\n" +
    "from datetime import datetime\n" +
    "\n" +
    "API_KEY    = \"발급받은_API-KEY\"\n" +
    "SECRET_KEY = \"발급받은_SECRET-KEY\"\n" +
    "SALT       = \"\".join(str(random.randint(0, 9)) for _ in range(10))\n" +
    "BASE       = \"https://openapis.xroshot.com\"\n" +
    "\n" +
    "\n" +
    "def _headers(body_str):\n" +
    "    \"\"\"공통 인증 헤더 생성 (발송 코드와 동일한 HMAC 방식)\"\"\"\n" +
    "    timestamp = datetime.now().strftime(\"%Y%m%d%H%M%S\")\n" +
    "    data = (body_str + SALT).encode(\"utf-8\")\n" +
    "    key  = (SECRET_KEY + \"_\" + timestamp).encode(\"utf-8\")\n" +
    "    h = hmac.new(key, data, hashlib.sha256).hexdigest().upper()\n" +
    "    return {\n" +
    "        \"Content-Type\": \"application/json; charset=utf-8\",\n" +
    "        \"API-KEY\": API_KEY, \"SECRET-KEY\": SECRET_KEY,\n" +
    "        \"SALT\": SALT, \"TIMESTAMP\": timestamp, \"HASH\": h,\n" +
    "    }\n" +
    "\n" +
    "\n" +
    "def inquiry_report(job_ids, send_day):\n" +
    "    # job_ids : 발송 응답에서 받은 JobID 리스트 (시간 아님 · 최대 10건)\n" +
    "    # send_day: 그 메시지를 발송한 날짜 YYYYMMDD (시간 아님 · 차세대 필수)\n" +
    "    body = {\"JobIDs\": job_ids, \"SendDay\": send_day}\n" +
    "    body_str = json.dumps(body, ensure_ascii=False, separators=(\",\", \":\"))\n" +
    "    res = requests.post(BASE + \"/V1/inquiry/report\",\n" +
    "                        data=body_str.encode(\"utf-8\"), headers=_headers(body_str))\n" +
    "    print(res.status_code, res.text)\n" +
    "    return res\n" +
    "\n" +
    "\n" +
    "if __name__ == \"__main__\":\n" +
    "    # 예) 2026-06-23 에 발송하고 받은 JobID가 1234567890 인 경우\n" +
    "    # ※ 동일 JobID 재조회 주기: 권장 10분(최소 5분)\n" +
    "    inquiry_report([1234567890], \"20260623\")\n";

  var INQ_CURL =
    "#!/usr/bin/env bash\n" +
    "API_KEY=\"발급받은_API-KEY\"\n" +
    "SECRET_KEY=\"발급받은_SECRET-KEY\"\n" +
    "SALT=$(tr -dc '0-9' </dev/urandom | head -c 10)\n" +
    "TIMESTAMP=$(date +%Y%m%d%H%M%S)\n" +
    "\n" +
    "# JobIDs: 발송 응답에서 받은 JobID(최대 10건) / SendDay: 발송 날짜 YYYYMMDD(차세대 필수)\n" +
    "BODY='{\"JobIDs\":[1234567890],\"SendDay\":\"20260623\"}'\n" +
    "\n" +
    "HASH=$(printf '%s' \"${BODY}${SALT}\" \\\n" +
    "  | openssl dgst -sha256 -hmac \"${SECRET_KEY}_${TIMESTAMP}\" -binary \\\n" +
    "  | xxd -p -c 256 | tr 'a-z' 'A-Z')\n" +
    "\n" +
    "curl -X POST \"https://openapis.xroshot.com/V1/inquiry/report\" \\\n" +
    "  -H \"Content-Type: application/json; charset=utf-8\" \\\n" +
    "  -H \"API-KEY: ${API_KEY}\" \\\n" +
    "  -H \"SECRET-KEY: ${SECRET_KEY}\" \\\n" +
    "  -H \"SALT: ${SALT}\" \\\n" +
    "  -H \"TIMESTAMP: ${TIMESTAMP}\" \\\n" +
    "  -H \"HASH: ${HASH}\" \\\n" +
    "  -d \"${BODY}\"\n";

  var INQ_NODE = `const crypto = require("crypto");

const API_KEY    = "발급받은_API-KEY";
const SECRET_KEY = "발급받은_SECRET-KEY";
const SALT       = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join(""); // 10자리 랜덤
const BASE       = "https://openapis.xroshot.com";

async function inquiryReport(jobIds, sendDay) {
  // jobIds : 발송 응답에서 받은 JobID 배열 (최대 10건)
  // sendDay: 발송한 날짜 YYYYMMDD (차세대 필수)
  const bodyStr   = JSON.stringify({ JobIDs: jobIds, SendDay: sendDay });
  const _d = new Date(), _p = (n) => String(n).padStart(2, "0");
  const timestamp = "" + _d.getFullYear() + _p(_d.getMonth() + 1) + _p(_d.getDate())
                    + _p(_d.getHours()) + _p(_d.getMinutes()) + _p(_d.getSeconds()); // YYYYMMDDHHmmss
  const hash = crypto.createHmac("sha256", SECRET_KEY + "_" + timestamp)
    .update(bodyStr + SALT, "utf8").digest("hex").toUpperCase();

  const res = await fetch(BASE + "/V1/inquiry/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "API-KEY": API_KEY, "SECRET-KEY": SECRET_KEY,
      "SALT": SALT, "TIMESTAMP": timestamp, "HASH": hash,
    },
    body: bodyStr,
  });
  console.log(res.status, await res.text());
}

inquiryReport([1234567890], "20260623");
`;

  var INQ_JAVA = `import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

public class InquiryReport {
    static final String API_KEY    = "발급받은_API-KEY";
    static final String SECRET_KEY = "발급받은_SECRET-KEY";
    static final String SALT       = newSalt();
    static final String BASE       = "https://openapis.xroshot.com";

    public static void main(String[] args) throws Exception {
        // JobIDs: 발송 응답에서 받은 JobID(최대 10건) / SendDay: 발송 날짜 YYYYMMDD(차세대 필수)
        String body = """
                {"JobIDs":[1234567890],"SendDay":"20260623"}""";
        post(BASE + "/V1/inquiry/report", body);
    }

    static void post(String url, String body) throws Exception {
        String timestamp = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String hash = hmacSha256(body + SALT, SECRET_KEY + "_" + timestamp).toUpperCase();
        HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                .header("Content-Type", "application/json; charset=utf-8")
                .header("API-KEY", API_KEY).header("SECRET-KEY", SECRET_KEY)
                .header("SALT", SALT).header("TIMESTAMP", timestamp).header("HASH", hash)
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
        HttpResponse<String> res = HttpClient.newHttpClient()
                .send(req, HttpResponse.BodyHandlers.ofString());
        System.out.println(res.statusCode() + " " + res.body());
    }

    static String hmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : raw) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    static String newSalt() {
        StringBuilder s = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < 10; i++) s.append(rnd.nextInt(10));
        return s.toString();
    }
}
`;

  /* 예약 취소·조회 테스트 코드 (Python · cURL · Node.js · Java) */
  var RSV_PY = `import json, hmac, hashlib, random, requests
from datetime import datetime

API_KEY    = "발급받은_API-KEY"
SECRET_KEY = "발급받은_SECRET-KEY"
SALT       = "".join(str(random.randint(0, 9)) for _ in range(10))
BASE       = "https://openapis.xroshot.com"


def _headers(body_str):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    data = (body_str + SALT).encode("utf-8")
    key  = (SECRET_KEY + "_" + timestamp).encode("utf-8")
    h = hmac.new(key, data, hashlib.sha256).hexdigest().upper()
    return {
        "Content-Type": "application/json; charset=utf-8",
        "API-KEY": API_KEY, "SECRET-KEY": SECRET_KEY,
        "SALT": SALT, "TIMESTAMP": timestamp, "HASH": h,
    }


def reserve(type_, job_ids, send_day):
    # type_   : 0=예약 취소, 1=예약 조회
    # job_ids : 예약 발송 시 받은 JobID 리스트 (최대 10건)
    # send_day: 예약 발송 날짜 YYYYMMDD (차세대 필수)
    body = {"Type": type_, "JobIDs": job_ids, "SendDay": send_day}
    body_str = json.dumps(body, ensure_ascii=False, separators=(",", ":"))
    res = requests.post(BASE + "/V1/inquiry/reserve",
                        data=body_str.encode("utf-8"), headers=_headers(body_str))
    print(res.status_code, res.text)
    return res


if __name__ == "__main__":
    reserve(1, [1234567890], "20260623")  # Type 1=조회 (취소하려면 0)
`;

  var RSV_CURL =
    "#!/usr/bin/env bash\n" +
    "API_KEY=\"발급받은_API-KEY\"\n" +
    "SECRET_KEY=\"발급받은_SECRET-KEY\"\n" +
    "SALT=$(tr -dc '0-9' </dev/urandom | head -c 10)\n" +
    "TIMESTAMP=$(date +%Y%m%d%H%M%S)\n" +
    "\n" +
    "# Type 0:취소 / 1:조회 · JobIDs 최대 10건 · SendDay 발송 날짜 YYYYMMDD(차세대 필수)\n" +
    "BODY='{\"Type\":1,\"JobIDs\":[1234567890],\"SendDay\":\"20260623\"}'\n" +
    "\n" +
    "HASH=$(printf '%s' \"${BODY}${SALT}\" \\\n" +
    "  | openssl dgst -sha256 -hmac \"${SECRET_KEY}_${TIMESTAMP}\" -binary \\\n" +
    "  | xxd -p -c 256 | tr 'a-z' 'A-Z')\n" +
    "\n" +
    "curl -X POST \"https://openapis.xroshot.com/V1/inquiry/reserve\" \\\n" +
    "  -H \"Content-Type: application/json; charset=utf-8\" \\\n" +
    "  -H \"API-KEY: ${API_KEY}\" \\\n" +
    "  -H \"SECRET-KEY: ${SECRET_KEY}\" \\\n" +
    "  -H \"SALT: ${SALT}\" \\\n" +
    "  -H \"TIMESTAMP: ${TIMESTAMP}\" \\\n" +
    "  -H \"HASH: ${HASH}\" \\\n" +
    "  -d \"${BODY}\"\n";

  var RSV_NODE = `const crypto = require("crypto");

const API_KEY    = "발급받은_API-KEY";
const SECRET_KEY = "발급받은_SECRET-KEY";
const SALT       = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join(""); // 10자리 랜덤
const BASE       = "https://openapis.xroshot.com";

async function reserve(type, jobIds, sendDay) {
  // type   : 0=예약 취소, 1=예약 조회
  // jobIds : 예약 발송 시 받은 JobID 배열 (최대 10건)
  // sendDay: 예약 발송 날짜 YYYYMMDD (차세대 필수)
  const bodyStr   = JSON.stringify({ Type: type, JobIDs: jobIds, SendDay: sendDay });
  const _d = new Date(), _p = (n) => String(n).padStart(2, "0");
  const timestamp = "" + _d.getFullYear() + _p(_d.getMonth() + 1) + _p(_d.getDate())
                    + _p(_d.getHours()) + _p(_d.getMinutes()) + _p(_d.getSeconds()); // YYYYMMDDHHmmss
  const hash = crypto.createHmac("sha256", SECRET_KEY + "_" + timestamp)
    .update(bodyStr + SALT, "utf8").digest("hex").toUpperCase();

  const res = await fetch(BASE + "/V1/inquiry/reserve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "API-KEY": API_KEY, "SECRET-KEY": SECRET_KEY,
      "SALT": SALT, "TIMESTAMP": timestamp, "HASH": hash,
    },
    body: bodyStr,
  });
  console.log(res.status, await res.text());
}

reserve(1, [1234567890], "20260623");  // Type 1=조회 (취소하려면 0)
`;

  var RSV_JAVA = `import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

public class ReserveInquiry {
    static final String API_KEY    = "발급받은_API-KEY";
    static final String SECRET_KEY = "발급받은_SECRET-KEY";
    static final String SALT       = newSalt();
    static final String BASE       = "https://openapis.xroshot.com";

    public static void main(String[] args) throws Exception {
        // Type 0:취소, 1:조회 / JobIDs 최대 10건 / SendDay 발송 날짜 YYYYMMDD(차세대 필수)
        String body = """
                {"Type":1,"JobIDs":[1234567890],"SendDay":"20260623"}""";
        post(BASE + "/V1/inquiry/reserve", body);
    }

    static void post(String url, String body) throws Exception {
        String timestamp = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String hash = hmacSha256(body + SALT, SECRET_KEY + "_" + timestamp).toUpperCase();
        HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                .header("Content-Type", "application/json; charset=utf-8")
                .header("API-KEY", API_KEY).header("SECRET-KEY", SECRET_KEY)
                .header("SALT", SALT).header("TIMESTAMP", timestamp).header("HASH", hash)
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
        HttpResponse<String> res = HttpClient.newHttpClient()
                .send(req, HttpResponse.BodyHandlers.ofString());
        System.out.println(res.statusCode() + " " + res.body());
    }

    static String hmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : raw) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    static String newSalt() {
        StringBuilder s = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < 10; i++) s.append(rnd.nextInt(10));
        return s.toString();
    }
}
`;

  A["smart"] = {
    navName: "openAPI · 스마트메시지 Biz",
    intro:
      "크로샷(Xroshot) BIZ API로 SMS/LMS/MMS/VMS/FMS를 발송하는 방법입니다. " +
      "HMAC-SHA256 인증 후 REST API로 발송·결과 조회·예약 취소를 처리합니다. " +
      "출처: 크로샷 BIZ API 명세서(openapi.xroshot.com/biz, KT). 일부 항목은 ‘확인 필요’로 표기했습니다.",
    download: { title: "크로샷 BIZ API 가이드", meta: "openapi.xroshot.com · 제공 KT" },
    features: [
      /* ───────────────────── 1. SDK 다운로드 · 적용 ───────────────────── */
      {
        id: "sdk",
        name: "1. SDK 다운로드 · 적용",
        intro: "언어별 SDK를 내려받아 빠르게 연동할 수 있습니다. SDK에는 인증(HMAC)·발송·조회 로직이 들어 있어 규격을 직접 구현하지 않아도 됩니다.",
        steps: [
          {
            title: "SDK 다운로드",
            body: "사용 언어에 맞는 SDK를 내려받으세요. <b>Java·Node.js·PHP</b>는 공식 포털에서 함께 제공되고, <b>Python</b> SDK는 별도 링크로 제공됩니다.",
            downloads: [
              {
                label: "Java · Node.js · PHP SDK",
                sub: "공식 포털 (openapi.xroshot.com) · Java 1.8+ / Node 6+(request 2.34+) / PHP 7+",
                href: "https://openapi.xroshot.com/download",
              },
              {
                label: "Python SDK",
                sub: "Python 3.7+ · requests",
                href: "https://cms.mono.co.kr/messaging-api/v1/bd/system/file/link/download?link=MTAyMF4xNzQ1",
              },
            ],
            note: "API-KEY·SECRET-KEY 발급과 접속 IP 등록은 KT를 통해 사전에 완료해야 합니다.",
          },
          {
            title: "적용 흐름 (공통)",
            body: "어느 언어로 연동하든 적용 순서는 동일합니다.",
            list: [
              "<b>① 인증 정보 준비</b> — KT가 발급한 <code>API-KEY</code>·<code>SECRET-KEY</code> 확인, 접속 IP 등록",
              "<b>② SDK 추가</b> — 압축 해제 후 프로젝트에 포함 (아래 언어별 방법)",
              "<b>③ 인증 정보·번호 입력</b> — 샘플의 API-KEY/SECRET-KEY·회신번호·수신번호를 실제 값으로 수정",
              "<b>④ 발송 테스트</b> — 샘플 실행 후, 응답으로 받은 <code>JobID</code>로 결과를 조회",
            ],
          },
          {
            title: "언어별 적용 방법",
            body: "사용 언어를 골라 <b>위에서 아래로 순서대로</b> 적용하세요.",
            tables: [
              {
                label: "Java",
                cols: ["단계", "내용"],
                colWidths: ["10%", "90%"],
                rows: [
                  ["1", "압축 해제 후 <code>xroshot_openapi_sdk-1.11.jar</code> 를 프로젝트 classpath(라이브러리)에 추가"],
                  ["2", "샘플 <code>OpenApiJavaSdkSample.java</code> 참고"],
                  ["3", "<code>ApiClient client = new ApiClient(apiKey, passwd, apiServer);</code> 로 클라이언트 생성"],
                  ["4", "요청 객체 구성 후 <code>client.sendMessage(req);</code> 호출"],
                ],
              },
              {
                label: "Node.js",
                cols: ["단계", "내용"],
                colWidths: ["10%", "90%"],
                rows: [
                  ["1", "SDK 파일을 프로젝트 폴더에 복사"],
                  ["2", "<code>npm install request</code> 로 의존성 설치"],
                  ["3", "<code>var openapi = require('./openapi');</code>"],
                  ["4", "샘플(<code>sendSmsBroadcast.js</code> 등)의 apiKey·hashKey·번호 수정 후 실행"],
                ],
              },
              {
                label: "PHP",
                cols: ["단계", "내용"],
                colWidths: ["10%", "90%"],
                rows: [
                  ["1", "<code>OpenApi/</code> 폴더를 프로젝트에 포함"],
                  ["2", "<code>require_once 'class/Message.php';</code>"],
                  ["3", "<code>Common.php</code> 에서 apiKey·apiPW·apiCenter 설정 → <code>new Message(...)</code>"],
                  ["4", "<code>$Message-&gt;executeMessage(\"/send/sms\", $param);</code> 호출"],
                ],
              },
              {
                label: "Python",
                cols: ["단계", "내용"],
                colWidths: ["10%", "90%"],
                rows: [
                  ["1", "<code>openapi.py</code> 를 프로젝트 폴더에 두기"],
                  ["2", "<code>pip install requests</code>"],
                  ["3", "<code>from openapi import OpenApiClient</code>"],
                  ["4", "<code>client = OpenApiClient(api_key, secret_key, ENDPOINT_1)</code> → <code>client.send_sms(body)</code> (또는 샘플 <code>send_sms_broadcast.py</code> 실행)"],
                ],
              },
            ],
            note: "엔드포인트(센터)는 1센터·2센터·차세대 중 발급받은 센터를 사용합니다. 인증·발송 상세 규격은 다음 탭(<b>2. 인증</b> · <b>3. 메시지 발송</b>)을 참고하세요.",
          },
        ],
      },

      /* ───────────────────── 2. 인증 ───────────────────── */
      {
        id: "auth",
        name: "2. 인증 · 공통 헤더",
        intro: "모든 요청은 HMAC-SHA256 인증을 거칩니다. 공통 헤더 5종과 HASH 산출 규칙을 먼저 확인하세요.",
        steps: [
          {
            title: "개요",
            body:
              "크로샷 Open API는 <b>HMAC-SHA256 기반 인증</b> 후 사용하는 메시지 발송용 REST API입니다. " +
              "<b>SMS · LMS · MMS · VMS · FMS</b> 등 다양한 타입을 발송할 수 있습니다.",
            list: [
              "<b>메시지 발송</b> — 동보 / 대량 / 파일첨부",
              "<b>발송 건별 결과 조회</b>",
              "<b>예약 취소 / 조회</b>",
            ],
            note: "보안 강화를 위해 인증을 거쳐야 하며, 접속 IP 등록(미등록 IP 차단)도 적용됩니다. <i>(IP 등록 절차는 확인 필요)</i>",
          },
          {
            title: "공통 헤더",
            body: "모든 API 요청에 공통으로 들어가는 헤더입니다.",
            table: {
              schema: true,
              cols: ["헤더", "필수", "설명"],
              colWidths: ["22%", "10%", "68%"],
              rows: [
                ["API-KEY", "O", "고객 식별 key값"],
                ["HASH", "O", "<code>body + SALT</code> 를 <code>SECRET-KEY + \"_\" + TIMESTAMP</code> 키로 SHA256 HMAC 한 결과값(대문자)"],
                ["SALT", "O", "body 뒤에 추가할 데이터 (SDK 기준 <b>10자리 랜덤 숫자</b>)"],
                ["TIMESTAMP", "O", "현재 시각 <code>YYYYMMDDHHmmss</code> (14자리). HASH 산출에 사용"],
                ["SECRET-KEY", "O", "고객 비밀번호 (헤더로 함께 전송)"],
                ["Content-Type", "O", "<code>application/json; charset=utf-8</code> (파일첨부 시 <code>multipart/form-data</code>)"],
              ],
            },
            note: "TIMESTAMP 형식(<code>YYYYMMDDHHmmss</code>)·SALT(10자리 랜덤 숫자)·SECRET-KEY 헤더 전송은 공식 SDK(Java·Node·PHP) 기준입니다.",
          },
          {
            title: "HASH 생성 규칙 (HMAC-SHA256)",
            body: "HASH 는 아래 공식으로 만들며, 결과 문자열은 <b>대문자(UpperCase)</b>로 변환합니다.",
            codePlain:
              "data = <전송할 Body(JSON 문자열)> + SALT\n" +
              "key  = <SECRET-KEY> + \"_\" + TIMESTAMP\n" +
              "\n" +
              "HASH = HMAC_SHA256(data, key).toUpperCase()",
            note:
              "<b>★ 핵심:</b> HASH 산출에 쓴 <code>body</code> 문자열은 실제 전송하는 Body(JSON)와 <b>1바이트도 달라선 안 됩니다.</b> " +
              "직렬화한 문자열을 그대로 해싱한 뒤 그 문자열을 그대로 전송해야 인증이 일치합니다. " +
              "(라이브러리의 자동 직렬화/재직렬화로 공백·키 순서가 바뀌면 인증 실패)",
          },
        ],
      },

      /* ───────────────────── 3. 메시지 발송 ───────────────────── */
      {
        id: "send",
        name: "3. 메시지 발송",
        intro: "엔드포인트 · 요청 Body · 발송 테스트 코드 · 파일첨부 · 응답 순서입니다.",
        steps: [
          {
            title: "엔드포인트 (Request URL)",
            body: "메시지 타입은 URL path로 지정합니다: <code>sms | vms | fms | mms</code>",
            table: {
              cols: ["센터", "URL"],
              colWidths: ["18%", "82%"],
              rows: [
                ["1센터", "<code>https://openapi1.xroshot.com/V1/send/{sms|vms|fms|mms}</code>"],
                ["2센터", "<code>https://openapi2.xroshot.com/V1/send/{sms|vms|fms|mms}</code>"],
                ["차세대", "<code>https://openapis.xroshot.com/V1/send/{sms|vms|fms|mms}</code>"],
              ],
            },
            note: "센터(1센터/2센터/차세대)는 고객 계정이 속한 센터를 사용합니다. <i>(소속 센터는 발급 정보 확인)</i>",
          },
          {
            title: "요청 Body — 최상위 필드 (동보/대량)",
            body: "Content-Type: <code>application/json; charset=utf-8</code>. <b>Message</b>(동보)와 <b>Bundle</b>(대량)은 발송 방식에 따라 택일합니다.",
            table: {
              schema: true,
              cols: ["필드", "타입", "필수", "설명"],
              colWidths: ["20%", "11%", "9%", "60%"],
              rows: [
                ["MessageSubType", "Int", "O", "세부 유형 (아래 표 참고)"],
                ["CallbackNumber", "String", "O", "회신번호"],
                ["SendNumber", "String", "", "발신 과금번호"],
                ["ReserveType", "Int", "", "1: 즉시, 2: 예약"],
                ["ReserveTime", "String", "", "예약 시간 (즉시 발송 시 미사용)"],
                ["ReserveDTime", "String", "", "예약 만료시간"],
                ["CustomMessageID", "String", "", "SP Client가 지정한 메시지 ID"],
                ["CDRID", "String", "", "과금 지정 ID (발송 ID 다수일 때 특정 ID로 과금)"],
                ["CDRTime", "String", "", "과금 정산시간"],
                ["CallbackURL", "String", "", "회신 URL (콜백 URL SMS 전송에만 사용)"],
                ["ConvertType", "String", "", "변환 타입 (아래 표 참고)"],
                ["KisaOrigCode", "Int64", "△", "최초 발신 사업자코드(9자리). <b>중계사업자는 필수</b> (SMS·MMS)"],
                ["Message", "Array", "O", "동보 메시지 리스트 (최대 100건)"],
                ["Bundle", "Array", "O", "대량 메시지 리스트 (최대 100건)"],
              ],
            },
          },
          {
            title: "MessageSubType · ConvertType 값",
            tables: [
              {
                label: "MessageSubType (세부 유형)",
                cols: ["값", "의미", "적용 타입"],
                colWidths: ["12%", "30%", "58%"],
                rows: [
                  ["1", "일반텍스트", "SMS, VMS, FMS, MMS"],
                  ["2", "url", "SMS, VMS, FMS"],
                  ["3", "이미지", "FMS, MMS"],
                  ["4", "오디오", "MMS"],
                  ["5", "비디오", "MMS"],
                  ["6", "시나리오", "VMS"],
                ],
              },
              {
                label: "ConvertType (변환 타입)",
                cols: ["값", "의미"],
                colWidths: ["40%", "60%"],
                rows: [
                  ["TTF_CONV", "팩스 (FMS)"],
                  ["TTS_CONV_F", "여성 음성 (VMS)"],
                  ["TTS_CONV_M", "남성 음성 (VMS)"],
                ],
              },
            ],
          },
          {
            title: "Message(동보) · Bundle(대량) 구조",
            tables: [
              {
                label: "Message 배열 — 동보 (같은 내용 → 여러 수신자)",
                schema: true,
                cols: ["필드", "하위", "타입", "필수", "설명"],
                colWidths: ["16%", "16%", "11%", "9%", "48%"],
                rows: [
                  ["Content", "—", "String", "O", "메시지 내용"],
                  ["Attachment", "—", "Array", "", "url 타입일 때 사용(서버 등록 파일 경로 전송)"],
                  ["", "attachID", "Int", "O", "Index (1부터)"],
                  ["", "Path", "String", "O", "서버에 등록된 경로"],
                  ["Subject", "—", "String", "", "제목"],
                  ["Receivers", "—", "Array", "O", "수신번호 리스트"],
                  ["", "Seq", "Int", "O", "Index (1부터)"],
                  ["", "Number", "String", "O", "수신번호"],
                ],
              },
              {
                label: "Bundle 배열 — 대량 (수신자마다 다른 내용)",
                schema: true,
                cols: ["필드", "하위", "타입", "필수", "설명"],
                colWidths: ["16%", "16%", "11%", "9%", "48%"],
                rows: [
                  ["Seq", "—", "Int", "O", "Index (1부터)"],
                  ["Number", "—", "String", "O", "수신번호"],
                  ["Content", "—", "String", "O", "메시지 내용"],
                  ["Attachment", "—", "Array", "", "url 타입일 때 사용(서버 등록 파일 경로)"],
                  ["", "attachID", "Int", "O", "Index (1부터)"],
                  ["", "Path", "String", "O", "서버에 등록된 경로"],
                  ["Subject", "—", "String", "", "제목"],
                  ["CallbackURL", "—", "String", "", "회신 URL"],
                ],
              },
            ],
            note: "<b>동보</b>는 동일 내용을 여러 명에게, <b>대량</b>은 수신자별로 다른 내용을 보낼 때 사용합니다. 각각 최대 100건.",
          },
          {
            title: "발송 테스트 코드 (SMS 동보 1건)",
            body:
              "아래는 <b>SMS 동보 발송</b> 최소 예제입니다. 인증 정보(API-KEY/SECRET-KEY)는 발급받은 값으로 바꿔 사용하세요. " +
              "HASH 계산에 쓴 <b>body 문자열을 그대로 전송</b>하는 점에 유의하세요.",
            codeTabs: [
              { name: "Python", code: SEND_PY },
              { name: "cURL (bash)", code: SEND_CURL },
              { name: "Node.js", code: SEND_NODE },
              { name: "Java", code: SEND_JAVA },
            ],
            note:
              "테스트 전 <b>발신(회신)번호 사전등록</b>과 <b>접속 IP 등록</b>이 되어 있어야 합니다. " +
              "TIMESTAMP는 <code>YYYYMMDDHHmmss</code>(14자리), SALT는 10자리 랜덤 숫자입니다(공식 SDK 기준). 인증 실패(10002/41003) 시 우선 점검하세요.",
          },
          {
            title: "파일 첨부 발송 (multipart/form-data)",
            body: "이미지·오디오·비디오·팩스 등 파일을 직접 올려 보낼 때는 <code>multipart/form-data</code>로 전송합니다.",
            table: {
              schema: true,
              cols: ["구분", "필드", "타입", "필수", "설명"],
              colWidths: ["14%", "16%", "10%", "9%", "51%"],
              rows: [
                ["Headers", "(공통 헤더)", "—", "O", "API-KEY, HASH, SALT, TIMESTAMP, SECRET-KEY"],
                ["Headers", "Content-Type", "—", "O", "<code>multipart/form-data</code>"],
                ["Body", "file", "—", "O", "전송할 파일 (VMS/FMS는 MessageSubType에 따라 선택)"],
                ["Body", "message", "String", "O", "동보/대량 메시지 body 내용"],
              ],
            },
          },
          {
            title: "응답 (Response)",
            table: {
              schema: true,
              cols: ["필드", "하위", "타입", "설명"],
              colWidths: ["20%", "14%", "11%", "55%"],
              rows: [
                ["CustomMessageID", "—", "String", "요청 시 설정한 메시지 ID"],
                ["Time", "—", "String", "서버 전송 처리 시간"],
                ["GrpID", "—", "Int64", "전송요청 대표 ID"],
                ["SubmitTime", "—", "String", "전송 요청 받은 시간"],
                ["Result", "—", "Int", "수신 결과 (결과코드 참고)"],
                ["Count", "—", "Int", "요청받은 메시지 수"],
                ["JobIDs", "—", "Array", "요청받은 메시지 리스트"],
                ["", "Index", "Int", "할당 순서"],
                ["", "JobID", "Int64", "할당된 메시지 JobID (결과 조회 키)"],
              ],
            },
            note: "응답의 <b>JobID</b>로 이후 ‘발송 결과 조회’를 합니다. <b>Result</b> 코드는 ‘6. 결과 코드’를 참고하세요.",
          },
        ],
      },

      /* ───────────────────── 4. 발송 결과 조회 ───────────────────── */
      {
        id: "inquiry",
        name: "4. 발송 결과 조회",
        intro: "발송 시 받은 JobID로 건별 결과를 조회합니다. (동일 건 재조회 권장 10분, 최소 5분)",
        steps: [
          {
            title: "엔드포인트 · 재요청 주기",
            table: {
              cols: ["센터", "URL"],
              colWidths: ["18%", "82%"],
              rows: [
                ["1센터", "<code>https://openapi1.xroshot.com/V1/inquiry/report</code>"],
                ["2센터", "<code>https://openapi2.xroshot.com/V1/inquiry/report</code>"],
                ["차세대", "<code>https://openapis.xroshot.com/V1/inquiry/report</code>"],
              ],
            },
            note: "동일 전송 건(JobID) 결과 재조회 주기는 <b>권장 10분(최소 5분)</b>. 최소 주기 이내 재요청 시 실패될 수 있습니다.",
          },
          {
            title: "요청 파라미터",
            body: "Content-Type: <code>application/json; charset=utf-8</code> · Headers: 공통 헤더 동일",
            table: {
              schema: true,
              cols: ["필드", "타입", "필수", "설명"],
              colWidths: ["18%", "16%", "10%", "56%"],
              rows: [
                ["JobIDs", "Int64[]", "O", "조회할 JobID 리스트 (최대 10건)"],
                ["SendDay", "String", "O", "발송 날짜 (예: 20201002) <b>※ 차세대에서만 사용</b>"],
              ],
            },
          },
          {
            title: "응답 (주요 필드)",
            table: {
              schema: true,
              cols: ["필드", "타입", "설명"],
              colWidths: ["22%", "12%", "66%"],
              rows: [
                ["JobID", "Int64", "서버가 할당한 메시지 고유 key"],
                ["Result", "Int", "결과 및 에러코드 (‘6. 결과 코드’ 참고)"],
                ["Time", "String", "메시지가 전달된 시간"],
                ["MessageType", "Int", "메시지 유형 (SMS/VMS/FMS/MMS)"],
                ["SendNumber", "String", "전송 번호"],
                ["ReciveNumber", "String", "수신자 전화번호"],
                ["CallbackNumber", "String", "회신 번호"],
                ["TelconInfo", "Int", "이통사 (1:SKT 2:KT 3:LGT 4:AHNN 5:DACOM)"],
                ["Fee", "Int", "과금 기준 요금 (원)"],
                ["FinishPage", "Int", "FMS 전송 마지막 페이지 수 (FMS만)"],
                ["Duration", "Int", "VMS 총 통화시간(초) (VMS만)"],
                ["ReplyInfo", "String", "VMS 시나리오 전송 결과 (VMS만)"],
                ["Rtime", "String", "VMS 통화 시작시간 (VMS만)"],
                ["StatusText", "String", "이통사 제공 단말 전송 상태 부가정보"],
                ["CustomMessageID", "String", "SP 내부 관리 고유 메시지 ID"],
                ["SequenceNumber", "Int", "전송요청 내 순서 (동보/대량)"],
                ["GroupID", "Int64", "동보/대량 그룹 ID (단건은 미사용)"],
                ["SubmitTime", "String", "전송 요청 받은 시간"],
              ],
            },
          },
          {
            title: "결과 조회 테스트 코드",
            codeTabs: [
              { name: "Python", code: INQ_PY },
              { name: "cURL (bash)", code: INQ_CURL },
              { name: "Node.js", code: INQ_NODE },
              { name: "Java", code: INQ_JAVA },
            ],
            note: "<code>job_ids</code>는 발송 응답에서 받은 <b>JobID</b>, <code>send_day</code>는 <b>발송 날짜(YYYYMMDD)</b>입니다. 동일 JobID 재조회는 권장 10분(최소 5분).",
          },
        ],
      },

      /* ───────────────────── 5. 예약 취소 · 조회 ───────────────────── */
      {
        id: "reserve",
        name: "5. 예약 취소 · 조회",
        intro: "예약 발송 건을 취소하거나, 예약 시간을 조회합니다.",
        steps: [
          {
            title: "엔드포인트",
            table: {
              cols: ["센터", "URL"],
              colWidths: ["18%", "82%"],
              rows: [
                ["1센터", "<code>https://openapi1.xroshot.com/V1/inquiry/reserve</code>"],
                ["2센터", "<code>https://openapi2.xroshot.com/V1/inquiry/reserve</code>"],
                ["차세대", "<code>https://openapis.xroshot.com/V1/inquiry/reserve</code>"],
              ],
            },
          },
          {
            title: "요청 파라미터",
            body: "Content-Type: <code>application/json; charset=utf-8</code> · Headers: 공통 헤더 동일",
            table: {
              schema: true,
              cols: ["필드", "타입", "필수", "설명"],
              colWidths: ["16%", "16%", "10%", "58%"],
              rows: [
                ["Type", "Int", "O", "<b>0: 취소, 1: 조회</b>"],
                ["JobIDs", "Int64[]", "O", "요청할 JobID 리스트 (최대 10건)"],
                ["SendDay", "String", "O", "발송 날짜 (예: 20201002) ※ 차세대에서만 사용"],
              ],
            },
          },
          {
            title: "응답",
            body:
              "<b>예약취소(Type=0)</b> → <code>200 OK</code> (Body 없음)<br>" +
              "<b>예약조회(Type=1)</b> → 아래 리스트 반환",
            table: {
              schema: true,
              cols: ["필드", "하위", "타입", "설명"],
              colWidths: ["18%", "20%", "12%", "50%"],
              rows: [
                ["JobIDs", "—", "Array", "요청한 JobID 리스트"],
                ["", "JobID", "Int64", "요청한 JobID"],
                ["", "ReserveTime", "String", "해당 JobID의 예약 시간"],
              ],
            },
          },
          {
            title: "예약 취소·조회 테스트 코드",
            body: "<code>Type</code> 값으로 <b>취소(0)·조회(1)</b>를 구분합니다. 예약 발송 시 받은 JobID와 발송 날짜로 요청합니다.",
            codeTabs: [
              { name: "Python", code: RSV_PY },
              { name: "cURL (bash)", code: RSV_CURL },
              { name: "Node.js", code: RSV_NODE },
              { name: "Java", code: RSV_JAVA },
            ],
            note: "<b>Type 0</b>=예약 취소, <b>Type 1</b>=예약 조회. 차세대 센터는 <code>SendDay</code>(발송일)가 필수이며, JobID는 한 번에 최대 10건입니다.",
          },
        ],
      },

      /* ───────────────────── 6. 결과 코드 ───────────────────── */
      {
        id: "codes",
        name: "6. 결과 코드",
        intro: "발송·조회 응답의 Result 값 해석표입니다. 0=처리중, 10000=성공.",
        steps: [
          {
            title: "공통 · 메시지 발송 결과코드",
            tables: [
              {
                label: "공통",
                cols: ["코드", "내용"],
                colWidths: ["18%", "82%"],
                rows: [
                  ["<code>0</code>", "처리중"],
                  ["<code>10000</code>", "성공"],
                ],
              },
              {
                label: "메시지 발송 (100xx) · 스팸/제한 (101xx)",
                cols: ["코드", "내용"],
                colWidths: ["18%", "82%"],
                rows: [
                  ["<code>10001</code>", "시스템 장애"],
                  ["<code>10002</code>", "인증 실패"],
                  ["<code>10003</code>", "메시지 형식 오류"],
                  ["<code>10004</code>", "BIND 안됨"],
                  ["<code>10005</code>", "인증티켓 유효성 오류"],
                  ["<code>10006~10009</code>", "SP(가입자) 없음 / 패스워드 오류 / 일시정지 / 해지"],
                  ["<code>10010~10011</code>", "EU(사용자) 없음·해지·정지 / 이미 연결됨"],
                  ["<code>10013</code>", "서버처리 용량 초과"],
                  ["<code>10017</code>", "권한 없음"],
                  ["<code>10021</code>", "파일을 읽을 수 없음"],
                  ["<code>10022</code>", "변환 실패(팩스)"],
                  ["<code>10023</code>", "인자 값이 올바르지 않음"],
                  ["<code>10027</code>", "가입되지 않은 상품"],
                  ["<code>10028</code>", "초당 메시지 전송 갯수 초과"],
                  ["<code>10032</code>", "변환 실패(음성)"],
                  ["<code>10033</code>", "월간 메시지 전송 갯수 초과"],
                  ["<code>10034</code>", "메시지 길이 오류"],
                  ["<code>10035</code>", "전화번호 오류"],
                  ["<code>10038</code>", "CustomMessageID 중복"],
                  ["<code>10039</code>", "이통사 시스템 장애"],
                  ["<code>10100</code>", "동보 처리 갯수 초과"],
                  ["<code>10101~10104</code>", "스팸 — 메시지내용 / 발신자 / 착신자 / 회신번호"],
                  ["<code>10106</code>", "메시지 길이 초과"],
                  ["<code>10107~10108</code>", "동일 착번 금지 / 동일 메시지 제한"],
                  ["<code>10114~10117</code>", "피싱 회신번호 / 미등록 회신번호 차단 / 회신번호 길이 / 착신번호 세칙 위반"],
                ],
              },
            ],
            note: "전체 발송 결과코드(10001~10117)는 명세서 6장을 참고하세요. 자주 보는 코드만 발췌했습니다.",
          },
          {
            title: "이통사 결과코드 (102xx ~ 200xx)",
            table: {
              cols: ["코드", "내용"],
              colWidths: ["18%", "82%"],
              rows: [
                ["<code>10200</code>", "통화중"],
                ["<code>10201</code>", "무응답"],
                ["<code>10202</code>", "착신가입자 없음"],
                ["<code>10203</code>", "비가입자, 결번, 서비스정지"],
                ["<code>10212</code>", "NPDB 가입자없음 (Undeliverable)"],
                ["<code>10253</code>", "전송 실패(무선망), 단말기 일시정지"],
                ["<code>12002~12003</code>", "MMS 주소 형식 오류 / Relay·Server가 주소 못 찾음"],
                ["<code>12107</code>", "착신번호 오류"],
                ["<code>14005</code>", "일반 서비스 에러 / MMS G/W 내부 처리 실패"],
                ["<code>14007</code>", "미지원 단말 / 전송 실패"],
                ["<code>14301</code>", "미 가입자 오류"],
                ["<code>14307</code>", "일시정지 가입자 오류"],
                ["<code>20000</code>", "이통사 기타에러"],
              ],
            },
          },
          {
            title: "Request · DB 결과코드 (400xx ~ 50000)",
            table: {
              cols: ["코드", "내용"],
              colWidths: ["18%", "82%"],
              rows: [
                ["<code>40000</code>", "Request Error"],
                ["<code>40002~40003</code>", "계정 일시 정지 / 해지·정지"],
                ["<code>41000</code>", "Header 정보 에러"],
                ["<code>41001</code>", "API-KEY 미등록 또는 Secret Key 틀림"],
                ["<code>41002</code>", "미등록 IP"],
                ["<code>41003</code>", "인증정보 불일치"],
                ["<code>41004</code>", "리포트/예약조회 중복요청"],
                ["<code>42000</code>", "메시지 항목 누락 또는 부적합"],
                ["<code>42001</code>", "동보/대량/조회 전송 건수 초과"],
                ["<code>50000</code>", "DB 에러"],
              ],
            },
            note: "<b>인증 실패 점검 순서:</b> 41001(키 오류) → 41002(IP 미등록) → 41003(HASH 불일치, body 1바이트 차이/타임스탬프 확인).",
          },
          {
            title: "전체 에러코드 보기",
            body: "위는 자주 보는 코드 중심의 요약입니다. <b>스마트메시지 OpenAPI 전체 결과코드</b>는 결과코드 페이지에서 확인하세요. 코드 의미가 불확실하거나 차단 해제 등이 필요하면 <b>모노커뮤니케이션즈</b>로 문의 바랍니다.",
            cta: { href: "#/codes?svc=mcs-openapi", label: "결과코드 페이지 · 스마트메시지 OpenAPI 전체 에러코드 보기", icon: "hash" },
          },
        ],
      },
    ],
  };
})();

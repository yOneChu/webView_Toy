# DB 명세서 API 연동 가이드

명세서 3종의 API 주소와 전송 형식은 **`api.js` 상단의 `DB_SPEC_TYPES` 한 곳**에서만 관리합니다.
주소를 채우면 그 명세서는 즉시 실제 DB 데이터로 전환됩니다.

> 최종 갱신: 2026-08-17

---

## 1. 현재 연결 상태

| 명세서 | ID | 조회(readUrl) | 저장(saveUrl) | 화면 동작 |
|---|---|---|---|---|
| ECO 검증 | `ECO_VERIFY` | ❌ 미설정 | ❌ 미설정 | 목업(localStorage), 조회·편집 O |
| 로직 작성 | `LOGIC_WRITE` | ✅ **연결됨** | ✅ **연결됨** | 실 DB 조회·저장 O |
| 로직 검증 | `LOGIC_VERIFY` | ✅ **연결됨** | ✅ **연결됨** | 실 DB 조회·저장 O |

**연결 주소 (base: `http://localhost:8070/apiv2`)**

| 용도 | 메서드 | 주소 |
|---|---|---|
| 로직 작성 조회 | GET | `/getLogicWriteAsDB?key=subae&type=LOGIC_WRITE` |
| 로직 검증 조회 | GET | `/getLogicVerifyAsDB?key=subae&type=LOGIC_VERIFY` |
| 저장 (공용) | POST | `/update_PLM_DB_MetaData?key=subae&type=<명세서ID>` |

조회 응답 특성 (실제 호출 확인 기준)

| 항목 | 값 |
|---|---|
| Content-Type | `text/plain;charset=UTF-8` — **JSON이 아니라 마크다운 원문** |
| 본문 크기 | 약 12KB |
| CORS | `Access-Control-Allow-Origin: *` → 브라우저에서 바로 호출 가능 |

> 화면은 Content-Type을 보고 `text/*`면 본문 전체를 마크다운으로, `application/json`이면
> `content` / `CONTENT` / `data` / `result` / `text` 필드에서 본문을 꺼내 씁니다. 둘 다 지원합니다.

---

## 2. 설정 방법 (`api.js` → `DB_SPEC_TYPES`)

```js
const DB_SPEC_TYPES = [
    {
        id: 'LOGIC_WRITE', name: '로직 작성', icon: 'pen-tool',
        readUrl: 'http://localhost:8070/apiv2/getLogicWriteAsDB?key=subae&type=LOGIC_WRITE',
        saveUrl: 'http://localhost:8070/apiv2/update_PLM_DB_MetaData?key=subae&type=LOGIC_WRITE',
        saveMethod: 'POST',
        saveFormat: 'form',                        // ★ @RequestParam 컨트롤러용
        saveFields: { content: 'updatedContent' }, // ★ 서버 파라미터명 매핑
    },
];
```

| 옵션 | 설명 |
|---|---|
| `readUrl` | 마크다운 본문을 가져올 GET 주소. 없으면 localStorage 목업으로 동작 |
| `saveUrl` | 저장 주소. **없으면 읽기 전용**(편집 버튼이 자물쇠로 잠김) |
| `saveMethod` | 저장 HTTP 메서드 (기본 `POST`) |
| `saveFormat` | `'form'` → `application/x-www-form-urlencoded`<br>`'json'` → `application/json` (기본값) |
| `saveFields` | 서버가 기대하는 파라미터명 매핑. 예) `{ content: 'updatedContent' }` |

**규칙 3줄 요약**

1. `readUrl` 이 있으면 → 실제 API 조회, 없으면 → localStorage 목업
2. `saveUrl` 이 없으면 → **읽기 전용**
3. `saveUrl` 을 채우는 순간 → 편집·저장 즉시 활성화 (다른 코드 수정 불필요)

---

## 3. 저장(수정) API 규약

### 실제로 나가는 요청

```
POST http://localhost:8070/apiv2/update_PLM_DB_MetaData?key=subae&type=LOGIC_WRITE
Content-Type: application/x-www-form-urlencoded;charset=UTF-8

id=LOGIC_WRITE&updatedContent=%23%20로직%20작성...&author=홍길동
```

| 파라미터 | 위치 | 값 |
|---|---|---|
| `key` | 쿼리스트링 | `subae` |
| `type` | 쿼리스트링 | 명세서 ID (`LOGIC_WRITE` / `LOGIC_VERIFY`) |
| `id` | form 본문 | 명세서 ID (`type` 과 동일 값) |
| `updatedContent` | form 본문 | 수정된 마크다운 전문 |
| `author` | form 본문 | 작성자명 |

**응답**: `200` 또는 `204` (본문은 무엇이든 무관 — 저장 후 화면이 자동으로 재조회합니다)

### 컨트롤러 예시

```java
@PostMapping("/update_PLM_DB_MetaData")
@CrossOrigin
public String update_PLM_DB_MetaData(
        @RequestParam("key") String key,
        @RequestParam("type") String type,              // ★ 어느 명세서인지 구분
        @RequestParam("updatedContent") String updatedContent,
        @RequestParam(value = "author", required = false) String author) {
    ...
}
```

### ⚠️ 반드시 확인할 3가지

1. **`form` 전송이어야 한다** — 애노테이션 없는 `String` 파라미터나 `@RequestParam` 은
   쿼리스트링과 `x-www-form-urlencoded` 본문만 읽습니다. **JSON body 로 보내면 `null`** 이 됩니다.
   (이 프로젝트가 `saveFormat: 'form'` 을 쓰는 이유)
2. **저장 API가 두 명세서 공용이다** — `update_PLM_DB_MetaData` 를 `LOGIC_WRITE` 와 `LOGIC_VERIFY` 가
   함께 씁니다. 컨트롤러가 **`type`(또는 본문 `id`)으로 대상 행을 구분하지 않으면 서로 덮어씁니다.**
3. **`@RequestParam` 이름을 명시할 것** — 애노테이션을 생략하면 컴파일 시 `-parameters` 옵션 유무에
   따라 파라미터 이름을 못 찾아 예외가 나거나 엉뚱하게 바인딩될 수 있습니다.

### 서버 체크리스트

- [ ] `content` 컬럼은 `NVARCHAR(MAX)` (본문이 12KB 이상)
- [ ] 요청/응답 인코딩 `UTF-8`
- [ ] **CORS**: `x-www-form-urlencoded` 는 단순 요청이라 **프리플라이트(OPTIONS)가 발생하지 않습니다.**
      `@CrossOrigin` 만으로 충분합니다. (JSON 방식으로 바꾸면 OPTIONS 허용이 별도로 필요)
- [ ] 본문 크기 제한 — Tomcat `maxPostSize` 기본 2MB 내이지만 앞단 프록시가 있으면 확인

---

## 4. JSON 방식으로 바꾸고 싶다면

컨트롤러를 `@RequestBody` 로 바꾸고,

```java
public String update_PLM_DB_MetaData(@RequestParam String key,
                                     @RequestBody Map<String, Object> body) {
    String updatedContent = (String) body.get("updatedContent");
```

`api.js` 의 해당 명세서에서 `saveFormat` 만 `'json'` 으로 바꾸면 됩니다 (`saveFields` 매핑은 그대로 적용).

```
POST .../update_PLM_DB_MetaData?key=subae&type=LOGIC_WRITE
Content-Type: application/json

{ "id": "LOGIC_WRITE", "updatedContent": "# 로직 작성...", "author": "홍길동" }
```

단, JSON 은 CORS **프리플라이트(OPTIONS)가 발생**하므로 서버가 OPTIONS 를 허용해야 합니다.
(과거 `PUT` 이 403 으로 막혔던 것도 프리플라이트 문제였습니다.)

전송 형식 자체를 더 크게 손봐야 한다면 `api.js` 의 `SpecStore._buildSaveRequest()` 한 곳만 고치면 됩니다.

---

## 5. 남은 작업: ECO 검증

`ECO_VERIFY` 만 아직 목업(localStorage)입니다. 아래 두 줄만 채우면 즉시 실 DB 로 전환됩니다.

```js
{
    id: 'ECO_VERIFY', name: 'ECO 검증', icon: 'shield-check',
    readUrl: 'http://localhost:8070/apiv2/getEcoVerifyAsDB?key=subae&type=ECO_VERIFY',
    saveUrl: 'http://localhost:8070/apiv2/update_PLM_DB_MetaData?key=subae&type=ECO_VERIFY',
    saveMethod: 'POST',
    saveFormat: 'form',
    saveFields: { content: 'updatedContent' },
},
```

---

## 6. 조회 응답이 JSON인 경우

조회 API 를 JSON 으로 만들 경우 별도 설정 없이 아래 형태를 지원합니다.

```json
{ "content": "# 마크다운 본문 ..." }
```

`content` / `CONTENT` / `data` / `result` / `text` 중 아무 필드나 가능하며,
필드명이 완전히 다르면 `api.js` 의 `SpecStore._pickContent()` 를 수정하세요.

---

## 7. 참고: 인증 헤더가 필요할 때

`api.js` 맨 아래에서 공통 헤더를 지정합니다 (조회·저장 모두에 적용됩니다).

```js
window.DbSpecStore = new SpecStore({
    headers: { Authorization: 'Bearer <token>' }
});
```

> 단, 커스텀 헤더를 추가하면 form 전송이라도 **CORS 프리플라이트가 발생**하므로
> 서버에서 OPTIONS 와 해당 헤더를 허용해야 합니다.

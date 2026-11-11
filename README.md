# Goreun 고른

고르게, 고르고, 고른.

취향과 입력한 기준을 참고해 사진을 분류하고, 나란히 비교하며 직접 남길 사진을 고르는 서비스입니다.

## 작업물

- `landing/`: 통합 랜딩페이지 HTML·CSS·JavaScript와 이미지, Pretendard 폰트.
- `prototype/`: 홈·사진 선택·기준 입력·분류·비교·최종 선택 흐름이 있는 웹 체험판.

## 하나의 사이트로 실행

저장소 루트에서 Node.js로 실행합니다. 외부 npm 패키지는 필요하지 않습니다.

```sh
npm run dev
```

- http://127.0.0.1:8766/ : 랜딩페이지
- 랜딩의 모든 ‘올릴 사진 고르기’ 버튼 → 같은 사이트의 `/app/?start=pick` → 사진 선택
- `/app/` : 서비스 홈으로 직접 진입 (새로고침 가능)
- 서비스 상단 Goreun / 홈의 ‘고른 서비스 소개’ → 랜딩으로 돌아가기
- 기존 `/landing/` 주소는 `/`로 이동합니다.

```sh
npm run build
npm test
```

빌드 결과 `prototype/dist/server/index.js` 하나에 랜딩과 서비스, `/api/config`·`/api/analyze`를 함께 포함합니다. 배포는 저장소 루트에서 빌드하고 `prototype/dist`를 기존 Worker/Sites 배포 대상으로 사용합니다. 단순 GitHub Pages 정적 배포는 이 서버 API를 실행하지 못합니다.

서버 API 키가 없는 로컬 실행에서는 기기에서 기본 정리를 체험할 수 있습니다. Gemini 분석은 서버 런타임의 `GEMINI_API_KEY`가 필요하며 키는 저장소에 포함하지 않습니다. 기존 서비스에 설정된 API 키와 배포 권한은 GitHub 연결만으로 이전되지 않습니다. 저장소 코드 반영과 운영 사이트 재배포는 별개입니다.

비밀 설정을 사용한 로컬 테스트는 `prototype/README.md`의 stdin 방식을 참고하세요.

## 현재 반영된 내용

- 화이트·블랙 디자인, Pretendard, 하단 홈 / 고른 / 설정.
- 예시 사진 63장. 아기 표정·인플루언서 사진은 인물 사진에, 바다 사진은 여행에 모았습니다.
- 사진 선택 완료 후 기준 입력창 표시. 사진 목록만 스크롤됩니다.
- 중앙 로고 모션과 작은 안내 문구를 사용하는 분류 로딩 화면.
- 사진은 자동 삭제하지 않으며, 휴대폰 원본 앨범의 실제 폴더 이동은 웹에서 지원하지 않습니다.

## 구성과 의존성

- `prototype/.openai/hosting.json`: 기존 Sites 프로젝트 식별 정보. 다른 사이트에 배포할 때는 해당 프로젝트 설정으로 교체해야 합니다.
- 체험판의 Worker는 번들 용량을 줄이기 위해 Pretendard 폰트를 기존 공개 랜딩에서 가져옵니다. `prototype/worker/index.mjs`에 경로가 있으며, 원본 폰트도 저장소에 포함되어 있습니다.
- 취향 참고와 정리 대상의 압축 미리보기를 Gemini로 보내기 전에 사용자 동의를 받습니다.
- 예시 이미지 생성 프롬프트는 `prototype/image-generation-prompts.json`, 이미지 출처 표기는 각 assets의 출처 파일을 참고합니다.

계정 인계 메모, 실제 API 키, Git 인증정보, 생성된 빌드 파일은 포함하지 않습니다.

## 인스타그램 사진 선정으로 업데이트
오늘 올릴 사진, 내 취향으로 고르세요.

설정은 좋아하는 사진과 공통 기준으로 줄였습니다. 사진 선택 후 원하는 분위기를 한 줄로 적거나 예시 버튼으로 고르고, 후보를 나란히 비교한 뒤 직접 선택합니다. 선택한 사진은 ZIP으로 저장할 수 있습니다.

인스타그램 계정 연동은 준비 중입니다. 버튼에서 안내를 확인하고 좋아하는 게시물 사진을 직접 추가할 수 있으며, 실제 계정 인증이나 자동 게시가 동작한다고 표시하지 않습니다.

## GitHub Pages 배포

`.github/workflows/static.yml`이 `main`에 push할 때 자동 실행됩니다. Actions에서 **Deploy Goreun to GitHub Pages → Run workflow**로 수동 실행할 수도 있습니다.

1. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
2. Actions에서 위 워크플로의 성공 여부를 확인합니다. 배포 단계에 표시된 URL로 접속합니다.
3. 기본 주소는 `https://hhjoo1006.github.io/TTT_Goreun/`, 서비스 주소는 그 아래 `app/`입니다.

이 워크플로는 테스트 후 `npm run build:pages`로 생성한 `dist/pages`만 배포합니다. 랜딩은 첫 화면, 네 곳의 시작 버튼은 사진 선택 화면으로 연결됩니다. 저장소 경로는 Pages 설정의 `base_path`를 사용하며 사용자 지정 도메인의 루트 경로도 지원합니다.

**Pages 배포본은 기기 내 기본 정리만 제공합니다.** Gemini 서버 API와 비밀 키는 포함하지 않으며 AI 분석은 활성화되지 않습니다. 기존 `npm run build`의 서버 포함 배포 방식은 그대로 사용할 수 있습니다.

로컬 빌드 확인: `npm run test:pages && npm run build:pages`. 기본 경로는 `/TTT_Goreun`이며 루트 배포를 테스트하려면 `PAGES_BASE_PATH='' npm run build:pages`를 사용합니다.

## 서비스 첫 화면의 광고 문구

`/app/`의 큰 제목만 `utm_content`로 전환합니다. `prototype/web/entry-copy.mjs`의 `entryTitles`에 항목을 추가하면 타겟을 확장할 수 있습니다. 값이 없거나 등록되지 않은 값이면 기존 HTML 제목을 유지합니다. 랜딩, 버튼, 설명, 스타일, 사진은 바뀌지 않습니다.

| utm_content | 서비스 제목 |
| --- | --- |
| travel_instagram | 여행 사진은 잔뜩, / 인스타엔 뭘 올리지? |
| cute | 오늘 찍은 사진 중 / 가장 귀여운 한 컷은? 💕 |
| pet | 이것도 귀엽고, / 저것도 귀엽고, / 견생샷만 골라줄게요! (시작 버튼: 3초 만에 고르기) |

시작 버튼 문구는 `entry-copy.mjs`의 `entryButtons`에 등록한 값만 바뀌고, 나머지는 기존 버튼 문구를 유지합니다.

광고 링크는 `/app/?utm_source=instagram&utm_medium=paid_social&utm_campaign=travel_post_01&utm_content=travel_instagram` 또는 `/app/?utm_source=instagram&utm_medium=paid_social&utm_campaign=cute_pick_01&utm_content=cute`를 사용합니다. `start=pick`은 첫 화면을 건너뛰므로 제목을 보여줄 광고 링크에는 넣지 않습니다. UTM 값은 유입 식별용이며 이 변경에서 별도 집계 도구를 추가하지는 않습니다.

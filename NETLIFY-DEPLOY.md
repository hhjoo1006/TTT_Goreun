# Netlify 배포 안내

## GitHub에서 ZIP을 받은 경우 (Windows)

1. ZIP을 압축 해제합니다. `package.json`, `netlify.toml`, `deploy-netlify.cmd`가 같은 폴더에 있어야 합니다.
2. Node.js 22 LTS 이상이 없다면 https://nodejs.org 에서 설치합니다.
3. `deploy-netlify.cmd`를 더블클릭합니다.
4. 브라우저에서 Netlify 로그인 후, 터미널에서 **GEMINI_API_KEY를 이미 등록한 기존 사이트**를 선택합니다. 새 사이트를 만들지 않습니다.
5. 선택한 사이트를 확인하고 아무 키나 누르면 빌드 후 운영 사이트로 배포합니다.

이 파일은 공식 Netlify CLI를 실행하며 인터넷 연결이 필요합니다. 실제 API 키나 Netlify 토큰을 파일에 넣지 않습니다.

## 직접 명령어로 배포 (Windows / macOS)

프로젝트 폴더에서 실행합니다.

```sh
npx --yes netlify-cli login
npx --yes netlify-cli link
npx --yes netlify-cli deploy --build --prod
```

`link`에서 반드시 기존 사이트를 선택하세요. `--prod`는 해당 사이트의 운영 배포를 교체합니다.

## GitHub 연결 배포

Netlify에서 이 저장소를 연결하면 `netlify.toml` 설정을 사용합니다.

| 항목 | 값 |
| --- | --- |
| Base directory | 저장소 루트 (비움) |
| Build command | `npm run build:netlify` |
| Publish directory | `dist/netlify` |
| Functions directory | `netlify/functions` |
| 환경변수 | `GEMINI_API_KEY` |
| 선택 환경변수 | `GEMINI_MODEL` (미설정 시 기존 기본 모델 사용) |

키는 Netlify 환경변수에만 저장하며 Production 및 Functions 범위에 적용되어야 합니다. 범위 선택이 없다면 전체 범위를 사용합니다. 키를 변경한 뒤에는 재배포합니다.

## 파일 드래그 업로드에 대한 주의

기존 사이트의 Deploys 화면에 정적 폴더/ZIP만 올리면 서버 함수 배포를 보장할 수 없습니다. `dist/netlify`는 화면 파일만 포함합니다. **AI 분석까지 사용하려면 위 CLI 또는 GitHub 연결 배포를 사용하세요.** 로그인한 Netlify Drop의 소스 빌드 기능을 사용하더라도 배포 로그에서 `goreun-api` 함수가 배포됐는지 확인해야 합니다.

## 배포 후 확인

- `/`: 랜딩, `/app/`: 서비스.
- `/api/config`: `{"gemini":true,...}`이면 함수가 키 설정을 읽었습니다. 이 응답은 키 유효성이나 사용 한도까지 검증하지는 않습니다.
- 사진 2장 이상을 선택하고 전송에 동의한 뒤 실제 AI 분석을 실행해 모델 접근 권한과 한도를 확인합니다.
- 404 또는 HTML 응답: 함수가 함께 배포되지 않았는지 확인하세요.
- `gemini:false`: 선택한 사이트/환경의 `GEMINI_API_KEY`와 Functions 범위를 확인한 뒤 재배포하세요.

기존 GitHub Pages 빌드는 계속 기기 내 기본 정리만 제공합니다. Netlify 전용 빌드는 API 호출을 유지하고 사진·폰트·WASM을 정적 파일로 배포하며, 키는 서버에서만 읽습니다.

공식 문서: https://docs.netlify.com/build/functions/get-started/ 및 https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/

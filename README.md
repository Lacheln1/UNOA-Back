# 유레카 프론트엔드 비대면 1조 : UNOA
![메인페이지](https://github.com/user-attachments/assets/10f18e9d-dfef-4602-8a3a-f6faec707e58)

## UNOA(You know NOA)
💡 **UNOA**은 `한 번에 쉽게, 나한테 딱 맞게`
추천부터 비교, 혜택 정리까지 한 곳에서 나에게 딱 맞는 요금제 관리 도우미입니다.

[🔗팀노션](https://fern-cesium-085.notion.site/01-UNOA-You-know-NOA-203303b4c814802d9b9ad1fe21f34684?pvs=74)
[🎨피그마](https://www.figma.com/design/KBt5oYt5mAsCMx3QqdSzt0/%EC%A2%85%ED%95%A9%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8_1%EC%A1%B0?t=YK1wDd3ggn1E3B6M-0)
  
## 🏃‍♂️ 주요기능

| **기능** | **설명** |
| --- | --- |
| **챗봇 요금제 추천** | GPT 기반 자연어 챗봇 + 실시간 스트리밍 출력 |
| **챗봇 간단 모드** | 디지털 리터러시가 낮은 유저를 위한 버튼 기반 추천 |
| **요금제 리스트 조회** | 카테고리별 분류, 정렬/필터 기능 |
| **요금제 비교** | 요금제 2개 선택 시 사이드 비교창으로 비교 |
| **마이페이지** | **LG U+ 가입자 :** 사용 요금제 및 혜택 정보 제공 </br> **LG U+ 미가입자 :** 챗봇 서비스 유도 및 가입 시 받을 수 있는 혜택 정보 제공 |
| **회원가입/로그인** | 카카오 간편 로그인 및 자체 가입 지원 |
| **비회원 접근** | 챗봇/리스트/비교 기능 모두 사용 가능, 단 마이페이지 제외 |

## 📚 Tech Stack

### 💻 FE Development

[![My Skills](https://skillicons.dev/icons?i=js,html,css,react,tailwindcss,vite)](https://skillicons.dev)

### 💻 BE Development

[![My Skills](https://skillicons.dev/icons?i=nodejs,express,mongodb&theme=light)](https://skillicons.dev)


### ⌛ Developed Period

#### 2025.06.09 ~ 2025.06.26 (18 days)

# 👩‍💻 팀원

<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <a href="https://github.com/gusdn6288">
          <img src="https://avatars.githubusercontent.com/u/100756731?v=4" width="120px;" /><br />
          <b>김현우A</b>
        </a>
        <div style="height:45px"></div>
         <hr/>
        <p style="font-size:10px;"># 메인페이지<br /># 요금제페이지(비교하기)</p>
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/song-eun">
          <img src="https://avatars.githubusercontent.com/u/80393294?v=4" width="120px;" /><br />
          <b>송은재</b>
        </a>
         <hr/>
        <div style="height:45px"></div>
        <p># 챗봇페이지(간단모드)<br /># 마이페이지(혜택)</p>
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/zeromin41">
          <img src="https://avatars.githubusercontent.com/u/130297212?v=4" width="120px;" /><br />
          <b>심영민</b>
        </a>
        <div style="height:45px"></div>
         <hr/>
        <p># 챗봇페이지(채팅모드)</p>
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/Lacheln1">
          <img src="https://avatars.githubusercontent.com/u/59949555?v=4" width="120px;" /><br />
          <b>홍성현</b>
        </a>
         <hr/>
        <div style="height:45px"></div>
        <p># 요금제페이지(리스트)</p>
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/H-JuKyung">
          <img src="https://avatars.githubusercontent.com/u/148874281?v=4" width="120px;" /><br />
          <b>황주경</b>
        </a>
         <hr/>
        <div style="height:45px"></div>
        <p># 회원가입/로그인페이지<br /># 마이페이지(회원정보)</p>
      </td>
    </tr>
  </tbody>
</table>

# :pencil: API 명세

### 1. 챗봇 API

| 기능 | Method | Endpoint | 설명 |
| --- | --- | --- | --- |
| **서버 상태 확인** | `GET` | `/health` | 서버의 현재 동작 상태를 확인합니다. |
| **요금제 목록 조회** | `GET` | `/plans` | 챗봇이 추천할 수 있는 전체 요금제 목록을 가져옵니다. |
| **IP 기반 대화 조회** | `GET` | `/conversations/ip/:ip` | 특정 IP 주소(`:ip`)를 기준으로 이전 대화 내역을 조회합니다. |
| **세션 기반 대화 조회** | `GET` | `/conversations/:sessionId` | 특정 세션 ID(`:sessionId`)에 해당하는 대화 내역을 조회합니다. |
| **관리자 통계 조회** | `GET` | `/admin/stats` | 관리자 페이지에 표시될 통계 데이터를 조회합니다. |
| **AI 요금제 비교/요약** | `POST` | `/plans/compare` | 사용자가 선택한 요금제들을 AI를 통해 비교하고 요약된 결과를 제공합니다. (Request Body에 비교할 데이터 필요) |

### 2. 인증 API

| 기능 | Method | Endpoint | 설명 |
| --- | --- | --- | --- |
| **회원가입** | `POST` | `/register` | 새로운 사용자를 등록합니다. (Request Body에 `userId`, `password` 등 필요) |
| **아이디 중복 확인** | `GET` | `/check-id` | 회원가입 시 사용자 아이디의 중복 여부를 확인합니다. (Query String으로 `?id=아이디` 전달) |
| **로그인** | `POST` | `/login` | 아이디와 비밀번호로 로그인합니다. 성공 시 토큰을 발급합니다. |
| **내 정보 조회** | `GET` | `/me` | 현재 로그인된 사용자의 정보를 가져옵니다. **(인증 필요: `verifyToken`)** |
| **로그아웃** | `POST` | `/logout` | 현재 사용자를 로그아웃 처리합니다. |

### 3. 카카오 소셜 로그인 API

| 기능 | Method | Endpoint | 설명 |
| --- | --- | --- | --- |
| **카카오 로그인 시작** | `GET` | `/login` | 카카오 인증 페이지로 사용자를 리디렉션하여 로그인을 시작합니다. |
| **카카오 로그인 콜백** | `GET` | `/callback` | 카카오 인증 성공 후, 인증 코드를 받아 백엔드에서 후속 처리를 진행합니다. |
| **카카오 계정 회원가입 완료** | `POST` | `/complete` | 카카오 인증 후, 서비스에 필요한 추가 정보(예: 닉네임)를 받아 회원가입을 최종 완료합니다. |

# 📁 디렉토리 구조
```
Unoa_Back/
├── .github/              # GitHub Actions (CI/CD) 워크플로우 설정
├── config/               # 환경 변수, DB 연결 등 프로젝트 설정 파일
├── controllers/          # 요청(Request)에 대한 비즈니스 로직 처리 및 응답(Response) 반환
│   ├── authController.js
│   ├── chatbotController.js
│   ├── kakaoAuthController.js
│   └── userController.js
├── data/                 # (사용 시) 초기 데이터나 정적 데이터 파일
├── handlers/             # 이벤트 기반 로직 처리 (예: 웹소켓)
│   └── socketHandlers.js
├── images/               # (사용 시) 서버에서 관리하는 이미지 파일
├── middlewares/          # 요청과 응답 사이의 중간 처리 로직 (인증, 로깅 등)
│   └── authMiddleware.js
├── models/               # MongoDB 데이터베이스 스키마 및 모델 정의
│   ├── Benefit.js
│   ├── Conversation.js
│   ├── Plan.js
│   └── User.js
├── node_modules/         # Node.js 패키지 및 의존성
├── routes/               # API 엔드포인트(URI) 정의 및 컨트롤러 연결
│   ├── apiRoutes.js
│   ├── authRoutes.js
│   ├── kakaoAuthRoutes.js
│   └── userRoutes.js
├── scripts/              # 데이터베이스 시딩 등 보조 스크립트
│   ├── seedBenefits.js
│   └── seedDatabase.js
├── services/             # 컨트롤러보다 복잡한 비즈니스 로직, 외부 API 연동 등 처리
│   └── promptService.js
├── utils/                # 공통으로 사용되는 헬퍼 함수 및 유틸리티
│   └── helpers.js
└── .env                  # 환경 변수 설정 파일 (Git 추적 안 됨)
```

# 🎯 커밋 컨벤션

- `feat`: Add a new feature
- `fix`: Bug fix
- `docs`: Documentation updates
- `style`: Code formatting, missing semicolons, cases where no code change is involved
- `refactor`: Code refactoring
- `test`: Test code, adding refactoring tests
- `build`: Build task updates, package manager updates


# 🔰 실행 방법
``` bash
# 1. 의존성 설치 (루트 디렉토리에서 실행)
npm install

# 2. 클라이언트 및 서버 빌드
npm run build

# 3. 초기 데이터 필요한 경우 데이터 시딩
npm run seed

# 4. 개발 서버 실행 (클라이언트와 서버가 동시에 실행됨)
npm run dev
```

```env
# .env파일
# 서버 설정
PORT = 5000
NODE_ENV=development

# 프론트엔드 도메인
FRONTEND_URL=http://localhost:5173

# MongoDB 설정
MONGODB_URI={실제 값}
MONGODB_DB_NAME={실제 값}

# OpenAPI 키 설정
OPENAI_API_KEY={실제 값}

# 인증 관련 설정
BCRYPT_SALT_ROUNDS={원하는 값}
JWT_SECRET={실제 값}
JWT_EXPIRATION={원하는 값}

# 카카오 로그인
KAKAO_CLIENT_ID={실제 값}
KAKAO_CLIENT_SECRET={실제 값}
KAKAO_CALLBACK_URI=http://localhost:5000/api/auth/kakao/callback
```

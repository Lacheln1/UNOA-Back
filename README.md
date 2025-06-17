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
      <td align="center"><a href="https://github.com/gusdn6288"><img src="https://avatars.githubusercontent.com/u/100756731?v=4" width="120px;" alt=""/><br /><b>김현우A</b></a><br /><p>개발</p></td>
      <td align="center"><a href="https://github.com/song-eun"><img src="https://avatars.githubusercontent.com/u/80393294?v=4" width="120px;" alt=""/><br /><b>송은재</b></a><br /><p>개발</p></td>
      <td align="center"><a href="https://github.com/zeromin41"><img src="https://avatars.githubusercontent.com/u/130297212?v=4" width="120px;" alt=""/><br /><b>심영민</b></a><br /><p>개발</p></td>
      <td align="center"><a href="https://github.com/Lacheln1"><img src="https://avatars.githubusercontent.com/u/59949555?v=4" width="120px;" alt=""/><br /><b>홍성현</b></a><br /><p>개발</p></td>
      <td align="center"><a href="https://github.com/H-JuKyung"><img src="https://avatars.githubusercontent.com/u/148874281?v=4" width="120px;" alt=""/><br /><b>황주경</b></a><br /><p>개발</p></td>
    </tr>
  </tbody>
</table>

# 📁 디렉토리 구조
```
/UNOA
|
|-- 📂 UNOA-back/ (백엔드)
|   |
|   |-- 📂 node_modules/
|   |-- 📂 config/
|   |
|   |-- .env              (API 키 등 환경 변수)
|   |-- package.json
|   |-- server.js         (서버 실행 파일)
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

# 3. 개발 서버 실행 (클라이언트와 서버가 동시에 실행됨)
npm run dev
```

```env
# .env파일
OPENAI_API_KEY={OpenAI에서 받은 API키}
```

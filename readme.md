<h1>NestJS Example</hq>

<h2>프로젝트 설명</h2>

- 이 프로젝트는 NestJS를 이용해 기본적인 CRUD를 수행하는 예시입니다.

- 기술 스택 : TypeScript + NestJS + TypeORM

- 개발하며 정리한 글들 : <a href="https://github.com/sang-w0o/Study/tree/master/Backend%20Frameworks/NestJS/TypeORM%20%2B%20NestJS">링크</a>

<h2>기능 설명</h2>

- 간단한 게시판 API를 구현할 것이다.  
  사실상 모든 CRUD는 게시판의 연장선이라고 생각하기 때문이다.  
  우선 테이블 구조는 아래와 같다.

- 또한 JWT를 이용해서 간단한 인증 절차 및 middleware를 적용할 것이다.

- 사용자(`users`) 테이블은 아래의 컬럼들을 가진다.

  - user_id (INTEGER, PK)
  - name (VARCHAR(200), NOT NULL)
  - email (VARCHAR(200), NOT NULL, UNIQUE)
  - password (VARCHAR(1000), NOT NULL)

- 게시판(`boards`) 테이블은 아래의 컬럼들을 갖는다.

  - board_id (INTEGER, PK)
  - title (VARCHAR(400), NOT NULL)
  - content (VARCHAR(1000), NOT NULL)
  - created_at (DATETIME, NOT NULL)
  - last_modified_at (DATETIME, NOT NULL)

- 구현할 API 들은 아래와 같다.

- [x] 회원 등록 : `[POST] /user`
- [x] 회원 정보 수정 : `[PUT] /user/{userId}`
- [x] 회원 정보 조회 : `[GET] /user/{userId}`
- [x] 회원 정보 삭제 : `[DELETE] /user/{userId}`
- [x] 글 등록 : `[POST] /user/board/{userId}`
- [x] 글 수정 : `[PATCH] /user/board/{userId}/{boardId}`
- [x] 글 삭제 : `[DELETE] /user/board/{userId}/{boardId}`
- [x] 특정 글 조회 : `[GET] /board/{boardId}`
- [x] 글 조회 : `[GET] /board?page=number&size=number`

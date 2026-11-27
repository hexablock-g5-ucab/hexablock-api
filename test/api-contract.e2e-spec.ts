import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import { LevelDefinitionResponseDto } from './../src/interfaces/http/levels/levels.dto';

type Method = 'get' | 'post' | 'put';

interface RouteCase {
  method: Method;
  path: string;
  body?: object;
}

const PROBLEM_JSON = /^application\/problem\+json/;
const PROBLEM_FIELDS = ['type', 'title', 'status', 'detail', 'instance'];

const VALID_LEVEL = {
  schemaVersion: 1,
  order: 1,
  difficulty: 'easy',
  board: { shape: 'hexagon', radius: 3 },
  spec: { goal: { type: 'score', target: 500 } },
};

/** Every route of the v6.3 contract, with a body that passes validation. */
const ROUTES: RouteCase[] = [
  {
    method: 'post',
    path: '/auth/register',
    body: {
      email: 'player@example.com',
      password: 'correct-horse',
      displayName: 'Player',
    },
  },
  {
    method: 'post',
    path: '/auth/login',
    body: { email: 'player@example.com', password: 'correct-horse' },
  },
  { method: 'get', path: '/me' },
  { method: 'get', path: '/progress/hexa-lines' },
  {
    method: 'put',
    path: '/progress/hexa-sort',
    body: {
      bestScore: 1200,
      data: { anything: true },
      levels: [
        {
          levelId: 'sort-001',
          bestScore: 1200,
          completedAt: '2026-11-25T10:00:00.000Z',
        },
      ],
    },
  },
  {
    method: 'post',
    path: '/games/hexa-merge/scores',
    body: { score: 4500, moves: 37, elapsedMs: 95000 },
  },
  { method: 'get', path: '/games/hexa-sort/leaderboard?levelId=sort-001' },
  { method: 'get', path: '/games/hexa-sort/levels' },
  {
    method: 'put',
    path: '/games/hexa-sort/levels/sort-001',
    body: VALID_LEVEL,
  },
];

describe('API contract v6.3 (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function send({ method, path, body }: RouteCase) {
    const req = request(app.getHttpServer())[method](path);
    return body ? req.send(body) : req;
  }

  it.each(ROUTES)(
    'should_return_501_problem_json_when_calling $method $path',
    async (route) => {
      // Arrange: a request valid for the contract. Act
      const res = await send(route);

      // Assert
      expect(res.status).toBe(501);
      expect(res.headers['content-type']).toMatch(PROBLEM_JSON);
      expect(Object.keys(res.body).sort()).toEqual([...PROBLEM_FIELDS].sort());
      expect(res.body).toMatchObject({
        status: 501,
        title: 'Not Implemented',
        instance: route.path.split('?')[0],
      });
    },
  );

  it('should_return_400_problem_json_when_gameId_is_unknown', async () => {
    // Arrange
    const path = '/games/hexa-fit/leaderboard';

    // Act
    const res = await request(app.getHttpServer()).get(path);

    // Assert
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(PROBLEM_JSON);
    expect(res.body).toEqual({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'gameId must be one of: hexa-lines, hexa-sort, hexa-merge',
      instance: path,
    });
  });

  it('should_return_400_problem_json_when_body_is_invalid', async () => {
    // Arrange: negative moves, missing elapsedMs and an unknown property
    const body = { score: 10, moves: -1, stars: 3 };

    // Act
    const res = await request(app.getHttpServer())
      .post('/games/hexa-lines/scores')
      .send(body);

    // Assert
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(PROBLEM_JSON);
    expect(res.body).toMatchObject({ status: 400, title: 'Bad Request' });
    expect(res.body.detail).toContain('property stars should not exist');
    expect(res.body.detail).toContain('moves must not be less than 0');
    expect(res.body.detail).toContain('elapsedMs must be an integer number');
  });

  it('should_return_501_when_level_envelope_matches_the_path', async () => {
    // Arrange: the envelope ids repeated in the body
    const envelope = {
      ...VALID_LEVEL,
      gameId: 'hexa-sort',
      levelId: 'sort-001',
    };

    // Act
    const res = await request(app.getHttpServer())
      .put('/games/hexa-sort/levels/sort-001')
      .send(envelope);

    // Assert
    expect(res.status).toBe(501);
    expect(res.headers['content-type']).toMatch(PROBLEM_JSON);
  });

  it('should_return_501_when_level_read_back_is_sent_unchanged', async () => {
    // Arrange: a body shaped exactly like the GET /levels response item
    const levelReadBack: Required<LevelDefinitionResponseDto> = {
      gameId: 'hexa-sort',
      levelId: 'sort-001',
      schemaVersion: 1,
      version: 3,
      order: 1,
      difficulty: 'easy',
      board: { shape: 'hexagon', radius: 3 },
      spec: { goal: { type: 'score', target: 500 } },
    };

    // Act
    const res = await request(app.getHttpServer())
      .put('/games/hexa-sort/levels/sort-001')
      .send(levelReadBack);

    // Assert
    expect(res.status).toBe(501);
    expect(res.headers['content-type']).toMatch(PROBLEM_JSON);
  });

  it.each([
    ['gameId', { gameId: 'hexa-merge', levelId: 'sort-001' }],
    ['levelId', { gameId: 'hexa-sort', levelId: 'sort-002' }],
  ])(
    'should_return_400_problem_json_when_envelope_%s_differs_from_the_path',
    async (field, ids) => {
      // Arrange
      const path = '/games/hexa-sort/levels/sort-001';

      // Act
      const res = await request(app.getHttpServer())
        .put(path)
        .send({ ...VALID_LEVEL, ...ids });

      // Assert
      expect(res.status).toBe(400);
      expect(res.headers['content-type']).toMatch(PROBLEM_JSON);
      expect(res.body).toEqual({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: `${field} in the body must match the path`,
        instance: path,
      });
    },
  );

  it('should_not_echo_the_body_when_json_is_malformed', async () => {
    // Act
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"password": hunter2}');

    // Assert
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(PROBLEM_JSON);
    expect(res.body.detail).toBe('Request body is not valid JSON.');
    expect(JSON.stringify(res.body)).not.toContain('hunter2');
  });

  it('should_list_every_contract_route_when_reading_docs_json', async () => {
    // Act
    const res = await request(app.getHttpServer()).get('/docs-json');

    // Assert
    expect(res.status).toBe(200);
    const doc = res.body as {
      info: { title: string };
      paths: Record<string, Record<string, unknown>>;
      components: { securitySchemes: Record<string, unknown> };
    };
    expect(doc.info.title).toBe('HexaBlock API');
    expect(doc.components.securitySchemes).toHaveProperty('bearer');
    const operations = Object.entries(doc.paths).flatMap(([path, item]) =>
      Object.keys(item).map((method) => `${method.toUpperCase()} ${path}`),
    );
    expect(operations).toEqual(
      expect.arrayContaining([
        'POST /auth/register',
        'POST /auth/login',
        'GET /me',
        'GET /progress/{gameId}',
        'PUT /progress/{gameId}',
        'POST /games/{gameId}/scores',
        'GET /games/{gameId}/leaderboard',
        'GET /games/{gameId}/levels',
        'PUT /games/{gameId}/levels/{levelId}',
      ]),
    );
  });
});

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'test', 'docs', 'chore', 'ci', 'build', 'perf', 'style', 'revert']],
    'scope-enum': [2, 'always', ["auth", "users", "progress", "leaderboard", "levels", "api", "db", "domain", "app", "infra", "aop", "docs", "ci", "deps", "repo"]],
    'scope-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 100],
  },
};

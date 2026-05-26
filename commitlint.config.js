/**
 * Commitlint — проверка conventional commits.
 * Подключается husky-хуком .husky/commit-msg.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build', 'revert'],
    ],
    'scope-enum': [
      1,
      'always',
      ['web', 'mobile', 'api', 'db', 'ui', 'types', 'config', 'api-client', 'infra', 'docs', 'deps'],
    ],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/** AGENTS.md: domain and application stay free of Nest, Prisma, bcrypt and JWT libraries. */
const ROOT = join(__dirname, '..', '..');
const GUARDED_LAYERS = ['src/domain', 'src/application'];
const FORBIDDEN = ['@nestjs', '@prisma/client', 'bcrypt', 'jsonwebtoken'];

/**
 * Violations that predate this test, each to be fixed in its own PR.
 * The test fails if a listed file no longer violates, so the list cannot go stale.
 */
const KNOWN_VIOLATIONS: Record<string, string> = {
  // Uses Nest's Logger; to be replaced by the LogPort of model v6.3.
  'src/application/aspects/logging.use-case.ts': '@nestjs/common',
};

/** Matches `from 'x'`, `import 'x'`, `import('x')` and `require('x')`. */
const IMPORT_PATTERN = /\b(?:from|import|require)\s*\(?\s*['"]([^'"]+)['"]/g;

function importedModules(source: string): string[] {
  return [...source.matchAll(IMPORT_PATTERN)].map((m) => m[1]);
}

function isForbidden(specifier: string): boolean {
  return FORBIDDEN.some(
    (name) => specifier === name || specifier.startsWith(`${name}/`),
  );
}

function tsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return tsFiles(path);
    return entry.name.endsWith('.ts') ? [path] : [];
  });
}

function violations(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const layer of GUARDED_LAYERS) {
    for (const file of tsFiles(join(ROOT, layer))) {
      const bad = importedModules(readFileSync(file, 'utf8')).filter(
        isForbidden,
      );
      if (bad.length > 0) {
        found.set(relative(ROOT, file).replaceAll('\\', '/'), bad);
      }
    }
  }
  return found;
}

describe('Layer boundaries', () => {
  it('should_detect_forbidden_module_when_imported_in_any_syntax', () => {
    // Arrange
    const source = [
      "import { Injectable } from '@nestjs/common';",
      "import type { User } from '@prisma/client';",
      "import * as bcrypt from 'bcrypt';",
      "const jwt = require('jsonwebtoken');",
      "const lazy = await import('@nestjs/jwt');",
      "export { Module } from '@nestjs/core';",
      "import { normalizeEmail } from '../../domain/users/email';",
      "import { something } from 'bcryptjs-not-listed';",
    ].join('\n');

    // Act
    const bad = importedModules(source).filter(isForbidden);

    // Assert
    expect(bad).toEqual([
      '@nestjs/common',
      '@prisma/client',
      'bcrypt',
      'jsonwebtoken',
      '@nestjs/jwt',
      '@nestjs/core',
    ]);
  });

  it('should_find_no_framework_imports_when_scanning_domain_and_application', () => {
    // Act
    const found = violations();
    const unexpected = [...found.entries()].filter(
      ([file]) => !(file in KNOWN_VIOLATIONS),
    );

    // Assert
    expect(unexpected).toEqual([]);
  });

  it('should_still_violate_when_file_is_listed_as_known_violation', () => {
    // Act
    const found = violations();

    // Assert
    for (const [file, specifier] of Object.entries(KNOWN_VIOLATIONS)) {
      expect(found.get(file)).toContain(specifier);
    }
  });
});

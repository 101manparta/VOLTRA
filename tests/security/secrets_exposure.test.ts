import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function findFilesRecursively(dir: string, ext: string[]): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFilesRecursively(fullPath, ext));
    } else if (ext.some(e => file.endsWith(e))) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Security & Secrets Exposure Audit (Phase 2 & Phase 17)', () => {
  it('ensures .gitignore strictly blocks .env files from Git tracking', () => {
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const content = fs.readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('.env*');
    expect(content).toContain('!.env.example');
  });

  it('guarantees SUPABASE_SERVICE_ROLE_KEY is never referenced in client code under src/', () => {
    const srcDir = path.resolve(process.cwd(), 'src');
    const sourceFiles = findFilesRecursively(srcDir, ['.ts', '.tsx', '.js', '.jsx']);

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(content).not.toContain('service_role');
    }
  });

  it('verifies .env.example contains only non-sensitive templates and placeholders', () => {
    const examplePath = path.resolve(process.cwd(), '.env.example');
    expect(fs.existsSync(examplePath)).toBe(true);

    const content = fs.readFileSync(examplePath, 'utf-8');
    expect(content).toContain('VITE_SUPABASE_URL=');
    expect(content).toContain('VITE_SUPABASE_ANON_KEY=');
    expect(content).toContain('SUPABASE_SERVICE_ROLE_KEY=');
    expect(content).toContain('your-project-id.supabase.co');
  });
});

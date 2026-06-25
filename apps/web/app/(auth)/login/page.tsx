import { LoginForm } from '@/components/auth/login-form';
import { GlassPanel } from '@/components/ui/glass-panel';

export default function LoginPage() {
  return (
    <div>
      <div className="mb-7 text-center">
        <h1 className="mb-2 text-2xl font-medium tracking-tight text-ink">
          С возвращением
        </h1>
        <p className="text-sm text-ink-muted">Войдите, чтобы продолжить работу</p>
      </div>
      <GlassPanel className="p-6">
        <LoginForm />
      </GlassPanel>
    </div>
  );
}

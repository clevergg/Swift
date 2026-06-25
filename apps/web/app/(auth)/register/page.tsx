import { GlassPanel } from '@/components/ui/glass-panel';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-7 text-center">
        <h1 className="mb-2 text-2xl font-medium tracking-tight text-ink">
          Управляй командой легко и спокойно
        </h1>
        <p className="text-sm text-ink-muted">
          Создайте аккаунт, чтобы начать работу
        </p>
      </div>
      <GlassPanel className="p-6">
        <RegisterForm />
      </GlassPanel>
    </div>
  );
}
